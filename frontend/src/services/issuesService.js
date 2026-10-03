// Issues service — the only place components get issue data from.
// All data flows through the Express backend (/api/issues, /api/comments).
// Field mapping (DB shape -> UI shape) happens here, so components stay clean.
// Media lives in Cloudinary; the DB keeps only metadata references.

import { api } from './api'
import { uploadIssueVideo, videoPoster } from './mediaService'

// Normalises the issue media list. Falls back to legacy photo/img URLs for
// documents created before the Cloudinary migration.
function normalizeMedia(i) {
  const media = Array.isArray(i.media) ? i.media.filter((m) => m && m.url) : []
  if (media.length) return media.map((m) => ({ ...m }))

  const legacy = [
    ...(Array.isArray(i.photos) ? i.photos : []),
    ...(i.img ? [i.img] : []),
  ].filter(Boolean)
  return [...new Set(legacy)].map((url) => ({
    url,
    publicId: '',
    resourceType: 'image',
    format: '',
    bytes: 0,
    width: null,
    height: null,
    duration: null,
  }))
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
  const media = normalizeMedia(i)
  const firstImage = media.find((m) => m.resourceType === 'image')
  const firstVideo = media.find((m) => m.resourceType === 'video')
  const img =
    firstImage?.url ||
    (firstVideo ? videoPoster(firstVideo.url) : '') ||
    i.img ||
    ''

  return {
    id: i._id,
    title: i.title,
    area: i.area,
    // Thana is the main location; `area` is only a free-text landmark.
    thana: i.thana || '',
    city: i.city || '',
    reporter: i.user?.name || i.reporter || 'Anonymous',
    reporterAvatar: i.user?.avatar || i.user?.profilePicture?.url || '',
    time: formatTime(i.createdAt),
    statusClass: i.statusClass || '',
    statusLabel: i.statusLabel || 'Open',
    moderationStatus: i.moderationStatus || 'approved',
category: i.category,
priority: i.priority,
coordsText: i.coordsText,
    date: i.date,
    description: i.description,
    address: i.address,
    up: i.up ?? 0,
    down: i.down ?? 0,
    comments: i.comments ?? 0,
    media,
    photos: media.filter((m) => m.resourceType === 'image').map((m) => m.url),
    img,
    primaryIsVideo: !firstImage && !!firstVideo,
    hasVideo: !!firstVideo,
    alt: i.title,
    upvotedBy,
    myUpvote: me ? upvotedBy.includes(me) : false,
  }
}

function mapComment(c) {
  return {
    id: c._id,
    parent: c.parent ? String(c.parent) : null,
    author: c.user?.name || 'Anonymous',
    time: formatTime(c.createdAt),
    text: c.text,
    up: 0,
    down: '00',
    timestamp: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
    replies: [],
  }
}

// The API returns a flat, oldest-first list. Nest replies under their parent
// so the UI can render the thread; orphans fall back to the top level.
function buildCommentTree(list) {
  const byId = new Map()
  list.forEach((c) => byId.set(String(c.id), c))
  const roots = []
  byId.forEach((c) => {
    const parent = c.parent && byId.get(c.parent)
    if (parent) parent.replies.push(c)
    else roots.push(c)
  })
  return roots
}

// Builds the multipart body for create/update. Images go through the backend;
// videos are streamed directly to Cloudinary and referenced by publicId.
async function buildIssueFormData(data) {
  const form = new FormData()

  const textFields = ['title', 'area', 'thana', 'city', 'category', 'priority', 'date', 'description', 'coordsText']
  textFields.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) form.append(key, data[key])
  })
  if (data.fullAddress !== undefined) form.append('address', data.fullAddress)

  const items = data.mediaItems || []
  const existing = items.filter((item) => item.kind === 'existing' && item.publicId)
  const newFiles = items.filter((item) => item.kind === 'file' && item.file)

  // Always send the keep-list so the backend can detect removals — even when
  // every existing item was removed (empty array).
  form.append('keptMedia', JSON.stringify(existing.map((item) => item.publicId)))

  const directUploads = []
  for (const item of newFiles) {
    if (item.resourceType === 'video') {
      directUploads.push(await uploadIssueVideo(item.file))
    } else {
      form.append('media', item.file, item.file.name)
    }
  }

  if (directUploads.length) {
    form.append(
      'uploadedMedia',
      JSON.stringify(
        directUploads.map((m) => ({
          publicId: m.publicId,
          resourceType: m.resourceType,
        })),
      ),
    )
  }

  return form
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
  const form = await buildIssueFormData(data)
  const created = await api.postForm('/issues', form)
  return mapIssue(created)
}

export async function updateReport(id, data) {
  const form = await buildIssueFormData(data)
  const updated = await api.putForm(`/issues/${id}`, form)
  return mapIssue(updated)
}

export async function deleteReport(id) {
  await api.del(`/issues/${id}`)
  return id
}

// Hides a post from the current user's feed only (stored on the server so it
// follows the user across devices).
export async function hideReport(id) {
  await api.patch(`/issues/${id}/hide`, {})
  return id
}

export async function toggleUpvote(id) {
  const issue = await api.patch(`/issues/${id}/upvote`, {})
  return mapIssue(issue)
}

export async function getCommentsForIssue(id) {
  return buildCommentTree((await api.get(`/comments/issue/${id}`)).map(mapComment))
}

export async function addComment(id, text, parentId = null) {
  const created = await api.post(`/comments/issue/${id}`, { text, parent: parentId })
  return mapComment(created)
}
