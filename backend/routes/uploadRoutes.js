import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', protect, uploadImage);

export default router;