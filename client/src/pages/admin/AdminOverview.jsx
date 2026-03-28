import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Users,
  Calendar,
  ClipboardCheck,
  DollarSign,
  Crown,
  Flag,
  Plus,
  Megaphone,
  Shield,
} from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { adminGlass, adminGlassHover } from '../../components/admin/adminUi.js'

const pieColors = ['#8b5cf6', '#6366f1', '#a78bfa', '#c4b5fd']

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${adminGlass} ${adminGlassHover} p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums text-white">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  )
}

export function AdminOverview() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [activity, setActivity] = useState(null)

  useEffect(() => {
    api('/admin/stats', { token }).then(setStats).catch(() => {})
    api('/admin/analytics', { token }).then(setAnalytics).catch(() => {})
    api('/admin/activity', { token }).then(setActivity).catch(() => {})
  }, [token])

  const regChart = analytics?.registrationsOverTime?.length
    ? analytics.registrationsOverTime
    : [{ date: '-', count: 0 }]
  const tierData =
    (analytics?.membershipDistribution || []).length > 0
      ? analytics.membershipDistribution.map((t) => ({
          name: t.tier,
          value: t.count,
        }))
      : [{ name: 'free', value: 1 }]

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-zinc-500">Welcome back — here&apos;s what&apos;s happening on Nexus Events.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Stat icon={Users} label="Total users" value={stats?.totalUsers ?? '—'} />
        <Stat icon={Calendar} label="Total events" value={stats?.totalEvents ?? '—'} />
        <Stat icon={ClipboardCheck} label="Registrations" value={stats?.totalRegistrations ?? '—'} />
        <Stat
          icon={DollarSign}
          label="Revenue"
          value={stats != null ? `$${(stats.revenueCents / 100).toFixed(2)}` : '—'}
          hint="Stripe completed payments"
        />
        <Stat icon={Crown} label="Premium + VIP" value={stats?.activeMemberships ?? '—'} />
        <Stat icon={Flag} label="Flagged" value={stats?.flaggedMessages ?? '—'} hint="Chat queue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`${adminGlass} p-6`}>
          <h2 className="font-semibold text-white">Registrations (30 days)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regChart}>
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${adminGlass} p-6`}>
          <h2 className="font-semibold text-white">Membership tiers</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {tierData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${adminGlass} p-6`}>
          <h2 className="font-semibold text-white">Recent activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {activity?.recentUsers?.slice(0, 5).map((u) => (
              <li key={u.id} className="flex justify-between gap-2 border-b border-white/[0.06] pb-3 text-zinc-400">
                <span>
                  New user <span className="text-zinc-200">{u.name}</span>
                </span>
                <span className="shrink-0 text-xs text-zinc-600">{u.at?.slice(0, 10)}</span>
              </li>
            ))}
            {activity?.recentEvents?.slice(0, 3).map((e) => (
              <li key={e.id} className="flex justify-between gap-2 border-b border-white/[0.06] pb-3 text-zinc-400">
                <span>
                  Event created <span className="text-zinc-200">{e.title}</span>
                </span>
                <span className="shrink-0 text-xs text-zinc-600">{e.at?.slice(0, 10)}</span>
              </li>
            ))}
            {!activity && <li className="text-zinc-500">Loading…</li>}
          </ul>
        </div>

        <div className={`${adminGlass} p-6`}>
          <h2 className="font-semibold text-white">Quick actions</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              to="/events/new"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-violet-500/40"
            >
              <Plus className="h-4 w-4 text-violet-400" /> Create event
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-violet-500/40"
            >
              <Users className="h-4 w-4 text-violet-400" /> Manage users
            </Link>
            <Link
              to="/admin/moderation"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-violet-500/40"
            >
              <Shield className="h-4 w-4 text-violet-400" /> Review flagged
            </Link>
            <span className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-zinc-500">
              <Megaphone className="h-4 w-4" /> Announcements (soon)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
