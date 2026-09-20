// Admin service — the only place the admin pages talk to /api/admin.
// Swaps out adminMockData.js for the Overview, Manage Users and Manage Issues pages.
import { api } from './api'

export const STATUS_OPTIONS = ['Open', 'In progress', 'Resolved', 'Rejected']

// The public feed styles issues by statusClass, so keep it in sync with the label.
const STATUS_CLASS = {
  Open: '',
  'In progress': 'st-progress',
  Resolved: 'st-done',
  Rejected: '',
}

function toQuery(params) {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.set(k, v)
  })
  const s = usp.toString()
  return s ? `?${s}` : ''
}

export const getOverview = () => api.get('/admin/overview')

export const getAdminUsers = ({ search, role, page, limit } = {}) =>
  api.get(`/admin/users${toQuery({ search, role, page, limit })}`)

export const suspendUser = (id) => api.patch(`/admin/users/${id}/suspend`)
export const reactivateUser = (id) => api.patch(`/admin/users/${id}/reactivate`)

export const getAdminIssues = ({ search, status, page, limit } = {}) =>
  api.get(`/admin/issues${toQuery({ search, status, page, limit })}`)

// Reuses the existing admin-only endpoint (it also notifies the report owner).
export const updateIssueStatus = (id, statusLabel) =>
  api.patch(`/issues/${id}/status`, {
    statusLabel,
    statusClass: STATUS_CLASS[statusLabel] ?? '',
  })

export const deleteIssueAsAdmin = (id) => api.del(`/admin/issues/${id}`)

// ---- display helpers ----

export function formatTimeAgo(ts) {
  if (!ts) return ''
  const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of units) {
    const v = Math.floor(seconds / secs)
    if (v >= 1) return `${v} ${label}${v > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}

export function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
