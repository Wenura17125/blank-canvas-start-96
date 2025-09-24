
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import {FileText, CheckCircle, Clock, AlertCircle, DollarSign} from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalSubmissions: number
  acceptedPapers: number
  pendingReviews: number
  paymentStatus: string
}

interface RecentSubmission {
  _id: string
  title: string
  status: string
  submittedAt: string
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    acceptedPapers: 0,
    pendingReviews: 0,
    paymentStatus: 'pending'
  })
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch user's papers
      const { list: papers } = await lumi.entities.papers.list({
        filter: { user_id: user.userId },
        sort: { submittedAt: -1 }
      })

      // Calculate stats
      const totalSubmissions = papers?.length || 0
      const acceptedPapers = papers?.filter(p => p.status === 'accepted').length || 0
      const pendingReviews = papers?.filter(p => p.status === 'under_review').length || 0

      // Fetch payment status
      const { list: payments } = await lumi.entities.payments.list({
        filter: { user_id: user.userId },
        sort: { createdAt: -1 }
      })

      const latestPayment = payments?.[0]
      const paymentStatus = latestPayment?.status || 'pending'

      setStats({
        totalSubmissions,
        acceptedPapers,
        pendingReviews,
        paymentStatus
      })

      // Set recent submissions (last 5)
      setRecentSubmissions(papers?.slice(0, 5) || [])

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-green-500" size={16} />
      case 'under_review':
        return <Clock className="text-yellow-500" size={16} />
      case 'rejected':
        return <AlertCircle className="text-red-500" size={16} />
      default:
        return <FileText className="text-gray-500" size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'revision_required':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.userName}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your conference participation and submissions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accepted Papers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.acceptedPapers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Payment Status</p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {stats.paymentStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
        </div>
        <div className="p-6">
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No submissions yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start by submitting your first paper!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(submission.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {submission.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {formatStatus(submission.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/submit-paper"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <Upload className="text-gray-400 group-hover:text-blue-500 mr-3" size={24} />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-blue-700">Submit New Paper</p>
              <p className="text-sm text-gray-500">Upload your research paper</p>
            </div>
          </a>

          <a
            href="/dashboard/profile"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <User className="text-gray-400 group-hover:text-blue-500 mr-3" size={24} />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-blue-700">Update Profile</p>
              <p className="text-sm text-gray-500">Manage your information</p>
            </div>
          </a>

          <a
            href="/dashboard/payments"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <CreditCard className="text-gray-400 group-hover:text-blue-500 mr-3" size={24} />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-blue-700">Payment Portal</p>
              <p className="text-sm text-gray-500">Handle registration fees</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
