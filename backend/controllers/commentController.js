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
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const comment = await Comment.create({
      issue: issue._id,
      user: req.user._id,
      text,
    });

    // Notify the issue owner, unless they're commenting on their own report
    if (issue.user.toString() !== req.user._id.toString()) {
      await createNotification({
        recipientId: issue.user,
        type: 'comment',
        actorId: req.user._id,
        actorName: req.user.name,
        targetType: 'Comment',
        targetId: comment._id,
        subject: `your report "${issue.title}"`,
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