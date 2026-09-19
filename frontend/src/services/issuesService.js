// Issues service — the only place components get issue data from.
// Today it serves mock data + localStorage; tomorrow the function bodies
// become fetch('/api/...') calls and no component needs to change.

import { feedIssues, trendingIssues, upvotedIssues, seedMyReports, PLACEHOLDER_IMG } from './mockData'
import { api } from './api'

const USER_REPORTS_KEY = 'nagorik_user_reports'

function readUserReports() {
  try {
    const raw = localStorage.getItem(USER_REPORTS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeUserReports(reports) {
  // Photos are stored as data URLs which can be large — if we exceed the
  // localStorage quota, retry without photos rather than losing the report.
  try {
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(reports))
  } catch {
    try {
      localStorage.setItem(
        USER_REPORTS_KEY,
        JSON.stringify(reports.map((r) => ({ ...r, photos: [] })))
      )
    } catch {
      /* storage unavailable — report stays in memory only */
    }
  }
}

export function getFeedIssues() {
  const mine = readUserReports() || []
  return [...mine, ...feedIssues]
}

export function getTrendingIssues() {
  return trendingIssues
}

export function getUpvotedIssues() {
  return upvotedIssues
}

// Lazily seeds localStorage with the three demo reports on first visit so
// edit/delete work uniformly on every row of "My Reports".
export function getMyReports() {
  let reports = readUserReports()
  if (!reports) {
    reports = seedMyReports
    writeUserReports(reports)
  }
  return reports
}

export function findReport(id) {
  return getMyReports().find((r) => r.id === id) || null
}

export async function submitReport(data) {
  const report = {
    title: data.title,
    area: data.area,
    category: data.category,
    priority: data.priority,
    date: data.date,
    description: data.description,
    address: data.fullAddress,
    photos: data.photos || [],
    img: (data.photos && data.photos[0]) || PLACEHOLDER_IMG,
  }
  const created = await api.post('/issues', report)
  // Keep a localStorage mirror so the (still mock-based) feed and profile
  // can render the new report until they are wired to the backend.
  const reports = readUserReports() || seedMyReports
  const local = {
    id: created._id,
    title: created.title,
    area: created.area,
    by: 'You',
    time: 'Just now',
    statusClass: created.statusClass || '',
    statusLabel: created.statusLabel || 'Open',
    category: created.category,
    priority: created.priority,
    date: created.date,
    description: created.description,
    address: created.address,
    up: created.up ?? 0,
    down: created.down ?? 0,
    comments: created.comments ?? 0,
    photos: created.photos || [],
    img: created.img || PLACEHOLDER_IMG,
  }
  writeUserReports([local, ...reports])
  return created
}

export function updateReport(id, patch) {
  const reports = (readUserReports() || seedMyReports).map((r) =>
    r.id === id ? { ...r, ...patch } : r
  )
  writeUserReports(reports)
  return reports
}

export function deleteReport(id) {
  const reports = (readUserReports() || seedMyReports).filter((r) => r.id !== id)
  writeUserReports(reports)
  return reports
}
