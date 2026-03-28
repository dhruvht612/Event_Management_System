import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { adminGlass } from '../../components/admin/adminUi.js'

export function AdminModeration() {
  const { token } = useAuth()
  const [flagged, setFlagged] = useState([])
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    void Promise.resolve()
      .then(() => api('/admin/messages/flagged', { token }))
      .then((d) => {
        if (!cancelled) setFlagged(d.messages || [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token])

  async function remove(id) {
    setNotice('')
    try {
      await api(`/admin/messages/${id}`, { method: 'DELETE', token })
      setFlagged((f) => f.filter((m) => m.id !== id))
      setNotice('Message removed.')
    } catch (e) {
      setNotice(e.message || 'Failed')
    }
  }

  async function unflag(id) {
    setNotice('')
    try {
      await api(`/admin/messages/${id}/unflag`, { method: 'POST', token })
      setFlagged((f) => f.filter((m) => m.id !== id))
      setNotice('Flag dismissed.')
    } catch (e) {
      setNotice(e.message || 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      {notice && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {notice}
        </p>
      )}
      <div className="space-y-4">
        {flagged.map((m) => (
          <div key={m.id} className={`${adminGlass} p-5`}>
            <p className="text-xs text-zinc-500">
              {m.event_title} · {m.user_name} · {m.created_at ? format(new Date(m.created_at), 'PPp') : ''}
            </p>
            <p className="mt-2 text-sm text-zinc-200">{m.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => unflag(m.id)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
              >
                Dismiss flag
              </button>
              <button
                type="button"
                onClick={() => remove(m.id)}
                className="rounded-xl bg-red-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Remove message
              </button>
            </div>
          </div>
        ))}
        {!flagged.length && (
          <p className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-zinc-500">
            No flagged messages in the queue.
          </p>
        )}
      </div>
    </div>
  )
}
