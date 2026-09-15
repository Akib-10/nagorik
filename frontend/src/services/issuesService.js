// Issues service —  real API + mock data (trending and upvoted nei bole)
// feed/mine/create/update/delete → backend API
// trending/upvoted →  mock (cz backend route nei)

import { api } from './api'
import { trendingIssues, upvotedIssues } from './mockData'

export async function getFeedIssues() {
  return api.get('/issues')
}

export function getTrendingIssues() {
  return trendingIssues
}

export function getUpvotedIssues() {
  return upvotedIssues
}

export async function getMyReports() {
  return api.get('/issues/mine')
}

export async function findReport(id) {
  const reports = await getMyReports()
  return reports.find((r) => r._id === id) || null
}

export async function submitReport(data) {
  return api.post('/issues', data)
}

export async function updateReport(id, patch) {
  return api.put(`/issues/${id}`, patch)
}

export async function deleteReport(id) {
  return api.del(`/issues/${id}`)
}