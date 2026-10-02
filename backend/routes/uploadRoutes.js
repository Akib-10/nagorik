import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUploadSignature } from '../controllers/uploadController.js';

const router = express.Router();

// Signed request for direct browser -> Cloudinary uploads (large media).
router.post('/signature', protect, getUploadSignature);

export default router;
