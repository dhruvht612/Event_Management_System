import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, Ticket, Sparkles, PlusCircle, LayoutGrid, CheckCircle2, Crown } from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { StatCard } from '../components/dashboard/StatCard.jsx'
import { TicketCard } from '../components/dashboard/TicketCard.jsx'
import { UpcomingEventsSection } from '../components/dashboard/UpcomingEventsSection.jsx'
import { RecommendedEventCard } from '../components/dashboard/RecommendedEventCard.jsx'
import { ActivityFeed } from '../components/dashboard/ActivityFeed.jsx'
import { SavedEventsSection } from '../components/dashboard/SavedEventsSection.jsx'

function tierLabel(tier) {
  if (tier === 'vip') return 'VIP'
  if (tier === 'premium') return 'Premium'
  return 'Free'
}

export function Dashboard() {
  const { token, user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [recs, setRecs] = useState([])
  const [saved, setSaved] = useState([])
  const [badges, setBadges] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [loadingSaved, setLoadingSaved] = useState(true)

  useEffect(() => {
    let cancelled = false
    void Promise.resolve()
      .then(() => {
        if (cancelled) return
        setLoadingTickets(true)
        setLoadingSaved(true)
        return Promise.all([
          api('/me/tickets', { token }).then((d) => {
            if (!cancelled) setTickets(d.tickets || [])
          }),
          api('/recommendations', { token }).then((d) => {
            if (!cancelled) setRecs(d.events || [])
          }),
          api('/users/badges', { token }).then((d) => {
            if (!cancelled) setBadges(d.badges || [])
          }),
          api('/users/saved-events', { token }).then((d) => {
            if (!cancelled) setSaved(d.events || [])
          }),
        ])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setLoadingTickets(false)
          setLoadingSaved(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const stats = useMemo(() => {
    /* snapshot for dashboard stats */
    const now = +new Date()
    const list = tickets || []
    let attended = 0
    let upcoming = 0
    for (const t of list) {
      const end = new Date(t.end_at || t.endAt).getTime()
      const start = new Date(t.start_at || t.startAt).getTime()
      if (end < now) attended += 1
      else if (start >= now || (now >= start && now <= end)) upcoming += 1
    }
    return {
      attended,
      upcoming,
      ticketsOwned: list.length,
      membership: tierLabel(user?.membershipTier),
    }
  }, [tickets, user])

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin'

  return (
    <div className="relative min-h-screen pb-20 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[#020617]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-violet-950/25 via-transparent to-indigo-950/20" />
      <div className="pointer-events-none fixed left-1/3 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/12 blur-[100px]" />

      <div className="relative z-10 w-full py-10 sm:py-12 lg:py-14">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-200/90">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Smart Event Dashboard
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-xl text-lg text-zinc-400">
              Your tickets, activity, and personalized recommendations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-violet-500/40 hover:bg-white/[0.1]"
            >
              <LayoutGrid className="h-4 w-4 text-violet-400" />
              Browse events
            </Link>
            {isOrganizer && (
              <Link
                to="/events/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 ring-1 ring-white/15 transition hover:brightness-110"
              >
                <PlusCircle className="h-4 w-4" />
                Create event
              </Link>
            )}
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="relative mt-12"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-violet-600/5 via-transparent to-indigo-600/5 blur-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={CalendarDays} label="Upcoming events" value={stats.upcoming} sub="Registered & not over" />
            <StatCard icon={Ticket} label="Tickets owned" value={stats.ticketsOwned} sub="Active registrations" />
            <StatCard icon={CheckCircle2} label="Events attended" value={stats.attended} sub="Past events" />
            <StatCard icon={Crown} label="Membership" value={stats.membership} sub="Your tier" />
          </div>
        </motion.section>

        {badges.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="relative mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Badges</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b.badge_key}
                  className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200"
                >
                  {b.badge_key.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
          {loadingTickets ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : (
            <UpcomingEventsSection tickets={tickets} />
          )}

          <section className="relative">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                  My tickets
                </h2>
                <p className="mt-1 text-sm text-zinc-500">QR codes and status for every registration</p>
              </div>
            </div>
            {!tickets.length ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
                <Ticket className="mx-auto h-12 w-12 text-zinc-600" />
                <p className="mt-4 text-zinc-500">No tickets yet.</p>
                <Link
                  to="/events"
                  className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  Browse events
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {tickets.map((t, i) => (
                  <TicketCard key={t.id} ticket={t} index={i} />
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-12 xl:grid-cols-2 xl:gap-16">
            <ActivityFeed tickets={tickets} />
            <div className="xl:pt-0">
              <SavedEventsSection events={saved} loading={loadingSaved} />
            </div>
          </div>

          <section className="relative">
            <div className="pointer-events-none absolute -right-10 top-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="relative mb-8">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                Recommended for you
              </h2>
              <p className="mt-1 text-sm text-zinc-500">Based on your interests and campus activity</p>
            </div>
            {!recs.length ? (
              <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-14 text-center text-sm text-zinc-500">
                Join an event to unlock personalized picks.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {recs.map((ev, i) => (
                  <RecommendedEventCard key={ev.id} event={ev} index={i} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
