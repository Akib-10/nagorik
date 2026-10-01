import { useEffect, useSyncExternalStore } from 'react'
import {
  acquireUnreadCountPolling,
  getNotificationState,
  subscribe,
} from '../services/notificationStore'

export function useUnreadCount(enabled = true) {
  const notificationState = useSyncExternalStore(
    subscribe,
    getNotificationState,
    getNotificationState
  )

  useEffect(() => {
    if (!enabled) return
    return acquireUnreadCountPolling()
  }, [enabled])

  return enabled ? notificationState.unreadCount : 0
}