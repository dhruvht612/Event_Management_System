import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, ArrowRight } from 'lucide-react'
import { RecommendedEventCard } from './RecommendedEventCard.jsx'

export function SavedEventsSection({ events, loading }) {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">Saved events</h2>
          <p className="mt-1 text-sm text-zinc-500">Bookmarks for later — tap the heart on any event page</p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1 text-sm font-medium text-violet-400 transition hover:text-violet-300"
        >
          Discover more <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : !events?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center"
        >
          <Bookmark className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-4 text-sm text-zinc-500">No saved events yet.</p>
          <Link to="/events" className="mt-3 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300">
            Explore events
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((ev, i) => (
            <RecommendedEventCard key={ev.id} event={ev} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
