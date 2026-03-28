import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Search, Copy, Trash2, ExternalLink, LayoutGrid, List, Download } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { adminGlass, adminGlassHover, adminInput } from '../../components/admin/adminUi.js'
import { ConfirmModal } from '../../components/admin/ConfirmModal.jsx'
import { Select } from '../../components/ui/Select.jsx'

export function AdminEvents() {
  const { token } = useAuth()
  const [events, setEvents] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('table')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    void Promise.resolve()
      .then(() => api('/admin/events', { token }))
      .then((d) => {
        if (!cancelled) setEvents(d.events || [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q.toLowerCase())) return false
      if (filter === 'upcoming' && e.scheduleStatus !== 'upcoming') return false
      if (filter === 'past' && e.scheduleStatus !== 'past') return false
      if (filter === 'live' && e.scheduleStatus !== 'live') return false
      if (filter === 'virtual' && e.locationType !== 'virtual') return false
      if (filter === 'physical' && e.locationType !== 'physical') return false
      return true
    })
  }, [events, q, filter])

  async function refreshList() {
    const d = await api('/admin/events', { token })
    setEvents(d.events || [])
  }

  async function duplicate(id) {
    setNotice('')
    try {
      await api(`/admin/events/${id}/duplicate`, { method: 'POST', token })
      setNotice('Event duplicated.')
      await refreshList()
    } catch (e) {
      setNotice(e.message || 'Failed')
    }
  }

  async function remove(id) {
    try {
      await api(`/events/${id}`, { method: 'DELETE', token })
      setPendingDelete(null)
      await refreshList()
    } catch (e) {
      setNotice(e.message || 'Delete failed')
    }
  }

  async function downloadAttendeesCsv(id) {
    const base = import.meta.env.VITE_API_URL || '/api'
    const res = await fetch(`${base}/admin/events/${id}/attendees.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      setNotice('Could not download CSV')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {notice && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {notice}
        </p>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            className={`${adminInput} pl-10`}
            placeholder="Search by title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filter}
            onValueChange={setFilter}
            aria-label="Filter events"
            options={[
              { value: 'all', label: 'All schedules' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'live', label: 'Live' },
              { value: 'past', label: 'Past' },
              { value: 'virtual', label: 'Virtual' },
              { value: 'physical', label: 'Physical' },
            ]}
            triggerClassName="min-w-[160px]"
          />
          <div className="flex rounded-xl border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setView('table')}
              className={`rounded-lg p-2 ${view === 'table' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg p-2 ${view === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Link
            to="/events/new"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Create event
          </Link>
        </div>
      </div>

      {view === 'table' ? (
        <div className={`${adminGlass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Regs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{e.title}</td>
                    <td className="px-4 py-3 text-zinc-400">{format(new Date(e.startAt), 'MMM d, p')}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-zinc-500">{e.locationText || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{e.organizerName || '—'}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-300">
                      {e.confirmedCount}/{e.capacity}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-zinc-400">{e.scheduleStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => downloadAttendeesCsv(e.id)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                          title="Export CSV"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/events/${e.id}`}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => duplicate(e.id)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(e)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`${adminGlass} ${adminGlassHover} p-5`}
            >
              <h3 className="font-semibold text-white">{e.title}</h3>
              <p className="mt-2 text-xs text-zinc-500">{format(new Date(e.startAt), 'PPp')}</p>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{e.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {e.tags?.slice(0, 4).map((t) => (
                  <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/events/${e.id}`} className="flex-1 rounded-lg bg-white/10 py-2 text-center text-sm">
                  Open
                </Link>
                <button type="button" onClick={() => duplicate(e.id)} className="rounded-lg bg-white/5 px-3 text-sm">
                  Duplicate
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete event?"
        message="This removes the event and related data. This cannot be undone."
        confirmLabel="Delete"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove(pendingDelete.id)}
      />
    </div>
  )
}
