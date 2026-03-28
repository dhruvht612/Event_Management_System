import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Sparkles, Flame } from 'lucide-react'
import { spotsLeft, statusBadge } from '../events/eventUtils.js'
import { glassCard, glassCardHover } from './dashboardStyles.js'

function extraBadges(ev) {
  const list = []
  const created = ev.createdAt ? new Date(ev.createdAt) : null
  if (created && Date.now() - created.getTime() < 7 * 86400000) {
    list.push({ key: 'new', label: 'New', className: 'bg-cyan-500/15 text-cyan-200 ring-cyan-500/30' })
  }
  const cap = ev.capacity || 1
  const taken = ev.confirmedCount ?? 0
  if (cap > 10 && taken / cap >= 0.4) {
    list.push({ key: 'trending', label: 'Trending', className: 'bg-orange-500/15 text-orange-200 ring-orange-500/30' })
  }
  const sb = statusBadge(ev)
  if (sb.label === 'Almost full') {
    list.push({ key: 'full', label: 'Almost full', className: `${sb.className} ring-1` })
  }
  return list.slice(0, 2)
}

export function RecommendedEventCard({ event: ev, index = 0 }) {
  const left = spotsLeft(ev)
  const badges = extraBadges(ev)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`${glassCard} ${glassCardHover} relative flex h-full flex-col overflow-hidden p-5 sm:p-6`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {badges.map((b) => (
          <span
            key={b.key}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${b.className}`}
          >
            {b.key === 'trending' && <Flame className="h-3 w-3" />}
            {b.key === 'new' && <Sparkles className="h-3 w-3" />}
            {b.label}
          </span>
        ))}
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-white">
        {ev.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
        {ev.description || 'Join the community on campus.'}
      </p>
      <div className="mt-4 space-y-2 text-sm text-zinc-500">
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-violet-400/90" />
          {format(new Date(ev.startAt), 'MMM d, yyyy · p')}
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-400/90" />
          <span className="line-clamp-1">{ev.locationText || ev.locationType}</span>
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-violet-400/90" />
          {ev.confirmedCount ?? 0} going · {left} spots left
        </p>
      </div>
      {ev.tags && ev.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ev.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 flex gap-2">
        <Link
          to={`/events/${ev.id}`}
          className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-violet-900/30 ring-1 ring-white/15 transition hover:brightness-110"
        >
          Register
        </Link>
        <Link
          to={`/events/${ev.id}`}
          className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-violet-500/40 hover:bg-white/[0.1]"
        >
          View
        </Link>
      </div>
    </motion.div>
  )
}
