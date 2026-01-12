"use client"

import { createContext, useState, useCallback, useEffect, type ReactNode } from "react"

interface User {
  id?: string
  email?: string
  name?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  setError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
  login: (userData: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const storedUser = localStorage.getItem("user")

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
      }
    }
  }, [])

  const login = useCallback((userData: User, token: string) => {
    localStorage.setItem("authToken", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    setError(null)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setUser(null)
    setError(null)
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    setError,
    setIsLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
