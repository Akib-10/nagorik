import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { VoteUpIcon, CommentIcon, PinIcon } from '../../components/icons'
import { EmptyState } from './AdminUI'
import { getAnalytics } from '../../services/adminServices'

const STATUS_COLORS = {
  Open: '#C8102E',
  'In progress': '#E8A33D',
  Resolved: '#2E8B57',
  Rejected: '#9C8D8A',
}
const CATEGORY_COLORS = ['#C8102E', '#E8A33D', '#2E8B57', '#8C0B22', '#6B5D5A', '#3A7CA5', '#9C8D8A']

// Heatmap cell colours, quietest to busiest.
const HEAT_EMPTY = 'var(--color-nagorik-surface-2)'
const HEAT_LEVELS = ['#F3B7BF', '#E8707F', '#C8102E', '#8C0B22']

const AXIS_TICK = { fill: 'var(--color-nagorik-muted)', fontSize: 11 }
const GRID_STROKE = 'var(--color-nagorik-line)'
const TOOLTIP_STYLE = {
  background: 'var(--color-nagorik-paper)',
  border: '1px solid var(--color-nagorik-line)',
  borderRadius: 10,
  fontSize: 12,
  padding: '6px 10px',
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
}
const TOOLTIP_LABEL = { color: 'var(--color-nagorik-heading)', fontWeight: 700, marginBottom: 2 }
const CURSOR = { fill: 'var(--color-nagorik-surface-2)', opacity: 0.6 }

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

const longDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

const monthName = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })

const trim = (s, n = 16) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s)

// ---- Layout bits ------------------------------------------------------------

