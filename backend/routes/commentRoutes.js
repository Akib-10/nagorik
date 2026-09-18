import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCommentsForIssue,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';

const router = express.Router();

router.get('/issue/:issueId', getCommentsForIssue);            // public
router.post('/issue/:issueId', protect, createComment);
router.delete('/:id', protect, deleteComment);                 // singular delete only

export default router;