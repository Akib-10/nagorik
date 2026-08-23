import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import usePageStyles from '../hooks/usePageStyles'
import AppHeader from '../components/AppHeader'
import { getMyReports, getUpvotedIssues, deleteReport } from '../services/issuesService'
import { getUser } from '../services/authService'
import { HomeGlyph, PinIcon, ClockIcon, VoteUpIcon, CommentIcon, EyeIcon, EditPenIcon, TrashIcon, ShieldIcon } from '../components/icons'

function ReportRow({ issue, expanded, onView, onEdit, onDelete }) {
  return (
    <article className="report-row">
      <div className="report-thumb">
        <img src={issue.img} alt={issue.title} />
      </div>
      <div className="report-info">
        <div className="report-toprow">
          <h3>{issue.title}</h3>
          <span className={`badge-sm ${issue.statusClass || ''}`}><span className="dot"></span>{issue.statusLabel}</span>
        </div>
        <div className="report-metaline">
          <span><PinIcon size={12} />{issue.area}</span>
          <span><ClockIcon size={12} />{issue.time}</span>
        </div>
        <div className="report-statsline">
          <span><VoteUpIcon size={12} />{issue.up} upvotes</span>
          <span><CommentIcon size={12} />{issue.comments} comments</span>
        </div>
        <div className="row-actions">
          <button type="button" className={`mini-pill${expanded ? ' ghost' : ''}`} onClick={() => onView(issue.id)}><EyeIcon />{expanded ? 'Hide' : 'View'}</button>
          <button type="button" className="mini-pill ghost" onClick={() => onEdit(issue.id)}><EditPenIcon size={12} />Edit</button>
          <button type="button" className="mini-pill ghost" onClick={() => onDelete(issue.id)}><TrashIcon />Delete</button>
        </div>
        {expanded && (
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
            <div className="kv-row"><span className="k">Category</span><span className="v">{issue.category || '—'}</span></div>
            <div className="kv-row"><span className="k">Priority</span><span className="v">{issue.priority || '—'}</span></div>
            <div className="kv-row"><span className="k">Description</span><span className="v">{issue.description || '—'}</span></div>
            <div className="kv-row" style={{ borderBottom: 'none' }}><span className="k">Full Address</span><span className="v">{issue.address || '—'}</span></div>
          </div>
        )}
      </div>
    </article>
  )
}

export default function UserProfile() {
  usePageStyles('app')
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('reports')
  const [reports, setReports] = useState(() => getMyReports())
  const [expandedId, setExpandedId] = useState(null)
  const upvotedIssues = getUpvotedIssues()
  const userData = getUser()
  const displayName = userData.name || 'Nagorik User'

  useEffect(() => {
    document.title = 'Profile — নাগরিক'
    document.documentElement.lang = 'bn'
  }, [])

  const handleView = (id) => setExpandedId((prev) => (prev === id ? null : id))

  const handleEdit = (id) => navigate('/report', { state: { editId: id } })

  const handleDelete = (id) => {
    const report = reports.find((r) => r.id === id)
    if (!window.confirm(`Delete "${report ? report.title : 'this report'}"? This cannot be undone.`)) return
    setReports(deleteReport(id))
    if (expandedId === id) setExpandedId(null)
  }

  const handleEditProfile = () => navigate('/edit_profile')

  const resolvedCount = reports.filter((r) => r.statusLabel === 'Resolved').length

  return (
    <>
      <AppHeader
        logoHref="/"
        navItems={[
          { label: 'HOME', variant: 'inactive', to: '/browse_feed', icon: <HomeGlyph /> },
        ]}
      />

      {/* ================= PROFILE ================= */}
      <div className="profile-wrap">

        <section className="profile-card">
          <div className="profile-head">
            <div className="profile-id">
              <div className="avatar-lg">{displayName.charAt(0).toUpperCase()}</div>
              <div className="profile-id-info">
                <h1>{displayName}</h1>
                <span className="joined-line">
                  <ClockIcon size={13} />
                  Joined Date: 04 Nov, 2024
                </span>
              </div>
            </div>
            <button type="button" className="banner-edit" onClick={handleEditProfile}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></svg>
              EDIT PROFILE
            </button>
          </div>

          <div className="contributions">
            <h2>Contributions</h2>
            <div className="contrib-grid">
              <div className="contrib-card">
                <span className="label">Issues Reported</span>
                <span className="numrow"><EditPenIcon size={17} /><span className="num">{reports.length}</span></span>
              </div>
              <div className="contrib-card">
                <span className="label">Upvotes Given</span>
                <span className="numrow"><VoteUpIcon size={17} /><span className="num">{upvotedIssues.length}</span></span>
              </div>
              <div className="contrib-card">
                <span className="label">Comments made</span>
                <span className="numrow"><CommentIcon size={17} /><span className="num">123</span></span>
              </div>
              <div className="contrib-card">
                <span className="label">Issues resolved</span>
                <span className="numrow"><ShieldIcon size={17} /><span className="num">{resolvedCount}</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TABS ================= */}
        <div className="tabs" style={{ padding: '26px 0 0' }}>
          <button type="button" className={`tab-btn${activeTab === 'reports' ? ' active' : ''}`} onClick={() => setActiveTab('reports')}>My Reports</button>
          <button type="button" className={`tab-btn${activeTab === 'upvoted' ? ' active' : ''}`} onClick={() => setActiveTab('upvoted')}>Upvoted</button>
          <button type="button" className="tab-btn" onClick={() => navigate('/settings')}>Settings</button>
        </div>

        {/* MY REPORTS */}
        <div className={`panel-section${activeTab === 'reports' ? ' active' : ''}`}>
          <div className="section-head-sm"><h2>Reports submitted by you</h2><span>{reports.length} total</span></div>
          <div className="issues-list">
            {reports.length ? (
              reports.map((issue) => (
                <ReportRow
                  key={issue.id}
                  issue={issue}
                  expanded={expandedId === issue.id}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '48px 0', fontSize: '14px' }}>
                You haven't reported any issues yet.
              </p>
            )}
          </div>
        </div>

        {/* UPVOTED */}
        <div className={`panel-section${activeTab === 'upvoted' ? ' active' : ''}`}>
          <div className="section-head-sm"><h2>Issues you upvoted</h2><span>{upvotedIssues.length} total</span></div>
          <div className="issues-list">
            {upvotedIssues.map((issue) => (
              <ReportRow key={issue.id} issue={{ ...issue, statusClass: '', statusLabel: 'Open' }} expanded={false} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
            ))}
          </div>
        </div>

      </div>
    </>
  )
}