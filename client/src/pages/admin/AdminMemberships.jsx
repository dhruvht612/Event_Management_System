import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { adminGlass, adminGlassHover } from '../../components/admin/adminUi.js'

export function AdminMemberships() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    api('/admin/stats', { token }).then(setStats).catch(() => {})
    api('/admin/analytics', { token }).then(setAnalytics).catch(() => {})
  }, [token])

  const tiers = analytics?.membershipDistribution || []

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${adminGlass} ${adminGlassHover} p-6`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Premium + VIP accounts</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
            {stats?.activeMemberships ?? '—'}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${adminGlass} ${adminGlassHover} p-6`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Revenue (Stripe)</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
            {stats != null ? `$${(stats.revenueCents / 100).toFixed(2)}` : '—'}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${adminGlass} ${adminGlassHover} p-6`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Total users</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
            {stats?.totalUsers ?? '—'}
          </p>
        </motion.div>
      </div>

      <div className={`${adminGlass} p-6`}>
        <h2 className="flex items-center gap-2 font-semibold text-white">
          <Crown className="h-5 w-5 text-amber-400" />
          Tier distribution
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.tier}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-500">{t.tier}</p>
              <p className="mt-2 text-2xl font-bold text-white">{t.count}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          Assign tiers from the{' '}
          <Link className="text-violet-400 hover:underline" to="/admin/users">
            Users
          </Link>{' '}
          page.
          Expiration dates and Stripe sync can be wired when billing is fully enabled.
        </p>
      </div>
    </div>
  )
}
