// One-off migration: move legacy media (base64 data URLs or /uploads files)
// from MongoDB into Cloudinary and store only metadata/references.
//
// Run once per database after configuring Cloudinary:
//   node scripts/migrateMediaToCloudinary.js
//
// Only images existed before this migration, so all legacy media is uploaded
// with resource_type "image".
import '../config/env.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Issue from '../models/Issue.js';
import { uploadBuffer } from '../services/cloudinaryService.js';
import { CLOUDINARY_FOLDERS } from '../config/cloudinary.js';
import { detectMimeType } from '../utils/mediaValidation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

// Returns { buffer, mime } for legacy base64 / on-disk values, else null.
function readLegacyMedia(value) {
  if (!value || typeof value !== 'string') return null;

  const dataUrl = value.match(DATA_URL_RE);
  if (dataUrl) {
    return { buffer: Buffer.from(dataUrl[2], 'base64'), mime: dataUrl[1] };
  }

  if (value.startsWith('/uploads/')) {
    const filePath = path.join(UPLOAD_DIR, path.basename(value));
    if (!fs.existsSync(filePath)) return null;
    const buffer = fs.readFileSync(filePath);
    return { buffer, mime: detectMimeType(buffer) };
  }

  return null;
}

async function migrateUser(user) {
  const legacy = readLegacyMedia(user.avatar);
  if (!legacy) return false;

  const asset = await uploadBuffer(legacy.buffer, {
    resourceType: 'image',
    folder: CLOUDINARY_FOLDERS.userProfile,
  });
  user.profilePicture = asset;
  user.avatar = asset.url;
  await user.save();
  return true;
}

async function migrateIssue(issue) {
  const existing = new Set((issue.media || []).map((m) => m.publicId));
  const media = [...(issue.media || [])];
  let changed = false;

  const legacyValues = [
    ...(Array.isArray(issue.photos) ? issue.photos : []),
    issue.img,
  ].filter(Boolean);

  for (const value of legacyValues) {
    const legacy = readLegacyMedia(value);
    if (!legacy) continue;
    const asset = await uploadBuffer(legacy.buffer, {
      resourceType: 'image',
      folder: CLOUDINARY_FOLDERS.issueImages,
    });
    if (!existing.has(asset.publicId)) {
      media.push(asset);
      existing.add(asset.publicId);
    }
    changed = true;
  }

  if (changed) {
    const photos = media.filter((m) => m.resourceType === 'image').map((m) => m.url);
    issue.media = media;
    issue.photos = photos;
    issue.img = photos[0] || '';
    await issue.save();
  }
  return changed;
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary env vars are not set — aborting migration.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  let users = 0;
  let issues = 0;

  for (const user of await User.find()) {
    if (await migrateUser(user)) users += 1;
  }
  for (const issue of await Issue.find()) {
    if (await migrateIssue(issue)) issues += 1;
  }

  console.log(`migrated ${users} users, ${issues} issues`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('migration error:', err.message);
  process.exit(1);
});
