// backend/config/media.js
// Central place for media folders, allowed types and size/count limits.
// Values come from environment variables so they are configured in one place
// and never hardcoded across controllers.
import './env.js';

function envInt(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

// Cloudinary folders — profile pictures, issue images and issue videos are
// deliberately kept in separate folders so they are distinguishable at rest.
export const CLOUDINARY_FOLDERS = {
  userProfile: 'nagorik/users/profile',
  issueImages: 'nagorik/issues/images',
  issueVideos: 'nagorik/issues/videos',
};

// Folder prefix used to validate client-supplied public ids (direct uploads).
export const CLOUDINARY_ROOT = 'nagorik';

export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'];

export const MAX_IMAGE_SIZE_MB = envInt('MAX_IMAGE_SIZE_MB', 10);
export const MAX_VIDEO_SIZE_MB = envInt('MAX_VIDEO_SIZE_MB', 200);
export const MAX_ISSUE_MEDIA_COUNT = envInt('MAX_ISSUE_MEDIA_COUNT', 5);

export const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// Profile pictures are images only and use the (usually stricter) image cap.
export const MAX_PROFILE_PICTURE_BYTES = MAX_IMAGE_BYTES;

// Media larger than this is expected to be uploaded straight from the browser
// to Cloudinary using a backend-signed request, so it never passes through and
// buffers inside Express. The backend multipart path still accepts videos up to
// MAX_VIDEO_BYTES for API completeness.
export const DIRECT_UPLOAD_THRESHOLD_BYTES = 20 * 1024 * 1024;
