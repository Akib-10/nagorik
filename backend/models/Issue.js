import mongoose from 'mongoose';

// Cloudinary reference + metadata only. Never the binary/base64 file itself.
const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'video'], required: true },
    format: { type: String, default: '' },
    bytes: { type: Number, default: 0 },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    duration: { type: Number, default: null },
    folder: { type: String, default: '' },
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    priority: {
      type: String,
      default: 'Medium'
    },

    category: {
      type: String
    },

    date: {
      type: String
    },

    area: String,
    description: String,
    address: String,
    // Free-text location shown on the report card (e.g. "Dhanmondi, Dhaka
    // (23.81 N, 90.41 E)"). Submitted by the reporter; stored verbatim.
    coordsText: String,

    // Structured Cloudinary media (images and videos). This is the source of
    // truth for new uploads and supports mixed image/video lists.
    media: { type: [mediaSchema], default: [] },

    // Legacy fields kept for backward compatibility with existing docs and
    // older UI consumers. New writes mirror the image URLs here.
    photos: [String],
    img: String,

    statusLabel: { type: String, default: 'Open' },
    statusClass: { type: String, default: '' },

    // Admin moderation. New reports are published immediately ("approved"); an
    // admin can still take one down later by flagging it as spam or rejecting
    // it, which hides it from the public feed (see issueController.js). Its
    // reporter can still see it on their profile. Documents created before this
    // field existed have no value and are treated as "approved".
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'spam', 'rejected'],
      default: 'approved',
    },
    moderatedAt: { type: Date, default: null },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
