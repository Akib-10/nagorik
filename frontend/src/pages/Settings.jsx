import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getUser, getSettings, saveSettings, getTheme, setTheme, signOut } from '../services/authService'
import { HomeGlyph, GearIcon, BellIconApp, ShieldIcon, UserGlyph, MailIcon } from '../components/icons'

const SETTING_DEFAULTS = {
  email: true,
  push: true,
  digest: false,
  public: true,
  showUpvotes: true,
}

function CardHead({ icon, title, sub }) {
  return (
    <div className="mb-2.5 flex items-start gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-nagorik-soft-red text-nagorik-red dark:text-[#FF7080]">{icon}</span>
      <div>
        <h3 className="m-0 text-[15px] font-extrabold text-nagorik-heading">{title}</h3>
        {sub && <p className="mt-0.5 text-[11.5px] text-nagorik-muted">{sub}</p>}
      </div>
    </div>
  )
}

export default function Settings() {
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

      <main className="mx-auto max-w-[1160px] px-7 pb-[60px] max-[760px]:px-4">

        <div className="py-[36px_0_28px] text-center">
          <h1 className="mb-2 m-0 text-[30px] font-extrabold text-nagorik-heading">Settings</h1>
          <p className="m-0 text-[14px] text-nagorik-secondary">Personalise how Nagorik looks and notifies you. Changes are saved automatically.</p>
        </div>

        {/* ACCOUNT SUMMARY */}
        <Link to="/user" className="mt-2 flex cursor-pointer items-center gap-[18px] rounded-2xl border border-nagorik-border bg-nagorik-surface p-[18px_20px] transition-[border-color_0.15s_ease,transform_0.15s_ease,box-shadow_0.15s_ease] hover:border-nagorik-red hover:-translate-y-px hover:shadow-[0_10px_24px_-14px_rgba(200,16,46,0.45)]" aria-label="Go to your profile">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full border-2 border-nagorik-red bg-white text-[22px] font-extrabold text-nagorik-red dark:bg-nagorik-surface-2">{displayName.charAt(0).toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <h2 className="mb-1 text-[17px] font-extrabold text-nagorik-heading">{displayName}</h2>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-nagorik-muted">
              <MailIcon /> {userData.email || 'demo@nagorik.bd'}
            </span>
          </div>
          <span className="shrink-0 text-[12.5px] font-bold text-nagorik-red whitespace-nowrap dark:text-[#FF7080]">View profile →</span>
        </Link>

        <div className="relative mt-[22px] grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
          {savedFlash && (
            <div className="absolute -top-[34px] right-0 rounded-full bg-[#E8F5EE] px-3.5 py-1.5 text-[12px] font-bold text-nagorik-green animate-[saveFlash_0.3s_ease] max-[760px]:static max-[760px]:mb-3 max-[760px]:inline-block" role="status">✓ Preferences saved</div>
          )}

          {/* APPEARANCE */}
          <section className="rounded-2xl border border-nagorik-border bg-nagorik-surface p-[18px_20px]">
            <CardHead icon={<GearIcon size={16} />} title="Appearance" sub="Make the app comfortable for your eyes." />
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Dark mode</span>
                <span className="text-[12px] text-nagorik-muted">Darker surfaces across every page — easier at night.</span>
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

          {/* NOTIFICATIONS */}
          <section className="rounded-2xl border border-nagorik-border bg-nagorik-surface p-[18px_20px]">
            <CardHead icon={<BellIconApp size={16} />} title="Notifications" sub="Choose what you want to hear about." />
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Email notifications</span>
                <span className="text-[12px] text-nagorik-muted">Updates on your reports and followed issues</span>
              </div>
              <button type="button" className={toggleButton('email')} onClick={() => toggleSetting('email')} aria-label="Email notifications"></button>
            </div>
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Push notifications</span>
                <span className="text-[12px] text-nagorik-muted">Real-time alerts on your device</span>
              </div>
              <button type="button" className={toggleButton('push')} onClick={() => toggleSetting('push')} aria-label="Push notifications"></button>
            </div>
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Weekly digest</span>
                <span className="text-[12px] text-nagorik-muted">Trending issues in your area</span>
              </div>
              <button type="button" className={toggleButton('digest')} onClick={() => toggleSetting('digest')} aria-label="Weekly digest"></button>
            </div>
          </section>

          {/* PRIVACY */}
          <section className="rounded-2xl border border-nagorik-border bg-nagorik-surface p-[18px_20px]">
            <CardHead icon={<ShieldIcon size={15} />} title="Privacy" sub="Control what other citizens can see." />
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Public profile</span>
                <span className="text-[12px] text-nagorik-muted">Others can see your reports and activity</span>
              </div>
              <button type="button" className={toggleButton('public')} onClick={() => toggleSetting('public')} aria-label="Public profile"></button>
            </div>
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Show upvotes</span>
                <span className="text-[12px] text-nagorik-muted">Display upvoted issues on your profile</span>
              </div>
              <button type="button" className={toggleButton('showUpvotes')} onClick={() => toggleSetting('showUpvotes')} aria-label="Show upvotes"></button>
            </div>
          </section>

          {/* DANGER ZONE */}
          <section className="rounded-2xl border border-[rgba(200,16,46,0.35)] bg-nagorik-surface p-[18px_20px]">
            <CardHead icon={<UserGlyph size={16} />} title="Account actions" sub="Manage your session and account." />
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Log out</span>
                <span className="text-[12px] text-nagorik-muted">End your session on this device</span>
              </div>
              <button type="button" className="rounded-full border-[1.5px] border-nagorik-border bg-transparent px-4 py-2 text-[12.5px] font-bold text-nagorik-secondary transition-[border-color_0.15s_ease,color_0.15s_ease,background_0.15s_ease] hover:border-nagorik-red hover:text-nagorik-red" onClick={handleLogout}>
                Log out
              </button>
            </div>
            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Delete account</span>
                <span className="text-[12px] text-nagorik-muted">Permanently remove your account and data</span>
              </div>
              <button
                type="button"
                className="rounded-full border-[1.5px] border-nagorik-red bg-transparent px-4 py-2 text-[12.5px] font-bold text-nagorik-red transition-[background_0.15s_ease,color_0.15s_ease] hover:bg-nagorik-red hover:text-white"
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