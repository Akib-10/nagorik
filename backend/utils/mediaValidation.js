// backend/utils/mediaValidation.js
// Magic-byte sniffing so the backend validates the *actual* file content
// instead of trusting the client-supplied MIME type or resource type.
import {
  ALLOWED_IMAGE_MIME,
  ALLOWED_VIDEO_MIME,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '../config/media.js';

function ascii(buffer, start, end) {
  return buffer.subarray(start, end).toString('latin1');
}

// Returns the detected MIME type from the file signature, or null if unknown.
export function detectMimeType(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WEBP: "RIFF" .... "WEBP"
  if (ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 12) === 'WEBP') {
    return 'image/webp';
  }

  // ISO base media (MP4 / QuickTime): "ftyp" at offset 4
  if (ascii(buffer, 4, 8) === 'ftyp') {
    const brand = ascii(buffer, 8, 12);
    if (brand === 'qt  ') return 'video/quicktime';
    return 'video/mp4';
  }

  // Matroska / WebM: EBML header 1A 45 DF A3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return 'video/webm';
  }

  return null;
}

export function resourceTypeForMime(mimeType) {
  if (ALLOWED_IMAGE_MIME.includes(mimeType)) return 'image';
  if (ALLOWED_VIDEO_MIME.includes(mimeType)) return 'video';
  return null;
}

const MAX_BYTES_BY_TYPE = {
  image: MAX_IMAGE_BYTES,
  video: MAX_VIDEO_BYTES,
};

// Validates a single multer memory file.
// `allowed` filters the accepted resource types (e.g. ['image'] for avatars).
// Returns { ok, resourceType, mimeType } or { ok: false, error, code }.
export function validateMediaFile(file, allowed = ['image', 'video']) {
  if (!file || !file.buffer || !file.buffer.length) {
    return { ok: false, code: 'EMPTY_FILE', error: 'The uploaded file is empty.' };
  }

  const mimeType = detectMimeType(file.buffer);
  const resourceType = mimeType ? resourceTypeForMime(mimeType) : null;

  if (!mimeType || !resourceType) {
    return {
      ok: false,
      code: 'UNSUPPORTED_TYPE',
      error: `Unsupported file type for "${file.originalname || 'file'}". Allowed: JPEG, PNG, WEBP, MP4, WEBM, MOV.`,
    };
  }

  if (!allowed.includes(resourceType)) {
    return {
      ok: false,
      code: 'UNSUPPORTED_TYPE',
      error:
        resourceType === 'video'
          ? 'Only image files are allowed here.'
          : 'Only video files are allowed here.',
    };
  }

  const maxBytes = MAX_BYTES_BY_TYPE[resourceType];
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return {
      ok: false,
      code: 'FILE_TOO_LARGE',
      error: `${resourceType === 'image' ? 'Image' : 'Video'} is too large. Maximum size is ${mb} MB.`,
    };
  }

  return { ok: true, resourceType, mimeType };
}
