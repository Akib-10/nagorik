// Media service — single place for all upload/validation logic used by the UI.
// Actual files always go to Cloudinary (directly, or through the backend for
// small images); MongoDB only ever receives metadata references.
import { api } from './api'

const envInt = (value, fallback) => {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// Mirrors the backend limits for UX only — the backend remains authoritative.
export const MAX_IMAGE_SIZE_MB = envInt(import.meta.env.VITE_MAX_IMAGE_SIZE_MB, 10)
export const MAX_VIDEO_SIZE_MB = envInt(import.meta.env.VITE_MAX_VIDEO_SIZE_MB, 200)
export const MAX_ISSUE_MEDIA_COUNT = envInt(import.meta.env.VITE_MAX_ISSUE_MEDIA_COUNT, 5)

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Client-side validation for UX; returns an error string or null when valid.
export function validateMediaFile(file) {
  if (!file) return 'No file selected.'
  if (!file.size) return 'The selected file is empty.'

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    return 'Unsupported file type. Use JPEG, PNG, WEBP, MP4, WEBM or MOV.'
  }
  if (isImage && file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image is too large. Maximum size is ${MAX_IMAGE_SIZE_MB} MB.`
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    return `Video is too large. Maximum size is ${MAX_VIDEO_SIZE_MB} MB.`
  }
  return null
}

export const mediaResourceType = (file) =>
  ALLOWED_VIDEO_TYPES.includes(file.type) ? 'video' : 'image'

// ---- Profile picture -------------------------------------------------------

export async function uploadProfilePicture(file) {
  const form = new FormData()
  form.append('profilePicture', file)
  const res = await api.postForm('/profile/picture', form)
  return res.data
}

export async function removeProfilePicture() {
  const res = await api.del('/profile/picture')
  return res.data
}

// ---- Direct browser -> Cloudinary upload (large media) ---------------------

async function uploadDirect(file, kind) {
  const signed = await api.post('/upload/signature', { kind })
  const data = signed.data

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', data.apiKey)
  form.append('timestamp', data.timestamp)
  form.append('signature', data.signature)
  form.append('folder', data.folder)
  form.append('allowed_formats', data.allowed_formats)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/${data.resourceType}/upload`,
    { method: 'POST', body: form },
  )
  const result = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(result?.error?.message || 'Cloudinary upload failed.')
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    duration: result.duration,
    folder: result.folder || data.folder,
  }
}

// Videos are streamed from the browser straight to Cloudinary so large files
// never pass through Express.
export function uploadIssueVideo(file) {
  return uploadDirect(file, 'issue-video')
}

// ---- Cloudinary delivery helpers ------------------------------------------

// Inserts an optimisation transform into a Cloudinary URL (keeps originals).
export function optimizedUrl(url, { width, height, crop } = {}) {
  if (!url || typeof url !== 'string') return url
  const marker = url.includes('/video/upload/')
    ? '/video/upload/'
    : url.includes('/image/upload/')
      ? '/image/upload/'
      : null
  if (!marker) return url

  const parts = ['f_auto', 'q_auto']
  if (width) parts.push(`w_${width}`)
  if (height) parts.push(`h_${height}`)
  if (crop) parts.push(`c_${crop}`)
  return url.replace(marker, `${marker}${parts.join(',')}/`)
}

// Builds a poster thumbnail URL for a Cloudinary-hosted video.
export function videoPoster(url, width = 600) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('/video/upload/')) return ''
  return url
    .replace('/video/upload/', `/video/upload/so_0,w_${width},f_jpg,q_auto/`)
    .replace(/\.(mp4|webm|mov)$/i, '.jpg')
}
