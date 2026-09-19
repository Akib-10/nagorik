// One-off migration: convert base64 images stored on existing Issue docs to
// files in uploads/ and replace them with /uploads URLs. Run once per DB.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Issue from '../models/Issue.js';
import { saveBase64Image } from '../services/fileStorage.js';

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const issues = await Issue.find();
  let converted = 0;
  for (const doc of issues) {
    let changed = false;
    if (Array.isArray(doc.photos)) {
      for (let i = 0; i < doc.photos.length; i++) {
        if (doc.photos[i] && doc.photos[i].startsWith('data:image/')) {
          doc.photos[i] = saveBase64Image(doc.photos[i]);
          changed = true;
        }
      }
      if (changed) doc.markModified('photos');
    }
    if (doc.img && doc.img.startsWith('data:image/')) {
      doc.img = saveBase64Image(doc.img);
      changed = true;
    }
    if (changed) {
      await doc.save();
      converted += 1;
    }
  }
  console.log(`migrated ${converted} issues`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('migration error:', err.message);
  process.exit(1);
});