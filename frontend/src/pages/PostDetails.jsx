import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import usePageStyles from '../hooks/usePageStyles'
import AppHeader from '../components/AppHeader'
import { getFeedIssues } from '../services/issuesService'
import {
  HomeGlyph,
  SearchIcon,
  PinIcon,
  UserGlyph,
  ClockIcon,
  VoteUpIcon,
  VoteDownIcon,
  CommentIcon,
  RepostIcon,
  ShareNodesIcon,
} from '../components/icons'

// --- small local icons used only on this page (not part of the shared icon set) ---
function ChevronLeftIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronDownIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CloseIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// Keeps the seed data's zero-padded style ("02") once votes are toggled.
function formatDown(value) {
  const n = Number(value)
  return Number.isNaN(n) ? value : String(n).padStart(2, '0')
}

// Seed comment thread — same lorem-ipsum placeholder convention as the rest of the seed data.
const SEED_COMMENTS = [
  {
    id: 'c1',
    author: 'Abrar Patwary',
    time: '8h ago',
    text:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui',
    up: 12,
    down: '02',
    replies: [
      {
        id: 'c1-r1',
        author: 'Abrar Patwary',
        time: '8h ago',
        text:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui',
        up: 12,
        down: '02',
        replies: [],
      },
    ],
  },
]

// Recursively keeps a comment (and its replies) if it or any descendant matches the search query.
function filterComment(comment, q) {
  const hay = `${comment.author} ${comment.text}`.toLowerCase()
  const selfMatch = hay.includes(q)
  const replies = (comment.replies || []).map((r) => filterComment(r, q)).filter(Boolean)
  if (!selfMatch && replies.length === 0) return null
  return { ...comment, replies }
}

