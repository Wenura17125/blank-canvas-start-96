
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'

// User Pages
import { Dashboard } from './pages/Dashboard'
import { SubmitPaper } from './pages/SubmitPaper'
import { MySubmissions } from './pages/MySubmissions'
import { UserProfile } from './pages/UserProfile'
import { Payments } from './pages/Payments'

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminUsers } from './pages/AdminUsers'
import { AdminPapers } from './pages/AdminPapers'
import { AdminFinancials } from './pages/AdminFinancials'
import { AdminMessages } from './pages/AdminMessages'

// Landing Page Component
const LandingPage: React.FC = () => {
  const { signIn } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ICHR2026
          </h1>
          <h2 className="text-2xl text-gray-700 mb-8">
            International Conference on Human Rights 2026
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Join leading researchers, academics, and practitioners in advancing human rights research and practice. 
            Submit your papers, register for the conference, and connect with the global human rights community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={signIn}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Access Portal
            </button>
            <button
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Conference Information */}
        <div id="about" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Submit Papers</h3>
            <p className="text-gray-600">
              Share your research with the global human rights community. Submit original papers on current human rights topics.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Reviews</h3>
            <p className="text-gray-600">
              All submissions undergo rigorous peer review by leading experts in human rights research and practice.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Network</h3>
            <p className="text-gray-600">
              Connect with researchers, practitioners, and advocates from around the world working on human rights issues.
            </p>
          </div>
        </div>

        {/* Conference Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Conference Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Dates</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Paper Submission Deadline:</strong> March 15, 2026</li>
                <li><strong>Review Notification:</strong> May 1, 2026</li>
                <li><strong>Final Paper Submission:</strong> June 15, 2026</li>
                <li><strong>Conference Dates:</strong> September 15-17, 2026</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Registration Fees</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Early Bird (Before March 1):</strong> $450</li>
                <li><strong>Regular Registration:</strong> $550</li>
                <li><strong>Student Registration:</strong> $350</li>
                <li><strong>Virtual Attendance:</strong> $200</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Participate?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join ICHR2026 and contribute to advancing human rights research and practice worldwide.
          </p>
          <button
            onClick={signIn}
            className="px-12 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: { 
            background: '#363636', 
            color: '#fff',
            borderRadius: '8px'
          },
          success: { 
            style: { 
              background: '#10b981',
              color: '#fff'
            } 
          },
          error: { 
            style: { 
              background: '#ef4444',
              color: '#fff'
            } 
          }
        }}
      />
      
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
              ) : (
                <LandingPage />
              )
            } 
          />

          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/submit-paper" element={
            <ProtectedRoute>
              <Layout>
                <SubmitPaper />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/my-submissions" element={
            <ProtectedRoute>
              <Layout>
                <MySubmissions />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/profile" element={
            <ProtectedRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/payments" element={
            <ProtectedRoute>
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/papers" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminPapers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/financials" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminFinancials />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/messages" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminMessages />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Settings page placeholder */}
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h2>
                  <p className="text-gray-600">Advanced system configuration options will be available here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
