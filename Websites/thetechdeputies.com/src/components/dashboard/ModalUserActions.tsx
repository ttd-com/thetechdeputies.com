/**
 * @file ModalUserActions.tsx
 * @description Modal component for user management actions including search, role toggle, and password reset
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useUserManagement, useUserOperations } from '@/contexts/UserManagementContext'

interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  lastLoginAt?: string
  emailVerified: boolean
}

interface ModalUserActionsProps {
  isOpen: boolean
  onClose: () => void
  onUserAction?: (action: string, userId: string) => void
}

export function ModalUserActions({ isOpen, onClose, onUserAction }: ModalUserActionsProps) {
  const { users, loading, error, searchUsers } = useUserManagement()
  const { toggleUserRole, resetUserPassword, bulkUpdateRoles } = useUserOperations()
  const [searchTerm, setSearchTerm] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL')

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to close modal
      if (event.key === 'Escape') {
        onClose()
        return
      }

      // Ctrl/Cmd + F to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        document.getElementById('user-search')?.focus()
        return
      }

      // Ctrl/Cmd + A to select all users
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault()
        toggleAllUsers()
        return
      }

      // Ctrl/Cmd + Enter to bulk promote selected users
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && selectedUsers.size > 0) {
        event.preventDefault()
        handleBulkAction('promote')
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedUsers])

  const filteredUsers = useMemo(() => {
    let result = searchTerm ? searchUsers(searchTerm) : users

    // Apply role filter
    if (roleFilter !== 'ALL') {
      result = result.filter(user => user.role === roleFilter)
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      const isVerified = statusFilter === 'VERIFIED'
      result = result.filter(user => user.emailVerified === isVerified)
    }

    return result
  }, [searchTerm, searchUsers, users, roleFilter, statusFilter])

  const handleToggleRole = async (userId: string) => {
    setIsProcessing(true)
    try {
      const success = await toggleUserRole(userId)
      if (success) {
        onUserAction?.('role-toggled', userId)
      }
    } catch (error) {
      console.error('Failed to toggle role:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePasswordReset = async (userId: string) => {
    setIsProcessing(true)
    try {
      const success = await resetUserPassword(userId)
      if (success) {
        onUserAction?.('password-reset', userId)
        alert('Password reset email sent successfully!')
      }
    } catch (error) {
      console.error('Failed to send password reset:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkAction = async (action: 'promote' | 'demote' | 'reset-password') => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user')
      return
    }

    setIsProcessing(true)
    try {
      const userIds = Array.from(selectedUsers)
      
      if (action === 'reset-password') {
        // Handle bulk password reset
        let allSuccessful = true
        for (const userId of userIds) {
          const success = await resetUserPassword(userId)
          if (!success) {
            allSuccessful = false
            break
          }
        }
        
        if (allSuccessful) {
          onUserAction?.('bulk-password-reset', userIds.join(','))
          setSelectedUsers(new Set())
          alert('Password reset emails sent successfully!')
        }
      } else {
        // Handle bulk role update
        const newRole = action === 'promote' ? 'ADMIN' : 'USER'
        const success = await bulkUpdateRoles(userIds, newRole)
        
        if (success) {
          onUserAction?.(`bulk-${action}`, userIds.join(','))
          setSelectedUsers(new Set())
          alert(`${action.replace('-', ' ')} completed successfully!`)
        }
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">User Management Actions</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts:</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  <span><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Esc</kbd> Close modal</span>
                  <span><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Ctrl+F</kbd> Focus search</span>
                  <span><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Ctrl+A</kbd> Select all</span>
                  <span><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Ctrl+Enter</kbd> Bulk promote</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    id="user-search"
                    type="text"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
                    className="block px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admins</option>
                    <option value="USER">Users</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'VERIFIED' | 'UNVERIFIED')}
                    className="block px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="ALL">All Status</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="UNVERIFIED">Unverified</option>
                  </select>
                </div>

                <div className="flex-1 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setRoleFilter('ALL')
                      setStatusFilter('ALL')
                    }}
                    className="text-sm text-primary hover:text-primary"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.size > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                  <button
                    onClick={() => handleBulkAction('promote')}
                    disabled={isProcessing}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Promote to Admin
                  </button>
                  <button
                    onClick={() => handleBulkAction('demote')}
                    disabled={isProcessing}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    Demote to User
                  </button>
                  <button
                    onClick={() => handleBulkAction('reset-password')}
                    disabled={isProcessing}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Reset Passwords
                  </button>
                  <span className="text-sm text-gray-500">
                    ({selectedUsers.size} selected)
                  </span>
                </div>
              )}
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  </svg>
                  <span className="text-gray-600">Loading users...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                    <div className="mt-4">
                      <button
                        onClick={() => window.location.reload()}
                        className="text-sm font-medium text-red-600 hover:text-red-500 underline"
                      >
                        Try refreshing the page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Table */}
            {!loading && !error && (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleAllUsers}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.email}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.emailVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                            {user.lastLoginAt && (
                              <span className="text-xs text-gray-500">
                                Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleRole(user.id)}
                              disabled={isProcessing}
                              className="text-primary hover:text-primary px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
                            >
                              {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              onClick={() => handlePasswordReset(user.id)}
                              disabled={isProcessing}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium disabled:opacity-50"
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="text-gray-500">No users found matching your criteria</div>
              </div>
            )}
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}