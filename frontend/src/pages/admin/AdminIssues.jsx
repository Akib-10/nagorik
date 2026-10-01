import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, TrashIcon, ChevronDownIcon, CheckIcon, AlertIcon, XIcon } from '../../components/icons'
import { SearchInput, PriorityDot, PillButton, Modal, EmptyState } from './AdminUI'
import AdminPagination from './AdminPagination'
import {
  getAdminIssues,
  updateIssueStatus,
  moderateIssue,
  deleteIssueAsAdmin,
  STATUS_OPTIONS,
  MODERATION_TABS,
} from '../../services/adminServices'

const TABS = ['All', ...MODERATION_TABS]
const PAGE_SIZE = 15

// The three moderation decisions an admin can make on a post.
const DECISIONS = [
  {
    action: 'approve',
    value: 'approved',
    label: 'Approve',
    Icon: CheckIcon,
    active: 'bg-nagorik-green text-white border-nagorik-green',
    idle: 'text-nagorik-green border-nagorik-green/40 hover:bg-nagorik-green/10',
  },
  {
    action: 'spam',
    value: 'spam',
    label: 'Spam',
    Icon: AlertIcon,
    active: 'bg-nagorik-gold text-white border-nagorik-gold',
    idle: 'text-nagorik-gold border-nagorik-gold/40 hover:bg-nagorik-gold/10',
  },
  {
    action: 'reject',
    value: 'rejected',
    label: 'Reject',
    Icon: XIcon,
    active: 'bg-nagorik-red text-white border-nagorik-red',
    idle: 'text-nagorik-red border-nagorik-red/40 hover:bg-nagorik-red/10',
  },
]

const MODERATION_BADGE = {
  pending: { label: 'Pending review', cls: 'bg-nagorik-gold/15 text-nagorik-gold' },
  spam: { label: 'Spam', cls: 'bg-nagorik-gold/15 text-nagorik-gold' },
  rejected: { label: 'Rejected', cls: 'bg-nagorik-soft-red text-nagorik-red' },
}

const SUGGESTION_LIMIT = 5

// Dropdown matches: what the admin has typed must be the START of the title (best),
// or the start of a word in the title / area / reporter.
function rankSuggestions(items, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const startsWord = (text) => ` ${String(text || '').toLowerCase()}`.includes(` ${q}`)
  return items
    .map((issue) => {
      const title = String(issue.title || '').toLowerCase()
      let score = -1
      if (title.startsWith(q)) score = 0
      else if (startsWord(issue.title)) score = 1
      else if (startsWord(issue.area) || startsWord(issue.reporter)) score = 2
      return { issue, score }
    })
    .filter((m) => m.score >= 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, SUGGESTION_LIMIT)
    .map(({ issue }) => ({
      id: issue.id,
      label: issue.title,
      sub: [issue.area, issue.reporter].filter(Boolean).join(' · '),
    }))
}

const FLASH = {
  approve: 'Post approved — it is now visible in the feed',
  spam: 'Post flagged as spam and hidden from the feed',
  reject: 'Post rejected and hidden from the feed',
}

