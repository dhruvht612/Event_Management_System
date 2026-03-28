import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function RecommendedStrip({ events, loading }) {
  if (loading || !events?.length) return null

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Recommended for you</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {events.slice(0, 6).map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="min-w-[240px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-violet-500/30"
          >
            <Link to={`/events/${ev.id}`} className="block">
              <p className="font-medium text-zinc-100">{ev.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{(ev.tags || []).join(' · ')}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
