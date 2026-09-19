// backend/services/fileStorage.js
// Persists base64 image data URLs to the local uploads/ folder and returns a URL.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export function saveBase64Image(dataUrl) {
  const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return dataUrl;
  const ext = MIME_EXT[match[1]];
  if (!ext) return dataUrl;
  const buf = Buffer.from(match[2], 'base64');
  if (!buf.length) return dataUrl;

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);
  return `/uploads/${filename}`;
}