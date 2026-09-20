import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import { createNotification } from '../services/notificationService.js';

// GET /api/comments/issue/:issueId — public, like the issue feed
export async function getCommentsForIssue(req, res) {
  try {
    const comments = await Comment.find({ issue: req.params.issueId })
      .populate('user', 'name avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// POST /api/comments/issue/:issueId
export async function createComment(req, res) {
  try {
    const { text, parent } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Resolve the comment being replied to, if any. It must belong to the
    // same issue so replies can't be attached across posts.
    let parentComment = null;
    if (parent) {
      parentComment = await Comment.findById(parent);
      if (!parentComment || parentComment.issue.toString() !== issue._id.toString()) {
        return res.status(400).json({ message: 'Invalid parent comment' });
      }
    }

    const comment = await Comment.create({
      issue: issue._id,
      user: req.user._id,
      parent: parentComment ? parentComment._id : null,
      text,
    });

    // Replies notify the person being replied to; top-level comments notify
    // the report owner. Never notify yourself.
    const recipient = parentComment ? parentComment.user : issue.user;
    if (recipient.toString() !== req.user._id.toString()) {
      await createNotification({
        recipientId: recipient,
        type: 'comment',
        actorId: req.user._id,
        actorName: req.user.name,
        targetType: 'Comment',
        targetId: comment._id,
        subject: parentComment ? 'your comment' : `your report "${issue.title}"`,
        title: 'New Comment',
      });
    }

    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
}

// DELETE /api/comments/:id — singular delete only, owner-only
export async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Not found' });
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await comment.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}