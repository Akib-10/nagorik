import mongoose from 'mongoose';

// Tiny key/value store for platform-wide admin settings (one document per key).
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
