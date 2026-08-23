import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import usePageStyles from '../hooks/usePageStyles'
import logo from '../assets/images/logo_for_dark_mode.png'
import { signIn } from '../services/authService'

const COPY = {
  login: {
    heading: 'Log in to Nagorik',
    sub: 'Track your reports, vote on issues, and follow your neighbourhood.',
  },
  register: {
    heading: 'Create your Nagorik account',
    sub: "It's free — join your neighbourhood in under a minute.",
  },
}

export default function Login() {
  usePageStyles('landing')

  const [tab, setTab] = useState('login')
  const [note, setNote] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const loginEmailRef = useRef(null)
  const regNameRef = useRef(null)
  const regEmailRef = useRef(null)

  useEffect(() => {
    document.title = 'Log in — নাগরিক'
  }, [])

  const selectTab = (nextTab) => {
    setTab(nextTab)
    setNote(null)
  }

  // Mirrors the data-auth-form handler in assets/js/main.js: store a demo
  // session and return the visitor to ?next=... or the profile page.
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    const isRegister = e.currentTarget.dataset.form === 'register'
    const userName = isRegister
      ? (regNameRef.current ? regNameRef.current.value : 'Nagorik User')
      : (loginEmailRef.current ? loginEmailRef.current.value : 'Nagorik User')
    const userEmail = isRegister
      ? (regEmailRef.current ? regEmailRef.current.value : '')
      : (loginEmailRef.current ? loginEmailRef.current.value : '')

    signIn({ name: userName, email: userEmail })
    setNote({ text: 'Signed in — redirecting…', color: '#2E8B57' })

    const next = searchParams.get('next')
    setTimeout(() => {
      navigate(next || '/user')
    }, 500)
  }

  return (
    <>
      <header className="site-header" id="top">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="নাগরিক home">
            <img src={logo} alt="নাগরিক logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/browse_feed">Browse feed</Link>
          </nav>
          <div className="header-actions" style={{ marginLeft: 'auto' }}>
            <Link to="/" className="btn btn-ghost">← Back home</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="page-hero" style={{ paddingBottom: '0' }}>
          <div className="wrap">
            <span className="eyebrow">Welcome</span>
            <h1>{COPY[tab].heading}</h1>
            <p>{COPY[tab].sub}</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '0' }}>
          <div className="wrap">
            <div className="panel" style={{ maxWidth: '440px' }}>

              <div className="auth-tabs">
                <button type="button" className={tab === 'login' ? 'active' : undefined} onClick={() => selectTab('login')}>Log in</button>
                <button type="button" className={tab === 'register' ? 'active' : undefined} onClick={() => selectTab('register')}>Register</button>
              </div>

              {/* LOG IN */}
              <div className={`auth-panel${tab === 'login' ? ' active' : ''}`}>
                <form onSubmit={handleAuthSubmit} data-form="login">
                  <div className="form-row">
                    <label htmlFor="loginEmail">Email</label>
                    <input id="loginEmail" type="email" placeholder="you@example.com" required ref={loginEmailRef} />
                  </div>
                  <div className="form-row">
                    <label htmlFor="loginPassword">Password</label>
                    <input id="loginPassword" type="password" placeholder="••••••••" required />
                  </div>
                  <div className="form-actions" style={{ flexDirection: 'column' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Log in</button>
                  </div>
                  {tab === 'login' && (
                    <p className="form-note" style={{ marginTop: '14px', fontSize: '13.5px', color: note ? note.color : 'var(--muted)' }}>
                      {note ? note.text : ''}
                    </p>
                  )}
                </form>
              </div>

              {/* REGISTER */}
              <div className={`auth-panel${tab === 'register' ? ' active' : ''}`}>
                <form onSubmit={handleAuthSubmit} data-form="register">
                  <div className="form-row">
                    <label htmlFor="regName">Full name</label>
                    <input id="regName" type="text" placeholder="Your name" required ref={regNameRef} />
                  </div>
                  <div className="form-row">
                    <label htmlFor="regEmail">Email</label>
                    <input id="regEmail" type="email" placeholder="you@example.com" required ref={regEmailRef} />
                  </div>
                  <div className="form-row">
                    <label htmlFor="regPassword">Password</label>
                    <input id="regPassword" type="password" placeholder="Create a password" required />
                  </div>
                  <div className="form-actions" style={{ flexDirection: 'column' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create account</button>
                  </div>
                  {tab === 'register' && (
                    <p className="form-note" style={{ marginTop: '14px', fontSize: '13.5px', color: note ? note.color : 'var(--muted)' }}>
                      {note ? note.text : ''}
                    </p>
                  )}
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" style={{ marginTop: '0' }}>
        <div className="wrap">
          <div className="footer-bottom" style={{ borderTop: '0', paddingTop: '0' }}>
            <span>© 2026 Nagorik. Made with ♥ for Dhaka.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
