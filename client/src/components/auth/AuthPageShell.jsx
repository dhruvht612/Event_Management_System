import { motion } from 'framer-motion'

/**
 * Full-viewport dark backdrop + purple glows for auth pages (matches Nexus Events landing).
 */
export function AuthPageShell({ children }) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#020617]" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-violet-950/35 via-[#020617]/80 to-indigo-950/25"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed left-[12%] top-20 z-0 h-[min(480px,50vh)] w-[min(480px,85vw)] rounded-full bg-violet-600/20 blur-[100px]"
        animate={{ opacity: [0.45, 0.72, 0.45], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed bottom-0 right-0 z-0 h-[360px] w-[360px] translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-600/15 blur-[90px]"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed left-1/2 top-32 z-0 h-px w-[min(90%,640px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
