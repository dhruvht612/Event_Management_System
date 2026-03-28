const styles = {
  admin: 'bg-rose-500/15 text-rose-200 ring-rose-500/30',
  organizer: 'bg-violet-500/15 text-violet-200 ring-violet-500/30',
  attendee: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
}

export function RoleBadge({ role }) {
  const c = styles[role] || styles.attendee
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${c}`}
    >
      {role}
    </span>
  )
}
