import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function AuthCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto w-full max-w-md sm:max-w-lg ${className}`.trim()}
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_80px_-12px_rgba(0,0,0,0.65),0_0_60px_-15px_rgba(139,92,246,0.35)] backdrop-blur-2xl sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
          style={{
            background:
              'radial-gradient(900px 400px at 50% -20%, rgba(139, 92, 246, 0.18), transparent 55%)',
          }}
        />
        <div className="relative">
          <Link
            to="/"
            className="group mb-8 flex flex-col items-center gap-3 outline-none transition hover:opacity-90"
          >
            <motion.span
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-base font-bold text-white shadow-lg shadow-violet-500/40 ring-1 ring-white/20"
            >
              N
            </motion.span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white">
              Nexus Events
            </span>
          </Link>
          {children}
        </div>
      </div>
    </motion.div>
  )
}
