import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import logo from '../../assets/images/logo_for_dark_mode.png'
import { isAuthenticated, getUser, signOut } from '../../services/authService'
import {
  GridIcon,
  ClipboardIcon,
  UsersIcon,
  TagIcon,
  BarChartIcon,
  GearIcon,
  HomeGlyph,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from '../../components/icons'

const NAV_ITEMS = [
  { to: '/admin', end: true, label: 'Overview', icon: GridIcon },
  { to: '/admin/issues', label: 'Manage Issues', icon: ClipboardIcon },
  { to: '/admin/users', label: 'Manage Users', icon: UsersIcon },
  { to: '/admin/categories', label: 'Categories', icon: TagIcon },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChartIcon },
  { to: '/admin/settings', label: 'Settings', icon: GearIcon },
]

const TITLES = {
  '/admin': 'Overview',
  '/admin/issues': 'Manage Issues',
  '/admin/users': 'Manage Users',
  '/admin/categories': 'Categories',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

function SidebarContent({ userData, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-nagorik-line px-6 py-5">
        <img src={logo} alt="নাগরিক" className="h-9 w-auto" />
        <div className="leading-tight">
          <p className="m-0 text-[13px] font-extrabold tracking-wide text-nagorik-heading">
            NAGORIK
          </p>
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-nagorik-red">
            Admin Panel
          </p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors duration-150',
                    isActive
                      ? 'bg-nagorik-red !text-white'
                      : 'text-nagorik-secondary hover:bg-nagorik-surface-2 hover:text-nagorik-heading ',
                  )
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-nagorik-line px-3 py-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-nagorik-red bg-nagorik-surface-2 text-[13px] font-bold text-nagorik-red">
            {(userData.name || 'A').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="m-0 truncate text-[13px] font-bold text-nagorik-heading">
              {userData.name || 'Admin User'}
            </p>
            <p className="m-0 truncate text-[11px] text-nagorik-muted">
              {userData.email || 'admin@nagorik.app'}
            </p>
          </div>
        </div>

        <Link
          to="/"
          onClick={onNavigate}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-nagorik-secondary transition-colors duration-150 hover:bg-nagorik-surface-2 hover:text-nagorik-heading"
        >
          <HomeGlyph />
          <span>Back to site</span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-nagorik-red transition-colors duration-150 hover:bg-nagorik-red/10 cursor-pointer"
        >
          <LogOutIcon />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.title = 'Admin Panel — নাগরিক'
  }, [])

 if (!isAuthenticated()) {
  return <Navigate to="/login?next=/admin" replace />
}

const userData = getUser()

if (!userData.isAdmin) {
  return <Navigate to="/browse_feed" replace />
}
  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const pageTitle = TITLES[location.pathname] || 'Admin Panel'

  return (
    <div className="min-h-screen bg-nagorik-cream">
      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-[268px] shrink-0 border-r border-nagorik-line bg-nagorik-paper min-[981px]:block">
          <div className="sticky top-0 h-screen">
            <SidebarContent userData={userData} onLogout={handleLogout} />
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 min-[981px]:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[280px] bg-nagorik-paper shadow-xl">
              <div className="flex items-center justify-end px-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-nagorik-secondary hover:bg-nagorik-surface-2 cursor-pointer"
                >
                  <XIcon />
                </button>
              </div>
              <SidebarContent
                userData={userData}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-nagorik-line bg-nagorik-cream/90 px-5 py-4 backdrop-blur-[8px] min-[981px]:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-nagorik-heading hover:bg-nagorik-surface-2 cursor-pointer min-[981px]:hidden"
            >
              <MenuIcon />
            </button>
            <h1 className="m-0 text-[19px] font-extrabold text-nagorik-heading">
              {pageTitle}
            </h1>
          </header>

          <main className="px-5 py-6 min-[981px]:px-8 min-[981px]:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
