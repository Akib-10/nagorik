// backend/config/cloudinary.js
// Single source of truth for the Cloudinary SDK configuration.
// The API secret lives only here (server-side) and must never reach the client.
import './env.js';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_FOLDERS, CLOUDINARY_ROOT } from './media.js';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

export const isCloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  // Do not crash the whole server on boot: every route that needs Cloudinary
  // calls assertCloudinaryConfigured() and gets a clean 503 instead.
  console.warn(
    '[cloudinary] Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET. ' +
      'Media uploads are disabled until these are set in backend/.env.',
  );
}

export function assertCloudinaryConfigured() {
  if (!isCloudinaryConfigured) {
    const err = new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env.',
    );
    err.statusCode = 503;
    throw err;
  }
}

export { cloudinary, CLOUDINARY_FOLDERS, CLOUDINARY_ROOT };
