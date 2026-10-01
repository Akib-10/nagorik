import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadIssueMedia } from '../middleware/upload.js';
import {
  getIssues,
  getIssueById,
  getMyIssues,
  getUpvotedIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  // ==== NOTIFICATION EDIT: START ====
  upvoteIssue,
  updateIssueStatus,
  // ==== NOTIFICATION EDIT: END ====
} from '../controllers/issueController.js';

const router = express.Router();

router.get('/', getIssues);              // public — feed-er jonno 
router.get('/mine', protect, getMyIssues);
router.get('/upvoted', protect, getUpvotedIssues);
router.get('/:id', getIssueById);
router.post('/', protect, uploadIssueMedia, createIssue);
router.put('/:id', protect, uploadIssueMedia, updateIssue);
router.delete('/:id', protect, deleteIssue);

// ==== NOTIFICATION EDIT: START ====
router.patch('/:id/upvote', protect, upvoteIssue);
router.patch('/:id/status', protect, updateIssueStatus); // admin check is inside the controller
// ==== NOTIFICATION EDIT: END ====

export default router;