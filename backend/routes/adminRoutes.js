// backend/routes/adminRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import {
  getOverview,
  listUsers,
  listIssues,
  moderateIssue,
  deleteIssue,
  suspendUser,
  reactivateUser,
  getSettings,
  updateSettings,
  getAnalytics,
} from '../controllers/adminController.js';

const router = express.Router();

// Every route below requires a valid token AND isAdmin === true.
router.use(protect, adminOnly);

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/reactivate', reactivateUser);
router.get('/issues', listIssues);
router.patch('/issues/:id/moderate', moderateIssue);
router.delete('/issues/:id', deleteIssue);
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.get('/analytics', getAnalytics);

export default router;
