// backend/routes/adminRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import {
  getOverview,
  listUsers,
  listIssues,
  deleteIssue,
  suspendUser,
  reactivateUser,
} from '../controllers/adminController.js';

const router = express.Router();

// Every route below requires a valid token AND isAdmin === true.
router.use(protect, adminOnly);

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/reactivate', reactivateUser);
router.get('/issues', listIssues);
router.delete('/issues/:id', deleteIssue);

export default router;
