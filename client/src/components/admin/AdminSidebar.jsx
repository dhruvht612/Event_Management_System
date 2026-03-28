import { Link, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Crown,
  ShieldAlert,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/admin/memberships', label: 'Memberships', icon: Crown },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldAlert },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar({ collapsed, onToggleCollapse }) {
  return (
    <aside
      className={`relative z-20 flex shrink-0 flex-col border-r border-white/[0.08] bg-[#070a12]/95 backdrop-blur-xl transition-[width] duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.08] px-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-500/30">
          N
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold text-white">
              Nexus Admin
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Control center</p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="ml-auto hidden rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/25 to-indigo-600/20 text-white ring-1 ring-violet-500/30'
                    : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? 'text-violet-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                  {isActive && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-white/[0.08] p-3">
        <Link
          to="/events"
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300 ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg">↩</span>
          {!collapsed && 'Back to site'}
        </Link>
      </div>
    </aside>
  )
}

export function AdminMobileNavBar({ onOpen }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#070a12]/95 px-4 py-3 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
        aria-label="Open menu"
      >
        <PanelLeft className="h-6 w-6" />
      </button>
      <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-white">Admin</span>
      <span className="w-10" />
    </div>
  )
}
