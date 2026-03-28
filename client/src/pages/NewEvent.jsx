import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Select } from '../components/ui/Select.jsx'

export function NewEvent() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [locationType, setLocationType] = useState('physical')
  const [locationText, setLocationText] = useState('')
  const [capacity, setCapacity] = useState(100)
  const [tags, setTags] = useState('')
  const [err, setErr] = useState('')

  if (user && user.role === 'attendee') {
    return <p className="text-[var(--color-muted)]">Only organizers and admins can create events.</p>
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const { event } = await api('/events', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title,
          description,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          locationType,
          locationText,
          capacity: Number(capacity),
          tags: tagList,
        }),
      })
      navigate(`/events/${event.id}`)
    } catch (er) {
      setErr(er.message || 'Failed')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-xl">
      <Card>
        <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold">New event</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          {err && <p className="text-sm text-red-500">{err}</p>}
          <div>
            <label className="mb-1 block text-xs font-medium">Title</label>
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Description</label>
            <textarea
              className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Start</label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">End</label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="new-event-location-type">
              Location type
            </label>
            <Select
              id="new-event-location-type"
              value={locationType}
              onValueChange={setLocationType}
              options={[
                { value: 'physical', label: 'Physical' },
                { value: 'virtual', label: 'Virtual' },
              ]}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Address or URL</label>
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Capacity</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Tags (comma-separated)</label>
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="hackathon, tech"
            />
          </div>
          <Button type="submit" className="w-full">
            Publish event
          </Button>
        </form>
      </Card>
    </motion.div>
  )
}
