import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import usePageStyles from '../hooks/usePageStyles'
import AppHeader from '../components/AppHeader'
import { getUser, getSettings, saveSettings, getTheme, setTheme, signOut } from '../services/authService'
import { HomeGlyph, GearIcon, BellIconApp, ShieldIcon, UserGlyph, MailIcon } from '../components/icons'

// Same keys the profile page's Settings tab uses — both stay in sync
// through "nagorik_settings" in localStorage.
const SETTING_DEFAULTS = {
  email: true,
  push: true,
  digest: false,
  public: true,
  showUpvotes: true,
}

function CardHead({ icon, title, sub }) {
  return (
    <div className="card-head">
      <span className="setting-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        {sub && <p className="card-sub">{sub}</p>}
      </div>
    </div>
  )
}

export default function Settings() {
  usePageStyles('app')
  const navigate = useNavigate()

  const userData = getUser()
  const displayName = userData.name || 'Nagorik User'

  const [theme, setThemeState] = useState(() => getTheme())
  const [settings, setSettings] = useState(() => ({
    ...SETTING_DEFAULTS,
    ...getSettings(),
  }))
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    document.title = 'Settings — নাগরিক'
    document.documentElement.lang = 'en'
  }, [])

  // Brief "saved" confirmation whenever a preference changes.
  useEffect(() => {
    if (!savedFlash) return
    const t = setTimeout(() => setSavedFlash(false), 1600)
    return () => clearTimeout(t)
  }, [savedFlash])

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
    setSavedFlash(true)
  }

  const toggleSetting = (key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      saveSettings(next)
      return next
    })
    setSavedFlash(true)
  }

  const toggleButton = (key) => `toggle${settings[key] ? ' active' : ''}`

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  return (
    <>
      <AppHeader
        logoHref="/"
        navItems={[
          { label: 'HOME', variant: 'inactive', to: '/browse_feed', icon: <HomeGlyph /> },
        ]}
      />

      <main className="container settings-page">

        <div className="page-head">
          <h1>Settings</h1>
          <p>Personalise how Nagorik looks and notifies you. Changes are saved automatically.</p>
        </div>

        {/* ---------- ACCOUNT SUMMARY — click through to the profile page ---------- */}
        <Link to="/user" className="setting-card account-card" aria-label="Go to your profile">
          <div className="avatar-md">{displayName.charAt(0).toUpperCase()}</div>
          <div className="account-info">
            <h2>{displayName}</h2>
            <span><MailIcon /> {userData.email || 'demo@nagorik.bd'}</span>
          </div>
          <span className="account-go">View profile →</span>
        </Link>

        <div className="settings-grid settings-page-grid">
          {savedFlash && (
            <div className="save-flash" role="status">✓ Preferences saved</div>
          )}

          {/* ---------- APPEARANCE ---------- */}
          <section className="setting-card">
            <CardHead icon={<GearIcon size={16} />} title="Appearance" sub="Make the app comfortable for your eyes." />
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Dark mode</span>
                <span className="setting-desc">Darker surfaces across every page — easier at night.</span>
              </div>
              <button
                type="button"
                className={theme === 'dark' ? 'toggle active' : 'toggle'}
                onClick={handleThemeToggle}
                aria-label="Dark mode"
                aria-pressed={theme === 'dark'}
              ></button>
            </div>
          </section>

          {/* ---------- NOTIFICATIONS ---------- */}
          <section className="setting-card">
            <CardHead icon={<BellIconApp size={16} />} title="Notifications" sub="Choose what you want to hear about." />
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Email notifications</span>
                <span className="setting-desc">Updates on your reports and followed issues</span>
              </div>
              <button type="button" className={toggleButton('email')} onClick={() => toggleSetting('email')} aria-label="Email notifications"></button>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Push notifications</span>
                <span className="setting-desc">Real-time alerts on your device</span>
              </div>
              <button type="button" className={toggleButton('push')} onClick={() => toggleSetting('push')} aria-label="Push notifications"></button>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Weekly digest</span>
                <span className="setting-desc">Trending issues in your area</span>
              </div>
              <button type="button" className={toggleButton('digest')} onClick={() => toggleSetting('digest')} aria-label="Weekly digest"></button>
            </div>
          </section>

          {/* ---------- PRIVACY ---------- */}
          <section className="setting-card">
            <CardHead icon={<ShieldIcon size={15} />} title="Privacy" sub="Control what other citizens can see." />
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Public profile</span>
                <span className="setting-desc">Others can see your reports and activity</span>
              </div>
              <button type="button" className={toggleButton('public')} onClick={() => toggleSetting('public')} aria-label="Public profile"></button>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Show upvotes</span>
                <span className="setting-desc">Display upvoted issues on your profile</span>
              </div>
              <button type="button" className={toggleButton('showUpvotes')} onClick={() => toggleSetting('showUpvotes')} aria-label="Show upvotes"></button>
            </div>
          </section>

          {/* ---------- DANGER ZONE ---------- */}
          <section className="setting-card danger-zone">
            <CardHead icon={<UserGlyph size={16} />} title="Account actions" sub="Manage your session and account." />
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Log out</span>
                <span className="setting-desc">End your session on this device</span>
              </div>
              <button type="button" className="ghost-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Delete account</span>
                <span className="setting-desc">Permanently remove your account and data</span>
              </div>
              <button
                type="button"
                className="danger-btn"
                onClick={() => window.confirm('Delete your account? This cannot be undone.')}
              >
                Delete
              </button>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
