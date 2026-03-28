import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { adminGlass } from '../../components/admin/adminUi.js'
import { Select } from '../../components/ui/Select.jsx'

export function AdminRegistrations() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('all')

  useEffect(() => {
    api('/admin/registrations', { token })
      .then((d) => setRows(d.registrations || []))
      .catch(() => {})
  }, [token])

  const filtered = rows.filter((r) => (status === 'all' ? true : r.status === status))

  async function exportAll() {
    const base = import.meta.env.VITE_API_URL || '/api'
    const res = await fetch(`${base}/admin/registrations/export.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'registrations.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select
          value={status}
          onValueChange={setStatus}
          aria-label="Filter by registration status"
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'confirmed', label: 'confirmed' },
            { value: 'waitlist', label: 'waitlist' },
            { value: 'cancelled', label: 'cancelled' },
          ]}
          triggerClassName="min-w-[180px]"
        />
        <button
          type="button"
          onClick={exportAll}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
      <div className={`${adminGlass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{r.user_name}</p>
                    <p className="text-xs text-zinc-500">{r.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{r.event_title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs">{r.status}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{r.ticket_code}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {r.registered_at ? format(new Date(r.registered_at), 'MMM d, yyyy p') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
