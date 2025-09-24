
import React, { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import {MessageSquare, Search, Mail, MailOpen, Reply, Trash2, Filter, AlertTriangle, Clock} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  _id: string
  name: string
  email: string
  subject: string
  body: string
  isRead: boolean
  priority: string
  category: string
  adminResponse?: string
  respondedAt?: string
  respondedBy?: string
  createdAt: string
}

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRead, setFilterRead] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyModal, setReplyModal] = useState<{ message: Message; response: string } | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const { list } = await lumi.entities.messages.list({
        sort: { createdAt: -1 }
      })
      setMessages(list || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await lumi.entities.messages.update(messageId, {
        isRead: true,
        updatedAt: new Date().toISOString()
      })
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ))
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      toast.error('Failed to update message')
    }
  }

  const handleDeleteMessage = async (messageId: string, subject: string) => {
    if (!confirm(`Are you sure you want to delete the message "${subject}"?`)) {
      return
    }

    try {
      await lumi.entities.messages.delete(messageId)
      setMessages(prev => prev.filter(msg => msg._id !== messageId))
      toast.success('Message deleted successfully')
    } catch (error) {
      console.error('Failed to delete message:', error)
      toast.error('Failed to delete message')
    }
  }

  const handleSendReply = async (messageId: string, response: string) => {
    try {
      await lumi.entities.messages.update(messageId, {
        adminResponse: response,
        respondedAt: new Date().toISOString(),
        respondedBy: 'admin',
        isRead: true,
        updatedAt: new Date().toISOString()
      })
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { 
              ...msg, 
              adminResponse: response,
              respondedAt: new Date().toISOString(),
              respondedBy: 'admin',
              isRead: true
            } 
          : msg
      ))

      toast.success('Reply sent successfully')
      setReplyModal(null)
    } catch (error) {
      console.error('Failed to send reply:', error)
      toast.error('Failed to send reply')
    }
  }

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      await handleMarkAsRead(message._id)
    }
  }

  const openReplyModal = (message: Message) => {
    setReplyModal({
      message,
      response: ''
    })
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.body.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRead = filterRead === 'all' || 
      (filterRead === 'read' && message.isRead) ||
      (filterRead === 'unread' && !message.isRead)

    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority
    const matchesCategory = filterCategory === 'all' || message.category === filterCategory

    return matchesSearch && matchesRead && matchesPriority && matchesCategory
  })

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="text-red-500" size={16} />
      case 'high':
        return <AlertTriangle className="text-orange-500" size={16} />
      case 'medium':
        return <Clock className="text-yellow-500" size={16} />
      default:
        return <Clock className="text-gray-500" size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800'
      case 'payment':
        return 'bg-green-100 text-green-800'
      case 'paper_submission':
        return 'bg-purple-100 text-purple-800'
      case 'registration':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCategory = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const unreadCount = messages.filter(m => !m.isRead).length
  const urgentCount = messages.filter(m => m.priority === 'urgent' && !m.isRead).length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Management</h1>
        <p className="text-gray-600">
          Manage and respond to messages from conference participants.
        </p>
      </div>

      {/* Message Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <MessageSquare className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Mail className="text-red-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <AlertTriangle className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">{urgentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Reply className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => m.adminResponse).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search messages by name, email, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="payment">Payment</option>
              <option value="paper_submission">Paper Submission</option>
              <option value="registration">Registration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Messages ({filteredMessages.length})
          </h2>
        </div>
        
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchTerm || filterRead !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No messages have been received yet'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div
                key={message._id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !message.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleViewMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {message.isRead ? (
                        <MailOpen className="text-gray-400" size={16} />
                      ) : (
                        <Mail className="text-blue-600" size={16} />
                      )}
                      <h3 className={`text-sm font-medium ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {message.name}
                      </h3>
                      <span className="text-sm text-gray-500">{message.email}</span>
                      {getPriorityIcon(message.priority)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(message.priority)}`}>
                        {message.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(message.category)}`}>
                        {formatCategory(message.category)}
                      </span>
                    </div>
                    <h4 className={`text-sm mb-2 ${!message.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {message.subject}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {message.body}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                      {message.adminResponse && (
                        <span className="text-xs text-green-600 font-medium">
                          Responded {message.respondedAt && new Date(message.respondedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openReplyModal(message)
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Reply"
                    >
                      <Reply size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMessage(message._id, message.subject)
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">From</h4>
                  <p className="text-gray-700">{selectedMessage.name}</p>
                  <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Received</h4>
                  <p className="text-gray-700">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                  <div className="flex items-center">
                    {getPriorityIcon(selectedMessage.priority)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedMessage.category)}`}>
                    {formatCategory(selectedMessage.category)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Subject</h4>
                <p className="text-gray-700 font-medium">{selectedMessage.subject}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.body}
                  </p>
                </div>
              </div>

              {selectedMessage.adminResponse && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin Response</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.adminResponse}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Responded by {selectedMessage.respondedBy} on{' '}
                      {selectedMessage.respondedAt && new Date(selectedMessage.respondedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => openReplyModal(selectedMessage)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Reply size={16} className="mr-2" />
                Reply
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Reply to Message</h2>
              <p className="text-gray-600 mt-1">
                To: {replyModal.message.name} ({replyModal.message.email})
              </p>
              <p className="text-gray-600">
                Re: {replyModal.message.subject}
              </p>
            </div>
            
            <div className="p-6">
              <textarea
                value={replyModal.response}
                onChange={(e) => setReplyModal(prev => prev ? { ...prev, response: e.target.value } : null)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your response here..."
              />
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => setReplyModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendReply(replyModal.message._id, replyModal.response)}
                disabled={!replyModal.response.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Reply size={16} className="mr-2" />
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
