import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../lib/api.js'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setSession } = useAuth()

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const token = params.get('token')
    if (!token) {
      navigate('/login?error=oauth', { replace: true })
      return
    }
    ;(async () => {
      try {
        const data = await api('/auth/me', { token })
        setSession(token, data.user)
        navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
      } catch {
        navigate('/login?error=oauth', { replace: true })
      }
    })()
  }, [navigate, setSession])

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[var(--color-muted)]">
      Completing sign-in…
    </div>
  )
}
