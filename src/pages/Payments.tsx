
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import {CreditCard, Upload, CheckCircle, Clock, AlertCircle, FileText, DollarSign} from 'lucide-react'
import toast from 'react-hot-toast'

interface Payment {
  _id: string
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

export const Payments: React.FC = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 450,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    notes: ''
  })

  const fetchPayments = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { list } = await lumi.entities.payments.list({
        filter: { user_id: user.userId },
        sort: { createdAt: -1 }
      })
      setPayments(list || [])
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast.error('Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    toast.success('Payment slip selected')
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!selectedFile) {
      toast.error('Please select a payment slip to upload')
      return
    }

    setUploading(true)
    try {
      const paymentData = {
        user_id: user.userId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: 'pending',
        paymentMethod: paymentDetails.paymentMethod,
        paymentSlipPath: `/uploads/payments/${Date.now()}_${selectedFile.name}`,
        paymentSlipName: selectedFile.name,
        transactionId: `TXN${Date.now()}`,
        notes: paymentDetails.notes || `${paymentDetails.paymentMethod} payment for ICHR2026 registration`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await lumi.entities.payments.create(paymentData)
      
      toast.success('Payment slip uploaded successfully! We will verify your payment within 2-3 business days.')
      setSelectedFile(null)
      setPaymentDetails(prev => ({ ...prev, notes: '' }))
      await fetchPayments()
      
    } catch (error) {
      console.error('Payment submission failed:', error)
      toast.error('Failed to upload payment slip. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />
      case 'failed':
        return <AlertCircle className="text-red-500" size={20} />
      default:
        return <FileText className="text-gray-500" size={20} />
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

  const registrationFees = [
    { type: 'Early Bird (Before March 1)', amount: 450, description: 'Full conference access with 20% discount' },
    { type: 'Regular Registration', amount: 550, description: 'Full conference access' },
    { type: 'Student Registration', amount: 350, description: 'Student discount (ID required)' },
    { type: 'Virtual Attendance', amount: 200, description: 'Online participation only' }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Portal</h1>
        <p className="text-gray-600">
          Complete your conference registration by submitting your payment information.
        </p>
      </div>

      {/* Registration Fees */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="mr-2" size={20} />
            Registration Fees
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrationFees.map((fee, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{fee.type}</h3>
                  <span className="text-xl font-bold text-blue-600">${fee.amount}</span>
                </div>
                <p className="text-sm text-gray-600">{fee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bank Transfer Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h2>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-4">Transfer to the following account:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Bank Name:</strong> International Conference Bank</p>
                <p><strong>Account Name:</strong> ICHR2026 Conference</p>
                <p><strong>Account Number:</strong> 1234567890</p>
                <p><strong>Routing Number:</strong> 987654321</p>
              </div>
              <div>
                <p><strong>SWIFT Code:</strong> ICBKUS33</p>
                <p><strong>Bank Address:</strong> 123 Conference Ave, Academic City, AC 12345</p>
                <p><strong>Reference:</strong> ICHR2026-{user?.userId}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please include your User ID ({user?.userId}) as the payment reference 
                to ensure proper processing of your payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Slip Upload */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Upload Payment Slip</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <select
                  id="amount"
                  value={paymentDetails.amount}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={450}>$450 - Early Bird</option>
                  <option value={550}>$550 - Regular</option>
                  <option value={350}>$350 - Student</option>
                  <option value={200}>$200 - Virtual</option>
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  value={paymentDetails.currency}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="CNY">CNY</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentDetails.paymentMethod}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="paymentSlip" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Slip/Receipt
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {selectedFile ? (
                  <div>
                    <FileText className="mx-auto text-green-500 mb-2" size={48} />
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Upload payment slip or receipt
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      JPG, PNG, or PDF (max 5MB)
                    </p>
                    <input
                      type="file"
                      id="paymentSlip"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={paymentDetails.notes}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information about your payment"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Submit Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No payments yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Your payment history will appear here after submission
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          ${payment.amount} {payment.currency}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatStatus(payment.paymentMethod)} • {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-400">
                            Transaction ID: {payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {formatStatus(payment.status)}
                      </span>
                      {payment.processedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Processed: {new Date(payment.processedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      {payment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
