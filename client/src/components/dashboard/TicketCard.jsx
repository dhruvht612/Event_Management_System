import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { QrCode, ExternalLink } from 'lucide-react'
import { glassCard, glassCardHover } from './dashboardStyles.js'

function ticketUiStatus(startAt, endAt) {
  const now = Date.now()
  const start = new Date(startAt).getTime()
  const end = new Date(endAt).getTime()
  if (now >= start && now <= end) {
    return { label: 'Active', pill: 'bg-emerald-500/20 text-emerald-200 ring-emerald-500/30' }
  }
  if (now > end) {
    return { label: 'Used', pill: 'bg-zinc-500/20 text-zinc-300 ring-zinc-500/35' }
  }
  return { label: 'Active', pill: 'bg-violet-500/20 text-violet-200 ring-violet-500/30' }
}

export function TicketCard({ ticket, index = 0 }) {
  const evId = ticket.eventId || ticket.event_id
  const title = ticket.eventTitle || ticket.event_title
  const startAt = ticket.startAt || ticket.start_at
  const endAt = ticket.endAt || ticket.end_at
  const qr = ticket.qrDataUrl
  const regStatus = ticket.status
  const ui = ticketUiStatus(startAt, endAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`${glassCard} ${glassCardHover} group relative flex flex-col overflow-hidden p-5 sm:p-6`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${ui.pill}`}
          >
            {ui.label}
          </span>
          {regStatus === 'waitlist' && (
            <span className="ml-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-200 ring-1 ring-amber-500/25">
              Waitlist
            </span>
          )}
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">{format(new Date(startAt), 'EEE, MMM d · p')}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400 ring-1 ring-white/10">
          <QrCode className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex justify-center sm:justify-start">
          {qr ? (
            <img
              src={qr}
              alt=""
              className="h-28 w-28 rounded-xl border border-white/10 bg-white p-1.5 shadow-inner shadow-black/40"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-xs text-zinc-500">
              QR loading…
            </div>
          )}
        </div>
        <Link
          to={`/events/${evId}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-violet-600/30 hover:ring-violet-500/40"
        >
          View details
          <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
        </Link>
      </div>
    </motion.div>
  )
}
