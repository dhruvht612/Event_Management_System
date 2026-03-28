import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { DashboardPreview } from './DashboardPreview.jsx'

const pills = ['QR Check-in', 'Waitlists', 'Memberships', 'Real-time Chat', 'Analytics']

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function HeroSection() {
  return (
    <section className="relative grid w-full grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-14 2xl:gap-16">
      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 min-w-0 max-w-3xl lg:max-w-none">
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-violet-100/95 shadow-lg shadow-violet-500/10 backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Built for student orgs and hackathons
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 font-[family-name:var(--font-display)] text-[2rem] font-semibold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem] xl:text-[3.5rem] 2xl:text-[3.75rem] 2xl:leading-[1.06]"
        >
          Run{' '}
          <span className="bg-gradient-to-r from-violet-100 via-white to-indigo-100 bg-clip-text text-transparent">
            hackathons & campus events
          </span>{' '}
          without the chaos
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl lg:max-w-2xl xl:text-[1.125rem] xl:leading-relaxed"
        >
          Registrations, waitlists, QR check-in, real-time chat, Stripe memberships, and analytics — in one polished
          dashboard.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-3 sm:gap-4">
          <Link
            to="/events"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/30 ring-1 ring-white/10 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/40 sm:px-8 sm:py-4 sm:text-[0.9375rem]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition group-hover:opacity-100" />
            <span className="relative">Browse events</span>
            <ArrowRight className="relative h-4 w-4 transition duration-300 group-hover:translate-x-1 sm:h-[1.125rem] sm:w-[1.125rem]" />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-zinc-50 shadow-inner shadow-black/20 backdrop-blur-sm transition duration-300 hover:border-violet-400/40 hover:bg-white/[0.1] sm:px-8 sm:py-4 sm:text-[0.9375rem]"
          >
            Create account
          </Link>
        </motion.div>

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-2 sm:gap-2.5">
          {pills.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-sm transition duration-300 hover:border-violet-500/30 hover:text-white sm:px-3.5 sm:text-[0.8125rem]"
            >
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <div className="relative min-h-0 min-w-0 lg:pl-2 xl:pl-4">
        <DashboardPreview />
      </div>
    </section>
  )
}