function CommentItem({ comment, votes, onVote, depth = 0 }) {
  const myVote = votes[comment.id] || null
  const upCount = Number(comment.up) + (myVote === 'up' ? 1 : 0)
  const downCount = formatDown(Number(comment.down) + (myVote === 'down' ? 1 : 0))

  return (
    <div className="pd-comment">
      <div className="pd-comment-avatar" />
      <div className="pd-comment-body">
        <div className="pd-comment-head">
          <span className="pd-comment-author">{comment.author}</span>
          <span className="pd-comment-dot">•</span>
          <span className="pd-comment-time">{comment.time}</span>
        </div>
        <p className="pd-comment-text">{comment.text}</p>
        <div className="pd-comment-actions">
          <div className="pd-vote-outline">
            <button type="button" className={myVote === 'up' ? 'active' : undefined} onClick={() => onVote(comment.id, 'up')}>
              <VoteUpIcon size={14} />{upCount}
            </button>
            <div className="sep" />
            <button type="button" className={myVote === 'down' ? 'active' : undefined} onClick={() => onVote(comment.id, 'down')}>
              <VoteDownIcon size={14} />{downCount}
            </button>
          </div>
          <button type="button" className="pd-outline-pill"><CommentIcon size={14} />Reply</button>
          <button type="button" className="pd-outline-pill"><ShareNodesIcon size={14} />share</button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="pd-comment-children">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} votes={votes} onVote={onVote} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PostDetails() {
  usePageStyles('app')

  const { id } = useParams()
  const navigate = useNavigate()

  const issue = useMemo(() => {
    const list = getFeedIssues()
    return list.find((i) => String(i.id) === String(id)) || null
  }, [id])

  // Supports a future `images: [...]` array on the issue; falls back to the single feed image.
  const images = useMemo(() => {
    if (!issue) return []
    if (Array.isArray(issue.images) && issue.images.length) return issue.images
    return [issue.img]
  }, [issue])

  const [activeImage, setActiveImage] = useState(0)
  const [myVote, setMyVote] = useState(null)
  const [comments, setComments] = useState(SEED_COMMENTS)
  const [commentVotes, setCommentVotes] = useState({})
  const [sortBy, setSortBy] = useState('best')
  const [commentQuery, setCommentQuery] = useState('')
  const [newComment, setNewComment] = useState('')

  const handlePostVote = (dir) => {
    setMyVote((prev) => (prev === dir ? null : dir))
  }

  const handleCommentVote = (commentId, dir) => {
    setCommentVotes((prev) => ({ ...prev, [commentId]: prev[commentId] === dir ? null : dir }))
  }

  const handleAddComment = () => {
    const text = newComment.trim()
    if (!text) return
    setComments((prev) => [
      { id: `c-${Date.now()}`, author: 'You', time: 'just now', text, up: 0, down: '00', replies: [] },
      ...prev,
    ])
    setNewComment('')
  }

  const visibleComments = useMemo(() => {
    let list = comments
    const q = commentQuery.trim().toLowerCase()
    if (q) list = list.map((c) => filterComment(c, q)).filter(Boolean)
    list = [...list]
    if (sortBy === 'best') list.sort((a, b) => Number(b.up) - Number(a.up))
    if (sortBy === 'newest') list.reverse()
    return list
  }, [comments, commentQuery, sortBy])

  if (!issue) {
    return (
      <>
        <AppHeader
          logoHref="/"
          navItems={[{ label: 'HOME', variant: 'active', icon: <HomeGlyph /> }]}
          showIconButtons
          showLogout
        />
        <div className="post-detail-wrap">
          <Link to="/browse_feed" className="pd-back-link"><ChevronLeftIcon size={16} />Back to feed</Link>
          <p style={{ marginTop: 32, color: 'var(--muted)' }}>This post could not be found.</p>
        </div>
      </>
    )
  }

  const upCount = issue.up + (myVote === 'up' ? 1 : 0)
  const downCount = formatDown(Number(issue.down) + (myVote === 'down' ? 1 : 0))

  return (
    <>
      <AppHeader
        logoHref="/"
        navItems={[{ label: 'HOME', variant: 'active', icon: <HomeGlyph /> }]}
        showIconButtons
        showLogout
      />

      <div className="post-detail-wrap">
        <button type="button" className="pd-back-link" onClick={() => navigate('/browse_feed')}>
          <ChevronLeftIcon size={16} />Back to feed
        </button>

        <div className="pd-gallery">
          <img src={images[activeImage]} alt={issue.alt || issue.title} />
          <button type="button" className="pd-gallery-close" onClick={() => navigate('/browse_feed')} aria-label="Close">
            <CloseIcon size={13} />
          </button>
          {images.length > 1 && (
            <div className="pd-gallery-dots">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={idx === activeImage ? 'active' : undefined}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <h1 className="pd-title">{issue.title}</h1>
        <div className="issue-meta pd-meta">
          <span><PinIcon size={14} />{issue.area}</span>
          <span><UserGlyph size={14} />{issue.reporter}</span>
          <span><ClockIcon size={14} />{issue.time}</span>
        </div>

        <p className="pd-desc">
          {issue.description ||
            'Residents have noticed large trees in the north section cut down without any visible permits. Workers have been operating in the late evening hours, which has raised concerns among nearby households. This needs urgent investigation from the city corporation.'}
        </p>

        <div className="issue-actions pd-actions">
          <div className="vote-group">
            <button type="button" className={myVote === 'up' ? 'active' : undefined} onClick={() => handlePostVote('up')}>
              <VoteUpIcon size={14} />{upCount}
            </button>
            <div className="sep" />
            <button type="button" className={myVote === 'down' ? 'active' : undefined} onClick={() => handlePostVote('down')}>
              <VoteDownIcon size={14} />{downCount}
            </button>
          </div>
          <button type="button" className="pill-action"><CommentIcon size={14} />{issue.comments}</button>
          <button type="button" className="icon-pill"><RepostIcon /></button>
          <button type="button" className="pill-action"><ShareNodesIcon />share</button>
        </div>

        <input
          type="text"
          className="pd-join-input"
          placeholder="Join the conversation"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddComment()
          }}
        />

        <div className="pd-comment-toolbar">
          <label className="pd-sort">
            Sort by:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="best">Best</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDownIcon size={12} />
          </label>
          <div className="pd-comment-search">
            <SearchIcon size={14} />
            <input
              type="text"
              placeholder="Search Comments"
              value={commentQuery}
              onChange={(e) => setCommentQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="pd-comment-thread">
          {visibleComments.length ? (
            visibleComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} votes={commentVotes} onVote={handleCommentVote} />
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 14 }}>
              No comments match your search.
            </p>
          )}
        </div>
      </div>
    </>
  )
}