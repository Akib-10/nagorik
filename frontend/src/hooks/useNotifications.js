import { useEffect, useSyncExternalStore } from 'react'
import {
  acquireListPolling,
  getNotificationState,
  subscribe,
} from '../services/notificationStore'

export function useNotifications(enabled = true) {
  const notificationState = useSyncExternalStore(
    subscribe,
    getNotificationState,
    getNotificationState
  )

  useEffect(() => {
    if (!enabled) return
    return acquireListPolling()
  }, [enabled])

  if (!enabled) {
    return {
      items: [],
      unreadCount: 0,
      totalPages: 1,
      page: 1,
      loading: false,
      loadingMore: false,
      error: null,
    }
  }

  return notificationState
}