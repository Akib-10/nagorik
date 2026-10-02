import Notification from '../models/Notification.js';
import User from '../models/User.js';

const AGGREGATABLE_TYPES = ['upvote', 'comment'];
const VALID_FILTERS = ['all', 'unread', 'status', 'activity'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

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
  issueId = null,
  subject = 'your issue report',
  title,
  message,
}) {
  // Every routable notification resolves to an issue. Fall back to the target
  // when the target already is the issue, so callers only set issueId for
  // targets that need disambiguating (i.e. comments).
  const resolvedIssueId =
    issueId ?? (targetType === 'Issue' ? targetId : null);

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
        existing.actors.push({ actorId, actorName });
        existing.actorCount += 1;
      }
      // Lead with the actor who started the thread, not whoever acted last —
      // otherwise the message flips names on every new participant.
      const firstActorName = existing.actors[0]?.actorName || actorName;
      existing.message = buildAggregatedMessage({
        type,
        firstActorName,
        actorCount: existing.actorCount,
        subject,
      });
      existing.title = title;
      existing.issueId = resolvedIssueId;
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
      issueId: resolvedIssueId,
      actors: [{ actorId, actorName }],
      actorCount: 1,
    });
  }

  return Notification.create({ recipient: recipientId, type, title, message, targetType, targetId, issueId: resolvedIssueId });
}

// Best-effort wrapper for call sites on user-facing write paths. A notification
// failure must never roll back or 500 the primary mutation (upvote, comment,
// status change), so errors are logged and swallowed.
export async function notify(payload) {
  try {
    return await createNotification(payload);
  } catch (err) {
    console.error('[notification] failed to create:', err.message);
    return null;
  }
}

// Tell every admin about something that needs their attention (e.g. a new
// report waiting for approval). `exceptUserId` skips the person who caused it.
// Best-effort like notify(): never throws.
export async function notifyAdmins({ exceptUserId = null, ...payload }) {
  try {
    const filter = { isAdmin: true };
    if (exceptUserId) filter._id = { $ne: exceptUserId };
    const admins = await User.find(filter).select('_id').lean();
    await Promise.all(
      admins.map((a) => notify({ ...payload, recipientId: a._id }))
    );
  } catch (err) {
    console.error('[notification] failed to notify admins:', err.message);
  }
}

export async function listNotifications({ recipientId, filter = 'all', page = 1, limit = DEFAULT_LIMIT }) {
  const query = { recipient: recipientId, isDeleted: false };

  const activeFilter = VALID_FILTERS.includes(filter) ? filter : 'all';
  if (activeFilter === 'unread') query.read = false;
  else if (activeFilter === 'status') query.type = { $in: ['status', 'moderation'] };
  else if (activeFilter === 'activity') query.type = { $in: ['upvote', 'comment'] };

  const pageNum = Math.max(1, Math.floor(Number(page)) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(limit)) || DEFAULT_LIMIT));
  const skip = (pageNum - 1) * limitNum;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: recipientId, isDeleted: false, read: false }),
  ]);

  return {
    items,
    total,
    unreadCount,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  };
}

export async function countUnread(recipientId) {
  return Notification.countDocuments({
    recipient: recipientId,
    isDeleted: false,
    read: false,
  });
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