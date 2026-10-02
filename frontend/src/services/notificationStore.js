import {
  NOTIFICATION_PAGE_SIZE,
  deleteNotification as deleteNotificationRequest,
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead as markAllAsReadRequest,
  setReadState,
} from './notificationService'

const LIST_POLL_INTERVAL = 45000
const COUNT_POLL_INTERVAL = 15000

const initialState = {
  items: [],
  unreadCount: 0,
  totalPages: 1,
  page: 1,
  filter: 'all',
  loading: true,
  loadingMore: false,
  error: null,
}

let state = initialState
let listPollTimer = null
let countPollTimer = null
let listConsumers = 0
let countConsumers = 0

const listeners = new Set()

function commit(patch) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

export function getNotificationState() {
  return state
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Single lightweight count used to keep the header badge live everywhere,
// including on pages that never mount the notifications list.
export async function refreshUnreadCount() {
  try {
    const data = await fetchUnreadCount()
    commit({ unreadCount: data.unreadCount ?? 0 })
  } catch {
    // Keep the last known count rather than flashing an error on the badge.
  }
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ]
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value}${label} ago`
  }
  return 'just now'
}

function toViewModel(n) {
  // Comment notifications point at a Comment, which has no route of its own,
  // so the owning issue drives navigation. targetId is only the fallback for
  // notifications written before issueId existed.
  const issueId = n.issueId ?? (n.targetType === 'Issue' ? n.targetId : null)

  return {
    id: n._id,
    type: n.type,
    title: n.title,
    message: n.message,
    time: timeAgo(n.createdAt),
    read: n.read,
    targetUrl: issueId ? `/post/${issueId}` : null,
  }
}

// "replace" drives the full-page loader, "append" drives the load-more button,
// and "silent" is used by the background poll so a refresh never blanks out or
// throws an error over a list the user is already reading.
export async function loadNotifications({
  filter = state.filter,
  page = 1,
  mode = 'replace',
} = {}) {
  if (mode === 'append') commit({ loadingMore: true })

  try {
    const data = await fetchNotifications({
      filter,
      page,
      limit: NOTIFICATION_PAGE_SIZE,
    })

    const items = (data.items || []).map(toViewModel)

    commit({
      items: mode === 'append' ? [...state.items, ...items] : items,
      totalPages: data.totalPages || 1,
      page,
      unreadCount: data.unreadCount ?? 0,
      error: null,
    })
  } catch (err) {
    if (mode === 'silent') return
    commit({
      error:
        err.status === 401
          ? 'Your session has expired. Please sign in again.'
          : err.message || 'Failed to load notifications.',
    })
  } finally {
    if (mode === 'append') commit({ loadingMore: false })
    else if (mode === 'replace') commit({ loading: false })
  }
}

export function selectFilter(filter) {
  if (filter === state.filter) return
  commit({ filter, page: 1, loading: true })
  loadNotifications({ filter, page: 1, mode: 'replace' })
}

export function loadMore() {
  const nextPage = state.page + 1
  if (nextPage > state.totalPages) return
  commit({ page: nextPage })
  loadNotifications({ filter: state.filter, page: nextPage, mode: 'append' })
}

export function retry() {
  commit({ loading: true })
  loadNotifications({ filter: state.filter, page: 1, mode: 'replace' })
}

export async function toggleRead(id) {
  const target = state.items.find((n) => n.id === id)
  if (!target) return
  const nextRead = !target.read

  commit({
    items: state.items.map((n) => (n.id === id ? { ...n, read: nextRead } : n)),
    unreadCount: Math.max(0, state.unreadCount + (nextRead ? -1 : 1)),
  })

  try {
    await setReadState(id, nextRead)
  } catch {
    commit({
      items: state.items.map((n) => (n.id === id ? { ...n, read: !nextRead } : n)),
    })
    refreshUnreadCount()
  }
}

export async function removeNotification(id) {
  const target = state.items.find((n) => n.id === id)
  const wasUnread = target && !target.read

  commit({
    items: state.items.filter((n) => n.id !== id),
    unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
  })

  try {
    const data = await deleteNotificationRequest(id)
    if (typeof data.unreadCount === 'number') {
      commit({ unreadCount: data.unreadCount })
    }
  } catch {
    loadNotifications({ filter: state.filter, page: 1, mode: 'silent' })
    refreshUnreadCount()
  }
}

export async function markAllAsRead() {
  if (state.unreadCount === 0) return
  const previous = state

  commit({
    items: state.items.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })

  try {
    await markAllAsReadRequest()
  } catch {
    commit(previous)
    refreshUnreadCount()
  }
}

// Drives the notifications page: loads the list and silently refreshes it so a
// new comment or upvote shows up without a manual reload.
export function acquireListPolling() {
  listConsumers += 1

  if (listPollTimer === null) {
    loadNotifications({ filter: state.filter, page: 1, mode: 'replace' })
    listPollTimer = setInterval(() => {
      loadNotifications({ filter: state.filter, page: 1, mode: 'silent' })
    }, LIST_POLL_INTERVAL)
  }

  let released = false
  return () => {
    if (released) return
    released = true
    listConsumers -= 1
    if (listConsumers <= 0 && listPollTimer !== null) {
      clearInterval(listPollTimer)
      listPollTimer = null
    }
  }
}

// Refetch the moment the user comes back to the tab instead of waiting for the
// next tick, and skip ticks while the tab is hidden.
function refreshIfVisible() {
  if (typeof document === 'undefined' || document.visibilityState === 'visible') {
    refreshUnreadCount()
  }
}

function bindVisibilityRefresh() {
  document.addEventListener('visibilitychange', refreshIfVisible)
  window.addEventListener('focus', refreshIfVisible)
}

function unbindVisibilityRefresh() {
  document.removeEventListener('visibilitychange', refreshIfVisible)
  window.removeEventListener('focus', refreshIfVisible)
}

// Drives the header badge on every other page.
export function acquireUnreadCountPolling() {
  countConsumers += 1

  if (countPollTimer === null) {
    refreshUnreadCount()
    countPollTimer = setInterval(refreshIfVisible, COUNT_POLL_INTERVAL)
    bindVisibilityRefresh()
  }

  let released = false
  return () => {
    if (released) return
    released = true
    countConsumers -= 1
    if (countConsumers <= 0 && countPollTimer !== null) {
      clearInterval(countPollTimer)
      countPollTimer = null
      unbindVisibilityRefresh()
    }
  }
}

// Called on sign-out so the next user never sees the previous user's cached
// notifications before the first fetch resolves.
export function resetNotificationState() {
  if (listPollTimer !== null) {
    clearInterval(listPollTimer)
    listPollTimer = null
  }
  if (countPollTimer !== null) {
    clearInterval(countPollTimer)
    countPollTimer = null
    unbindVisibilityRefresh()
  }
  listConsumers = 0
  countConsumers = 0
  commit(initialState)
}