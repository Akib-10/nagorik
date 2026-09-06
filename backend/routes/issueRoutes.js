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

router.get('/', getIssues);                       // public — feed-এর জন্য (login লাগে না)
router.get('/mine', protect, getMyIssues);        // নিজের report list — login দরকার
router.post('/', protect, createIssue);           // নতুন report submit — login দরকার
router.put('/:id', protect, updateIssue);         // edit report — শুধু মালিক
router.delete('/:id', protect, deleteIssue);      // delete report — শুধু মালিক

export default router;