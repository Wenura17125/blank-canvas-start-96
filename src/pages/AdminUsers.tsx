
import React, { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import {Users, Search, Eye, Trash2, Edit, UserCheck, Mail, Phone, Globe} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  _id: string
  user_id: string
  fullName: string
  affiliation: string
  country: string
  bio: string
  phone: string
  website: string
  orcid: string
  academicTitle: string
  participationType: string
  createdAt: string
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { list } = await lumi.entities.user_profiles.list({
        sort: { createdAt: -1 }
      })
      setUsers(list || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await lumi.entities.user_profiles.delete(userId)
      setUsers(prev => prev.filter(user => user._id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.affiliation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === 'all' || 
      (filterType === 'presenter' && user.participationType === 'presenter') ||
      (filterType === 'attendee' && user.participationType === 'attendee') ||
      (filterType === 'keynote' && user.participationType === 'keynote')

    return matchesSearch && matchesFilter
  })

  const getParticipationBadge = (type: string) => {
    const colors = {
      presenter: 'bg-blue-100 text-blue-800',
      attendee: 'bg-gray-100 text-gray-800',
      keynote: 'bg-purple-100 text-purple-800',
      panelist: 'bg-green-100 text-green-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">
          Manage conference participants and their profiles.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, affiliation, country, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Participants</option>
            <option value="presenter">Presenters</option>
            <option value="attendee">Attendees</option>
            <option value="keynote">Keynote Speakers</option>
          </select>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <UserCheck className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Presenters</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.participationType === 'presenter').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Keynote Speakers</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.participationType === 'keynote').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="text-gray-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Attendees</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.participationType === 'attendee').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Conference Participants ({filteredUsers.length})
          </h2>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No users have registered yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.academicTitle} {user.fullName || 'No name provided'}
                            </div>
                            <div className="text-sm text-gray-500">{user.country}</div>
                            <div className="text-xs text-gray-400">ID: {user.user_id}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.affiliation || 'Not specified'}</div>
                      {user.orcid && (
                        <div className="text-xs text-gray-500">ORCID: {user.orcid}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getParticipationBadge(user.participationType)}`}>
                        {user.participationType || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.fullName)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="text-gray-900">{selectedUser.academicTitle} {selectedUser.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Country</p>
                    <p className="text-gray-900">{selectedUser.country}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Affiliation</p>
                    <p className="text-gray-900">{selectedUser.affiliation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Participation Type</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getParticipationBadge(selectedUser.participationType)}`}>
                      {selectedUser.participationType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {selectedUser.phone && (
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-400 mr-3" />
                      <span className="text-gray-900">{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.website && (
                    <div className="flex items-center">
                      <Globe size={16} className="text-gray-400 mr-3" />
                      <a 
                        href={selectedUser.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedUser.website}
                      </a>
                    </div>
                  )}
                  {selectedUser.orcid && (
                    <div className="flex items-center">
                      <UserCheck size={16} className="text-gray-400 mr-3" />
                      <span className="text-gray-900">ORCID: {selectedUser.orcid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Biography */}
              {selectedUser.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Biography</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              {/* Registration Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm"><strong>User ID:</strong> {selectedUser.user_id}</p>
                  <p className="text-sm"><strong>Registration Date:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success('Email functionality would be implemented here')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Mail size={16} className="mr-2" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
