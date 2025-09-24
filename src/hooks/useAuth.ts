
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'

export interface User {
  projectId: string
  userId: string
  email: string
  userName: string
  userRole: 'ADMIN' | 'USER'
  createdTime: string
  accessToken: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(lumi.auth.user)
  const [isAuthenticated, setIsAuthenticated] = useState(lumi.auth.isAuthenticated)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = lumi.auth.onAuthChange(({ isAuthenticated, user }) => {
      setIsAuthenticated(isAuthenticated)
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async () => {
    setLoading(true)
    try {
      await lumi.auth.signIn()
    } catch (error) {
      console.error('Sign in failed:', error)
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await lumi.auth.signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
      setLoading(false)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    loading,
    signIn,
    signOut,
    isAdmin: user?.userRole === 'ADMIN'
  }
}
