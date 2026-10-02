// backend/middleware/upload.js
// Multer config: files are kept in memory only long enough to validate and
// stream them to Cloudinary. Nothing is ever written to the server filesystem.
import multer from 'multer';
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  MAX_ISSUE_MEDIA_COUNT,
  MAX_PROFILE_PICTURE_BYTES,
  MAX_VIDEO_BYTES,
} from '../config/media.js';

const memoryStorage = multer.memoryStorage();

// Lightweight pre-filter based on the declared MIME type. This only guards
// against obviously-wrong uploads; the authoritative check is magic-byte
// sniffing in utils/mediaValidation.js after the buffer is available.
function mediaFileFilter(req, file, cb) {
  if (file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('video/')) {
    return cb(null, true);
  }
  const err = new Error('Only image or video files can be uploaded.');
  err.code = 'UNSUPPORTED_TYPE';
  return cb(err);
}

function imageFileFilter(req, file, cb) {
  if (ALLOWED_IMAGE_MIME.includes(file.mimetype) || file.mimetype?.startsWith('image/')) {
    return cb(null, true);
  }
  const err = new Error('Only JPEG, PNG or WEBP images can be uploaded.');
  err.code = 'UNSUPPORTED_TYPE';
  return cb(err);
}

function toExpressHandler(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        const messages = {
          LIMIT_FILE_SIZE: `File is too large. Images max ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB, videos max ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB.`,
          LIMIT_FILE_COUNT: `Too many files. Maximum is ${MAX_ISSUE_MEDIA_COUNT}.`,
          LIMIT_UNEXPECTED_FILE: `Unexpected file field "${err.field}".`,
        };
        return res.status(400).json({
          success: false,
          message: messages[err.code] || 'Upload failed.',
          code: err.code,
        });
      }

      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'Upload failed.',
        code: err.code,
      });
    });
  };
}

const issueUploader = multer({
  storage: memoryStorage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: MAX_VIDEO_BYTES,
    files: MAX_ISSUE_MEDIA_COUNT,
  },
});

const profileUploader = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_PROFILE_PICTURE_BYTES,
    files: 1,
  },
});

export const uploadIssueMedia = toExpressHandler(
  issueUploader.array('media', MAX_ISSUE_MEDIA_COUNT),
);

export const uploadProfilePicture = toExpressHandler(
  profileUploader.single('profilePicture'),
);
