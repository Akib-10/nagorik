import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardIcon, UsersIcon, CommentIcon, CheckIcon } from '../../components/icons'
import { StatCard, StatusBadge, PillButton, EmptyState } from './AdminUI'
import { getOverview, formatTimeAgo } from '../../services/adminServices'

export default function AdminOverview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

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

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-4">
        <StatCard label="Total Issues" value={stats.totalIssues} sub={`${stats.open} open right now`} icon={ClipboardIcon} tone="red" />
        <StatCard label="In Progress" value={stats.inProgress} sub={`${stats.resolved} resolved · ${stats.rejected} rejected`} icon={CheckIcon} tone="gold" />
        <StatCard label="Registered Users" value={stats.totalUsers} sub={`${stats.newUsersThisWeek} new this week`} icon={UsersIcon} tone="green" />
        <StatCard label="Total Comments" value={stats.totalComments} sub={`${stats.totalUpvotes} total upvotes`} icon={CommentIcon} tone="muted" />
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
          <h2 className="m-0 mb-4 text-[15px] font-extrabold text-nagorik-heading">Recent Activity</h2>
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
        <h2 className="m-0 mb-4 text-[15px] font-extrabold text-nagorik-heading">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/issues">
            <PillButton variant="solid">Review open issues</PillButton>
          </Link>
          <Link to="/admin/users">
            <PillButton variant="outline">Manage users</PillButton>
          </Link>
          <Link to="/admin/categories">
            <PillButton variant="outline">Edit categories</PillButton>
          </Link>
          <Link to="/admin/analytics">
            <PillButton variant="ghost">View analytics</PillButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
