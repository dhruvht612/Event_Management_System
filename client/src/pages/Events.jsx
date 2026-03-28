import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { landingContainer } from '../lib/landingLayout.js'
import { EventsToolbar } from '../components/events/EventsToolbar.jsx'
import { EventCard } from '../components/events/EventCard.jsx'
import { FeaturedEventBanner } from '../components/events/FeaturedEventBanner.jsx'
import { PopularCategories } from '../components/events/PopularCategories.jsx'
import { RecommendedStrip } from '../components/events/RecommendedStrip.jsx'

function buildQuery({ tab, sort, category, search }) {
  const q = new URLSearchParams()
  q.set('tab', tab)
  q.set('sort', sort)
  if (category) q.set('tag', category)
  if (search.trim()) q.set('search', search.trim())
  return q.toString()
}

export function Events() {
  const { token, user } = useAuth()
  const [events, setEvents] = useState([])
  const [recommended, setRecommended] = useState([])
  const [recLoading, setRecLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('date')
  const [tab, setTab] = useState('upcoming')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const skipFetch = tab === 'registered' && !user
  const shouldFetchRec = Boolean(token && tab === 'upcoming')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 320)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (skipFetch) return

    let cancelled = false
    const qs = buildQuery({ tab, sort, category, search: debouncedSearch })

    void Promise.resolve()
      .then(() => {
        if (cancelled) return
        setLoading(true)
        setErr('')
        return api(`/events?${qs}`, { token })
      })
      .then((d) => {
        if (cancelled || d === undefined) return
        setEvents(d.events || [])
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tab, sort, category, debouncedSearch, token, user, skipFetch])

  useEffect(() => {
    if (!shouldFetchRec) return

    let cancelled = false

    void Promise.resolve()
      .then(() => {
        if (cancelled) return
        setRecLoading(true)
        return api('/recommendations', { token })
      })
      .then((d) => {
        if (cancelled || d === undefined) return
        setRecommended(d.events || [])
      })
      .catch(() => {
        if (!cancelled) setRecommended([])
      })
      .finally(() => {
        if (!cancelled) setRecLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, shouldFetchRec])

  const displayEvents = useMemo(
    () => (skipFetch ? [] : events),
    [events, skipFetch],
  )

  const featured = useMemo(() => {
    if (tab !== 'upcoming' || category || debouncedSearch || !displayEvents.length) return null
    return [...displayEvents].sort((a, b) => b.capacity - a.capacity)[0]
  }, [displayEvents, tab, category, debouncedSearch])

  const gridEvents = useMemo(() => {
    if (!featured) return displayEvents
    return displayEvents.filter((e) => e.id !== featured.id)
  }, [displayEvents, featured])

  const totalVisible = (featured ? 1 : 0) + gridEvents.length

  const tagCounts = useMemo(() => {
    const m = {}
    displayEvents.forEach((e) => (e.tags || []).forEach((t) => { m[t] = (m[t] || 0) + 1 }))
    return m
  }, [displayEvents])

  const upcomingThisWeek = useMemo(() => {
    if (tab !== 'upcoming') return []
    const now = new Date()
    const week = new Date(now.getTime() + 7 * 86400000)
    return displayEvents.filter((e) => {
      const s = new Date(e.startAt)
      return s >= now && s <= week
    })
  }, [displayEvents, tab])

  const showLoading = loading && !skipFetch

  return (
    <div className="relative min-h-screen pb-16 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[#020617]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
      <div className="pointer-events-none fixed left-1/4 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />

      <div className={`relative z-10 pt-8 sm:pt-10 ${landingContainer}`}>
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200/90">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live events
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Events
            </h1>
            <p className="mt-2 max-w-xl text-lg text-zinc-400">
              Discover what&apos;s happening on campus — hackathons, workshops, talks, and more.
            </p>
          </div>
        </header>

        <EventsToolbar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          tab={tab}
          onTabChange={setTab}
          registeredDisabled={!user}
        />

        {err && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</p>
        )}

        {tab === 'registered' && !user && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-zinc-400">Sign in to see events you&apos;re registered for.</p>
            <Link
              to="/login"
              className="mt-4 inline-flex rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        )}

        {showLoading && (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        )}

        {!showLoading && !err && user && tab === 'registered' && !displayEvents.length && (
          <p className="mt-10 text-center text-zinc-500">You haven&apos;t registered for any events yet.</p>
        )}

        {!showLoading && !err && !(tab === 'registered' && !user) && (
          <>
            {featured && <FeaturedEventBanner event={featured} />}

            {upcomingThisWeek.length > 1 && tab === 'upcoming' && (
              <section className="mb-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Upcoming this week</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {upcomingThisWeek.map((ev) => (
                    <Link
                      key={ev.id}
                      to={`/events/${ev.id}`}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-500/30"
                    >
                      {ev.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">
                  {tab === 'past' ? 'Past events' : tab === 'registered' ? 'Your events' : 'All upcoming'}
                </h2>
                <span className="text-sm text-zinc-500">{totalVisible} event{totalVisible !== 1 ? 's' : ''}</span>
              </div>

              {gridEvents.length === 0 && !featured ? (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-16 text-center text-zinc-500">
                  No events match your filters.
                </p>
              ) : gridEvents.length === 0 && featured ? (
                <p className="text-sm text-zinc-500">No other events match these filters — see the featured event above.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {gridEvents.map((ev, i) => (
                    <EventCard key={ev.id} event={ev} index={i} />
                  ))}
                </div>
              )}
            </section>

            <PopularCategories tagCounts={tagCounts} onPick={(tag) => setCategory(tag)} />

            <RecommendedStrip
              events={shouldFetchRec ? recommended : []}
              loading={shouldFetchRec && recLoading}
            />

          </>
        )}
      </div>
    </div>
  )
}
