import * as notificationService from '../services/notificationService.js';

// GET /api/notifications?filter=all|unread|status|activity&page=1&limit=20
export async function getNotifications(req, res) {
  try {
    const { filter = 'all', page = 1, limit = 20 } = req.query;
    const result = await notificationService.listNotifications({
      recipientId: req.user._id,
      filter,
      page,
      limit,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
}

// GET /api/notifications/unread-count
export async function getUnreadCount(req, res) {
  try {
    const { unreadCount } = await notificationService.listNotifications({
      recipientId: req.user._id,
      filter: 'unread',
      page: 1,
      limit: 1,
    });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch unread count', error: err.message });
  }
}

// PATCH /api/notifications/:id/read   body: { read: true|false }
export async function updateReadState(req, res) {
  try {
    const { id } = req.params;
    const { read = true } = req.body;
    const updated = await notificationService.markAsRead(id, req.user._id, read);
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification', error: err.message });
  }
}

// PATCH /api/notifications/mark-all-read
// Bulk action — READ STATE ONLY. Intentionally no bulk-delete counterpart.
export async function markAllAsRead(req, res) {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.json({ message: 'All notifications marked as read', ...result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all as read', error: err.message });
  }
}

// DELETE /api/notifications/:id
// Singular soft delete only. There is no bulk-delete route by design.
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const deleted = await notificationService.softDeleteNotification(id, req.user._id);
    if (!deleted) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted', id: deleted._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification', error: err.message });
  }
}