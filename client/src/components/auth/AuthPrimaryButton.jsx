import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function AuthPrimaryButton({ children, loading, disabled, className = '', ...props }) {
  const isDisabled = disabled || loading
  return (
    <motion.button
      type="submit"
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={`group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 ring-1 ring-white/15 transition-[box-shadow] hover:shadow-xl hover:shadow-violet-500/35 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
