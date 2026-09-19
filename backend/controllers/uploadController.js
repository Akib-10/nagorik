// backend/controllers/uploadController.js
import { saveBase64Image } from '../services/fileStorage.js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/upload — accepts { image: "data:image/jpeg;base64,..." }, saves it
// to the uploads/ folder and returns { url: "/uploads/<file>" }.
export async function uploadImage(req, res) {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'A base64 image is required' });
    }

    const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ message: 'Unsupported image format' });

    const buf = Buffer.from(match[2], 'base64');
    if (!buf.length) return res.status(400).json({ message: 'Empty image' });
    if (buf.length > MAX_BYTES) return res.status(400).json({ message: 'Image too large (max 5MB)' });

    const url = saveBase64Image(image);
    if (url === image) return res.status(400).json({ message: 'Unsupported image type' });

    res.status(201).json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}