import { Link, NavLink } from 'react-router-dom'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { landingContainer } from '../lib/landingLayout.js'

const linkBase =
  'relative rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-all duration-300 ease-out hover:text-white'
const linkActive =
  'text-white after:absolute after:bottom-1 after:left-3 after:right-3 after:h-px after:rounded-full after:bg-gradient-to-r after:from-violet-400 after:to-indigo-400 after:shadow-[0_0_12px_rgba(139,92,246,0.6)]'

export function FloatingNav() {
  const { user, logout } = useAuth()
  const { resolved, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isAdmin = user?.role === 'admin'
  const links = [
    { to: '/', label: 'Discover' },
    { to: '/events', label: 'Events' },
    ...(user && !isAdmin ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(user && (user.role === 'organizer' || user.role === 'admin')
      ? [{ to: '/events/new', label: 'New event' }]
      : []),
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header className={`pointer-events-none fixed inset-x-0 top-3 z-50 sm:top-4 ${landingContainer}`}>
      <motion.div
        layout
        className="pointer-events-auto w-full"
        animate={{
          scale: scrolled ? 0.985 : 1,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 shadow-2xl transition-all duration-300 ease-out sm:px-4 sm:py-3 ${
            scrolled
              ? 'border-white/15 bg-black/45 shadow-black/50 backdrop-blur-2xl'
              : 'border-white/10 bg-white/[0.06] shadow-black/30 backdrop-blur-xl'
          } `}
        >
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2 font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-violet-500/30">
              N
            </span>
            <span className="hidden sm:inline">Nexus Events</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggle}
              className="rounded-xl p-2 text-zinc-400 transition-colors duration-300 hover:bg-white/5 hover:text-white"
              aria-label="Toggle theme"
            >
              {resolved === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <>
                <span className="hidden max-w-[120px] truncate text-sm text-zinc-400 lg:inline">{user.name}</span>
                <Link
                  to="/account"
                  className="hidden text-sm text-violet-300/90 transition hover:text-violet-200 sm:inline"
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition duration-300 hover:border-white/20 hover:bg-white/10 sm:inline"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition duration-300 hover:text-white sm:inline"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-violet-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/40"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition group-hover:opacity-100" />
                  <span className="relative">Get started</span>
                </Link>
              </>
            )}
            <button
              type="button"
              className="rounded-xl p-2 text-zinc-300 md:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-2xl md:hidden"
            >
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                {!user && (
                  <Link
                    to="/login"
                    className="rounded-xl px-4 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                )}
                {user && (
                  <button
                    type="button"
                    className="rounded-xl px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5"
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                  >
                    Sign out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.header>
  )
}
