import Notification from '../models/Notification.js';

const AGGREGATABLE_TYPES = ['upvote', 'comment'];

function buildAggregatedMessage({ type, firstActorName, actorCount, subject }) {
  const verb = type === 'upvote' ? 'upvoted' : 'commented on';
  if (actorCount <= 1) {
    return `${firstActorName} ${verb} ${subject}.`;
  }
  const others = actorCount - 1;
  return `${firstActorName} and ${others} other${others > 1 ? 's' : ''} ${verb} ${subject}.`;
}

export async function createNotification({
  recipientId,
  type,
  actorId,
  actorName,
  targetType = null,
  targetId = null,
  subject = 'your issue report',
  title,
  message,
}) {
  if (AGGREGATABLE_TYPES.includes(type) && targetId) {
    const existing = await Notification.findOne({
      recipient: recipientId,
      type,
      targetId,
      read: false,
      isDeleted: false,
    });

    if (existing) {
      const alreadyActed = existing.actors.some(
        (a) => String(a.actorId) === String(actorId)
      );
      if (!alreadyActed) {
        existing.actors.push({ actorId });
        existing.actorCount += 1;
      }
      existing.message = buildAggregatedMessage({
        type,
        firstActorName: actorName,
        actorCount: existing.actorCount,
        subject,
      });
      existing.title = title;
      await existing.save();
      return existing;
    }

    return Notification.create({
      recipient: recipientId,
      type,
      title,
      message: buildAggregatedMessage({ type, firstActorName: actorName, actorCount: 1, subject }),
      targetType,
      targetId,
      actors: [{ actorId }],
      actorCount: 1,
    });
  }

  return Notification.create({ recipient: recipientId, type, title, message, targetType, targetId });
}

export async function listNotifications({ recipientId, filter = 'all', page = 1, limit = 20 }) {
  const query = { recipient: recipientId, isDeleted: false };

  if (filter === 'unread') query.read = false;
  else if (filter === 'status') query.type = 'status';
  else if (filter === 'activity') query.type = { $in: ['upvote', 'comment'] };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: recipientId, isDeleted: false, read: false }),
  ]);

  return { items, total, unreadCount, page: Number(page), limit: Number(limit) };
}

export async function markAsRead(notificationId, recipientId, read = true) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: recipientId, isDeleted: false },
    { read, readAt: read ? new Date() : null },
    { new: true }
  );
}

export async function markAllAsRead(recipientId) {
  const result = await Notification.updateMany(
    { recipient: recipientId, isDeleted: false, read: false },
    { read: true, readAt: new Date() }
  );
  return { matched: result.matchedCount, modified: result.modifiedCount };
}

export async function softDeleteNotification(notificationId, recipientId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: recipientId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
}