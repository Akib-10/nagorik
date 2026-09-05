// Issues service — the only place components get issue data from.
// Today it serves mock data + localStorage; tomorrow the function bodies
// become fetch('/api/...') calls and no component needs to change.

import { feedIssues, trendingIssues, upvotedIssues, seedMyReports, PLACEHOLDER_IMG } from './mockData'

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

export function submitReport(data) {
  const reports = readUserReports() || seedMyReports
  const report = {
    id: `rep-${Date.now()}`,
    title: data.title,
    area: data.area,
    by: 'You',
    time: 'Just now',
    statusClass: '',
    statusLabel: 'Open',
    category: data.category,
    priority: data.priority,
    date: data.date,
    description: data.description,
    address: data.fullAddress,
    up: 0,
    down: 0,
    comments: 0,
    photos: data.photos || [],
    img: (data.photos && data.photos[0]) || PLACEHOLDER_IMG,
  }
  writeUserReports([report, ...reports])
  return report
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
