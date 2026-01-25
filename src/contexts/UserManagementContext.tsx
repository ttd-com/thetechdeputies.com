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
      
      return data.users || []
    } catch (error) {
      console.error('Failed to fetch users:', error)
      return []
    }
  }, [])

  // Set up cache invalidation
  if (cacheTimeout) {
    clearTimeout(cacheTimeout)
  }
      
  setCacheTimeout(null)
  }, [])

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
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
  }, [state.users, query])

  const filterByRole = useCallback((role: 'USER' | 'ADMIN' | 'ALL') => {
    return role === 'ALL' 
      ? state.users
      : state.users.filter(user => user.role === role)
  }, [state.users, role])

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