import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  AuthPageShell,
  AuthCard,
  AuthInput,
  AuthPrimaryButton,
  GoogleAuthButton,
} from '../components/auth/index.js'
import { ApiError } from '../lib/api.js'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('attendee')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [fieldErr, setFieldErr] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const googleHref = `${window.location.origin}/api/auth/google`

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setFieldErr('')
    if (password !== confirmPassword) {
      setFieldErr('confirmPassword')
      setErr('Passwords do not match.')
      return
    }
    if (!termsAccepted) {
      setErr('Please accept the terms to continue.')
      return
    }
    setLoading(true)
    try {
      const u = await register({
        name,
        email,
        password,
        organization: organization.trim() || undefined,
        role,
      })
      navigate(u?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (er) {
      setErr(er instanceof ApiError ? er.message : 'Registration failed')
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
            Create your Nexus Events account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Host or join campus events with a single profile — hackathons, workshops, and more.
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
            label="Full name"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Alex Morgan"
          />

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
            label="Organization / university"
            icon={Building2}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            autoComplete="organization"
            placeholder="Optional — e.g. State University CS Club"
          />

          <div>
            <p className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Role
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1">
              {[
                { id: 'attendee', label: 'Attendee', hint: 'Browse & register' },
                { id: 'organizer', label: 'Organizer', hint: 'Create & manage' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRole(opt.id)}
                  className={`rounded-lg px-3 py-2.5 text-left transition ${
                    role === opt.id
                      ? 'bg-gradient-to-br from-violet-600/90 to-indigo-600/90 text-white shadow-lg shadow-violet-900/40 ring-1 ring-white/20'
                      : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
                  }`}
                >
                  <span className="block text-sm font-semibold">{opt.label}</span>
                  <span className="mt-0.5 block text-[11px] font-normal opacity-80">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <AuthInput
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setFieldErr('')
            }}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />

          <AuthInput
            label="Confirm password"
            icon={Lock}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setFieldErr('')
            }}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repeat password"
            error={fieldErr === 'confirmPassword' ? 'Must match password above' : undefined}
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400 transition hover:border-white/15">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500/40"
            />
            <span>
              I agree to the{' '}
              <span className="text-zinc-300">Terms of Service</span> and{' '}
              <span className="text-zinc-300">Privacy Policy</span> for Nexus Events.
            </span>
          </label>

          <div className="pt-1">
            <AuthPrimaryButton loading={loading}>Create account</AuthPrimaryButton>
          </div>
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

        <GoogleAuthButton href={googleHref}>Sign up with Google</GoogleAuthButton>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-violet-400 transition hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  )
}
