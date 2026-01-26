/**
 * @file UserManagementContext.tsx
 * @description Context for managing user state with caching and real-time updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  lastLoginAt?: string
  emailVerified: boolean
}

interface UserManagementState {
  users: User[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface UserManagementContextType extends UserManagementState {
  refreshUsers: () => Promise<void>
  updateUser: (userId: string, updates: Partial<User>) => void
  addUser: (user: User) => void
  removeUser: (userId: string) => void
  searchUsers: (query: string) => User[]
  filterByRole: (role: 'USER' | 'ADMIN' | 'ALL') => User[]
  getSelectedUsers: (userIds: string[]) => User[]
}

const UserManagementContext = createContext<UserManagementContextType | null>(null)

interface UserManagementProviderProps {
  children: React.ReactNode
}

export function UserManagementProvider({ children }: UserManagementProviderProps): React.ReactElement {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: false,
    error: null,
    lastUpdated: null
  })

  const [cacheTimeout, setCacheTimeout] = useState<NodeJS.Timeout | null>(null)

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000

  const refreshUsers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // In a real implementation, this would call your API
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch users')
      }

      // Update local state with fetched users
      setState(prev => ({ ...prev, users: data.users || [], loading: false, lastUpdated: new Date() }))
      return data.users || []
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setState(prev => ({ ...prev, loading: false, error: String(error) }))
      return []
    }
  }, [])

  // Simple cache cleanup on unmount
  useEffect(() => {
    return () => {
      if (cacheTimeout) clearTimeout(cacheTimeout)
    }
  }, [cacheTimeout])

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => (u.id === userId ? { ...u, ...updates } : u)),
      error: null,
      lastUpdated: new Date()
    }))
  }, [])

  const addUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, user] }))
  }, [])

  const removeUser = useCallback((userId: string) => {
    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }))
  }, [])

  const searchUsers = useCallback((query: string) => {
    return state.users.filter(user => 
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(query.toLowerCase()))
    )
  }, [state.users])

  const filterByRole = useCallback((role: 'USER' | 'ADMIN' | 'ALL') => {
    return role === 'ALL' 
      ? state.users
      : state.users.filter(user => user.role === role)
  }, [state.users])

  const getSelectedUsers = useCallback((userIds: string[]) => {
    return state.users.filter(user => userIds.includes(user.id))
  }, [state.users])

  const contextValue: UserManagementContextType = {
    ...state,
    refreshUsers,
    updateUser,
    addUser,
    removeUser,
    searchUsers,
    filterByRole,
    getSelectedUsers
  }

  return (
    <UserManagementContext.Provider value={contextValue}>
      {children}
    </UserManagementContext.Provider>
  );
}

/**
 * Hook: useUserManagement
 */
export function useUserManagement(): UserManagementContextType {
  const ctx = useContext(UserManagementContext)
  if (!ctx) throw new Error('useUserManagement must be used within UserManagementProvider')
  return ctx
}

/**
 * Hook: useUserOperations (subset of operations)
 */
export function useUserOperations() {
  const ctx = useUserManagement()
  
  const toggleUserRole = useCallback(async (userId: string) => {
    try {
      const user = ctx.users.find(u => u.id === userId)
      if (!user) return false
      
      const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) throw new Error('Failed to toggle role')
      ctx.updateUser(userId, { role: newRole })
      return true
    } catch (error) {
      console.error('Error toggling user role:', error)
      return false
    }
  }, [ctx])
  
  const resetUserPassword = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) throw new Error('Failed to reset password')
      return true
    } catch (error) {
      console.error('Error resetting user password:', error)
      return false
    }
  }, [])
  
  const bulkUpdateRoles = useCallback(async (userIds: string[], newRole: 'USER' | 'ADMIN') => {
    try {
      const response = await fetch('/api/admin/users/bulk-update-roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, role: newRole })
      })
      
      if (!response.ok) throw new Error('Failed to update roles')
      userIds.forEach(id => ctx.updateUser(id, { role: newRole }))
      return true
    } catch (error) {
      console.error('Error bulk updating roles:', error)
      return false
    }
  }, [ctx])
  
  return {
    refreshUsers: ctx.refreshUsers,
    updateUser: ctx.updateUser,
    addUser: ctx.addUser,
    removeUser: ctx.removeUser,
    searchUsers: ctx.searchUsers,
    filterByRole: ctx.filterByRole,
    getSelectedUsers: ctx.getSelectedUsers,
    toggleUserRole,
    resetUserPassword,
    bulkUpdateRoles
  }
}