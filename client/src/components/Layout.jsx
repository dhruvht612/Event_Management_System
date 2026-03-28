import { Link, Outlet, useLocation } from 'react-router-dom'
import { FloatingNav } from './FloatingNav.jsx'

const AUTH_PATHS = ['/login', '/register', '/forgot-password']

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isAuth = AUTH_PATHS.includes(location.pathname)

  return (
    <div
      className={`flex min-h-dvh flex-col ${isAuth ? 'bg-[#020617]' : 'bg-[var(--color-surface)]'}`}
    >
      <FloatingNav />
      <main
        className={`mx-auto w-full flex-1 ${
          isHome
            ? 'max-w-none px-0 pt-0'
            : isAuth
              ? 'flex max-w-none flex-col items-center justify-center px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-24'
              : 'max-w-7xl px-5 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8'
        }`}
      >
        <Outlet />
      </main>
      {!isHome && !isAuth && (
        <footer className="mt-auto border-t border-[var(--color-border)] py-10 text-center text-sm text-[var(--color-muted)]">
          <p className="px-4">
            Built for student orgs & hackathons · SQLite · Express · React
          </p>
          <Link to="/" className="mt-3 inline-block text-[var(--color-accent)] hover:underline">
            ← Back to home
          </Link>
        </footer>
      )}
    </div>
  )
}
