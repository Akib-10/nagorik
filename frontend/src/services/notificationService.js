import { api } from './api'

export const NOTIFICATION_PAGE_SIZE = 20

export async function fetchNotifications({
  filter = 'all',
  page = 1,
  limit = NOTIFICATION_PAGE_SIZE,
} = {}) {
  const params = new URLSearchParams({ filter, page: String(page), limit: String(limit) })
  return api.get(`/notifications?${params}`)
}

export async function fetchUnreadCount() {
  return api.get('/notifications/unread-count')
}

export function setReadState(id, read) {
  return api.patch(`/notifications/${id}/read`, { read })
}

export function deleteNotification(id) {
  return api.del(`/notifications/${id}`)
}

export function markAllAsRead() {
  return api.patch('/notifications/mark-all-read')
}