import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { CalendarClock, Radio, Ticket, ArrowRight } from 'lucide-react'
import { glassCard, glassCardHover } from './dashboardStyles.js'

function eventPhase(startAt, endAt) {
  const now = Date.now()
  const s = new Date(startAt).getTime()
  const e = new Date(endAt).getTime()
  if (now >= s && now <= e) return 'live'
  if (now < s) return 'upcoming'
  return 'past'
}

export function UpcomingEventsSection({ tickets }) {
  const upcoming = (tickets || [])
    .map((t) => ({
      ...t,
      startAt: t.startAt || t.start_at,
      endAt: t.endAt || t.end_at,
      eventId: t.eventId || t.event_id,
      eventTitle: t.eventTitle || t.event_title,
    }))
    .filter((t) => {
      const phase = eventPhase(t.startAt, t.endAt)
      return phase === 'upcoming' || phase === 'live'
    })
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

  if (!upcoming.length) {
    return (
      <section className="relative">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
              Upcoming events
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Your registered events on the horizon</p>
          </div>
        </div>
        <div className={`${glassCard} border-dashed p-10 text-center text-sm text-zinc-500`}>
          No upcoming registrations —{' '}
          <Link to="/events" className="font-medium text-violet-400 hover:text-violet-300">
            browse events
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="relative">
      <div className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
            Upcoming events
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Registered — next on your calendar</p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1 text-sm font-medium text-violet-400 transition hover:text-violet-300"
        >
          Browse all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {upcoming.map((t, i) => {
          const phase = eventPhase(t.startAt, t.endAt)
          const start = new Date(t.startAt)
          const live = phase === 'live'
          const countdown =
            live
              ? 'Happening now'
              : `Starts ${formatDistanceToNow(start, { addSuffix: true })}`

          return (
            <motion.div
              key={t.id || t.eventId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className={`${glassCard} ${glassCardHover} relative overflow-hidden p-5 sm:p-6`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {live ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-200 ring-1 ring-red-500/40">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    Live
                  </span>
                ) : (
                  <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-200 ring-1 ring-violet-500/30">
                    Upcoming
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                {t.eventTitle}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-violet-400/80" />
                  {format(start, 'MMM d, yyyy · p')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-zinc-300">
                  <Radio className="h-4 w-4 text-emerald-400/90" />
                  {countdown}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/events/${t.eventId}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 ring-1 ring-white/15 transition hover:brightness-110 sm:flex-initial"
                >
                  <Ticket className="h-4 w-4" />
                  {live ? 'Join' : 'View ticket'}
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
