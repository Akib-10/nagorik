// Issues service — the only place components get issue data from.
// All data now flows through the Express backend (/api/issues, /api/comments).
// Field mapping (DB shape -> UI shape) happens here, so components stay clean.
// Photos are stored on disk as files; the DB keeps only URLs, so feeds stay light.

import { api } from './api'

// Upload any base64 data-URL photos to /api/upload and return their /uploads URLs.
// Existing URLs pass through untouched, so edits never re-upload old photos.
async function persistPhotos(photos) {
  const list = photos || []
  if (!list.some((p) => typeof p === 'string' && p.startsWith('data:image/'))) return list
  return Promise.all(
    list.map(async (p) => {
      if (typeof p !== 'string' || !p.startsWith('data:image/')) return p
      const { url } = await api.post('/upload', { image: p })
      return url
    }),
  )
}

function currentUserId() {
  try {
    return JSON.parse(localStorage.getItem('nagorik_user') || '{}')._id || null
  } catch {
    return null
  }
}

function formatTime(ts) {
  if (!ts) return 'Just now'
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

function mapIssue(i) {
  const me = currentUserId()
  const upvotedBy = (i.upvotedBy || []).map((x) => String(x._id || x))
  return {
    id: i._id,
    title: i.title,
    area: i.area,
    reporter: i.user?.name || i.reporter || 'Anonymous',
    time: formatTime(i.createdAt),
    statusClass: i.statusClass || '',
    statusLabel: i.statusLabel || 'Open',
    category: i.category,
    priority: i.priority,
    date: i.date,
    description: i.description,
    address: i.address,
    up: i.up ?? 0,
    down: i.down ?? 0,
    comments: i.comments ?? 0,
    photos: i.photos || [],
    img: i.img || (i.photos && i.photos[0]) || '',
    alt: i.title,
    upvotedBy,
    myUpvote: me ? upvotedBy.includes(me) : false,
  }
}

function mapComment(c) {
  return {
    id: c._id,
    author: c.user?.name || 'Anonymous',
    time: formatTime(c.createdAt),
    text: c.text,
    up: 0,
    down: '00',
    timestamp: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
    replies: [],
  }
}

export async function getFeedIssues() {
  return (await api.get('/issues')).map(mapIssue)
}

export async function getIssueById(id) {
  return mapIssue(await api.get(`/issues/${id}`))
}

export async function getTrendingIssues() {
  const feed = await getFeedIssues()
  return feed
    .slice()
    .sort((a, b) => b.up - a.up)
    .slice(0, 4)
    .map((i) => ({ id: i.id, title: i.title, votes: i.up, time: i.time, img: i.img }))
}

export async function getMyReports() {
  return (await api.get('/issues/mine')).map(mapIssue)
}

export async function getUpvotedIssues() {
  return (await api.get('/issues/upvoted')).map(mapIssue)
}

export async function findReport(id) {
  const cleanId = String(id).replace('comment-', '')
  const list = [...(await getMyReports()), ...(await getFeedIssues())]
  return list.find((r) => String(r.id) === cleanId) || null
}

export async function submitReport(data) {
  const photos = await persistPhotos(data.photos)
  const created = await api.post('/issues', {
    title: data.title,
    area: data.area,
    category: data.category,
    priority: data.priority,
    date: data.date,
    description: data.description,
    address: data.fullAddress,
    photos,
    img: photos[0] || '',
  })
  return mapIssue(created)
}

export async function updateReport(id, patch) {
  const photos = await persistPhotos(patch.photos)
  const updated = await api.put(`/issues/${id}`, {
    title: patch.title,
    area: patch.area,
    category: patch.category,
    priority: patch.priority,
    date: patch.date,
    description: patch.description,
    address: patch.fullAddress,
    photos,
    img: photos[0] || patch.img || '',
  })
  return mapIssue(updated)
}

export async function deleteReport(id) {
  await api.del(`/issues/${id}`)
  return id
}

export async function toggleUpvote(id) {
  const issue = await api.patch(`/issues/${id}/upvote`, {})
  return mapIssue(issue)
}

export async function getCommentsForIssue(id) {
  return (await api.get(`/comments/issue/${id}`)).map(mapComment)
}

export async function addComment(id, text) {
  const created = await api.post(`/comments/issue/${id}`, { text })
  return mapComment(created)
}