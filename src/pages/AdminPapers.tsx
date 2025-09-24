
import React, { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import {FileText, Search, Eye, Download, Edit, Clock, CheckCircle, XCircle, AlertTriangle} from 'lucide-react'
import toast from 'react-hot-toast'

interface Paper {
  _id: string
  title: string
  abstract: string
  keywords: string
  status: string
  user_id: string
  fileName: string
  fileSize: number
  reviewerComments?: string
  submittedAt: string
  reviewedAt?: string
}

export const AdminPapers: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [reviewModal, setReviewModal] = useState<{ paper: Paper; status: string; comments: string } | null>(null)

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true)
      const { list } = await lumi.entities.papers.list({
        sort: { submittedAt: -1 }
      })
      setPapers(list || [])
    } catch (error) {
      console.error('Failed to fetch papers:', error)
      toast.error('Failed to load papers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  const handleStatusUpdate = async (paperId: string, newStatus: string, comments: string) => {
    try {
      const updateData = {
        status: newStatus,
        reviewerComments: comments,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await lumi.entities.papers.update(paperId, updateData)
      
      setPapers(prev => prev.map(paper => 
        paper._id === paperId 
          ? { ...paper, ...updateData }
          : paper
      ))

      toast.success(`Paper status updated to ${newStatus.replace('_', ' ')}`)
      setReviewModal(null)
    } catch (error) {
      console.error('Failed to update paper status:', error)
      toast.error('Failed to update paper status')
    }
  }

  const handleViewPaper = (paper: Paper) => {
    setSelectedPaper(paper)
  }

  const handleDownload = (paper: Paper) => {
    // In a real implementation, this would download the actual file
    toast.success(`Downloading ${paper.fileName}`)
  }

  const openReviewModal = (paper: Paper) => {
    setReviewModal({
      paper,
      status: paper.status,
      comments: paper.reviewerComments || ''
    })
  }

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.user_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || paper.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-green-500" size={20} />
      case 'under_review':
        return <Clock className="text-yellow-500" size={20} />
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />
      case 'revision_required':
        return <AlertTriangle className="text-orange-500" size={20} />
      default:
        return <FileText className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'revision_required':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const statusOptions = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'revision_required', label: 'Revision Required' }
  ]

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paper Management</h1>
        <p className="text-gray-600">
          Review and manage all paper submissions for the conference.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search papers by title, keywords, or author ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Paper Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <FileText className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Papers</p>
              <p className="text-2xl font-bold text-gray-900">{papers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Clock className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {papers.filter(p => p.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {papers.filter(p => p.status === 'accepted').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <XCircle className="text-red-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {papers.filter(p => p.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <AlertTriangle className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Revision Required</p>
              <p className="text-2xl font-bold text-gray-900">
                {papers.filter(p => p.status === 'revision_required').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Papers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Paper Submissions ({filteredPapers.length})
          </h2>
        </div>
        
        {filteredPapers.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No papers have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPapers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {paper.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          Keywords: {paper.keywords}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {paper.fileName} ({formatFileSize(paper.fileSize)})
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {paper.user_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(paper.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(paper.status)}`}>
                          {formatStatus(paper.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(paper.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewPaper(paper)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openReviewModal(paper)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Review Paper"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(paper)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Download File"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paper Details Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Paper Details</h2>
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedPaper.title}
                </h3>
                <div className="flex items-center mb-4">
                  {getStatusIcon(selectedPaper.status)}
                  <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedPaper.status)}`}>
                    {formatStatus(selectedPaper.status)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Abstract</h4>
                <p className="text-gray-700 leading-relaxed">{selectedPaper.abstract}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                <p className="text-gray-700">{selectedPaper.keywords}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Author ID</h4>
                  <p className="text-gray-700">{selectedPaper.user_id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Submission Date</h4>
                  <p className="text-gray-700">
                    {new Date(selectedPaper.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">File Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm"><strong>Filename:</strong> {selectedPaper.fileName}</p>
                  <p className="text-sm"><strong>Size:</strong> {formatFileSize(selectedPaper.fileSize)}</p>
                </div>
              </div>

              {selectedPaper.reviewerComments && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reviewer Comments</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedPaper.reviewerComments}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => openReviewModal(selectedPaper)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Review Paper
              </button>
              <button
                onClick={() => handleDownload(selectedPaper)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download size={16} className="mr-2" />
                Download File
              </button>
              <button
                onClick={() => setSelectedPaper(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Review Paper</h2>
              <p className="text-gray-600 mt-1">{reviewModal.paper.title}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Status
                </label>
                <select
                  id="status"
                  value={reviewModal.status}
                  onChange={(e) => setReviewModal(prev => prev ? { ...prev, status: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Reviewer Comments
                </label>
                <textarea
                  id="comments"
                  value={reviewModal.comments}
                  onChange={(e) => setReviewModal(prev => prev ? { ...prev, comments: e.target.value } : null)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed feedback for the author..."
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => setReviewModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(reviewModal.paper._id, reviewModal.status, reviewModal.comments)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
