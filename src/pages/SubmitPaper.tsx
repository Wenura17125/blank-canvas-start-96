
import React, { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import {Upload, FileText, CheckCircle, AlertCircle} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface FormData {
  title: string
  abstract: string
  keywords: string
  file: File | null
}

export const SubmitPaper: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    abstract: '',
    keywords: '',
    file: null
  })
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file')
      return
    }

    // Validate file size (16MB limit)
    const maxSize = 16 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 16MB')
      return
    }

    setFormData(prev => ({ ...prev, file }))
    toast.success('File selected successfully')
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Please enter a paper title')
      return false
    }
    if (formData.title.length < 5) {
      toast.error('Title must be at least 5 characters long')
      return false
    }
    if (!formData.abstract.trim()) {
      toast.error('Please enter an abstract')
      return false
    }
    if (formData.abstract.length < 100) {
      toast.error('Abstract must be at least 100 characters long')
      return false
    }
    if (!formData.keywords.trim()) {
      toast.error('Please enter keywords')
      return false
    }
    if (!formData.file) {
      toast.error('Please upload a paper file')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return

    setLoading(true)
    try {
      // Create paper submission record
      const paperData = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        keywords: formData.keywords.trim(),
        status: 'submitted',
        user_id: user.userId,
        fileName: formData.file!.name,
        fileSize: formData.file!.size,
        filePath: `/uploads/papers/${Date.now()}_${formData.file!.name}`,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await lumi.entities.papers.create(paperData)
      
      toast.success('Paper submitted successfully!')
      navigate('/dashboard/my-submissions')
      
    } catch (error) {
      console.error('Paper submission failed:', error)
      toast.error('Failed to submit paper. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      default:
        return '📁'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Submit Paper</h1>
          <p className="text-gray-600 mt-2">
            Submit your research paper for ICHR2026. Please ensure all information is accurate before submission.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Paper Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Paper Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your paper title (minimum 5 characters)"
              required
              minLength={5}
              maxLength={200}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Abstract */}
          <div>
            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
              Abstract *
            </label>
            <textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your paper abstract (minimum 100 characters)"
              required
              minLength={100}
              maxLength={2000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.abstract.length}/2000 characters (minimum 100 required)
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords *
            </label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter keywords separated by commas (e.g., human rights, AI ethics, digital governance)"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple keywords with commas
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paper File *
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : formData.file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">{getFileIcon(formData.file.name)}</div>
                  <p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your paper file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    onChange={handleFileInput}
                    accept=".pdf,.doc,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX (max 16MB)
            </p>
          </div>

          {/* Submission Guidelines */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              Submission Guidelines
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Papers must be original and not published elsewhere</li>
              <li>• Maximum length: 8,000 words including references</li>
              <li>• Follow APA citation style</li>
              <li>• Include author information in a separate cover letter</li>
              <li>• Ensure your paper is anonymized for blind review</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Submit Paper
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
