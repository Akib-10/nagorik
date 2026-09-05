import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getFeedIssues, getMyReports } from '../services/issuesService'
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

function formatDown(value) {
  const n = Number(value)
  return Number.isNaN(n) ? value : String(n).padStart(2, '0')
}

const SEED_COMMENTS = [
  {
    id: 'c1',
    author: 'Abrar Patwary',
    time: '8h ago',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui',
    up: 12,
    down: '02',
    replies: [
      {
        id: 'c1-r1',
        author: 'Abrar Patwary',
        time: '8h ago',
        text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui',
        up: 12,
        down: '02',
        replies: [],
      },
    ],
  },
]

function filterComment(comment, q) {
  const hay = `${comment.author} ${comment.text}`.toLowerCase()
  const selfMatch = hay.includes(q)
  const replies = (comment.replies || []).map((r) => filterComment(r, q)).filter(Boolean)
  if (!selfMatch && replies.length === 0) return null
  return { ...comment, replies }
}

function VoteOutline({ myVote, comment, onVote }) {
  const upCount = Number(comment.up) + (myVote === 'up' ? 1 : 0)
  const downCount = formatDown(Number(comment.down) + (myVote === 'down' ? 1 : 0))

  return (
    <div className="flex overflow-hidden rounded-full border-[1.5px] border-nagorik-light-red">
      <button type="button" className={`flex items-center gap-[5px] border-0 bg-transparent px-[13px] py-[7px] text-[12px] font-bold text-nagorik-red font-[inherit] transition-colors ${myVote === 'up' ? 'bg-nagorik-soft-red' : ''}`} onClick={() => onVote(comment.id, 'up')}>
        <VoteUpIcon size={14} />{upCount}
      </button>
      <div className="h-3.5 w-px bg-nagorik-light-red" />
      <button type="button" className={`flex items-center gap-[5px] border-0 bg-transparent px-[13px] py-[7px] text-[12px] font-bold text-nagorik-red font-[inherit] transition-colors ${myVote === 'down' ? 'bg-nagorik-soft-red' : ''}`} onClick={() => onVote(comment.id, 'down')}>
        <VoteDownIcon size={14} />{downCount}
      </button>
    </div>
  )
}

