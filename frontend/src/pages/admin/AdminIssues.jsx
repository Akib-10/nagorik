import { useEffect, useState } from 'react'
import { EyeIcon, TrashIcon, ChevronDownIcon } from '../../components/icons'
import { SearchInput, StatusBadge, PriorityDot, PillButton, Modal, EmptyState } from './AdminUI'
import AdminPagination from './AdminPagination'
import {
  getAdminIssues,
  updateIssueStatus,
  deleteIssueAsAdmin,
  formatDate,
  STATUS_OPTIONS,
} from '../../services/adminServices'

const TABS = ['All', ...STATUS_OPTIONS]
const PAGE_SIZE = 15

export default function AdminIssues() {
  const [tab, setTab] = useState('All')
  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('') // debounced copy of queryInput
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0) // bump to force a refetch after a mutation
  const [result, setResult] = useState(null) // { key, data } | { key, error }
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState('')

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

  const key = `${tab}|${query}|${page}|${tick}`

  useEffect(() => {
    let cancelled = false
    getAdminIssues({ status: tab, search: query, page, limit: PAGE_SIZE })
      .then((data) => !cancelled && setResult({ key, data }))
      .catch((e) => !cancelled && setResult({ key, error: e.message }))
    return () => {
      cancelled = true
    }
  }, [key, tab, query, page])

  const loading = !result || result.key !== key
  const data = result?.data
  const counts = data?.counts

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
          <SearchInput value={queryInput} onChange={setQueryInput} placeholder="Search issues, area or reporter" />
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded-2xl border border-nagorik-line bg-nagorik-paper transition-opacity ${loading && data ? 'opacity-60' : ''}`}>
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
            <EmptyState text="No issues match this filter." />
          </div>
        ) : (
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-nagorik-line text-[11px] font-bold uppercase tracking-wide text-nagorik-muted">
                <th className="px-5 py-3">Issue</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Votes</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((issue) => (
                <tr key={issue.id} className="border-b border-nagorik-line last:border-0 hover:bg-nagorik-surface-2/60">
                  <td className="px-5 py-3.5">
                    <div className="min-w-0 max-w-[320px]">
                      <p className="m-0 truncate text-[13.5px] font-semibold text-nagorik-heading">{issue.title}</p>
                      <p className="m-0 mt-0.5 text-[11.5px] text-nagorik-muted">
                        {[issue.area, issue.reporter].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-nagorik-secondary">{issue.category}</td>
                  <td className="px-4 py-3.5">
                    <PriorityDot priority={issue.priority} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative inline-block">
                      <select
                        value={issue.statusLabel}
                        disabled={busyId === issue.id}
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
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-nagorik-secondary">
                    {issue.up} ↑ / {issue.down} ↓
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewing(issue)}
                        aria-label="View issue"
                        title="View details"
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && <AdminPagination page={page} limit={PAGE_SIZE} total={data.total} onChange={setPage} />}

      {/* View modal */}
      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          <div className="flex flex-col gap-2.5">
            {viewing.description && (
              <p className="m-0 mb-1 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-nagorik-body-text">
                {viewing.description}
              </p>
            )}
            <Row label="Area" value={viewing.area || '—'} />
            {viewing.address && <Row label="Address" value={viewing.address} />}
            <Row label="Reported by" value={viewing.reporter} />
            <Row label="Category" value={viewing.category} />
            <div className="flex justify-between">
              <span className="text-nagorik-muted">Priority</span>
              <PriorityDot priority={viewing.priority} />
            </div>
            <div className="flex justify-between">
              <span className="text-nagorik-muted">Status</span>
              <StatusBadge status={viewing.statusLabel} />
            </div>
            <Row label="Votes" value={`${viewing.up} up · ${viewing.down} down`} />
            <Row label="Comments" value={viewing.comments} />
            <Row label="Date reported" value={formatDate(viewing.createdAt)} />
          </div>
        </Modal>
      )}

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

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-nagorik-muted">{label}</span>
      <span className="break-words text-right font-semibold text-nagorik-heading">{value}</span>
    </div>
  )
}
