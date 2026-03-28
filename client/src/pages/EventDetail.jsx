import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Share2, CalendarPlus, MessageCircle, Heart } from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getSocket } from '../lib/socket.js'
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'

const clientUrl = typeof window !== 'undefined' ? window.location.origin : ''

export function EventDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const [data, setData] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [body, setBody] = useState('')
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api(`/events/${id}`, { token })
      .then((d) => setData(d))
      .catch((e) => setErr(e.message))
  }, [id, token])

  useEffect(() => {
    if (!user || !token) return
    api(`/users/saved-events/check/${id}`, { token })
      .then((r) => setSaved(Boolean(r.saved)))
      .catch(() => {})
  }, [id, user, token])

  async function toggleSave() {
    if (!user || !token) return
    setErr('')
    try {
      if (saved) {
        await api(`/users/saved-events/${id}`, { method: 'DELETE', token })
        setSaved(false)
      } else {
        await api(`/users/saved-events/${id}`, { method: 'POST', token })
        setSaved(true)
      }
    } catch (e) {
      setErr(e.message || 'Could not update saved events')
    }
  }

  useEffect(() => {
    if (!user || !token) return
    api(`/messages/events/${id}`, { token })
      .then((d) => setMessages(d.messages || []))
      .catch(() => {})
    api(`/messages/events/${id}/announcements`, { token })
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {})
  }, [id, user, token])

  useEffect(() => {
    if (!user || !token) return
    const s = getSocket(token)
    s.emit('join:event', id)
    s.on('chat:message', (msg) => {
      if (msg.event_id === id) setMessages((m) => [...m, msg])
    })
    s.on('announcement:new', (a) => {
      if (a.event_id === id) setAnnouncements((prev) => [a, ...prev])
    })
    return () => {
      s.emit('leave:event', id)
      s.off('chat:message')
      s.off('announcement:new')
      s.disconnect()
    }
  }, [id, user, token])

  async function register() {
    setErr('')
    try {
      const r = await api(`/events/${id}/register`, { method: 'POST', token })
      setTicket({
        status: r.status,
        ticketCode: r.ticketCode,
        qrDataUrl: r.qrDataUrl,
      })
      api(`/auth/me`, { token }).catch(() => {})
    } catch (e) {
      setErr(e.message || 'Could not register')
    }
  }

  async function loadCalendar() {
    const r = await api(`/calendar/events/${id}/google`)
    window.open(r.url, '_blank')
  }

  function shareLinks() {
    const url = `${clientUrl}/events/${id}`
    const title = data?.event?.title || 'Event'
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      instagram: url,
    }
  }

  async function trackShare() {
    try {
      await api(`/share/events/${id}/share`, { method: 'POST' })
    } catch {
      /* ignore */
    }
  }

  async function sendChat(e) {
    e.preventDefault()
    if (!body.trim()) return
    try {
      await api(`/messages/events/${id}`, {
        method: 'POST',
        token,
        body: JSON.stringify({ body }),
      })
      setBody('')
    } catch (er) {
      setErr(er.message)
    }
  }

  if (!data && !err) {
    return <p className="text-[var(--color-muted)]">Loading…</p>
  }
  if (err && !data) {
    return <p className="text-red-500">{err}</p>
  }

  const ev = data.event
  const share = shareLinks()

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-[var(--color-muted)]">
          {format(new Date(ev.startAt), 'PPpp')} — {format(new Date(ev.endAt), 'PPpp')}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">{ev.title}</h1>
        <p className="mt-2 max-w-3xl text-[var(--color-muted)]">{ev.description}</p>
        <p className="mt-2 text-sm">
          <span className="rounded-md bg-black/5 px-2 py-0.5 dark:bg-white/10">{ev.locationType}</span>{' '}
          {ev.locationText}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user && (
            <Button type="button" variant="secondary" onClick={toggleSave} aria-pressed={saved}>
              <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
              {saved ? 'Saved' : 'Save event'}
            </Button>
          )}
          {user && (
            <Button type="button" onClick={register}>
              Register / waitlist
            </Button>
          )}
          {!user && (
            <Link to="/login">
              <Button>Sign in to register</Button>
            </Link>
          )}
          <Button type="button" variant="secondary" onClick={loadCalendar}>
            <CalendarPlus className="h-4 w-4" /> Google Calendar
          </Button>
          <a href={share.facebook} target="_blank" rel="noreferrer" onClick={trackShare}>
            <Button variant="secondary" type="button">
              <Share2 className="h-4 w-4" /> Facebook
            </Button>
          </a>
          <a href={share.whatsapp} target="_blank" rel="noreferrer" onClick={trackShare}>
            <Button variant="secondary" type="button">
              WhatsApp
            </Button>
          </a>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(`${clientUrl}/events/${id}`)
              trackShare()
            }}
          >
            Copy link (share to Instagram)
          </Button>
        </div>
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      </motion.div>

      {ticket && (
        <Card>
          <h2 className="text-lg font-semibold">Your ticket</h2>
          <p className="text-sm text-[var(--color-muted)]">Status: {ticket.status}</p>
          <p className="mt-2 font-mono text-sm">{ticket.ticketCode}</p>
          {ticket.qrDataUrl && (
            <img src={ticket.qrDataUrl} alt="QR" className="mt-4 h-48 w-48 rounded-xl border border-[var(--color-border)]" />
          )}
        </Card>
      )}

      {user && (
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <MessageCircle className="h-5 w-5" /> Event chat
          </h2>
          <div className="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[var(--color-border)] p-3">
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium">{m.user_name}</span>
                <span className="text-[var(--color-muted)]"> · {format(new Date(m.created_at), 'p')}</span>
                <p className="text-[var(--color-foreground)]">{m.body}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message (confirmed attendees)"
            />
            <Button type="submit">Send</Button>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Announcements</h2>
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="border-b border-[var(--color-border)] pb-3 last:border-0">
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-[var(--color-muted)]">{a.body}</p>
            </li>
          ))}
          {!announcements.length && <li className="text-sm text-[var(--color-muted)]">No announcements yet.</li>}
        </ul>
      </Card>
    </div>
  )
}
