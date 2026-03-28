import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  AuthPageShell,
  AuthCard,
  AuthInput,
  AuthPrimaryButton,
  GoogleAuthButton,
} from '../components/auth/index.js'
import { ApiError } from '../lib/api.js'

const REMEMBER_EMAIL_KEY = 'nexus_remember_email'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_EMAIL_KEY) || '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem(REMEMBER_EMAIL_KEY))
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'oauth') {
      setErr('Google sign-in failed. Please try again.')
    }
  }, [searchParams])

  const googleHref = `${window.location.origin}/api/auth/google`

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const loggedIn = await login(email, password)
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }
      if (loggedIn?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (er) {
      setErr(er instanceof ApiError ? er.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.35 }}
          className="text-center"
        >
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Sign in to manage events, registrations, and memberships.
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {err && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200"
            >
              {err}
            </motion.p>
          )}

          <AuthInput
            label="Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@university.edu"
          />

          <AuthInput
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-zinc-400 transition hover:text-zinc-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  const v = e.target.checked
                  setRememberMe(v)
                  if (!v) localStorage.removeItem(REMEMBER_EMAIL_KEY)
                }}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500/40"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="font-medium text-violet-400/90 transition hover:text-violet-300"
            >
              Forgot password?
            </Link>
          </div>

          <AuthPrimaryButton loading={loading}>Sign in</AuthPrimaryButton>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 backdrop-blur-sm">
              or
            </span>
          </div>
        </div>

        <GoogleAuthButton href={googleHref} />

        <p className="mt-8 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-violet-400 transition hover:text-violet-300"
          >
            Create your Nexus Events account
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  )
}