function Card({ title, sub, right, children, className = '' }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-nagorik-line bg-nagorik-paper p-4 ${className}`}>
      {(title || right) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="m-0 text-[14px] font-extrabold leading-tight text-nagorik-heading">{title}</h2>
            {sub && <p className="m-0 mt-0.5 text-[11px] text-nagorik-muted">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

function Legend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-nagorik-secondary">
      {items.map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}

// ---- KPI tiles --------------------------------------------------------------

function KpiTile({ label, value, unit, sub, icon: Icon, ring }) {
  return (
    <section className="flex min-w-0 items-center gap-3 rounded-2xl border border-nagorik-line bg-nagorik-paper px-4 py-3">
      {ring !== undefined ? (
        <div className="relative h-11 w-11 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={[{ v: ring }]}
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              barSize={6}
            >
              <RadialBar dataKey="v" cornerRadius={6} background={{ fill: 'var(--color-nagorik-surface-2)' }} fill="#C8102E" isAnimationActive={false} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-nagorik-soft-red text-nagorik-red">
          {Icon && <Icon size={18} />}
        </span>
      )}
      <div className="min-w-0">
        <p className="m-0 truncate text-[11px] font-semibold uppercase tracking-wide text-nagorik-muted">{label}</p>
        <p className="m-0 text-[24px] font-extrabold leading-tight text-nagorik-heading">
          {value}
          {unit && <span className="ml-0.5 text-[14px] font-semibold text-nagorik-muted">{unit}</span>}
        </p>
        {sub && <p className="m-0 truncate text-[11px] text-nagorik-muted">{sub}</p>}
      </div>
    </section>
  )
}

// ---- Charts -----------------------------------------------------------------

function ActivityChart({ weekly }) {
  const data = weekly.map((w) => ({ ...w, label: shortDate(w.weekStart) }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="gReports" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8102E" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#C8102E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gComments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9C8D8A" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#9C8D8A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 4" vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL} cursor={{ stroke: GRID_STROKE }} />
        <Area type="monotone" dataKey="comments" name="Comments" stroke="#9C8D8A" strokeWidth={2} fill="url(#gComments)" dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="reports" name="Reports" stroke="#C8102E" strokeWidth={2.5} fill="url(#gReports)" dot={false} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function StatusDonut({ byStatus, total }) {
  const data = byStatus.filter((s) => s.count > 0)
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[130px] w-[130px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ name: 'none', count: 1 }]}
              dataKey="count"
              nameKey="name"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              cornerRadius={3}
            >
              {data.length ? (
                data.map((s) => <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#9C8D8A'} />)
              ) : (
                <Cell fill="var(--color-nagorik-surface-2)" />
              )}
            </Pie>
            {data.length > 0 && <Tooltip contentStyle={TOOLTIP_STYLE} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-extrabold leading-none text-nagorik-heading">{total}</span>
          <span className="text-[10px] text-nagorik-muted">issues</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {byStatus.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-2 text-[12px]">
            <span className="inline-flex min-w-0 items-center gap-1.5 text-nagorik-secondary">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] || '#9C8D8A' }} />
              <span className="truncate">{s.name}</span>
            </span>
            <span className="font-bold text-nagorik-heading">
              {s.count}
              <span className="ml-1 text-[10.5px] font-medium text-nagorik-muted">
                {total ? Math.round((s.count / total) * 100) : 0}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HBarChart({ data, colors, valueName }) {
  const height = Math.max(120, data.length * 28 + 10)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={6}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={92}
          tickLine={false}
          axisLine={false}
          tick={{ ...AXIS_TICK, fill: 'var(--color-nagorik-secondary)', fontSize: 11.5 }}
          tickFormatter={(v) => trim(v, 14)}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL} cursor={CURSOR} />
        <Bar
          dataKey="count"
          name={valueName}
          radius={[0, 6, 6, 0]}
          barSize={14}
          label={{ position: 'right', fontSize: 11, fontWeight: 700, fill: 'var(--color-nagorik-heading)' }}
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Recharts has no heatmap, so this one stays a small CSS grid.
function Hotspot({ heatmap }) {
  const max = Math.max(0, ...heatmap.map((d) => d.count))
  const level = (n) => Math.min(HEAT_LEVELS.length - 1, Math.ceil((n / max) * HEAT_LEVELS.length) - 1)
  const lead = new Date(`${heatmap[0].date}T00:00:00Z`).getUTCDay()
  const cells = [...Array(lead).fill(null), ...heatmap]
  const cols = Math.ceil(cells.length / 7)
  const busiest = heatmap.reduce((a, b) => (b.count > a.count ? b : a), heatmap[0])
  const total = heatmap.reduce((sum, d) => sum + d.count, 0)

  // Month / year labels above the grid: one label on the first column of each
  // new month. The year is added on the very first label and on every January,
  // so the date range is never ambiguous.
  const monthLabels = []
  let prevMonth = ''
  for (let c = 0; c < cols; c++) {
    const first = cells.slice(c * 7, c * 7 + 7).find(Boolean)
    if (!first) continue
    const month = first.date.slice(0, 7)
    if (month !== prevMonth) {
      monthLabels.push({ col: c, date: first.date, withYear: prevMonth === '' || first.date.slice(5, 7) === '01' })
      prevMonth = month
    }
  }
  // A month that only just started at the left edge would collide with the
  // next label, so drop it when the next label is less than 3 columns away.
  if (monthLabels.length > 1 && monthLabels[1].col - monthLabels[0].col < 3) monthLabels.shift()
  const rangeText = `${longDate(heatmap[0].date)} – ${longDate(heatmap[heatmap.length - 1].date)}`

  return (
    <Card
      title="Date-wise hotspot"
      sub={`Reports per day · ${rangeText}`}
      right={
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-nagorik-soft-red text-nagorik-red">
          <PinIcon size={14} />
        </span>
      }
    >
      <div
        className="mb-1 grid h-3.5 gap-[3px] text-[10px] font-semibold leading-none text-nagorik-muted"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {monthLabels.map((m) => (
          <span key={m.date} className="whitespace-nowrap" style={{ gridColumn: m.col + 1, gridRow: 1 }}>
            {monthName(m.date)}
            {m.withYear ? ` ${m.date.slice(0, 4)}` : ''}
          </span>
        ))}
      </div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, auto)', gridAutoFlow: 'column' }}
      >
        {cells.map((d, i) =>
          d ? (
            <div
              key={d.date}
              title={`${longDate(d.date)}: ${d.count} report${d.count === 1 ? '' : 's'}`}
              className="aspect-square rounded-[3px]"
              style={{ backgroundColor: d.count === 0 ? HEAT_EMPTY : HEAT_LEVELS[level(d.count)] }}
            />
          ) : (
            <div key={`blank-${i}`} className="aspect-square" />
          ),
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-nagorik-muted">
        <span>{total === 0 ? 'No reports yet.' : `${total} reports · busiest ${shortDate(busiest.date)} (${busiest.count})`}</span>
        <span className="inline-flex items-center gap-1">
          Less
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: HEAT_EMPTY }} />
          {HEAT_LEVELS.map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: c }} />
          ))}
          More
        </span>
      </div>
    </Card>
  )
}

function TopPosts({ posts, onOpen }) {
  return (
    <ol className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 min-[900px]:grid-cols-2">
      {posts.map((p, i) => (
        <li key={p.id} className="border-b border-nagorik-line last:border-b-0 min-[900px]:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
          <button
            type="button"
            onClick={() => onOpen(p.id)}
            className="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent py-2 text-left font-[inherit]"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                i === 0 ? 'bg-nagorik-red text-white' : 'bg-nagorik-surface-2 text-nagorik-secondary'
              }`}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-semibold text-nagorik-heading">{p.title}</span>
              <span className="block truncate text-[11px] text-nagorik-muted">
                {[p.area, p.category].filter(Boolean).join(' · ')}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2.5 text-[11.5px] font-bold text-nagorik-heading">
              <span className="inline-flex items-center gap-1">
                <VoteUpIcon size={11} />
                {p.up}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-nagorik-muted">
                <CommentIcon size={11} />
                {p.comments}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

