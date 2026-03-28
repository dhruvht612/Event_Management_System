import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar, MapPin, Sparkles, ArrowRight, Users } from 'lucide-react'
import { spotsLeft, statusBadge } from './eventUtils.js'

export function FeaturedEventBanner({ event }) {
  if (!event) return null
  const left = spotsLeft(event)
  const badge = statusBadge(event)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-10 overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-600/20 via-indigo-900/20 to-[#0f172a] p-8 shadow-[0_0_0_1px_rgba(139,92,246,0.15),0_24px_80px_-24px_rgba(0,0,0,0.6)] md:p-10 lg:flex lg:items-stretch lg:gap-10"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-violet-500/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-[90px]" />

      <div className="relative flex-1">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-100">
          <Sparkles className="h-3.5 w-3.5" />
          Featured event
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
          {event.title}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">{event.description}</p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-300">
          <span className="inline-flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 backdrop-blur-sm">
            <Calendar className="h-4 w-4 text-violet-300" />
            {format(new Date(event.startAt), 'EEEE, MMMM d · h:mm a')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-violet-300" />
            {event.locationText}
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 backdrop-blur-sm">
            <Users className="h-4 w-4 text-violet-300" />
            {left} spots left
          </span>
          <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ring-1 ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-violet-900 shadow-xl transition hover:bg-zinc-100"
          >
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            Register now
          </Link>
        </div>
      </div>

      <div className="relative mt-8 hidden w-full max-w-sm shrink-0 rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-md lg:mt-0 lg:block">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Quick stats</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Capacity</dt>
            <dd className="font-semibold text-white">{event.capacity}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Registered</dt>
            <dd className="font-semibold text-white">{event.confirmedCount ?? 0}</dd>
          </div>
          {event.organizerName && (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Organizer</dt>
              <dd className="text-right font-medium text-zinc-200">{event.organizerName}</dd>
            </div>
          )}
        </dl>
      </div>
    </motion.section>
  )
}
