import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLayoutEffect } from 'react';
import { setPageStyles } from '../styles/usePageStyles'
import AppHeader from '../components/AppHeader'
import { getFeedIssues, getTrendingIssues } from '../services/issuesService'
import { HomeGlyph, SearchIcon, PinIcon, UserGlyph, ClockIcon, VoteUpIcon, VoteDownIcon, CommentIcon, RepostIcon, ShareNodesIcon, PlusIcon } from '../components/icons'

const TABS = ['latest', 'ongoing', 'trending', 'all']

// Keeps the seed data's zero-padded style ("02") once votes are toggled.
function formatDown(value) {
  const n = Number(value)
  return Number.isNaN(n) ? value : String(n).padStart(2, '0')
}

function IssueCard({ issue, myVote, onVote, onOpen }) {
  const upCount = issue.up + (myVote === 'up' ? 1 : 0)
  const downCount = formatDown(Number(issue.down) + (myVote === 'down' ? 1 : 0))

  // Any click on the card opens the post, except the action buttons below
  // (they call stopPropagation so voting/commenting doesn't also navigate).
  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }

  return (
    <article className="issue-card" onClick={() => onOpen(issue.id)} style={{ cursor: 'pointer' }}>
      <div className="issue-thumb">
        <img src={issue.img} alt={issue.alt} />
      </div>
      <div className="issue-body">
        <span className={`status-badge ${issue.statusClass || ''}`}><span className="dot"></span>{issue.statusLabel}</span>
        <h3 className="issue-title">{issue.title}</h3>
        <div className="issue-meta">
          <span><PinIcon size={14} />{issue.area}</span>
          <span><UserGlyph size={14} />{issue.reporter}</span>
          <span><ClockIcon size={14} />{issue.time}</span>
        </div>
        <div className="issue-actions">
          <div className="vote-group">
            <button
              type="button"
              className={myVote === 'up' ? 'active' : undefined}
              onClick={stop(() => onVote(issue.id, 'up'))}
            ><VoteUpIcon size={14} />{upCount}</button>
            <div className="sep"></div>
            <button
              type="button"
              className={myVote === 'down' ? 'active' : undefined}
              onClick={stop(() => onVote(issue.id, 'down'))}
            ><VoteDownIcon size={14} />{downCount}</button>
          </div>
          <button type="button" className="pill-action" onClick={stop(() => onOpen(issue.id))}><CommentIcon size={14} />{issue.comments}</button>
          <button type="button" className="icon-pill" onClick={stop(() => {})}><RepostIcon /></button>
          <button type="button" className="pill-action" onClick={stop(() => {})}><ShareNodesIcon />share</button>
        </div>
      </div>
    </article>
  )
}

export default function BrowseFeed() {
   useLayoutEffect(() => setPageStyles('app'))

  // Tab switching is visual-only in the original page as well.
  const [activeTab, setActiveTab] = useState('latest')
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [votes, setVotes] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'নাগরিক | Civic Issues'
    document.documentElement.lang = 'bn'
  }, [])

  const feedIssues = useMemo(() => getFeedIssues(), [])
  const trendingIssues = useMemo(() => getTrendingIssues(), [])

  const visibleIssues = useMemo(() => {
    let list = feedIssues
    if (activeTab === 'ongoing') list = list.filter((i) => i.statusLabel === 'Ongoing')
    if (activeTab === 'trending') list = [...list].sort((a, b) => b.up - a.up)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((i) =>
        [i.title, i.area, i.reporter, i.category]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    }
    return list
  }, [feedIssues, activeTab, query])

  const handleVote = (id, dir) => {
    setVotes((prev) => ({ ...prev, [id]: prev[id] === dir ? null : dir }))
  }

  const openPost = (id) => {
    navigate(`/post/${id}`)
  }

  return (
    <>
      <AppHeader
        logoHref="/"
        navItems={[
          { label: 'HOME', to: '/browse_feed', variant: 'active', icon: <HomeGlyph /> },
        ]}
        showIconButtons
        showLogout
      />

      {/* ================= HERO ================= */}
      <div className="hero-wrap">
        <section className="hero">
          <div className="hero-left">
            <h1>Dhaka Civic Issues</h1>
            <p>Report local problem, vote on urgent issues, track resolution progress.</p>
            <div className="hero-search">
              <SearchIcon size={18} />
              <div className="divider"></div>
              <input
                type="text"
                placeholder="Search issues by title, area, category"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">45</div>
              <div className="label">Open</div>
            </div>
            <div className="hero-stat">
              <div className="num">31</div>
              <div className="label">in progress</div>
            </div>
            <div className="hero-stat">
              <div className="num">14</div>
              <div className="label">received</div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= TABS ================= */}
      <div className="tabs" id="tabs">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            className={`tab-btn${activeTab === tabKey ? ' active' : ''}`}
            onClick={() => setActiveTab(tabKey)}
          >
            {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
          </button>
        ))}
      </div>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="main-layout">

        {/* Issues Feed */}
        <div className="issues-list" id="issuesList">
          {visibleIssues.length ? (
            visibleIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                myVote={votes[issue.id] || null}
                onVote={handleVote}
                onOpen={openPost}
              />
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '48px 0', fontSize: '14px' }}>
              No issues match your search. Try a different keyword or check the other tabs.
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="trending-card">
            <h3>🔥 Trending issues</h3>

            {trendingIssues.map((item, index) => (
              <div
                className="trending-item"
                key={`${item.id}-${index}`}
                onClick={() => openPost(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="trending-thumb"><img src={item.img} alt="" /></div>
                <div className="trending-info">
                  <p>{item.title}</p>
                  <div className="trending-stats">
                    <span>⬆ {item.votes}</span><span>🕒 {item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cta-card">
            <h3>Report a problem?</h3>
            <p>Help your community by reporting civic issue in your neighbourhood.</p>
            <Link to="/report" className="cta-btn">
              <PlusIcon />
              REPORT ISSUE
            </Link>
          </div>
        </aside>

      </div>
    </>
  )
}