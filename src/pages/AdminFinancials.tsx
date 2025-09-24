
import React, { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import {DollarSign, Search, Eye, CheckCircle, Clock, XCircle, TrendingUp, Download} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

interface Payment {
  _id: string
  user_id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  transactionId?: string
  notes?: string
  paymentSlipName?: string
  createdAt: string
  processedAt?: string
}

interface FinancialStats {
  totalRevenue: number
  pendingPayments: number
  completedPayments: number
  failedPayments: number
  revenueByMethod: { method: string; amount: number }[]
  revenueByMonth: { month: string; amount: number }[]
}

export const AdminFinancials: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    revenueByMethod: [],
    revenueByMonth: []
  })

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const { list } = await lumi.entities.payments.list({
        sort: { createdAt: -1 }
      })
      const paymentsData = list || []
      setPayments(paymentsData)

      // Calculate statistics
      const completedPayments = paymentsData.filter(p => p.status === 'completed')
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
      
      // Revenue by payment method
      const methodStats = paymentsData.reduce((acc, payment) => {
        if (payment.status === 'completed') {
          const method = payment.paymentMethod
          acc[method] = (acc[method] || 0) + payment.amount
        }
        return acc
      }, {} as Record<string, number>)

      const revenueByMethod = Object.entries(methodStats).map(([method, amount]) => ({
        method: method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        amount
      }))

      // Revenue by month (last 6 months)
      const monthlyStats = paymentsData.reduce((acc, payment) => {
        if (payment.status === 'completed') {
          const month = new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          acc[month] = (acc[month] || 0) + payment.amount
        }
        return acc
      }, {} as Record<string, number>)

      const revenueByMonth = Object.entries(monthlyStats).map(([month, amount]) => ({
        month,
        amount
      })).slice(-6)

      setStats({
        totalRevenue,
        pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
        completedPayments: completedPayments.length,
        failedPayments: paymentsData.filter(p => p.status === 'failed').length,
        revenueByMethod,
        revenueByMonth
      })

    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const updateData = {
        status: newStatus,
        processedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString()
      }

      await lumi.entities.payments.update(paymentId, updateData)
      
      setPayments(prev => prev.map(payment => 
        payment._id === paymentId 
          ? { ...payment, ...updateData }
          : payment
      ))

      toast.success(`Payment status updated to ${newStatus}`)
      await fetchPayments() // Refresh stats
    } catch (error) {
      console.error('Failed to update payment status:', error)
      toast.error('Failed to update payment status')
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />
      case 'failed':
        return <XCircle className="text-red-500" size={20} />
      default:
        return <DollarSign className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Management</h1>
        <p className="text-gray-600">
          Monitor conference revenue, payment processing, and financial analytics.
        </p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Payment Method */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.revenueByMethod}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, amount }) => `${method}: $${amount}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {stats.revenueByMethod.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Bar dataKey="amount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search payments by user ID, transaction ID, or payment method..."
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
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={() => toast.success('Export functionality would be implemented here')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Transactions ({filteredPayments.length})
          </h2>
        </div>
        
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No payments have been processed yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.transactionId || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatStatus(payment.paymentMethod)}
                        </p>
                        {payment.paymentSlipName && (
                          <p className="text-xs text-gray-400">
                            Slip: {payment.paymentSlipName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.user_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                          {formatStatus(payment.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                        {payment.processedAt && (
                          <p className="text-xs">
                            Processed: {new Date(payment.processedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(payment._id, 'completed')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Mark as Completed"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Transaction ID</h4>
                  <p className="text-gray-700">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User ID</h4>
                  <p className="text-gray-700">{selectedPayment.user_id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Amount</h4>
                  <p className="text-gray-700 text-xl font-semibold">
                    ${selectedPayment.amount} {selectedPayment.currency}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                  <p className="text-gray-700">{formatStatus(selectedPayment.paymentMethod)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <div className="flex items-center">
                    {getStatusIcon(selectedPayment.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedPayment.status)}`}>
                      {formatStatus(selectedPayment.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created Date</h4>
                  <p className="text-gray-700">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedPayment.paymentSlipName && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Slip</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm"><strong>File:</strong> {selectedPayment.paymentSlipName}</p>
                    <button
                      onClick={() => toast.success('Payment slip download would be implemented here')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Download Payment Slip
                    </button>
                  </div>
                </div>
              )}

              {selectedPayment.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedPayment.notes}</p>
                  </div>
                </div>
              )}

              {selectedPayment.processedAt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Processing Details</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Processed:</strong> {new Date(selectedPayment.processedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              {selectedPayment.status === 'pending' && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedPayment._id, 'completed')
                    setSelectedPayment(null)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Mark as Completed
                </button>
              )}
              <button
                onClick={() => setSelectedPayment(null)}
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
