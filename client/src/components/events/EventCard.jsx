import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import { spotsLeft, statusBadge, isLiveNow } from './eventUtils.js'

export function EventCard({ event, index = 0 }) {
  const left = spotsLeft(event)
  const badge = statusBadge(event)
  const live = isLiveNow(event)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.06)] transition duration-300 hover:-translate-y-1 hover:border-violet-500/35 hover:shadow-[0_20px_50px_-20px_rgba(139,92,246,0.25)]"
    >
      <Link
        to={`/events/${event.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`View ${event.title}`}
      />
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl transition-opacity group-hover:opacity-100" />

      <div className="relative z-10 mb-4 flex flex-wrap items-center gap-2">
        {live && (
          <span className="pointer-events-none rounded-full bg-red-500/20 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-red-200 ring-1 ring-red-500/40">
            Live
          </span>
        )}
        <span
          className={`pointer-events-none rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ring-1 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <h3 className="relative z-10 font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-zinc-50 group-hover:text-white">
        {event.title}
      </h3>

      <p className="relative z-10 mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">{event.description}</p>

      <ul className="relative z-10 mt-5 space-y-2.5 text-sm text-zinc-400">
        <li className="flex items-start gap-2.5">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-violet-400/90" />
          <span>{format(new Date(event.startAt), 'EEE, MMM d · h:mm a')}</span>
        </li>
        <li className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-400/90" />
          <span className="line-clamp-2">
            {event.locationType === 'virtual' ? 'Virtual' : 'In person'} · {event.locationText || '—'}
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <Users className="h-4 w-4 shrink-0 text-violet-400/90" />
          <span>
            {left} spots left · {event.capacity} capacity
          </span>
        </li>
        {event.organizerName && (
          <li className="text-xs text-zinc-500">Organized by {event.organizerName}</li>
        )}
      </ul>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {(event.tags || []).map((t) => (
          <span
            key={t}
            className="pointer-events-none rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-zinc-400"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-3">
        <Link
          to={`/events/${event.id}`}
          className="pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/35 sm:flex-none sm:px-6"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to={`/events/${event.id}`}
          className="pointer-events-auto rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-violet-400/30 hover:text-white"
        >
          Register
        </Link>
      </div>
    </motion.article>
  )
}
