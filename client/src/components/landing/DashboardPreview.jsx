import { motion } from 'framer-motion'
import {
  Activity,
  MessageSquare,
  QrCode,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

const card =
  'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-xl backdrop-blur-sm transition duration-500 hover:border-violet-500/30 hover:shadow-violet-500/10 md:p-5 xl:rounded-[1.25rem] xl:p-5 2xl:p-6'

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none lg:justify-self-end 2xl:max-w-2xl"
    >
      <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-fuchsia-600/20 blur-3xl 2xl:-inset-10" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[80px] xl:h-80 xl:w-80" />

      <div className="relative space-y-4 md:space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${card} flex items-center justify-between gap-3`}
        >
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 text-emerald-400 md:h-12 md:w-12">
              <Activity className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-500 md:text-sm">Live overview</p>
              <p className="truncate text-sm font-semibold text-white md:text-base">Spring Hackathon</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30 md:px-3 md:py-1.5 md:text-sm">
            Live
          </span>
        </motion.div>

        <div className="grid gap-4 md:gap-5 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className={`${card} group`}
          >
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 md:text-[0.8125rem]">
                Registrations
              </span>
              <Users className="h-4 w-4 text-violet-400/80 md:h-5 md:w-5" />
            </div>
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white md:text-4xl xl:text-5xl">
              1,247
            </p>
            <p className="mt-1 text-xs text-emerald-400/90 md:text-sm">+18% vs last event</p>
            <div className="mt-4 h-14 overflow-hidden rounded-lg bg-gradient-to-t from-violet-500/10 to-transparent md:h-16">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 120 40">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  d="M0 32 Q30 8 60 20 T120 12"
                  fill="none"
                  stroke="url(#dashPreviewGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="dashPreviewGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className={`${card}`}
          >
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 md:text-[0.8125rem]">
                Capacity
              </span>
              <TrendingUp className="h-4 w-4 text-amber-400/90 md:h-5 md:w-5" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl xl:text-5xl">
                  94%
                </p>
                <p className="text-xs text-zinc-500 md:text-sm">112 / 120 seats</p>
              </div>
              <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 p-0.5 ring-1 ring-amber-400/20 md:h-[4.5rem] md:w-[4.5rem]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900/80 text-xs font-bold text-amber-200 md:text-sm">
                  94%
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid gap-4 md:gap-5 sm:grid-cols-2"
        >
          <div className={`${card} flex flex-col gap-3 md:gap-4`}>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 md:text-[0.8125rem]">
              Member tiers
            </span>
            <div className="flex flex-wrap gap-2">
              {['Free', 'Premium', 'VIP'].map((tier, i) => (
                <span
                  key={tier}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition hover:scale-105 md:px-3.5 md:py-1.5 md:text-sm ${
                    i === 1
                      ? 'bg-violet-500/20 text-violet-200 ring-violet-500/40'
                      : 'bg-white/5 text-zinc-400 ring-white/10'
                  }`}
                >
                  {tier}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 md:text-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400 md:h-4 md:w-4" />
              Early access & discounts active
            </div>
          </div>
          <div className={`${card} flex items-center gap-4 md:gap-5`}>
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 md:h-[5rem] md:w-[5rem]">
              <QrCode className="h-9 w-9 text-violet-300/90 md:h-10 md:w-10" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white md:text-base">QR check-in</p>
              <p className="text-xs text-zinc-500 md:text-sm">Instant validation at the door</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className={`${card} relative overflow-hidden`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-indigo-600/10" />
          <div className="relative flex items-start gap-3 md:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 md:h-11 md:w-11">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white md:text-base">Event chat</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400 md:text-sm">
                24 new messages · organizers pinned an announcement for check-in times.
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300 md:text-xs">
              Real-time
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
