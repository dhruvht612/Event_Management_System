import { motion } from 'framer-motion'
import { landingCardPadding } from '../../lib/landingLayout.js'

const stats = [
  { value: '10,000+', label: 'registrations managed' },
  { value: '50+', label: 'campus events supported' },
  { value: 'Real-time', label: 'chat & membership tools' },
]

const logos = ['CS Society', 'Design Guild', 'Hack Club', 'Robotics', 'Debate']

export function TrustSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full pt-2 pb-6"
    >
      <div
        className={`relative w-full rounded-3xl border border-white/[0.06] bg-white/[0.025] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-sm ${landingCardPadding}`}
      >
        {/* Stats: equal columns, full width of card */}
        <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6 md:gap-10 lg:gap-12 xl:gap-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="flex min-w-0 flex-col items-center text-center sm:items-stretch sm:text-center"
            >
              <p className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl">
                {s.value}
              </p>
              <p className="mt-3 max-w-[14rem] text-base leading-snug text-zinc-400 sm:mx-auto sm:max-w-none">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mb-8 mt-16 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Trusted by student orgs
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 * i }}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-400 transition duration-300 hover:border-violet-500/25 hover:text-zinc-300"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
