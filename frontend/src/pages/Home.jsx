import { useEffect, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { setPageStyles } from '../styles/usePageStyles';
import LandingHeader from '../components/LandingHeader'
import LandingFooter from '../components/LandingFooter'
import AuthLink from '../components/AuthLink'
import { ShieldIcon, CameraIcon, ArrowUpIcon, BellIconLanding, MapFoldIcon } from '../components/icons'

const steps = [
  {
    no: 'STEP 01',
    icon: <CameraIcon size={20} />,
    title: 'Spot & snap',
    text: 'See a pothole, a dark street, an overflowing drain? Take a photo, drop a pin on the map, and write a quick description.',
  },
  {
    no: 'STEP 02',
    icon: <ArrowUpIcon size={20} />,
    title: 'Neighbours confirm',
    text: "Others upvote issues they've seen too. The more confirmations, the louder the signal to authorities.",
  },
  {
    no: 'STEP 03',
    icon: <BellIconLanding size={20} />,
    title: 'Authorities act',
    text: 'High-priority issues auto-notify the relevant city office. Track status live — from "Reported" to "Fixed".',
  },
]

const features = [
  {
    icon: <CameraIcon size={18} />,
    title: 'Photo & video reports',
    text: 'Snap it, upload it. Visual evidence makes issues impossible to ignore.',
  },
  {
    icon: <MapFoldIcon />,
    title: 'Live hotspot tracking',
    text: 'See every civic problem in your area on one feed. Priorities become obvious.',
  },
  {
    icon: <ArrowUpIcon size={18} />,
    title: 'Community voting',
    text: "Upvote issues you've seen too. The most-voted problems automatically escalate.",
  },
  {
    icon: <BellIconLanding size={18} />,
    title: 'Authority alerts',
    text: 'High-engagement issues ping the relevant city offices and utility teams directly.',
  },
]

const issues = [
  {
    thumb: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=60',
    cat: '🛣️ Road',
    statusClass: 'progress',
    statusLabel: 'In progress',
    title: 'Large pothole on Mirpur Road causing accidents',
    loc: '📍 Mirpur 10, Dhaka · 2 days ago',
    up: 342,
    comments: 47,
    meToo: 89,
  },
  {
    thumb: 'https://images.unsplash.com/photo-1518481852452-9415b262eba4?w=600&q=60',
    cat: '⚡ Electricity',
    statusClass: 'open',
    statusLabel: 'Open',
    title: 'Street lights out on entire Green Road stretch',
    loc: '📍 Dhanmondi, Dhaka · 3 days ago',
    up: 215,
    comments: 31,
    meToo: 67,
  },
  {
    thumb: 'https://images.unsplash.com/photo-1523867574650-fd3ee4b32e8f?w=600&q=60',
    cat: '💧 Water',
    statusClass: 'open',
    statusLabel: 'Open',
    title: 'Sewage overflow near Hatirjheel lake inlet',
    loc: '📍 Hatirjheel, Dhaka · 5 days ago',
    up: 489,
    comments: 62,
    meToo: 143,
  },
]

export default function Home() {
  useLayoutEffect(() => setPageStyles('landing'))

  useEffect(() => {
    document.title = 'নাগরিক — Nagorik | Report civic issues, get them fixed'
  }, [])

  return (
    <>
      <LandingHeader />

      <main>

        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="hero-inner">
            <span className="hero-eyebrow">
              <ShieldIcon />
              Built for Dhaka's neighbourhoods
            </span>
            <h1>Spot a problem, <em>report it,</em><br />watch it get fixed.</h1>
            <p className="lead">Nagorik turns local problems into visible, trackable, solvable civic issues — connecting neighbours directly to the authorities who can act.</p>

            <div className="hero-cta">
              <AuthLink to="/report" className="btn btn-primary">Report an issue →</AuthLink>
              <Link to="/browse_feed" className="btn btn-ghost">Browse issues</Link>
            </div>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="stats">
          <div className="wrap stats-grid">
            <div className="stat"><div className="num">14,820+</div><div className="label">Issues reported</div></div>
            <div className="stat"><div className="num green">3,241+</div><div className="label">Issues resolved</div></div>
            <div className="stat"><div className="num">6</div><div className="label">Cities active</div></div>
            <div className="stat"><div className="num">89%</div><div className="label">Resolution rate</div></div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="section" id="how-it-works">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow" style={{ justifyContent: 'center' }}>Simple as 1–2–3</span>
              <h2>How <span className="accent">Nagorik</span> works</h2>
              <p>Three steps between a broken road and a fixed one. In that order, every time.</p>
            </div>

            <div className="steps">
              {steps.map((step) => (
                <div className="step" key={step.no}>
                  <span className="step-no">{step.no}</span>
                  <div className="icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section className="section alt">
          <div className="wrap">
            <div className="section-head">
              <h2>Built to actually <span className="accent">get things done</span></h2>
              <p>Not just a complaint box. A real system that connects citizens to authorities.</p>
            </div>

            <div className="features">
              {features.map((feature) => (
                <div className="feature" key={feature.title}>
                  <div className="icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ REAL ISSUES ============ */}
        <section className="section" id="issues">
          <div className="wrap">
            <div className="section-head row">
              <div>
                <span className="eyebrow">Right now</span>
                <h2>Real issues. <span className="accent">Right now.</span></h2>
                <p>Community-reported and actively being tracked.</p>
              </div>
              <Link to="/browse_feed" className="btn btn-ghost">View all issues →</Link>
            </div>

            <div className="issues-grid">
              {issues.map((issue) => (
                <article className="issue-card" key={issue.title}>
                  <div className="thumb" style={{ backgroundImage: `url('${issue.thumb}')` }}>
                    <span className="cat">{issue.cat}</span>
                  </div>
                  <div className="body">
                    <span className={`status ${issue.statusClass}`}><i></i>{issue.statusLabel}</span>
                    <h4>{issue.title}</h4>
                    <div className="loc">{issue.loc}</div>
                    <div className="issue-stats"><span>▲ {issue.up}</span><span>💬 {issue.comments}</span><span>🟢 Me too {issue.meToo}</span></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TRUST STRIP ============ */}
        <section className="trust">
          <div className="wrap">
            <div className="label">VERIFIED WITH GOVERNMENT AUTHORITIES</div>
            <div className="trust-logos">
              <span>🏛️ DNCC</span>
              <span>🏛️ DSCC</span>
              <span>⚡ DESCO</span>
              <span>💧 WASA</span>
              <span>🚌 BRTA</span>
              <span>🏗️ RAJUK</span>
            </div>
          </div>
        </section>

        {/* ============ CTA + FOOTER ============ */}
        <section className="section">
          <div className="wrap">
            <div className="cta">
              <h2>Your city needs you.</h2>
              <p>Every report you submit makes your neighbourhood a little better. Join 12,000+ citizens already making a difference.</p>
              <div className="row">
                <Link to="/login" className="btn btn-light">Join Nagorik — it's free</Link>
                <a href="#issues" className="btn btn-outline-light">Browse without signing up →</a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </>
  )
}
