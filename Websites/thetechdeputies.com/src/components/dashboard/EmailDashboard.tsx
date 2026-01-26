/**
 * @file EmailDashboard.tsx
 * @description Real-time email dashboard component for monitoring queue status, analytics, and managing email operations
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ModalUserActions } from './ModalUserActions'
import { UserManagementProvider } from '@/contexts/UserManagementContext'

interface QueueMetrics {
  total: number
  queued: number
  processing: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
  bounced: number
  complained: number
}

interface EmailJob {
  id: string
  recipientEmail: string
  recipientName?: string
  subject: string
  status: 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'COMPLAINED' | 'FAILED' | 'CANCELLED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  createdAt: string
  updatedAt: string
}

export function EmailDashboard() {
  const [metrics, setMetrics] = useState<QueueMetrics>({
    total: 0,
    queued: 0,
    processing: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    failed: 0,
    bounced: 0,
    complained: 0
  })

  const [jobs, setJobs] = useState<EmailJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'queued' | 'processing' | 'sent' | 'delivered' | 'failed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch email data function
  const fetchEmailData = async () => {
    try {
      // In real app, this would call the API
      const response = await fetch('/api/email/queue')
      const data = await response.json()
      
      setMetrics(data.total || 0)
      setJobs(data.queue || [])
      
      setIsProcessing(false)
    } catch (error) {
      console.error('Failed to fetch email data:', error)
      setIsProcessing(false)
    }
  }

  // Simulate API calls to get data
  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        // Simulate API call with better error handling
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          console.warn('Email queue API failed, using mock data')
          // Return mock data for demonstration purposes
          return {
            queue: [
              {
                id: '1',
                recipientEmail: 'hello@thetechdeputies.com',
                recipientName: 'Admin User',
                subject: 'Email Dashboard Test',
                status: 'SENT',
                priority: 'HIGH',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: '2',
                recipientEmail: 'test@example.com', 
                recipientName: 'Test User',
                subject: 'Password Reset',
                status: 'DELIVERED',
                priority: 'NORMAL',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            metrics: {
              total: 2,
              queued: 0,
              processing: 0,
              sent: 2,
              delivered: 2,
              opened: 1,
              clicked: 0,
              failed: 0,
              bounced: 0,
              complained: 0
            },
            total: 2
          }
        }
      } catch (error) {
        console.error('Failed to fetch email data:', error)
        // Return empty data on error
        return {
          queue: [],
          metrics: {
            total: 0,
            queued: 0,
            processing: 0,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            failed: 0,
            bounced: 0,
            complained: 0
          },
          total: 0
        }
      }
    }
    
    const interval = setInterval(fetchEmailData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    return job.status.toLowerCase() === filter.toLowerCase()
  }).filter(job => {
    if (!searchTerm) return true
    return (
      job.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.recipientName && job.recipientName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const getStatusColor = (status: string) => {
    const colors = {
      queued: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      opened: 'bg-purple-100 text-purple-800',
      clicked: 'bg-indigo-100 text-indigo-800',
      bounced: 'bg-orange-100 text-orange-800',
      complained: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleRefresh = () => {
    setIsProcessing(true)
    const interval = setInterval(fetchEmailData, 1000) // Update every second during refresh
    
    setTimeout(() => {
      clearInterval(interval)
      setIsProcessing(false)
    }, 2000)
  }

  const handleRetry = async (jobId: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/email/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Show success message
        const successMessage = document.createElement('div')
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg z-50'
        successMessage.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Retry Scheduled Successfully</span>
          </div>
        `
        document.body.appendChild(successMessage)
        
        setTimeout(() => {
          document.body.removeChild(successMessage)
        }, 3000)
      }
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <UserManagementProvider>
      <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Email Dashboard</h1>
                  <p className="mt-2 text-sm text-gray-600">Real-time email queue management and analytics</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* View for Actions - Enhanced with Modal */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-secondary text-white rounded-md shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    User Actions
                  </button>
                  
                  <Link 
                    href="/dashboard/admin/users"
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Admin Panel
                  </Link>
                  
                  <Link 
                    href="/dashboard/admin/users/create"
                    className="flex items-center px-4 py-2 bg-accent-tan text-white rounded-md shadow-sm hover:bg-accent-tan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-tan"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    Create User
                  </Link>
                  
                  <Link 
                    href="/dashboard/admin/users/create"
                    className="flex items-center px-4 py-2 bg-accent-tan text-white rounded-md shadow-sm hover:bg-accent-tan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-tan"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    Create User
                  </Link>
                  
                  <button
                    onClick={handleRefresh}
                    disabled={isProcessing}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        </svg>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Refresh
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900">Queue Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{metrics.total}</div>
                  <div className="text-sm text-gray-600">Total Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500">{metrics.queued}</div>
                  <div className="text-sm text-gray-600">Queued</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-500">{metrics.processing}</div>
                  <div className="text-sm text-gray-600">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-500">{metrics.sent}</div>
                  <div className="text-sm text-gray-600">Sent</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900">Engagement</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-500">{metrics.delivered}</div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-500">{metrics.opened}</div>
                  <div className="text-sm text-gray-600">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-500">{metrics.clicked}</div>
                  <div className="text-sm text-gray-600">Clicked</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-400">-</div>
                  <div className="text-sm text-gray-600">CTR</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900">Issues</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">{metrics.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500">{metrics.bounced}</div>
                  <div className="text-sm text-gray-600">Bounced</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-700">{metrics.complained}</div>
                  <div className="text-sm text-gray-600">Complained</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-400">-</div>
                  <div className="text-sm text-gray-600">Others</div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Queue Table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Email Queue</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'queued' | 'processing' | 'sent' | 'delivered' | 'failed')}
                  className="block px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  <option value="all">All</option>
                  <option value="queued">Queued</option>
                  <option value="processing">Processing</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Jobs List */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.slice(0, 10).map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {job.recipientName || job.recipientEmail}
                        </div>
                        <div className="text-sm text-gray-500">{job.recipientEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">{job.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {job.status === 'FAILED' && (
                            <button
                              onClick={() => handleRetry(job.id)}
                              className="text-primary hover:text-primary px-2 py-1 rounded text-xs font-medium"
                              disabled={isProcessing}
                            >
                              Retry
                            </button>
                          )}
                          {(job.status === 'QUEUED' || job.status === 'SENDING') && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to cancel job ${job.id}?`)) {
                                  console.log('Job cancelled:', job.id)
                                }
                              }}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs font-medium"
                              disabled={isProcessing}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Actions Modal */}
      <ModalUserActions
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAction={(action, userId) => {
          console.log('User action:', action, userId)
          // You could add refresh logic here if needed
          fetchEmailData()
        }}
      />
      </div>
    </UserManagementProvider>
  )
}