import { useMemo, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getFeedIssues, getMyReports } from '../services/issuesService'
import { HomeGlyph, SearchIcon, PinIcon, UserGlyph, ClockIcon, VoteUpIcon, VoteDownIcon, CommentIcon, RepostIcon } from '../components/icons'

const ChevronLeftIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
const ChevronRightIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
const ChevronDownIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
const formatDown = (v) => (isNaN(Number(v)) ? v : String(Number(v)).padStart(2, '0'))

const SEED_COMMENTS = [{
  id: 'c1', author: 'Abrar Patwary', time: '8h ago',
  text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.',
  up: 12, down: '02', timestamp: Date.now() - 28800000,
  replies: [{ id: 'c1-r1', author: 'Sabbir Hossain', time: '6h ago', text: 'Agreed, this issue needs immediate attention from authorities as soon as possible.', up: 5, down: '00', timestamp: Date.now() - 21600000, replies: [] }],
}]

const filterComment = (c, q) => {
  const selfMatch = `${c.author} ${c.text}`.toLowerCase().includes(q)
  const replies = (c.replies || []).map((r) => filterComment(r, q)).filter(Boolean)
  return selfMatch || replies.length ? { ...c, replies } : null
}

function VoteOutline({ myVote, comment, onVote }) {
  const up = Number(comment.up) + (myVote === 'up' ? 1 : 0)
  const down = formatDown(Number(comment.down) + (myVote === 'down' ? 1 : 0))
  return (
    <div className="flex overflow-hidden rounded-full border-[1.5px] border-nagorik-light-red">
      <button type="button" className={`flex items-center gap-[5px] border-0 bg-transparent px-[13px] py-[7px] text-[12px] font-bold text-nagorik-red cursor-pointer ${myVote === 'up' ? 'bg-nagorik-soft-red' : ''}`} onClick={() => onVote(comment.id, 'up')}><VoteUpIcon size={14} />{up}</button>
      <div className="h-3.5 w-px bg-nagorik-light-red self-center" />
      <button type="button" className={`flex items-center gap-[5px] border-0 bg-transparent px-[13px] py-[7px] text-[12px] font-bold text-nagorik-red cursor-pointer ${myVote === 'down' ? 'bg-nagorik-soft-red' : ''}`} onClick={() => onVote(comment.id, 'down')}><VoteDownIcon size={14} />{down}</button>
    </div>
  )
}

