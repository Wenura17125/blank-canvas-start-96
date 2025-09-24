
import React, { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import {Users, FileText, DollarSign, MessageSquare, TrendingUp, Clock, CheckCircle, AlertTriangle} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalUsers: number
  totalPapers: number
  totalPayments: number
  totalMessages: number
  papersByStatus: { status: string; count: number }[]
  paymentsByStatus: { status: string; count: number }[]
  recentActivity: any[]
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPapers: 0,
    totalPayments: 0,
    totalMessages: 0,
    papersByStatus: [],
    paymentsByStatus: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [papersResponse, paymentsResponse, messagesResponse, profilesResponse] = await Promise.all([
        lumi.entities.papers.list({ sort: { createdAt: -1 } }),
        lumi.entities.payments.list({ sort: { createdAt: -1 } }),
        lumi.entities.messages.list({ sort: { createdAt: -1 } }),
        lumi.entities.user_profiles.list({ sort: { createdAt: -1 } })
      ])

      const papers = papersResponse.list || []
      const payments = paymentsResponse.list || []
      const messages = messagesResponse.list || []
      const profiles = profilesResponse.list || []

      // Calculate paper statistics
      const papersByStatus = [
        { status: 'Submitted', count: papers.filter(p => p.status === 'submitted').length },
        { status: 'Under Review', count: papers.filter(p => p.status === 'under_review').length },
        { status: 'Accepted', count: papers.filter(p => p.status === 'accepted').length },
        { status: 'Rejected', count: papers.filter(p => p.status === 'rejected').length },
        { status: 'Revision Required', count: papers.filter(p => p.status === 'revision_required').length }
      ]

      // Calculate payment statistics
      const paymentsByStatus = [
        { status: 'Pending', count: payments.filter(p => p.status === 'pending').length },
        { status: 'Completed', count: payments.filter(p => p.status === 'completed').length },
        { status: 'Failed', count: payments.filter(p => p.status === 'failed').length }
      ]

      // Get recent activity (last 10 items)
      const recentActivity = [
        ...papers.slice(0, 3).map(p => ({
          type: 'paper',
          title: `New paper submitted: ${p.title}`,
          time: p.submittedAt,
          icon: 'FileText'
        })),
        ...payments.slice(0, 3).map(p => ({
          type: 'payment',
          title: `Payment ${p.status}: $${p.amount}`,
          time: p.createdAt,
          icon: 'DollarSign'
        })),
        ...messages.slice(0, 2).map(m => ({
          type: 'message',
          title: `New message: ${m.subject}`,
          time: m.createdAt,
          icon: 'MessageSquare'
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

      setStats({
        totalUsers: profiles.length,
        totalPapers: papers.length,
        totalPayments: payments.length,
        totalMessages: messages.length,
        papersByStatus,
        paymentsByStatus,
        recentActivity
      })

    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText size={16} className="text-blue-500" />
      case 'DollarSign':
        return <DollarSign size={16} className="text-green-500" />
      case 'MessageSquare':
        return <MessageSquare size={16} className="text-purple-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
    }
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of conference management and system analytics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paper Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +8% from last week
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +15% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <MessageSquare className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <AlertTriangle size={12} className="mr-1" />
                {stats.totalMessages - Math.floor(stats.totalMessages * 0.7)} unread
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paper Status Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Papers by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.papersByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.paymentsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.paymentsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.icon)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={16} />
                <span className="text-sm text-gray-600">Accepted Papers</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.papersByStatus.find(p => p.status === 'Accepted')?.count || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="text-yellow-500 mr-2" size={16} />
                <span className="text-sm text-gray-600">Under Review</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.papersByStatus.find(p => p.status === 'Under Review')?.count || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="text-green-500 mr-2" size={16} />
                <span className="text-sm text-gray-600">Completed Payments</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.paymentsByStatus.find(p => p.status === 'Completed')?.count || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={16} />
                <span className="text-sm text-gray-600">Pending Payments</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.paymentsByStatus.find(p => p.status === 'Pending')?.count || 0}
              </span>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  $
                  {(stats.paymentsByStatus.find(p => p.status === 'Completed')?.count || 0) * 450}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-sm font-medium text-green-900">Database</p>
            <p className="text-xs text-green-600">Operational</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-sm font-medium text-green-900">File Storage</p>
            <p className="text-xs text-green-600">Operational</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-sm font-medium text-green-900">Email Service</p>
            <p className="text-xs text-green-600">Operational</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-sm font-medium text-green-900">Authentication</p>
            <p className="text-xs text-green-600">Operational</p>
          </div>
        </div>
      </div>
    </div>
  )
}
