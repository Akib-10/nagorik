// backend/controllers/adminController.js
// Read endpoints for the admin panel (overview, users, issues) + admin delete.
//
// PERFORMANCE NOTE: users.avatar and issues.photos / issues.img can hold
// base64 images (100kB+ per document). Every list query below uses an
// explicit projection so those fields never leave MongoDB.
import mongoose from 'mongoose';
import User from '../models/User.js';
import Issue from '../models/Issue.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { deleteAssets } from '../services/cloudinaryService.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

const STATUSES = ['Open', 'In progress', 'Resolved', 'Rejected'];

// Admin moderation. Mirrors the tab labels in frontend/src/services/adminServices.js
// (MODERATION_TABS) plus the synthetic 'All' tab.
const MODERATION_STATUSES = ['pending', 'approved', 'spam', 'rejected'];
const MODERATION_TABS = ['All', 'Pending', 'Approved', 'Spam', 'Rejected'];
const MODERATION_TAB_TO_STATUS = {
  Pending: 'pending',
  Approved: 'approved',
  Spam: 'spam',
  Rejected: 'rejected',
};

// Frontend sends an action name; store the canonical status value.
const MODERATION_ACTION_TO_STATUS = {
  approve: 'approved',
  spam: 'spam',
  reject: 'rejected',
  pending: 'pending',
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function getPaging(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

// { issueId -> commentCount } for a set of issue ids
async function commentCounts(issueIds) {
  if (!issueIds.length) return {};
  const rows = await Comment.aggregate([
    { $match: { issue: { $in: issueIds } } },
    { $group: { _id: '$issue', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [String(r._id), r.count]));
}

// { status -> count, All -> total } across the whole issues collection
async function statusCounts() {
  const rows = await Issue.aggregate([
    { $group: { _id: { $ifNull: ['$statusLabel', 'Open'] }, count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  let all = 0;
  rows.forEach((r) => {
    all += r.count;
    if (r._id in counts) counts[r._id] = r.count;
  });
  counts.All = all;
  return counts;
}

// { Pending|Approved|Spam|Rejected -> count, All -> total } for the moderation
// tabs. Documents predating the moderationStatus field count as "approved",
// which is the schema default.
async function moderationCounts() {
  const rows = await Issue.aggregate([
    {
      $group: {
        _id: { $ifNull: ['$moderationStatus', 'approved'] },
        count: { $sum: 1 },
      },
    },
  ]);
  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const counts = {};
  let all = 0;
  MODERATION_TABS.forEach((tab) => {
    const n = tab === 'All' ? 0 : byStatus[MODERATION_TAB_TO_STATUS[tab]] || 0;
    counts[tab] = n;
    all += n;
  });
  counts.All = all;
  return counts;
}

// GET /api/admin/overview
export async function getOverview(req, res) {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      counts,
      voteRows,
      totalUsers,
      newUsersThisWeek,
      totalComments,
      recentIssues,
      recentComments,
      recentUsers,
    ] = await Promise.all([
      statusCounts(),
      Issue.aggregate([{ $group: { _id: null, up: { $sum: '$up' } } }]),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Comment.countDocuments(),
      Issue.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title area statusLabel priority createdAt user')
        .populate('user', 'name')
        .lean(),
      Comment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('issue user createdAt')
        .populate('user', 'name')
        .populate('issue', 'title')
        .lean(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name createdAt').lean(),
    ]);

    // "Recent activity" is built from real records — no separate log collection needed.
    const activity = [
      ...recentIssues.map((i) => ({
        id: `i-${i._id}`,
        text: `${i.user?.name || 'A user'} reported "${i.title}"`,
        at: i.createdAt,
      })),
      ...recentComments.map((c) => ({
        id: `c-${c._id}`,
        text: c.issue
          ? `${c.user?.name || 'A user'} commented on "${c.issue.title}"`
          : `${c.user?.name || 'A user'} left a comment`,
        at: c.createdAt,
      })),
      ...recentUsers.map((u) => ({
        id: `u-${u._id}`,
        text: `${u.name} joined Nagorik`,
        at: u.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8);

    res.json({
      stats: {
        totalIssues: counts.All,
        open: counts['Open'],
        inProgress: counts['In progress'],
        resolved: counts['Resolved'],
        rejected: counts['Rejected'],
        totalUsers,
        newUsersThisWeek,
        totalComments,
        totalUpvotes: voteRows[0]?.up || 0,
      },
      recentIssues: recentIssues.map((i) => ({
        id: i._id,
        title: i.title,
        area: i.area || '',
        reporter: i.user?.name || 'Removed user',
        statusLabel: i.statusLabel || 'Open',
        priority: i.priority,
        createdAt: i.createdAt,
      })),
      activity,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/admin/users?search=&role=All|Admin|Citizen&page=1&limit=20
export async function listUsers(req, res) {
  try {
    const { search = '', role = 'All' } = req.query;
    const { page, limit, skip } = getPaging(req.query);

    const filter = {};
    if (role === 'Admin') filter.isAdmin = true;
    else if (role === 'Citizen') filter.isAdmin = { $ne: true };

    const q = String(search).trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total, adminCount, allCount] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email isAdmin isSuspended phone createdAt') // no password, no avatar
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ isAdmin: true }),
      User.countDocuments(),
    ]);

    const reportRows = users.length
      ? await Issue.aggregate([
          { $match: { user: { $in: users.map((u) => u._id) } } },
          { $group: { _id: '$user', count: { $sum: 1 } } },
        ])
      : [];
    const reportMap = Object.fromEntries(reportRows.map((r) => [String(r._id), r.count]));

    res.json({
      items: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.isAdmin ? 'Admin' : 'Citizen',
        status: u.isSuspended ? 'Suspended' : 'Active',
        reports: reportMap[String(u._id)] || 0,
        joined: u.createdAt,
      })),
      total,
      page,
      limit,
      counts: { All: allCount, Admin: adminCount, Citizen: allCount - adminCount },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/admin/issues?status=All|Open|In progress|Resolved|Rejected
//                  &moderation=All|Pending|Approved|Spam|Rejected&search=&page=1&limit=20
export async function listIssues(req, res) {
  try {
    const { search = '', status = 'All', moderation = 'All' } = req.query;
    const { page, limit, skip } = getPaging(req.query);

    const filter = {};
    if (STATUSES.includes(status)) {
      // Documents with no statusLabel behave as "Open" (schema default).
      filter.statusLabel = status === 'Open' ? { $in: ['Open', null] } : status;
    }

    // Moderation filter. "Approved" must also match docs written before the
    // field existed, hence the $in rather than an equality test.
    if (moderation !== 'All' && MODERATION_TAB_TO_STATUS[moderation]) {
      const wanted = MODERATION_TAB_TO_STATUS[moderation];
      filter.moderationStatus = wanted === 'approved' ? { $in: ['approved', null] } : wanted;
    }

    const q = String(search).trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      // The reporter's name lives on the User collection, so resolve it first.
      const matchedUsers = await User.find({ name: rx }).select('_id').lean();
      filter.$or = [
        { title: rx },
        { area: rx },
        { user: { $in: matchedUsers.map((u) => u._id) } },
      ];
    }

    const [issues, total, counts, modCounts] = await Promise.all([
      Issue.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-photos -img -upvotedBy') // keep heavy/base64 fields out of the list
        .populate('user', 'name')
        .lean(),
      Issue.countDocuments(filter),
      statusCounts(),
      moderationCounts(),
    ]);

    const cMap = await commentCounts(issues.map((i) => i._id));

    res.json({
      items: issues.map((i) => ({
        id: i._id,
        title: i.title,
        description: i.description || '',
        area: i.area || '',
        address: i.address || '',
        category: i.category || 'Uncategorized',
        priority: i.priority || 'Medium',
        statusLabel: i.statusLabel || 'Open',
        moderationStatus: i.moderationStatus || 'approved',
        reporter: i.user?.name || 'Removed user',
        up: i.up || 0,
        down: i.down || 0,
        comments: cMap[String(i._id)] || 0,
        date: i.date || '',
        createdAt: i.createdAt,
      })),
      total,
      page,
      limit,
      counts,
      moderationCounts: modCounts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// PATCH /api/admin/issues/:id/moderate  body: { action: 'approve'|'spam'|'reject' }
export async function moderateIssue(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }

    const action = String(req.body?.action || '');
    const moderationStatus = MODERATION_ACTION_TO_STATUS[action];
    if (!moderationStatus) {
      return res.status(400).json({ message: 'Unknown moderation action.' });
    }

    const issue = await Issue.findById(id).select('_id moderationStatus');
    if (!issue) return res.status(404).json({ message: 'Not found' });

    issue.moderationStatus = moderationStatus;
    issue.moderatedAt = new Date();
    issue.moderatedBy = req.user._id;
    await issue.save();

    return res.json({
      id: issue._id,
      moderationStatus,
      message: 'Moderation updated.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// PATCH /api/admin/users/:id/suspend — suspend a user. Cannot suspend yourself.
// PATCH /api/admin/users/:id/reactivate — lift the suspension.
async function setSuspension(req, res, suspended) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (String(req.user._id) === String(id)) {
      return res.status(400).json({ message: 'You cannot suspend your own account' });
    }

    const user = await User.findById(id).select('name isSuspended');
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (user.isSuspended === suspended) {
      return res.json({ id: user._id, status: suspended ? 'Suspended' : 'Active' });
    }

    user.isSuspended = suspended;
    user.suspendedAt = suspended ? new Date() : null;
    await user.save();

    res.json({ id: user._id, status: suspended ? 'Suspended' : 'Active' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export const suspendUser = (req, res) => setSuspension(req, res, true);
export const reactivateUser = (req, res) => setSuspension(req, res, false);

// DELETE /api/admin/issues/:id — admins may delete any issue
// (the public DELETE /api/issues/:id is owner-only).
export async function deleteIssue(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }
    const issue = await Issue.findById(id).select('_id media');
    if (!issue) return res.status(404).json({ message: 'Not found' });

    const media = issue.media || [];

    // Remove Cloudinary assets first; abort while Cloudinary is configured so
    // orphaned media never goes untracked.
    if (media.length && isCloudinaryConfigured) {
      const failures = await deleteAssets(
        media.map((m) => ({ publicId: m.publicId, resourceType: m.resourceType })),
      );
      if (failures.length) {
        console.error(
          '[admin] Cloudinary deletion failed; keeping issue record:',
          JSON.stringify(failures),
        );
        return res.status(502).json({
          message:
            'Some media could not be removed from storage. The report was not deleted — please try again.',
        });
      }
    }

    await Promise.all([
      Comment.deleteMany({ issue: issue._id }),
      // Hide notifications that point at the now-deleted issue.
      Notification.updateMany(
        { targetType: 'Issue', targetId: issue._id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() }
      ),
      issue.deleteOne(),
    ]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
