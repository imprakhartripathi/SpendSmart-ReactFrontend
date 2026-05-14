import type React from 'react'
import { NavLink } from 'react-router-dom'
import type { UserProfile } from '@/app/types'

type AppShellProps = {
  children: React.ReactNode
  profile: UserProfile | null
  unreadCount: number
  working: boolean
  onLogout: () => void
}

const navItems = [
  { to: '/overview', label: 'Overview' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/income', label: 'Income' },
  { to: '/categories', label: 'Categories' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/recurring', label: 'Recurring' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
]

export default function AppShell({
  children,
  profile,
  unreadCount,
  working,
  onLogout,
}: AppShellProps) {
  const avatarFallback = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SS'

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-card sidebar-brand">
          <div className="brand-mark">S</div>
          <div>
            <p className="eyebrow">SpendSmart</p>
            {/* <h1>Control Center</h1> */}
            <p className="sidebar-brand__meta">Control Center</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `sidebar-link${isActive ? " is-active" : ""}`
              }
              key={item.to}
              to={item.to}
            >
              <span>{item.label}</span>
              {item.to === "/notifications" && unreadCount > 0 ? (
                <span className="badge badge-accent">{unreadCount}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        {/* <div className='spacer-sidebar'>
          <br />
        </div> */}

        <div className="sidebar-card sidebar-summary">
          <div className="sidebar-summary__profile">
            <div className="avatar avatar-teal">
              {profile?.avatarUrl ? (
                <img alt={profile.fullName} src={profile.avatarUrl} />
              ) : (
                <span>{avatarFallback}</span>
              )}
            </div>
            <div className="sidebar-summary__text">
              <p>{profile?.email || "Connected session"}</p>
            </div>
          </div>
          <div className="sidebar-summary__actions">
            <button
              className="button button-secondary"
              disabled={working}
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        {/* <header className="app-topbar surface-card">
          <div className="app-topbar__lead">
            <p className="eyebrow">Wealth management dashboard</p>
            <h2>{profile?.fullName || 'Welcome back'}</h2>
            <p className="app-topbar__subtitle">Signal-first controls for money, budgets, and recurring commitments.</p>
          </div>
          <div className="topbar-actions">
            <div className="pill pill-muted">Live sync</div>
            <div className="pill pill-ghost">{profile?.timezone || 'UTC'}</div>
            <div className="pill pill-ghost">{profile?.currency || 'USD'}</div>
            <Link className="button button-secondary button-round" to="/expenses">
              New expense
            </Link>
            <Link className="button button-round" to="/budgets">
              Review budgets
            </Link>
          </div>
        </header> */}

        <main className="workspace">{children}</main>
      </div>
    </div>
  );
}
