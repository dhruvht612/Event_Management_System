import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { AuthPageShell, AuthCard } from '../components/auth/index.js'

export function ForgotPassword() {
  return (
    <AuthPageShell>
      <AuthCard>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
            Reset password
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Password reset by email isn&apos;t enabled in this demo. Contact your campus admin or use
            Google sign-in from the login page.
          </p>
        </motion.div>
        <div className="mt-8 flex justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-500">
            <Mail className="h-7 w-7" aria-hidden />
          </span>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link to="/login" className="font-semibold text-violet-400 transition hover:text-violet-300">
            ← Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  )
}
