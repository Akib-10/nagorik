// ==== PROFILE EDIT: ENTIRE FILE IS NEW ====
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfilePicture } from '../middleware/upload.js';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture as uploadProfilePictureController,
  deleteProfilePicture,
} from '../controllers/profileController.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/picture', protect, uploadProfilePicture, uploadProfilePictureController);
router.delete('/picture', protect, deleteProfilePicture);

export default router;
