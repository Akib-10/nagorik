import { useEffect, useState } from 'react'
import { SearchInput, EmptyState } from './AdminUI'
import AdminPagination from './AdminPagination'
import { getAdminUsers, suspendUser, reactivateUser, formatDate } from '../../services/adminServices'

const ROLE_TONE = {
  Admin: 'bg-nagorik-red text-white',
  Citizen: 'bg-nagorik-surface-2 text-nagorik-secondary',
}

const STATUS_TONE = {
  Active: 'bg-nagorik-surface-2 text-nagorik-secondary',
  Suspended: 'bg-nagorik-red/10 text-nagorik-red',
}

const ROLE_TABS = ['All', 'Admin', 'Citizen']
const PAGE_SIZE = 15

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('All')
  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('') // debounced copy of queryInput
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null) // { key, data } | { key, error }
  const [tick, setTick] = useState(0) // bump to force a refetch after a mutation
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState('')

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(queryInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [queryInput])

  const key = `${roleFilter}|${query}|${page}|${tick}`

  useEffect(() => {
    let cancelled = false
    getAdminUsers({ role: roleFilter, search: query, page, limit: PAGE_SIZE })
      .then((data) => !cancelled && setResult({ key, data }))
      .catch((e) => !cancelled && setResult({ key, error: e.message }))
    return () => {
      cancelled = true
    }
  }, [key, roleFilter, query, page, tick])

  const toggleSuspension = async (user) => {
    const suspend = user.status !== 'Suspended'
    setBusyId(user.id)
    try {
      if (suspend) await suspendUser(user.id)
      else await reactivateUser(user.id)
      flash(suspend ? `${user.name} suspended` : `${user.name} reactivated`)
      setTick((n) => n + 1)
    } catch (e) {
      flash(e.message || 'Could not update user status')
    } finally {
      setBusyId(null)
    }
  }

  const loading = !result || result.key !== key
  const data = result?.data
  const counts = data?.counts

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-nagorik-heading px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRoleFilter(r)
                setPage(1)
              }}
              className={`cursor-pointer rounded-full px-4 py-2 text-[12.5px] font-bold transition-colors duration-150 ${
                roleFilter === r
                  ? 'bg-nagorik-red text-white'
                  : 'bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-line'
              }`}
            >
              {r}
              {counts ? ` (${counts[r]})` : ''}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <SearchInput value={queryInput} onChange={setQueryInput} placeholder="Search by name or email" />
        </div>
      </div>

      <div className={`overflow-x-auto rounded-2xl border border-nagorik-line bg-nagorik-paper transition-opacity ${loading && data ? 'opacity-60' : ''}`}>
        {result?.error && !loading ? (
          <div className="p-5">
            <EmptyState text={`Couldn't load users: ${result.error}`} />
          </div>
        ) : !data ? (
          <div className="p-5">
            <EmptyState text="Loading users…" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-5">
            <EmptyState text="No users match this filter." />
          </div>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-nagorik-line text-[11px] font-bold uppercase tracking-wide text-nagorik-muted">
                <th className="px-5 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id} className="border-b border-nagorik-line last:border-0 hover:bg-nagorik-surface-2/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nagorik-surface-2 text-[13px] font-bold text-nagorik-red">
                        {(u.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="m-0 truncate text-[13.5px] font-semibold text-nagorik-heading">{u.name}</p>
                        <p className="m-0 mt-0.5 truncate text-[11.5px] text-nagorik-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-[11.5px] font-bold ${ROLE_TONE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-nagorik-secondary">{u.reports}</td>
                  <td className="px-4 py-3.5 text-[12.5px] text-nagorik-secondary">{u.phone || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-[11.5px] font-bold ${STATUS_TONE[u.status === 'Suspended' ? 'Suspended' : 'Active']}`}>
                      {u.status === 'Suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-nagorik-secondary">{formatDate(u.joined)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() => toggleSuspension(u)}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
                        u.status === 'Suspended'
                          ? 'bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-line'
                          : 'bg-nagorik-red/10 text-nagorik-red hover:bg-nagorik-red hover:text-white'
                      }`}
                    >
                      {busyId === u.id ? '…' : u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && <AdminPagination page={page} limit={PAGE_SIZE} total={data.total} onChange={setPage} />}
    </div>
  )
}
