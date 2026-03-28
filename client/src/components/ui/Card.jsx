import { motion } from 'framer-motion'

export function Card({ className = '', children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
