import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ems_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const data = await api('/auth/me', { token })
      setUser(data.user)
    } catch {
      setToken(null)
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    localStorage.setItem(STORAGE_KEY, data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (p) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(p),
    })
    setToken(data.token)
    localStorage.setItem(STORAGE_KEY, data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const setSession = (t, u) => {
    setToken(t)
    localStorage.setItem(STORAGE_KEY, t)
    setUser(u)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      setSession,
      refresh,
    }),
    [user, token, loading, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside provider')
  return ctx
}