function CommentItem({ comment, votes, onVote, depth = 0 }) {
  const myVote = votes[comment.id] || null

  return (
    <div className="flex gap-3">
      <div className="h-[38px] w-[38px] shrink-0 rounded-full border-2 border-nagorik-border bg-nagorik-surface-2"></div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[14px] font-extrabold text-nagorik-heading">{comment.author}</span>
          <span className="text-nagorik-muted">•</span>
          <span className="text-[12.5px] text-nagorik-muted">{comment.time}</span>
        </div>
        <p className="mb-2.5 text-[14px] leading-[1.6] text-nagorik-body-text">{comment.text}</p>
        <div className="flex flex-wrap items-center gap-2">
          <VoteOutline myVote={myVote} comment={comment} onVote={onVote} />
          <button type="button" className="flex items-center gap-[5px] rounded-full border-[1.5px] border-nagorik-light-red bg-transparent px-[15px] py-[7px] text-[12px] font-bold text-nagorik-red font-[inherit] cursor-pointer transition-colors hover:bg-nagorik-light-red"><CommentIcon size={14} />Reply</button>
          <button type="button" className="flex items-center gap-[5px] rounded-full border-[1.5px] border-nagorik-light-red bg-transparent px-[15px] py-[7px] text-[12px] font-bold text-nagorik-red font-[inherit] cursor-pointer transition-colors hover:bg-nagorik-light-red"><ShareNodesIcon size={14} />share</button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3.5 flex flex-col gap-[18px] border-l-2 border-nagorik-border pl-5">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} votes={votes} onVote={onVote} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Login() {
  const { id } = useParams()
  const navigate = useNavigate()

  const issue = useMemo(() => {
  // Search both feed issues AND user reports
  const allIssues = [...getFeedIssues(), ...getMyReports()]
  
  // Clean 'comment-' prefix if clicked from a comment highlight
  const cleanId = String(id).replace('comment-', '')
  
  return allIssues.find((i) => String(i.id) === cleanId) || null
}, [id])

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
          navItems={[{ label: 'BROWSE FEED', href: '/browse_feed', icon: <HomeGlyph /> }]}
          showIconButtons
        />
        <div className="mx-auto max-w-[860px] px-7 pt-7 pb-[60px]">
          <Link to="/browse_feed" className="mb-4 inline-flex items-center gap-1.5 bg-transparent p-0 text-[14px] font-bold text-nagorik-red font-[inherit] hover:underline"><ChevronLeftIcon size={16} />Back to feed</Link>
          <p className="mt-8 text-nagorik-muted">This post could not be found.</p>
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
        navItems={[{ label: 'BROWSE FEED', href: '/browse_feed', icon: <HomeGlyph /> }]}
        showIconButtons
      />

      <div className="mx-auto max-w-[860px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
        <button type="button" className="mb-4 inline-flex items-center gap-1.5 bg-transparent p-0 text-[14px] font-bold text-nagorik-red font-[inherit] cursor-pointer hover:underline" onClick={() => navigate('/browse_feed')}>
          <ChevronLeftIcon size={16} />Back to feed
        </button>

        <div className="relative h-[380px] overflow-hidden rounded-[18px] bg-nagorik-surface-2 max-[760px]:h-[240px]">
          <img src={images[activeImage]} alt={issue.alt || issue.title} className="h-full w-full object-cover" />
          <button type="button" className="absolute right-3.5 top-3.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] border-white/85 bg-[rgba(34,22,24,0.55)] text-white cursor-pointer" onClick={() => navigate('/browse_feed')} aria-label="Close">
            <CloseIcon size={13} />
          </button>
          {images.length > 1 && (
            <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`rounded-full border-0 bg-white/55 cursor-pointer p-0 ${idx === activeImage ? 'h-[9px] w-[9px] bg-white' : 'h-2 w-2'}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <h1 className="mb-2.5 mt-[22px] text-[30px] font-extrabold leading-[1.25] text-nagorik-red max-[760px]:text-[22px]">{issue.title}</h1>
        <div className="mb-[18px] flex flex-wrap items-center gap-[22px] text-[13px] text-nagorik-secondary">
          <span className="flex items-center gap-1.5"><PinIcon size={14} />{issue.area}</span>
          <span className="flex items-center gap-1.5"><UserGlyph size={14} />{issue.reporter}</span>
          <span className="flex items-center gap-1.5"><ClockIcon size={14} />{issue.time}</span>
        </div>

        <p className="mb-[22px] text-[15px] leading-[1.7] text-nagorik-body-text">
          {issue.description || 'Residents have noticed large trees in the north section cut down without any visible permits. Workers have been operating in the late evening hours, which has raised concerns among nearby households. This needs urgent investigation from the city corporation.'}
        </p>

        <div className="mb-[22px] flex flex-wrap items-center gap-2.5">
          <div className="flex overflow-hidden rounded-full bg-nagorik-red">
            <button type="button" className={`flex items-center gap-1.5 bg-transparent px-3.5 py-[9px] text-[13px] font-bold text-white font-[inherit] cursor-pointer transition-colors hover:bg-nagorik-hover-red ${myVote === 'up' ? 'bg-nagorik-hover-red' : ''}`} onClick={() => handlePostVote('up')}>
              <VoteUpIcon size={14} />{upCount}
            </button>
            <div className="h-4 w-px bg-white/35"></div>
            <button type="button" className={`flex items-center gap-1.5 bg-transparent px-3.5 py-[9px] text-[13px] font-bold text-white font-[inherit] cursor-pointer transition-colors hover:bg-nagorik-hover-red ${myVote === 'down' ? 'bg-nagorik-hover-red' : ''}`} onClick={() => handlePostVote('down')}>
              <VoteDownIcon size={14} />{downCount}
            </button>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-full bg-nagorik-red px-4 py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-nagorik-hover-red"><CommentIcon size={14} />{issue.comments}</button>
          <button type="button" className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-nagorik-red text-white transition-colors hover:bg-nagorik-hover-red"><RepostIcon /></button>
          <button type="button" className="flex items-center gap-2 rounded-full bg-nagorik-red px-4 py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-nagorik-hover-red"><ShareNodesIcon />share</button>
        </div>

        <input
          type="text"
          className="mb-[18px] w-full rounded-full border-[1.5px] border-nagorik-border bg-nagorik-surface-2 px-5 py-3.5 text-[14px] text-nagorik-muted font-[inherit] outline-none focus:border-nagorik-red focus:bg-white focus:text-nagorik-body-text"
          placeholder="Join the conversation"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddComment()
          }}
        />

        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-1.5 text-[13px] font-bold text-nagorik-secondary">
            Sort by:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="cursor-pointer border-0 bg-transparent text-[13px] font-extrabold text-nagorik-heading font-[inherit] outline-none">
              <option value="best">Best</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDownIcon size={12} />
          </label>
          <div className="flex max-w-[280px] flex-1 items-center gap-2 rounded-full border border-nagorik-border bg-nagorik-surface-2 px-4 py-[9px] text-[13px] text-nagorik-muted max-[760px]:max-w-full">
            <SearchIcon size={14} />
            <input
              type="text"
              placeholder="Search Comments"
              value={commentQuery}
              onChange={(e) => setCommentQuery(e.target.value)}
              className="w-full border-0 bg-transparent text-[13px] text-nagorik-body-text font-[inherit] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-[22px]">
          {visibleComments.length ? (
            visibleComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} votes={commentVotes} onVote={handleCommentVote} />
            ))
          ) : (
            <p className="py-8 text-center text-[14px] text-nagorik-muted">
              No comments match your search.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
