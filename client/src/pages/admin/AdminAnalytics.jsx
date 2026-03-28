import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { adminGlass } from '../../components/admin/adminUi.js'

export function AdminAnalytics() {
  const { token } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    api('/admin/analytics', { token }).then(setData).catch(() => {})
  }, [token])

  const tags = data?.tagPopularity?.length ? data.tagPopularity : [{ tag: '-', count: 0 }]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${adminGlass} p-6`}>
        <h2 className="font-semibold text-white">New users over time</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.usersOverTime || []}>
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className={`${adminGlass} p-6`}>
        <h2 className="font-semibold text-white">Registrations over time</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.registrationsOverTime || []}>
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className={`${adminGlass} p-6 lg:col-span-2`}>
        <h2 className="font-semibold text-white">Popular tags / categories</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tags}>
              <XAxis dataKey="tag" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
