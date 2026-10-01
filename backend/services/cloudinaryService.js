// backend/services/cloudinaryService.js
// Reusable Cloudinary operations. Controllers call these helpers instead of
// touching the SDK directly, so upload/delete logic lives in exactly one place.
import {
  cloudinary,
  assertCloudinaryConfigured,
  CLOUDINARY_FOLDERS,
  CLOUDINARY_ROOT,
} from '../config/cloudinary.js';
import {
  DIRECT_UPLOAD_THRESHOLD_BYTES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '../config/media.js';

const IMAGE_FORMATS = 'jpg,jpeg,png,webp';
const VIDEO_FORMATS = 'mp4,webm,mov';

// Normalises a Cloudinary SDK result into the metadata shape stored in MongoDB.
// No binary/base64 data is ever persisted — only references + metadata.
export function normalizeAsset(result, resourceType) {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type || resourceType,
    format: result.format || '',
    bytes: result.bytes || 0,
    width: result.width ?? null,
    height: result.height ?? null,
    duration: result.duration ?? null,
    folder: result.folder || '',
  };
}

// Upload an in-memory buffer (from multer) to Cloudinary.
export async function uploadBuffer(buffer, { resourceType, folder }) {
  assertCloudinaryConfigured();

  const options = {
    resource_type: resourceType,
    folder,
    use_filename: true,
    unique_filename: true,
  };

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
    stream.end(buffer);
  });

  return normalizeAsset(result, resourceType);
}

// Authoritative metadata for an asset that was uploaded directly from the
// browser. Used to verify client-supplied public ids before trusting them.
export async function fetchAsset(publicId, resourceType) {
  assertCloudinaryConfigured();
  const result = await cloudinary.api.resource(publicId, {
    resource_type: resourceType,
    type: 'upload',
  });
  return normalizeAsset(result, resourceType);
}

// Delete a single Cloudinary asset. `not found` is treated as success so the
// DB record can still be cleaned up.
export async function deleteAsset(publicId, resourceType = 'image') {
  assertCloudinaryConfigured();
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  return result;
}

// Best-effort bulk delete. Never throws: returns the list of items that failed
// so the caller can log/keep track of orphaned assets instead of losing them.
export async function deleteAssets(items = []) {
  const failures = [];
  await Promise.all(
    items.map(async ({ publicId, resourceType }) => {
      if (!publicId) return;
      try {
        await deleteAsset(publicId, resourceType || 'image');
      } catch (err) {
        failures.push({ publicId, resourceType, message: err.message });
      }
    }),
  );
  return failures;
}

// Builds a signed, short-lived upload request so the browser can stream large
// media straight to Cloudinary. The API secret is used only to sign here and
// is never sent to the client.
export async function createUploadSignature({ resourceType, folder }) {
  assertCloudinaryConfigured();

  const isImage = resourceType === 'image';
  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

  const params = {
    timestamp: Math.round(Date.now() / 1000),
    folder,
    allowed_formats: isImage ? IMAGE_FORMATS : VIDEO_FORMATS,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    ...params,
    signature,
    resourceType,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    maxBytes,
  };
}

// Optimised delivery URL for an asset. Keeps the original asset intact while
// serving a right-sized, auto-format/quality variant to the feed.
export function buildOptimizedUrl(publicId, resourceType = 'image', transform = {}) {
  if (!publicId) return '';
  const options = {
    resource_type: resourceType,
    secure: true,
    fetch_format: 'auto',
    quality: 'auto',
    ...transform,
  };
  return cloudinary.url(publicId, options);
}

// Applies a width/quality transform to a full Cloudinary URL. Falls back to the
// original URL for non-Cloudinary or unrecognised values.
export function optimizeUrl(url, transform = {}) {
  if (!url || typeof url !== 'string') return url;
  const marker = '/image/upload/';
  const videoMarker = '/video/upload/';
  const isVideo = url.includes(videoMarker);
  const markerToUse = isVideo ? videoMarker : url.includes(marker) ? marker : null;
  if (!markerToUse) return url;

  const parts = ['f_auto', 'q_auto'];
  if (transform.width) parts.push(`w_${transform.width}`);
  if (transform.height) parts.push(`h_${transform.height}`);
  if (transform.crop) parts.push(`c_${transform.crop}`);

  return url.replace(markerToUse, `${markerToUse}${parts.join(',')}/`);
}

export function isOwnedPublicId(publicId, allowedFolders) {
  if (!publicId || typeof publicId !== 'string') return false;
  if (!publicId.startsWith(`${CLOUDINARY_ROOT}/`)) return false;
  return allowedFolders.some((folder) => publicId.startsWith(`${folder}/`));
}

export { CLOUDINARY_FOLDERS, DIRECT_UPLOAD_THRESHOLD_BYTES };
