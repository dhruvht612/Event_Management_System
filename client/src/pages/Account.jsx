import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'

export function Account() {
  const { user, token, refresh } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [organization, setOrganization] = useState(user?.organization || '')
  const [msg, setMsg] = useState('')

  async function saveProfile(e) {
    e.preventDefault()
    setMsg('')
    const updated = await api('/users/profile', {
      method: 'PATCH',
      token,
      body: JSON.stringify({ name, organization }),
    })
    setName(updated.name)
    setOrganization(updated.organization || '')
    await refresh()
    setMsg('Saved.')
  }

  async function upgrade(tier) {
    setMsg('')
    try {
      const { url } = await api('/payments/checkout', {
        method: 'POST',
        token,
        body: JSON.stringify({ tier }),
      })
      if (url) window.location.href = url
    } catch (e) {
      setMsg(e.message || 'Payments not configured')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">Account</h1>
        <p className="text-[var(--color-muted)]">
          Membership: <strong className="text-[var(--color-foreground)]">{user?.membershipTier}</strong>
        </p>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Name</label>
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Organization</label>
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>
          <Button type="submit">Save</Button>
          {msg && <p className="text-sm text-[var(--color-muted)]">{msg}</p>}
        </form>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">Membership</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Upgrade for early access, discounts, and exclusive events (Stripe).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => upgrade('premium')}>
            Premium
          </Button>
          <Button type="button" onClick={() => upgrade('vip')}>
            VIP
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
