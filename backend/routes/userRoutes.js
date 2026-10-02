// Alias routes matching the documented `/api/users/profile-picture` contract.
// They reuse the same profile controllers/middleware as `/api/profile/picture`,
// so there is no duplicated logic.
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfilePicture } from '../middleware/upload.js';
import {
  uploadProfilePicture as uploadProfilePictureController,
  deleteProfilePicture,
} from '../controllers/profileController.js';

const router = express.Router();

router.post(
  '/profile-picture',
  protect,
  uploadProfilePicture,
  uploadProfilePictureController,
);
router.delete('/profile-picture', protect, deleteProfilePicture);

export default router;
