import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getIssues,
  getMyIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  // ==== NOTIFICATION EDIT: START ====
  upvoteIssue,
  updateIssueStatus,
  // ==== NOTIFICATION EDIT: END ====
} from '../controllers/issueController.js';

const router = express.Router();

router.get('/', getIssues);              // public — feed-এর জন্য
router.get('/mine', protect, getMyIssues);
router.post('/', protect, createIssue);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, deleteIssue);

// ==== NOTIFICATION EDIT: START ====
router.patch('/:id/upvote', protect, upvoteIssue);
router.patch('/:id/status', protect, updateIssueStatus); // admin check is inside the controller
// ==== NOTIFICATION EDIT: END ====

export default router;