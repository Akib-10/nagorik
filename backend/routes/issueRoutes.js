import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getIssues,
  getMyIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} from '../controllers/issueController.js';

const router = express.Router();

router.get('/', getIssues);              // public — feed-এর জন্য
router.get('/mine', protect, getMyIssues);
router.post('/', protect, createIssue);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, deleteIssue);

export default router;