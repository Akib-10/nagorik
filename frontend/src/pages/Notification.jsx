import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { HomeGlyph, VoteUpIcon, CommentIcon, PinIcon, CheckIcon } from '../components/icons'

const INITIAL_NOTIFS = [
  { id: 'n1', type: 'status', title: 'Report Status Updated', message: 'Your report "Uncollected waste near Mirpur 10" has been marked as In Progress by the City Corporation.', time: '10m ago', read: false, targetUrl: '/post/1' },
  { id: 'n2', type: 'upvote', title: 'Upvote Goal Reached', message: 'Abrar Patwary and 14 others upvoted your issue report on broken streetlights.', time: '2h ago', read: false, targetUrl: '/post/2' },
  { id: 'n3', type: 'comment', title: 'New Comment', message: 'Sabbir Hossain commented on your post: "This needs immediate attention from authorities."', time: '5h ago', read: true, targetUrl: '/post/1' },
  { id: 'n4', type: 'system', title: 'Community Announcement', message: 'Scheduled maintenance for Nagorik civic portal tonight from 2 AM to 4 AM.', time: '1d ago', read: true, targetUrl: null },
]

const ICONS = {
  upvote: <VoteUpIcon size={16} />,
  comment: <CommentIcon size={16} />,
  status: <PinIcon size={16} />,
  default: <CheckIcon size={16} />,
}

export default function Notification() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS)
  const [filter, setFilter] = useState('all')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [showClearModal, setShowClearModal] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const toggleRead = (id, e) => {
    e?.stopPropagation()
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)))
    setOpenMenuId(null)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setConfirmDeleteId(null)
    setOpenMenuId(null)
  }

  const handleItemClick = (item) => {
    if (!item.read) toggleRead(item.id)
    if (item.targetUrl) navigate(item.targetUrl)
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'status') return n.type === 'status'
    if (filter === 'activity') return n.type === 'upvote' || n.type === 'comment'
    return true
  })

  return (
    <>
      <AppHeader logoHref="/" navItems={[{ label: 'BROWSE FEED', href: '/browse_feed', icon: <HomeGlyph /> }]} showIconButtons />

      <main className="mx-auto max-w-[860px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
        {/* HEADER BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-nagorik-border pb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-extrabold text-nagorik-heading max-[760px]:text-[22px]">Notifications</h1>
            {unreadCount > 0 && <span className="rounded-full bg-[#C8102E] px-2.5 py-0.5 text-[12px] font-bold text-white">{unreadCount} New</span>}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))} disabled={!unreadCount} className="rounded-full border border-nagorik-border bg-nagorik-surface-2 px-3.5 py-1.5 text-[12px] font-bold text-nagorik-secondary transition-colors hover:bg-nagorik-border disabled:opacity-50 cursor-pointer">
              Mark all as read
            </button>
            <button type="button" onClick={() => setShowClearModal(true)} disabled={!notifications.length} className="rounded-full border border-[#C8102E]/30 bg-[#C8102E]/10 px-3.5 py-1.5 text-[12px] font-bold text-[#C8102E] transition-colors hover:bg-[#C8102E] hover:text-white disabled:opacity-50 cursor-pointer">
              Clear all
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[{ key: 'all', label: 'All' }, { key: 'unread', label: `Unread (${unreadCount})` }, { key: 'status', label: 'Updates' }, { key: 'activity', label: 'Activity' }].map((tab) => (
            <button key={tab.key} type="button" onClick={() => setFilter(tab.key)} className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors cursor-pointer ${filter === tab.key ? 'bg-nagorik-red text-white' : 'bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-border'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* NOTIFICATION CARDS */}
        <div className="flex flex-col gap-3">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div key={item.id} onClick={() => handleItemClick(item)} className={`group relative flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${item.read ? 'border-nagorik-border bg-nagorik-surface-2/60' : 'border-nagorik-red/30 bg-nagorik-soft-red/30 dark:bg-nagorik-soft-red/10'}`}>
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.type === 'status' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : item.type === 'upvote' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-nagorik-soft-red text-nagorik-red'}`}>
                    {ICONS[item.type] || ICONS.default}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-bold text-nagorik-heading">{item.title}</h2>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-[#C8102E]" />}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-[1.5] text-nagorik-body-text">{item.message}</p>
                    <span className="mt-1.5 block text-[12px] font-medium text-nagorik-muted">{item.time}</span>
                  </div>
                </div>

                {/* OPTIONS DROPDOWN */}
                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button type="button" title="More options" onClick={() => { setOpenMenuId(openMenuId === item.id ? null : item.id); setConfirmDeleteId(null) }} className="flex h-8 w-8 items-center justify-center rounded-full text-nagorik-muted transition-colors hover:bg-nagorik-border hover:text-nagorik-heading cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                  </button>

                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-nagorik-border bg-white p-1.5 shadow-lg dark:bg-nagorik-surface-2">
                      <button type="button" onClick={(e) => toggleRead(item.id, e)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-nagorik-heading hover:bg-nagorik-surface-2 dark:hover:bg-nagorik-border cursor-pointer">
                        <span>{item.read ? 'Mark as unread' : 'Mark as read'}</span>
                      </button>
                      {confirmDeleteId === item.id ? (
                        <div className="mt-1 border-t border-nagorik-border pt-1.5">
                          <p className="px-3 py-1 text-[11px] font-bold text-[#C8102E]">Confirm deletion?</p>
                          <div className="flex gap-1 px-1">
                            <button type="button" onClick={(e) => handleDelete(item.id, e)} className="flex-1 rounded-md bg-[#C8102E] py-1 text-center text-[12px] font-bold text-white hover:bg-red-700 cursor-pointer">Delete</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-md bg-nagorik-border py-1 text-center text-[12px] font-bold text-nagorik-heading cursor-pointer">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmDeleteId(item.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[#C8102E] hover:bg-[#C8102E]/10 cursor-pointer">
                          <span>Delete notification</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-nagorik-border bg-nagorik-surface-2/40 py-12 text-center">
              <p className="text-[14px] font-semibold text-nagorik-muted">No notifications found in this view.</p>
            </div>
          )}
        </div>
      </main>

      {/* CONFIRM CLEAR MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-nagorik-border bg-white p-6 shadow-xl dark:bg-[rgba(22,16,16,0.95)]">
            <h3 className="text-[18px] font-extrabold text-nagorik-heading">Clear all notifications?</h3>
            <p className="mt-2 text-[13px] text-nagorik-body-text">This action cannot be undone. All current notifications will be permanently deleted.</p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button type="button" onClick={() => setShowClearModal(false)} className="rounded-full border border-nagorik-border px-4 py-2 text-[13px] font-bold text-nagorik-secondary hover:bg-nagorik-surface-2 cursor-pointer">Cancel</button>
              <button type="button" onClick={() => { setNotifications([]); setShowClearModal(false) }} className="rounded-full bg-[#C8102E] px-4 py-2 text-[13px] font-bold text-white hover:bg-red-700 cursor-pointer">Yes, Clear All</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}