import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { AdminSidebar, AdminMobileNavBar } from './AdminSidebar.jsx'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const title =
    {
      '/admin': 'Overview',
      '/admin/events': 'Events',
      '/admin/users': 'Users',
      '/admin/registrations': 'Registrations',
      '/admin/memberships': 'Memberships',
      '/admin/moderation': 'Moderation',
      '/admin/analytics': 'Analytics',
      '/admin/settings': 'Settings',
    }[location.pathname] || 'Admin'

  return (
    <div className="flex min-h-dvh bg-[#020617] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-violet-950/20 via-[#020617] to-indigo-950/25" />
      <div className="pointer-events-none fixed left-0 top-0 h-[min(480px,50vh)] w-[min(480px,90vw)] rounded-full bg-violet-600/10 blur-[100px]" />

      <div className="relative z-10 flex min-h-dvh w-full">
        <div className="hidden lg:flex">
          <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="absolute left-0 top-0 h-full w-[260px] shadow-2xl"
              >
                <AdminSidebar collapsed={false} onToggleCollapse={() => setMobileOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminMobileNavBar onOpen={() => setMobileOpen(true)} />
          <header className="hidden h-16 items-center justify-between border-b border-white/[0.08] bg-[#070a12]/80 px-6 backdrop-blur-xl lg:flex">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Nexus Events</p>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-white">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-zinc-500 sm:inline">{user?.email}</span>
              <button
                type="button"
                className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <Link
                to="/events"
                className="hidden rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 sm:inline"
              >
                View site
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
