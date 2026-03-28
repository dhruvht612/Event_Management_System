import { CalendarDays, LayoutGrid } from 'lucide-react'
import { Select } from '../ui/Select.jsx'

const categories = [
  { id: '', label: 'All' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'networking', label: 'Networking' },
  { id: 'tech-talk', label: 'Tech Talks' },
]

const sorts = [
  { id: 'date', label: 'Upcoming first' },
  { id: 'popular', label: 'Most popular' },
  { id: 'newest', label: 'Newest' },
]

export function EventsToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  tab,
  onTabChange,
  registeredDisabled,
}) {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-sm"
          role="tablist"
        >
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past' },
            { id: 'registered', label: 'Registered' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              disabled={t.id === 'registered' && registeredDisabled}
              onClick={() => onTabChange(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <CalendarDays className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Calendar view coming soon</span>
          <button
            type="button"
            disabled
            className="rounded-lg border border-white/10 p-2 opacity-50"
            title="Calendar view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search + sort row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          placeholder="Search events, topics, organizers…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none ring-violet-500/30 transition focus:border-violet-500/40 focus:ring-2 lg:max-w-xl xl:max-w-2xl"
        />
        <div className="flex shrink-0 items-center gap-2">
          <span id="sort-events-label" className="text-xs text-zinc-500">
            Sort
          </span>
          <Select
            id="sort-events"
            aria-labelledby="sort-events-label"
            value={sort}
            onValueChange={onSortChange}
            options={sorts.map((s) => ({ value: s.id, label: s.label }))}
            triggerClassName="min-w-[188px]"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id || 'all'}
            type="button"
            onClick={() => onCategoryChange(c.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              category === c.id
                ? 'border-violet-500/50 bg-violet-500/20 text-violet-100 shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