export default function AdminIssues() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Pending')
  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('') // debounced copy of queryInput
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0) // bump to force a refetch after a mutation
  const [result, setResult] = useState(null) // { key, data } | { key, error }
  const [deleting, setDeleting] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState('')
  const [pool, setPool] = useState({ q: '', items: [] }) // candidates for the search dropdown

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(queryInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [queryInput])

  // Dropdown candidates: fetch every issue matching what is typed (across all tabs),
  // then rank them client-side so "a" and "ae" narrow instantly between requests.
  useEffect(() => {
    const q = queryInput.trim()
    if (!q) return
    let cancelled = false
    const t = setTimeout(() => {
      getAdminIssues({ moderation: 'All', search: q, page: 1, limit: 50 })
        .then((d) => !cancelled && setPool({ q, items: d.items || [] }))
        .catch(() => !cancelled && setPool({ q, items: [] }))
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [queryInput])

  const suggestions = rankSuggestions(pool.items, queryInput)

  const key = `${tab}|${query}|${page}|${tick}`

  useEffect(() => {
    let cancelled = false
    getAdminIssues({ moderation: tab, search: query, page, limit: PAGE_SIZE })
      .then((data) => !cancelled && setResult({ key, data }))
      .catch((e) => !cancelled && setResult({ key, error: e.message }))
    return () => {
      cancelled = true
    }
  }, [key, tab, query, page])

  const loading = !result || result.key !== key
  const data = result?.data
  const counts = data?.moderationCounts

  const decide = async (issue, decision) => {
    if (decision.value === issue.moderationStatus) return
    setBusyId(issue.id)
    try {
      await moderateIssue(issue.id, decision.action)
      flash(FLASH[decision.action])
      // The post leaves this tab, so step back a page if it was the last row.
      if (tab !== 'All' && data && data.items.length === 1 && page > 1) setPage(page - 1)
      setTick((n) => n + 1)
    } catch (e) {
      flash(e.message || 'Could not update this post')
    } finally {
      setBusyId(null)
    }
  }

  const changeStatus = async (issue, statusLabel) => {
    if (statusLabel === issue.statusLabel) return
    setBusyId(issue.id)
    try {
      await updateIssueStatus(issue.id, statusLabel)
      flash(`Status updated to "${statusLabel}"`)
      setTick((n) => n + 1)
    } catch (e) {
      flash(e.message || 'Could not update status')
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    const target = deleting
    setDeleting(null)
    try {
      await deleteIssueAsAdmin(target.id)
      flash('Issue deleted')
      // If that was the last row on this page, step back one page.
      if (data && data.items.length === 1 && page > 1) setPage(page - 1)
      setTick((n) => n + 1)
    } catch (e) {
      flash(e.message || 'Could not delete issue')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-nagorik-heading px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                setPage(1)
              }}
              className={`cursor-pointer rounded-full px-4 py-2 text-[12.5px] font-bold transition-colors duration-150 ${
                tab === t
                  ? 'bg-nagorik-red text-white'
                  : 'bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-line'
              }`}
            >
              {t}
              {counts ? ` (${counts[t]})` : ''}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <SearchInput
            value={queryInput}
            onChange={setQueryInput}
            placeholder="Search issues, area or reporter"
            suggestions={suggestions}
            onPick={(s) => setQueryInput(s.label)}
            className="w-full max-w-[460px]"
          />
        </div>
      </div>

      {/* Table — table-fixed + no min-width keeps every column inside the viewport,
          so the panel never scrolls sideways. */}
      <div className={`overflow-hidden rounded-2xl border border-nagorik-line bg-nagorik-paper transition-opacity ${loading && data ? 'opacity-60' : ''}`}>
        {result?.error && !loading ? (
          <div className="p-5">
            <EmptyState text={`Couldn't load issues: ${result.error}`} />
          </div>
        ) : !data ? (
          <div className="p-5">
            <EmptyState text="Loading issues…" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              text={tab === 'Pending' ? 'Nothing waiting for review — you are all caught up.' : 'No issues match this filter.'}
            />
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-nagorik-line text-[11px] font-bold uppercase tracking-wide text-nagorik-muted">
                <th className="w-[26%] px-4 py-3">Issue</th>
                <th className="w-[13%] px-2 py-3 text-center">Category</th>
                <th className="w-[10%] px-2 py-3 text-center">Priority</th>
                <th className="w-[13%] px-2 py-3 text-center">Status</th>
                <th className="w-[9%] px-2 py-3 text-center">Votes</th>
                <th className="w-[17%] px-2 py-3 text-center">Moderation</th>
                <th className="w-[12%] px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((issue) => {
                const badge = MODERATION_BADGE[issue.moderationStatus]
                const busy = busyId === issue.id
                return (
                  <tr
                    key={issue.id}
                    onClick={(e) => {
                      // Buttons / the status dropdown handle their own clicks.
                      if (e.target.closest('button, select, option, a')) return
                      navigate(`/post/${issue.id}`)
                    }}
                    className="cursor-pointer border-b border-nagorik-line last:border-0 hover:bg-nagorik-surface-2/60"
                  >
                    <td className="px-4 py-3.5">
                      <div className="min-w-0 max-w-[320px]">
                        <p className="m-0 truncate text-[13.5px] font-semibold text-nagorik-heading">{issue.title}</p>
                        <p className="m-0 mt-0.5 truncate text-[11.5px] text-nagorik-muted">
                          {[issue.area, issue.reporter].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </td>
                    <td className="truncate px-2 py-3.5 text-center text-[12.5px] text-nagorik-secondary">{issue.category}</td>
                    <td className="px-2 py-3.5 text-center">
                      <PriorityDot priority={issue.priority} />
                    </td>
                    <td className="px-2 py-3.5 text-center">
                      {badge ? (
                        // Not approved yet / hidden: the lifecycle status doesn't apply.
                        <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={issue.statusLabel}
                            disabled={busy}
                            onChange={(e) => changeStatus(issue, e.target.value)}
                            className="cursor-pointer appearance-none rounded-full border border-nagorik-border bg-nagorik-surface-2 py-1.5 pl-3 pr-7 text-[11.5px] font-bold text-nagorik-heading outline-none disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3.5 text-center text-[12.5px] text-nagorik-secondary">
                      {issue.up} ↑ / {issue.down} ↓
                    </td>
                    <td className="px-2 py-3.5">
                      {/* Shrinkable box + shrink-0 buttons: the label can expand on hover
                          without ever widening the cell, so no horizontal scroll appears. */}
                      <div className="mx-auto flex w-full max-w-[160px] items-center justify-center gap-1.5">
                        {DECISIONS.map((d) => {
                          const isCurrent = issue.moderationStatus === d.value
                          return (
                            <button
                              key={d.action}
                              type="button"
                              disabled={busy}
                              onClick={() => decide(issue, d)}
                              aria-pressed={isCurrent}
                              aria-label={d.label}
                              title={isCurrent ? `Currently: ${d.label}` : d.label}
                              className={`group inline-flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border px-1.5 text-[11.5px] font-bold transition-colors duration-150 focus-visible:outline-2 disabled:cursor-default disabled:opacity-50 ${
                                isCurrent ? d.active : d.idle
                              }`}
                            >
                              <d.Icon size={12} />
                              <span className="ml-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200 ease-out group-hover:ml-1 group-hover:max-w-[56px] group-hover:opacity-100 group-focus-visible:ml-1 group-focus-visible:max-w-[56px] group-focus-visible:opacity-100">
                                {d.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/post/${issue.id}`)}
                          aria-label="Open post page"
                          title="Open post page"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-nagorik-secondary hover:bg-nagorik-surface-2"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(issue)}
                          aria-label="Delete issue"
                          title="Delete"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-nagorik-red hover:bg-nagorik-red/10"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {data && <AdminPagination page={page} limit={PAGE_SIZE} total={data.total} onChange={setPage} />}

      {/* Delete confirm modal */}
      {deleting && (
        <Modal
          title="Delete this issue?"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <PillButton variant="ghost" onClick={() => setDeleting(null)}>
                Cancel
              </PillButton>
              <PillButton variant="solid" onClick={confirmDelete}>
                Delete
              </PillButton>
            </>
          }
        >
          <p className="m-0">
            This will permanently remove <strong>"{deleting.title}"</strong> and its comments from the
            platform. This action can't be undone.
          </p>
        </Modal>
      )}
    </div>
  )
}