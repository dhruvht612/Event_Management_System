import { motion } from 'framer-motion'

const labels = {
  hackathon: 'Hackathons',
  workshop: 'Workshops',
  networking: 'Networking',
  'tech-talk': 'Tech talks',
  tech: 'Tech',
  design: 'Design',
  careers: 'Careers',
}

export function PopularCategories({ tagCounts, onPick }) {
  const entries = Object.entries(tagCounts || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  if (!entries.length) return null

  return (
    <section className="mt-12 border-t border-white/[0.06] pt-10">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Popular categories</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {entries.map(([tag, count], i) => (
          <motion.button
            key={tag}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onPick(tag)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-500/35 hover:text-white"
          >
            {labels[tag] || tag}{' '}
            <span className="text-zinc-500">({count})</span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
