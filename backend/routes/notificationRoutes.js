import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getUnreadCount,
  updateReadState,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect); // every notification route is user-specific

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

router.patch('/mark-all-read', markAllAsRead); // bulk — read state only
router.patch('/:id/read', updateReadState);    // singular — toggle read/unread

router.delete('/:id', deleteNotification);     // singular soft delete only

export default router;