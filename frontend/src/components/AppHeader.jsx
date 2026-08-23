import { useNavigate, Link } from 'react-router-dom'
import logo from '../assets/images/logo_for_dark_mode.png'
import { isAuthenticated, getUser, signOut } from '../services/authService'
import { SearchIcon, PlusIcon, BellIconApp, GearIcon } from './icons'

// App-style header shared by browse_feed / user / report pages.
// The three original headers differ only in nav items and right-side
// buttons, so those are passed as props while the DOM stays identical.
export default function AppHeader({ logoHref = '/', navItems = [], showIconButtons = false, showLogout = false }) {
  const isAuth = isAuthenticated()
  const userData = getUser()
  const navigate = useNavigate()

  // Enter in the header search jumps to the feed pre-filtered with the query.
  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      navigate(`/browse_feed?q=${encodeURIComponent(e.currentTarget.value.trim())}`)
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to={logoHref} className="logo" aria-label="নাগরিক home">
          <img src={logo} alt="নাগরিক" />
        </Link>

        {navItems.map((item) => {
          const cls = item.variant ? `nav-btn ${item.variant}` : 'nav-btn'
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={cls}>
                {item.icon}
                <span className="label">{item.label}</span>
              </Link>
            )
          }
          return (
            <button key={item.label} type="button" className={cls}>
              {item.icon}
              <span className="label">{item.label}</span>
            </button>
          )
        })}

        <div className="header-search">
          <SearchIcon size={16} />
          <div className="divider"></div>
          <input type="text" placeholder="SEARCH CIVIC ISSUES" onKeyDown={handleSearchKey} />
        </div>

        <div className="header-right">
          <Link to="/report" className="report-btn">
            <PlusIcon />
            REPORT ISSUE
          </Link>
          {showIconButtons && (
            <>
              <button type="button" className="icon-btn"><BellIconApp /></button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Settings"
                onClick={() => navigate('/settings')}
              >
                <GearIcon />
              </button>
            </>
          )}
          <Link to="/user" className="avatar" aria-label="My profile">
            {isAuth && userData.name ? (
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary-red)' }}>
                {userData.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <svg viewBox="0 0 24 24" fill="var(--muted)"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
            )}
          </Link>
          {showLogout && <LogoutButton visible={isAuth} />}
        </div>
      </div>
    </header>
  )
}

function LogoutButton({ visible }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      id="logoutBtn"
      style={{ display: visible ? 'inline-flex' : 'none', fontSize: '12px', padding: '8px 12px' }}
      onClick={handleLogout}
    >
      Log out
    </button>
  )
}
