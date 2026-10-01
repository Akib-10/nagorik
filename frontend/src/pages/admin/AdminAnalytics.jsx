import { initialIssues, initialCategories } from '../../services/adminMockData'

function groupBy(list, key) {
  return list.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1
    return acc
  }, {})
}

function BarRow({ label, value, max, color }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="w-[150px] shrink-0 truncate text-[12.5px] font-semibold text-nagorik-secondary">
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-nagorik-surface-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 shrink-0 text-right text-[12.5px] font-bold text-nagorik-heading">
        {value}
      </span>
    </div>
  )
}

export default function AdminAnalytics() {
  const byStatus = groupBy(initialIssues, 'statusLabel')
  const byArea = groupBy(initialIssues, 'area')
  const maxStatus = Math.max(...Object.values(byStatus), 1)
  const maxCategory = Math.max(...initialCategories.map((c) => c.issueCount), 1)
  const maxArea = Math.max(...Object.values(byArea), 1)

  const totalVotes = initialIssues.reduce((sum, i) => sum + i.up, 0)
  const avgComments = Math.round(
    initialIssues.reduce((sum, i) => sum + i.comments, 0) / initialIssues.length,
  )

  const statusColors = {
    Open: '#C8102E',
    'In progress': '#E8A33D',
    Resolved: '#2E8B57',
    Rejected: '#9C8D8A',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-3">
        <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
          <p className="m-0 text-[12px] font-semibold uppercase tracking-wide text-nagorik-muted">
            Total Upvotes
          </p>
          <p className="m-0 mt-2 text-[26px] font-extrabold text-nagorik-heading">{totalVotes}</p>
        </div>
        <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
          <p className="m-0 text-[12px] font-semibold uppercase tracking-wide text-nagorik-muted">
            Avg. Comments / Issue
          </p>
          <p className="m-0 mt-2 text-[26px] font-extrabold text-nagorik-heading">{avgComments}</p>
        </div>
        <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
          <p className="m-0 text-[12px] font-semibold uppercase tracking-wide text-nagorik-muted">
            Resolution Rate
          </p>
          <p className="m-0 mt-2 text-[26px] font-extrabold text-nagorik-heading">
            {Math.round(((byStatus.Resolved || 0) / initialIssues.length) * 100)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-2">
        <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
          <h2 className="m-0 mb-4 text-[15px] font-extrabold text-nagorik-heading">Issues by Status</h2>
          <div className="flex flex-col gap-3.5">
            {Object.entries(byStatus).map(([status, count]) => (
              <BarRow key={status} label={status} value={count} max={maxStatus} color={statusColors[status] || '#9C8D8A'} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
          <h2 className="m-0 mb-4 text-[15px] font-extrabold text-nagorik-heading">Issues by Category</h2>
          <div className="flex flex-col gap-3.5">
            {initialCategories.map((cat) => (
              <BarRow key={cat.id} label={cat.name} value={cat.issueCount} max={maxCategory} color={cat.color} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
        <h2 className="m-0 mb-4 text-[15px] font-extrabold text-nagorik-heading">Top Reporting Areas</h2>
        <div className="flex flex-col gap-3.5">
          {Object.entries(byArea)
            .sort((a, b) => b[1] - a[1])
            .map(([area, count]) => (
              <BarRow key={area} label={area} value={count} max={maxArea} color="#C8102E" />
            ))}
        </div>
      </div>
    </div>
  )
}
