import { motion } from 'framer-motion'
import { glassCard, glassCardHover } from './dashboardStyles.js'

export function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`${glassCard} ${glassCardHover} relative overflow-hidden p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-white">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
        </div>
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
      </div>
    </motion.div>
  )
}
