import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadIssueMedia } from '../middleware/upload.js';
import {
  getIssues,
  getIssueStats,
  getTrendingIssues,
  getIssueById,
  getMyIssues,
  getUpvotedIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  // ==== NOTIFICATION EDIT: START ====
  upvoteIssue,
  updateIssueStatus,
  hideIssue,
  // ==== NOTIFICATION EDIT: END ====
} from '../controllers/issueController.js';

const router = express.Router();

router.get('/', optionalAuth, getIssues); // public — feed-er jonno (signed-in users don't see posts they hid)
router.get('/stats', getIssueStats); // public — feed hero + landing page numbers (must stay above '/:id')
router.get('/trending', getTrendingIssues); // public — landing page trending issues (must stay above '/:id')
router.get('/mine', protect, getMyIssues);
router.get('/upvoted', protect, getUpvotedIssues);
router.get('/:id', optionalAuth, getIssueById); // owner/admin can open their own non-public post
router.post('/', protect, uploadIssueMedia, createIssue);
router.put('/:id', protect, uploadIssueMedia, updateIssue);
router.delete('/:id', protect, deleteIssue);

// ==== NOTIFICATION EDIT: START ====
router.patch('/:id/upvote', protect, upvoteIssue);
router.patch('/:id/hide', protect, hideIssue); // hide from MY feed only
router.patch('/:id/status', protect, updateIssueStatus); // admin check is inside the controller
// ==== NOTIFICATION EDIT: END ====

export default router;