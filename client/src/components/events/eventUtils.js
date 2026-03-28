export function spotsLeft(ev) {
  const cap = ev.capacity ?? 0
  const taken = ev.confirmedCount ?? 0
  return Math.max(0, cap - taken)
}

export function statusBadge(ev) {
  if (ev.exclusiveTier === 'premium' || ev.exclusiveTier === 'vip') {
    return { label: 'Members only', className: 'bg-amber-500/15 text-amber-200 ring-amber-500/30' }
  }
  const left = spotsLeft(ev)
  const cap = ev.capacity || 1
  if (left <= 0) return { label: 'Full', className: 'bg-zinc-500/20 text-zinc-300 ring-zinc-500/30' }
  if (left <= Math.max(3, Math.ceil(cap * 0.15))) {
    return { label: 'Almost full', className: 'bg-orange-500/15 text-orange-200 ring-orange-500/30' }
  }
  return { label: 'Open', className: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30' }
}

export function isLiveNow(ev) {
  const now = Date.now()
  const start = new Date(ev.startAt).getTime()
  const end = new Date(ev.endAt).getTime()
  return now >= start && now <= end
}
