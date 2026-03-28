import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { adminGlass } from '../../components/admin/adminUi.js'
import { RoleBadge } from '../../components/admin/RoleBadge.jsx'
import { Select } from '../../components/ui/Select.jsx'

export function AdminUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [nextRole, setNextRole] = useState('attendee')
  const [nextTier, setNextTier] = useState('free')

  async function load() {
    const d = await api('/admin/users', { token })
    setUsers(d.users || [])
  }

  useEffect(() => {
    let cancelled = false
    void Promise.resolve()
      .then(() => api('/admin/users', { token }))
      .then((d) => {
        if (!cancelled) setUsers(d.users || [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token])

  async function applyRole() {
    if (!modal || modal.type !== 'role') return
    setNotice('')
    try {
      await api(`/admin/users/${modal.user.id}/role`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ role: nextRole }),
      })
      setNotice('Role updated.')
      setModal(null)
      await load()
    } catch (e) {
      setNotice(e.message || 'Failed')
    }
  }

  async function applyTier() {
    if (!modal || modal.type !== 'tier') return
    setNotice('')
    try {
      await api(`/admin/users/${modal.user.id}/membership`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ membershipTier: nextTier }),
      })
      setNotice('Membership updated.')
      setModal(null)
      await load()
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
      <div className={`${adminGlass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Regs</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <motion.tr
                  key={u.id}
                  layout
                  className="border-b border-white/[0.06] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{u.membershipTier}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-300">{u.registrationCount ?? 0}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setNextRole(u.role)
                        setModal({ type: 'role', user: u })
                      }}
                      className="mr-2 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                    >
                      Role
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNextTier(u.membershipTier)
                        setModal({ type: 'tier', user: u })
                      }}
                      className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                    >
                      Tier
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modal?.type === 'role' && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <h3 className="font-semibold text-white">Change role</h3>
              <p className="mt-1 text-sm text-zinc-400">{modal.user.name}</p>
              <div className="mt-4">
                <Select
                  value={nextRole}
                  onValueChange={setNextRole}
                  aria-label="New role"
                  options={[
                    { value: 'attendee', label: 'attendee' },
                    { value: 'organizer', label: 'organizer' },
                    { value: 'admin', label: 'admin' },
                  ]}
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyRole}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {modal?.type === 'tier' && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <h3 className="font-semibold text-white">Membership tier</h3>
              <p className="mt-1 text-sm text-zinc-400">{modal.user.name}</p>
              <div className="mt-4">
                <Select
                  value={nextTier}
                  onValueChange={setNextTier}
                  aria-label="Membership tier"
                  options={[
                    { value: 'free', label: 'free' },
                    { value: 'premium', label: 'premium' },
                    { value: 'vip', label: 'vip' },
                  ]}
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyTier}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
