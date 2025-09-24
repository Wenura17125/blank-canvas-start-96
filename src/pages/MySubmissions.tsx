
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import {FileText, Download, Eye, Clock, CheckCircle, XCircle, AlertTriangle} from 'lucide-react'
import toast from 'react-hot-toast'

interface Paper {
  _id: string
  title: string
  abstract: string
  keywords: string
  status: string
  fileName: string
  fileSize: number
  reviewerComments?: string
  submittedAt: string
  reviewedAt?: string
}

export const MySubmissions: React.FC = () => {
  const { user } = useAuth()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

  const fetchSubmissions = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { list } = await lumi.entities.papers.list({
        filter: { user_id: user.userId },
        sort: { submittedAt: -1 }
      })
      setPapers(list || [])
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

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

  const handleViewDetails = (paper: Paper) => {
    setSelectedPaper(paper)
  }

  const handleDownload = (paper: Paper) => {
    // In a real implementation, this would download the actual file
    toast.success(`Downloading ${paper.fileName}`)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Submissions</h1>
        <p className="text-gray-600">
          Track the status of your paper submissions and view reviewer feedback.
        </p>
      </div>

      {papers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted any papers yet. Start by submitting your first paper!
          </p>
          <a
            href="/dashboard/submit-paper"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Your First Paper
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {papers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {paper.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          Keywords: {paper.keywords}
                        </p>
                      </div>
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <p className="font-medium">{paper.fileName}</p>
                        <p className="text-xs">{formatFileSize(paper.fileSize)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(paper)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye size={16} />
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
        </div>
      )}

      {/* Paper Details Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Paper Details</h2>
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
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
                  <h4 className="font-medium text-gray-900 mb-2">Submission Date</h4>
                  <p className="text-gray-700">
                    {new Date(selectedPaper.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedPaper.reviewedAt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Review Date</h4>
                    <p className="text-gray-700">
                      {new Date(selectedPaper.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
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
    </div>
  )
}