// ---- Page -------------------------------------------------------------------

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getAnalytics()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message || 'Request failed'))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <EmptyState text={`Couldn't load analytics: ${error}`} />
  if (!data) return <EmptyState text="Loading analytics…" />

  const { totals, byStatus, byCategory, heatmap, weekly, topPosts, topAreas } = data
  const thisWeek = weekly[weekly.length - 1]
  const lastWeek = weekly[weekly.length - 2] || { reports: 0, comments: 0 }
  const resolution = Math.round(totals.resolutionRate)
  const areaData = topAreas.map((a) => ({ ...a }))

  return (
    <div className="flex flex-col gap-3">
      {/* headline numbers */}
      <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 min-[1100px]:grid-cols-4">
        <KpiTile label="Published issues" value={totals.issues.toLocaleString()} icon={PinIcon} sub={`${totals.resolved} resolved`} />
        <KpiTile label="Total upvotes" value={totals.upvotes.toLocaleString()} icon={VoteUpIcon} sub={`across ${totals.issues} issue${totals.issues === 1 ? '' : 's'}`} />
        <KpiTile label="Avg. comments / issue" value={totals.avgCommentsPerIssue.toFixed(1)} icon={CommentIcon} sub={`${totals.comments.toLocaleString()} comments total`} />
        <KpiTile label="Resolution rate" value={resolution} unit="%" ring={resolution} sub={`${totals.resolved} of ${totals.issues} resolved`} />
      </div>

      {/* trend + status */}
      <div className="grid grid-cols-1 gap-3 min-[1000px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title="Activity"
          sub="Reports and comments per week · last 12 weeks"
          right={
            <div className="hidden shrink-0 flex-col items-end gap-1 min-[520px]:flex">
              <Legend items={[['Reports', '#C8102E'], ['Comments', '#9C8D8A']]} />
              <span className="text-[11px] text-nagorik-muted">
                This week <strong className="text-nagorik-heading">{thisWeek.reports}</strong> reports · last week{' '}
                <strong className="text-nagorik-secondary">{lastWeek.reports}</strong>
              </span>
            </div>
          }
        >
          <ActivityChart weekly={weekly} />
        </Card>

        <Card title="Issues by status">
          <StatusDonut byStatus={byStatus} total={totals.issues} />
        </Card>
      </div>

      {/* category + areas + hotspot */}
      <div className="grid grid-cols-1 gap-3 min-[700px]:grid-cols-2 min-[1200px]:grid-cols-3">
        <Card title="Issues by category">
          {byCategory.length === 0 ? <EmptyState text="No issues yet." /> : <HBarChart data={byCategory} colors={CATEGORY_COLORS} valueName="Issues" />}
        </Card>
        <Card title="Top reporting areas" sub="By thana · where most issues are reported">
          {areaData.length === 0 ? <EmptyState text="No reported locations yet." /> : <HBarChart data={areaData} colors={['#C8102E']} valueName="Issues" />}
        </Card>
        <div className="min-[700px]:col-span-2 min-[1200px]:col-span-1">
          <Hotspot heatmap={heatmap} />
        </div>
      </div>

      {/* top posts */}
      <Card title="Top posts" sub="Most upvoted published issues">
        {topPosts.length === 0 ? <EmptyState text="No posts yet." /> : <TopPosts posts={topPosts} onOpen={(id) => navigate(`/post/${id}`)} />}
      </Card>
    </div>
  )
}