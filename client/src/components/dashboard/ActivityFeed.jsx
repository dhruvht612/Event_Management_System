import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'
import { glassCard } from './dashboardStyles.js'

export function ActivityFeed({ tickets }) {
  const items = []

  const normalized = (tickets || []).map((t) => ({
    ...t,
    eventTitle: t.eventTitle || t.event_title,
    startAt: t.startAt || t.start_at,
    endAt: t.endAt || t.end_at,
    eventId: t.eventId || t.event_id,
    registeredAt: t.registered_at || t.registeredAt,
  }))

  const byReg = [...normalized]
    .filter((t) => t.registeredAt)
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 4)

  byReg.forEach((t) => {
    items.push({
      key: `reg-${t.id}`,
      icon: CheckCircle2,
      tone: 'text-emerald-400/90',
      line: (
        <>
          You registered for{' '}
          <Link to={`/events/${t.eventId}`} className="font-medium text-violet-300 hover:text-violet-200">
            {t.eventTitle}
          </Link>
        </>
      ),
      time: format(new Date(t.registeredAt), 'MMM d · p'),
    })
  })

  const soon = normalized.filter((t) => {
    const s = new Date(t.startAt).getTime()
    const e = new Date(t.endAt).getTime()
    const now = +new Date()
    if (now >= s && now <= e) {
      return true
    }
    if (s > now && s - now < 72 * 3600000) return true
    return false
  })

  soon.slice(0, 2).forEach((t) => {
    const s = new Date(t.startAt)
    items.push({
      key: `soon-${t.eventId}`,
      icon: Clock,
      tone: 'text-amber-400/90',
      line: (
        <>
          <span className="font-medium text-zinc-200">{t.eventTitle}</span> is starting{' '}
          {formatDistanceToNow(s, { addSuffix: true })}
        </>
      ),
      time: format(s, 'MMM d · p'),
    })
  })

  const merged = items.slice(0, 6)

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">Activity</h2>
      <p className="mt-1 text-sm text-zinc-500">Recent registrations and reminders</p>
      <div className={`${glassCard} relative mt-5 overflow-hidden p-0`}>
        {merged.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">Activity will show as you register for events.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {merged.map((it, i) => {
              const Icon = it.icon
              return (
              <motion.li
                key={it.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 px-5 py-4"
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ${it.tone}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-zinc-300">{it.line}</p>
                  <p className="mt-1 text-xs text-zinc-600">{it.time}</p>
                </div>
              </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
