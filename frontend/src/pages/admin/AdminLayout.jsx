import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import logo from '../../assets/images/logo_for_dark_mode.png'
import { isAuthenticated, getUser, signOut } from '../../services/authService'
import { rememberAdminSection } from '../../services/adminSectionStore'
import {
  GridIcon,
  ClipboardIcon,
  UsersIcon,
  TagIcon,
  BarChartIcon,
  GearIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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

const COLLAPSE_KEY = 'nagorik_admin_sidebar_collapsed'

function SidebarContent({ userData, onNavigate, onLogout, collapsed = false, onToggleCollapse }) {
  const { pathname } = useLocation()

  // The wordmark returns the admin to the section they are currently in, so a
  // click from a nested view (a filtered list, a single record) lands back on
  // that section's root instead of jumping somewhere else in the panel.
  const currentSection =
    NAV_ITEMS.find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))?.to ?? '/admin'

  // While collapsed the label is removed from the flow, so the icon must centre itself.
  const navItem = ({ isActive }) =>
    clsx(
      'flex items-center rounded-xl text-[13.5px] font-semibold transition-colors duration-150',
      collapsed ? 'h-10 w-10 shrink-0 justify-center' : 'gap-3 px-3.5 py-2.5',
      isActive
        ? 'bg-nagorik-red !text-white'
        : 'text-nagorik-secondary hover:bg-nagorik-surface-2 hover:text-nagorik-heading',
    )

  const brand = (
    <Link
      to={currentSection}
      onClick={onNavigate}
      title="Back to this section"
      className="flex min-w-0 items-center gap-3 transition-opacity duration-150 hover:opacity-80"
    >
      <img src={logo} alt="নাগরিক" className="h-9 w-auto" />
      <div className="leading-tight">
        <p className="m-0 text-[13px] font-extrabold tracking-wide text-nagorik-heading">
          NAGORIK
        </p>
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-nagorik-red">
          Admin Panel
        </p>
      </div>
    </Link>
  )

  return (
    <div className="flex h-full flex-col">
      <div
        className={clsx(
          'flex items-center border-b border-nagorik-line',
          collapsed ? 'justify-center px-2 py-4' : 'px-6 py-5',
        )}
      >
        {collapsed ? (
          <Link
            to={currentSection}
            onClick={onNavigate}
            title="Back to this section"
            aria-label="Back to this section"
            className="transition-opacity duration-150 hover:opacity-80"
          >
            <img src={logo} alt="NAGORIK" className="h-7 w-auto" />
          </Link>
        ) : (
          brand
        )}
      </div>

      <nav className={clsx('flex-1 overflow-y-auto', collapsed ? 'px-3 py-4' : 'px-3 py-4')}>
        <ul className="flex flex-col items-center gap-1">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <li key={to} className="w-full">
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-label={collapsed ? label : undefined}
                className={navItem}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={clsx('border-t border-nagorik-line', collapsed ? 'px-3 py-4' : 'px-3 py-4')}>
        {collapsed ? (
          <div className="mb-2 flex justify-center">
            <span
              title={userData.name || 'Admin User'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-nagorik-red bg-nagorik-surface-2 text-[13px] font-bold text-nagorik-red"
            >
              {(userData.name || 'A').charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
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
        )}

        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          aria-label={collapsed ? 'Log out' : undefined}
          className={clsx(
            'flex w-full items-center rounded-xl text-[13px] font-semibold text-nagorik-red transition-colors duration-150 hover:bg-nagorik-red/10 cursor-pointer',
            collapsed ? 'h-10 w-10 shrink-0 justify-center' : 'gap-3 px-3.5 py-2.5',
          )}
        >
          <LogOutIcon />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* Collapse / expand toggle sits on the sidebar's right edge. */}
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-1/2 z-40 hidden h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-nagorik-line bg-nagorik-paper text-nagorik-secondary shadow-sm transition-colors duration-150 hover:bg-nagorik-surface-2 hover:text-nagorik-heading min-[981px]:flex"
        >
          {collapsed ? <ChevronRightIcon size={13} /> : <ChevronLeftIcon size={13} />}
        </button>
      )}
    </div>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true',
  )

  useEffect(() => {
    document.title = 'Admin Panel — নাগরিক'
  }, [])

  // Keeps the header logo pointing back at the exact admin page in view
  // (section + tab/page/search), so it works from a post opened out of the panel.
  useEffect(() => {
    rememberAdminSection(location.pathname, location.search)
  }, [location.pathname, location.search])

  const toggleCollapse = () => {
    setCollapsed((wasCollapsed) => {
      localStorage.setItem(COLLAPSE_KEY, String(!wasCollapsed))
      return !wasCollapsed
    })
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login?next=/admin" replace />
  }

const userData = getUser()

if (!userData.isAdmin) {
  return <Navigate to="/browse_feed" replace />
}
  const handleLogout = () => {
    signOut()
    navigate('/', { replace: true })
  }

  const pageTitle = TITLES[location.pathname] || 'Admin Panel'

  return (
    <div className="min-h-screen bg-nagorik-cream">
      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside
          className={clsx(
            'relative hidden shrink-0 border-r border-nagorik-line bg-nagorik-paper transition-[width] duration-200 min-[981px]:block',
            collapsed ? 'w-[76px]' : 'w-[268px]',
          )}
        >
          <div className="sticky top-0 h-screen">
            <SidebarContent
              userData={userData}
              onLogout={handleLogout}
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
            />
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
