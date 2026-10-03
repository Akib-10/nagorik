import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardIcon, UsersIcon, CommentIcon, CheckIcon, AlertIcon, XIcon } from '../../components/icons'
import { StatCard, StatusBadge, PillButton, EmptyState } from './AdminUI'
import { getOverview, moderateIssue, formatTimeAgo } from '../../services/adminServices'

// The three decisions available on a report that is waiting for review.
// "Remove" rejects it: it stays hidden from the public feed and the reporter is told.
const QUEUE_ACTIONS = [
  {
    action: 'approve',
    label: 'Add',
    title: 'Approve and add to the public feed',
    Icon: CheckIcon,
    cls: 'border-nagorik-green/40 text-nagorik-green hover:bg-nagorik-green/10',
    done: 'Report approved — it is now visible in the feed',
  },
  {
    action: 'spam',
    label: 'Flag',
    title: 'Flag as spam and keep it hidden',
    Icon: AlertIcon,
    cls: 'border-nagorik-gold/50 text-nagorik-gold hover:bg-nagorik-gold/10',
    done: 'Report flagged and hidden from the feed',
  },
  {
    action: 'reject',
    label: 'Remove',
    title: 'Remove from the queue (hidden from the feed)',
    Icon: XIcon,
    cls: 'border-nagorik-red/40 text-nagorik-red hover:bg-nagorik-red/10',
    done: 'Report removed and hidden from the feed',
  },
]

export default function AdminOverview() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // Decide on a queued report, then re-sync from the server so the queue, the
  // counts and Recent Issues all reflect the change.
  const decide = async (issue, a) => {
    setBusyId(issue.id)
    try {
      await moderateIssue(issue.id, a.action)
      flash(a.done)
      setData(await getOverview())
    } catch (e) {
      flash(e.message || 'Could not update this report')
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    getOverview()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <EmptyState text={`Couldn't load the overview: ${error}`} />
  if (!data) return <EmptyState text="Loading overview…" />

  const { stats, recentIssues, activity } = data
  const pendingIssues = data.pendingIssues || []
  const pendingCount = stats.pending || 0

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-nagorik-heading px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-4">
        <StatCard label="Total Issues" value={stats.totalIssues} sub={`${stats.open} open right now`} icon={ClipboardIcon} tone="red" />
        <StatCard label="In Progress" value={stats.inProgress} sub={`${stats.resolved} resolved · ${stats.rejected} rejected`} icon={CheckIcon} tone="gold" />
        <StatCard label="Registered Users" value={stats.totalUsers} sub={`${stats.newUsersThisWeek} new this week`} icon={UsersIcon} tone="green" />
        <StatCard label="Total Comments" value={stats.totalComments} sub={`${stats.totalUpvotes} total upvotes`} icon={CommentIcon} tone="muted" />
      </div>

      {/* Awaiting review: new reports land here first, above Recent Issues. */}
      <div className="rounded-2xl border border-nagorik-red/30 bg-nagorik-paper p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 flex items-center gap-2 text-[15px] font-extrabold text-nagorik-heading">
            Awaiting Review
            {pendingCount > 0 && (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-nagorik-red px-2 py-0.5 text-[11px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </h2>
          <Link to="/admin/issues?tab=Pending">
            <PillButton variant="ghost">Show all</PillButton>
          </Link>
        </div>
        {pendingIssues.length === 0 ? (
          <EmptyState text="Nothing waiting for review — you are all caught up." />
        ) : (
          <div className="flex flex-col gap-2">
            {pendingIssues.map((issue) => {
              const busy = busyId === issue.id
              return (
                <div
                  key={issue.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-nagorik-red/10 px-3.5 py-3 shadow-[inset_4px_0_0_0_var(--color-nagorik-red)]"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/post/${issue.id}`)}
                    className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit]"
                  >
                    <p className="m-0 truncate text-[13.5px] font-semibold text-nagorik-heading">
                      {issue.title}
                    </p>
                    <p className="m-0 mt-0.5 truncate text-[11.5px] text-nagorik-muted">
                      {[issue.area, issue.category, issue.reporter, formatTimeAgo(issue.createdAt)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {QUEUE_ACTIONS.map((a) => (
                      <button
                        key={a.action}
                        type="button"
                        disabled={busy}
                        onClick={() => decide(issue, a)}
                        title={a.title}
                        aria-label={a.title}
                        className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border bg-nagorik-paper px-3 text-[12px] font-bold transition-colors duration-150 disabled:cursor-default disabled:opacity-50 ${a.cls}`}
                      >
                        <a.Icon size={12} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 min-[1100px]:grid-cols-[1.6fr_1fr]">
        {/* Recent issues */}
        <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-extrabold text-nagorik-heading">Recent Issues</h2>
            <Link to="/admin/issues">
              <PillButton variant="ghost">View all</PillButton>
            </Link>
          </div>
          {recentIssues.length === 0 ? (
            <EmptyState text="No issues reported yet." />
          ) : (
            <div className="flex flex-col divide-y divide-nagorik-line">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[13.5px] font-semibold text-nagorik-heading">
                      {issue.title}
                    </p>
                    <p className="m-0 mt-0.5 text-[11.5px] text-nagorik-muted">
                      {[issue.area, issue.reporter].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <StatusBadge status={issue.statusLabel} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
          <div className="mb-4">
            <h2 className="m-0 text-[15px] font-extrabold text-nagorik-heading">Recent Activity</h2>
          </div>
          {activity.length === 0 ? (
            <EmptyState text="No activity yet." />
          ) : (
            <div className="flex flex-col gap-4">
              {activity.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-nagorik-red" />
                  <div className="min-w-0">
                    <p className="m-0 break-words text-[13px] text-nagorik-body-text">{entry.text}</p>
                    <p className="m-0 mt-0.5 text-[11px] text-nagorik-muted">{formatTimeAgo(entry.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
        <div className="mb-4">
          <h2 className="m-0 text-[15px] font-extrabold text-nagorik-heading">Quick Actions</h2>
        </div>
        {/* Equal-width cells: every button is the same size and lines up on
            one row (4 across) or a tidy 2x2 / stacked grid on small screens. */}
        <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 min-[1100px]:grid-cols-4">
          <Link to="/admin/issues" className="block">
            <PillButton variant="solid" className="w-full">Review open issues</PillButton>
          </Link>
          <Link to="/admin/users" className="block">
            <PillButton variant="outline" className="w-full">Manage users</PillButton>
          </Link>
          <Link to="/admin/categories" className="block">
            <PillButton variant="outline" className="w-full">Edit categories</PillButton>
          </Link>
          <Link to="/admin/analytics" className="block">
            <PillButton variant="ghost" className="w-full">View analytics</PillButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
