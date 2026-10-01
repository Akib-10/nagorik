// backend/controllers/uploadController.js
// Issues short-lived, signed upload requests so the browser can stream large
// media directly to Cloudinary. Only the signature + public config is returned;
// the API secret never leaves the server.
import { createUploadSignature } from '../services/cloudinaryService.js';
import { CLOUDINARY_FOLDERS } from '../config/cloudinary.js';

const UPLOAD_TARGETS = {
  profile: {
    folder: CLOUDINARY_FOLDERS.userProfile,
    resourceType: 'image',
  },
  'issue-image': {
    folder: CLOUDINARY_FOLDERS.issueImages,
    resourceType: 'image',
  },
  'issue-video': {
    folder: CLOUDINARY_FOLDERS.issueVideos,
    resourceType: 'video',
  },
};

// POST /api/upload/signature — body: { kind: 'profile' | 'issue-image' | 'issue-video' }
export async function getUploadSignature(req, res) {
  try {
    const kind = req.body?.kind ?? req.query?.kind;
    const target = UPLOAD_TARGETS[kind];
    if (!target) {
      return res
        .status(400)
        .json({ success: false, message: 'Unknown upload kind.' });
    }

    const signed = await createUploadSignature(target);
    return res.status(200).json({
      success: true,
      message: 'Upload signature generated.',
      data: signed,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : 'Could not create upload signature.',
    });
  }
}
