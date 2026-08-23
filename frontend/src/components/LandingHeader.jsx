import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo_for_dark_mode.png'
import { isAuthenticated, getUser } from '../services/authService'
import AuthLink from './AuthLink.jsx'
import { MenuIcon, SearchIcon, AvatarGlyph } from './icons'

// Landing site header — identical DOM to index.html <header class="site-header">.
// Behaviour ported from assets/js/main.js: mobile nav toggle, scroll-spy,
// special #top handling and auth-aware login/profile buttons.
export default function LandingHeader() {
  const [navOpen, setNavOpen] = useState(false)
  const [activeId, setActiveId] = useState('#top')
  const isAuth = isAuthenticated()
  const userData = getUser()
  const navRef = useRef(null)
  const toggleRef = useRef(null)
  const navigate = useNavigate()

  // Enter in the header search jumps to the feed pre-filtered with the query.
  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      navigate(`/browse_feed?q=${encodeURIComponent(e.currentTarget.value.trim())}`)
    }
  }

  useEffect(() => {
    // Close the mobile nav when clicking outside of it
    const onDocClick = (e) => {
      if (navRef.current && toggleRef.current &&
        !navRef.current.contains(e.target) && !toggleRef.current.contains(e.target)) {
        setNavOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  useEffect(() => {
    // Highlight in-page nav links while scrolling
    const sections = document.querySelectorAll('main [id]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(`#${entry.target.getAttribute('id')}`)
        }
      })
    }, { rootMargin: '-45% 0px -50% 0px' })
    sections.forEach((sec) => observer.observe(sec))

    // Scrolling back near the top re-activates "Home"
    const onScroll = () => {
      if (window.scrollY < 80) setActiveId('#top')
    }
    window.addEventListener('scroll', onScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // "Home" scrolls back up every time, even when the hash is already "#top"
  const handleHomeClick = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.history.replaceState(null, '', window.location.pathname)
    setActiveId('#top')
    setNavOpen(false)
  }

  const navLinkClass = (id) => (activeId === id ? 'active' : undefined)

  return (
    <header className="site-header" id="top">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="নাগরিক home">
          <img src={logo} alt="নাগরিক logo" />
        </Link>

        <button
          ref={toggleRef}
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((open) => !open)}
        >
          <MenuIcon />
        </button>

        <nav ref={navRef} className={`main-nav${navOpen ? ' open' : ''}`}>
          <a href="#top" className={navLinkClass('#top')} onClick={handleHomeClick}>Home</a>
          <a href="#how-it-works" className={navLinkClass('#how-it-works')} onClick={() => setNavOpen(false)}>How it works</a>
          <a href="#issues" className={navLinkClass('#issues')} onClick={() => setNavOpen(false)}>Real issues</a>
        </nav>

        <div className="header-search">
          <SearchIcon size={15} />
          <input type="text" placeholder="Search civic issues" aria-label="Search civic issues" onKeyDown={handleSearchKey} />
        </div>

        <div className="header-actions">
          <Link
            to="/login"
            className="btn btn-ghost"
            style={{ display: isAuth ? 'none' : 'inline-flex' }}
          >
            Log in
          </Link>
          <Link
            to="/user"
            className="avatar"
            style={{
              display: isAuth ? 'flex' : 'none',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--surface-2)',
              border: '2px solid var(--red)',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Profile"
          >
            {isAuth && userData.name ? (
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--red)' }}>
                {userData.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <AvatarGlyph size={24} />
            )}
          </Link>
          <AuthLink to="/report" className="btn btn-primary">Report an issue</AuthLink>
        </div>
      </div>
    </header>
  )
}