function CommentItem({ comment, votes, onVote, onAddReply, depth = 0 }) {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const isLong = (comment.text || '').length > 160

  const handleReplySubmit = () => {
    if (!replyText.trim()) return
    onAddReply(comment.id, replyText.trim())
    setReplyText(''); setShowReplyBox(false)
  }

  return (
    <div className="flex gap-3">
      <div className="h-[38px] w-[38px] shrink-0 rounded-full border-2 border-nagorik-border bg-nagorik-surface-2" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5 text-[14px] font-extrabold text-nagorik-heading">
          {comment.author} <span className="text-nagorik-muted font-normal">• {comment.time}</span>
        </div>
        <p className="mb-2.5 text-[14px] leading-[1.6] text-nagorik-body-text">
          {isLong && !expanded ? `${comment.text.slice(0, 160)}...` : comment.text}
          {isLong && (
            <button type="button" onClick={() => setExpanded(!expanded)} className="ml-1 text-[13px] font-bold text-nagorik-red cursor-pointer hover:underline">
              {expanded ? 'See Less' : 'See More'}
            </button>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <VoteOutline myVote={votes[comment.id]} comment={comment} onVote={onVote} />
          <button type="button" onClick={() => setShowReplyBox(!showReplyBox)} className="flex items-center gap-[5px] rounded-full border-[1.5px] border-nagorik-light-red px-[15px] py-[7px] text-[12px] font-bold text-nagorik-red hover:bg-nagorik-light-red">
            <CommentIcon size={14} />Reply
          </button>
        </div>
        {showReplyBox && (
          <div className="mt-3 flex gap-2">
            <input type="text" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()} className="flex-1 rounded-full border border-nagorik-border bg-nagorik-surface-2 px-4 py-2 text-[13px] outline-none focus:border-nagorik-red" />
            <button type="button" onClick={handleReplySubmit} className="rounded-full bg-nagorik-red px-4 py-2 text-[12px] font-bold text-white hover:bg-nagorik-hover-red">Send</button>
          </div>
        )}
        {comment.replies?.length > 0 && (
          <div className="mt-3.5 flex flex-col gap-[18px] border-l-2 border-nagorik-border pl-5">
            {comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} votes={votes} onVote={onVote} onAddReply={onAddReply} depth={depth + 1} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PostDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const issue = useMemo(() => {
    const cleanId = String(id).replace('comment-', '')
    return [...getFeedIssues(), ...getMyReports()].find((i) => String(i.id) === cleanId) || null
  }, [id])

  const images = useMemo(() => issue?.images?.length ? issue.images : (issue?.img ? [issue.img] : []), [issue])

  const [isDescExpanded, setIsDescExpanded] = useState(false)
  const [myVote, setMyVote] = useState(null)
  const [isReposted, setIsReposted] = useState(false)
  const [comments, setComments] = useState(SEED_COMMENTS)
  const [commentVotes, setCommentVotes] = useState({})
  const [sortBy, setSortBy] = useState('best')
  const [commentQuery, setCommentQuery] = useState('')
  const [newComment, setNewComment] = useState('')

  const handleScroll = (dir) => scrollRef.current?.scrollBy({ left: dir === 'left' ? -scrollRef.current.clientWidth : scrollRef.current.clientWidth, behavior: 'smooth' })
  const handleCommentVote = (cId, dir) => setCommentVotes((p) => ({ ...p, [cId]: p[cId] === dir ? null : dir }))

  const handleAddComment = () => {
    if (!newComment.trim()) return
    setComments((p) => [{ id: `c-${Date.now()}`, author: 'You', time: 'just now', text: newComment.trim(), up: 0, down: '00', timestamp: Date.now(), replies: [] }, ...p])
    setNewComment('')
  }

  const handleAddReply = (parentId, text) => {
    const addReply = (list) => list.map((item) => item.id === parentId ? { ...item, replies: [...item.replies, { id: `r-${Date.now()}`, author: 'You', time: 'just now', text, up: 0, down: '00', timestamp: Date.now(), replies: [] }] } : { ...item, replies: addReply(item.replies || []) })
    setComments((p) => addReply(p))
  }

  const visibleComments = useMemo(() => {
    let list = commentQuery.trim() ? comments.map((c) => filterComment(c, commentQuery.trim().toLowerCase())).filter(Boolean) : [...comments]
    if (sortBy === 'best') list.sort((a, b) => Number(b.up) - Number(a.up))
    if (sortBy === 'newest') list.sort((a, b) => b.timestamp - a.timestamp)
    if (sortBy === 'oldest') list.sort((a, b) => a.timestamp - b.timestamp)
    return list
  }, [comments, commentQuery, sortBy])

  if (!issue) {
    return (
      <>
        <AppHeader logoHref="/" navItems={[{ label: 'BROWSE FEED', href: '/browse_feed', icon: <HomeGlyph /> }]} showIconButtons />
        <div className="mx-auto max-w-[860px] px-7 pt-7 pb-[60px]">
          <Link to="/browse_feed" className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-nagorik-red hover:underline"><ChevronLeftIcon />Feed</Link>
          <p className="mt-8 text-nagorik-muted">This post could not be found.</p>
        </div>
      </>
    )
  }

  const desc = issue.description || 'Residents have noticed large trees in the north section cut down without any visible permits. Workers have been operating in the late evening hours, which has raised concerns among nearby households. This needs urgent investigation from the city corporation.'
  const isLongDesc = desc.length > 150

  return (
    <>
      <AppHeader logoHref="/" navItems={[{ label: 'BROWSE FEED', href: '/browse_feed', icon: <HomeGlyph /> }]} showIconButtons />
      <div className="mx-auto max-w-[860px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
        <button type="button" className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-nagorik-red hover:underline cursor-pointer" onClick={() => navigate('/browse_feed')}>
          <ChevronLeftIcon />Feed
        </button>

        <div className="relative mb-4 w-full overflow-hidden rounded-[18px] bg-nagorik-surface-2">
          <div ref={scrollRef} className="flex h-[380px] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth max-[760px]:h-[240px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {images.map((imgSrc, idx) => (
              <div key={idx} className="h-full w-full shrink-0 snap-center"><img src={imgSrc} alt="" className="h-full w-full object-cover" /></div>
            ))}
          </div>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => handleScroll('left')} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/70 cursor-pointer"><ChevronLeftIcon size={18} /></button>
              <button type="button" onClick={() => handleScroll('right')} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/70 cursor-pointer"><ChevronRightIcon size={18} /></button>
            </>
          )}
        </div>

        <h1 className="mb-3 pb-2 text-[30px] font-extrabold leading-[1.25] text-nagorik-red max-[760px]:text-[22px]">{issue.title}</h1>
        <div className="mb-[18px] flex flex-wrap items-center gap-[22px] text-[13px] text-nagorik-secondary">
          <span className="flex items-center gap-1.5"><PinIcon size={14} />{issue.area}</span>
          <span className="flex items-center gap-1.5"><UserGlyph size={14} />{issue.reporter}</span>
          <span className="flex items-center gap-1.5"><ClockIcon size={14} />{issue.time}</span>
        </div>

        <p className="mb-6 pb-4 text-[15px] leading-[1.7] text-nagorik-body-text">
          {isLongDesc && !isDescExpanded ? `${desc.slice(0, 150)}...` : desc}{' '}
          {isLongDesc && <button type="button" onClick={() => setIsDescExpanded(!isDescExpanded)} className="ml-1 text-[14px] font-bold text-nagorik-red cursor-pointer hover:underline">{isDescExpanded ? 'See Less' : 'See More'}</button>}
        </p>

        <div className="mb-[22px] flex flex-wrap items-center gap-2.5">
          <div className="flex overflow-hidden rounded-full bg-nagorik-red">
            <button type="button" className={`flex items-center gap-1.5 px-3.5 py-[9px] text-[13px] font-bold text-white cursor-pointer hover:bg-nagorik-hover-red ${myVote === 'up' ? 'bg-nagorik-hover-red' : ''}`} onClick={() => setMyVote(myVote === 'up' ? null : 'up')}><VoteUpIcon size={14} />{issue.up + (myVote === 'up' ? 1 : 0)}</button>
            <div className="h-4 w-px bg-white/35 self-center" />
            <button type="button" className={`flex items-center gap-1.5 px-3.5 py-[9px] text-[13px] font-bold text-white cursor-pointer hover:bg-nagorik-hover-red ${myVote === 'down' ? 'bg-nagorik-hover-red' : ''}`} onClick={() => setMyVote(myVote === 'down' ? null : 'down')}><VoteDownIcon size={14} />{formatDown(Number(issue.down) + (myVote === 'down' ? 1 : 0))}</button>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-full bg-nagorik-red px-4 py-[9px] text-[13px] font-bold text-white"><CommentIcon size={14} />{issue.comments}</button>
          <button type="button" onClick={() => setIsReposted(!isReposted)} className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-white cursor-pointer ${isReposted ? 'bg-green-600' : 'bg-nagorik-red hover:bg-nagorik-hover-red'}`}><RepostIcon /></button>
        </div>

        <input type="text" className="mb-[18px] w-full rounded-full border-[1.5px] border-nagorik-border bg-nagorik-surface-2 px-5 py-3.5 text-[14px] outline-none focus:border-nagorik-red focus:bg-white" placeholder="Join the conversation..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />

        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] font-bold text-nagorik-secondary">
            <span>Sort by:</span>
            <div className="relative inline-flex items-center">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none cursor-pointer rounded-full border border-nagorik-border bg-nagorik-surface-2 py-1.5 pl-3 pr-8 text-[13px] font-extrabold text-nagorik-heading outline-none focus:border-nagorik-red">
                <option value="best">Best</option><option value="newest">Newest</option><option value="oldest">Oldest</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 text-nagorik-heading"><ChevronDownIcon /></div>
            </div>
          </div>
          <div className="flex max-w-[280px] flex-1 items-center gap-2 rounded-full border border-nagorik-border bg-nagorik-surface-2 px-4 py-[9px] text-[13px] max-[760px]:max-w-full">
            <SearchIcon size={14} />
            <input type="text" placeholder="Search Comments" value={commentQuery} onChange={(e) => setCommentQuery(e.target.value)} className="w-full border-0 bg-transparent outline-none" />
          </div>
        </div>

        <div className="flex flex-col gap-[22px]">
          {visibleComments.length ? visibleComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} votes={commentVotes} onVote={handleCommentVote} onAddReply={handleAddReply} />
          )) : <p className="py-8 text-center text-[14px] text-nagorik-muted">No comments match your search.</p>}
        </div>
      </div>
    </>
  )
}