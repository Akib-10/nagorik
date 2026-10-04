import mongoose from 'mongoose';

// Report categories managed from the admin panel. The public report form reads
// this collection to fill its "Category" dropdown, so adding one here makes it
// selectable straight away. Issues store the category NAME as plain text
// (see Issue.category), so deleting a category never breaks existing reports.
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    color: { type: String, default: '#C8102E' },
  },
  { timestamps: true }
);

// Names are unique ignoring case ("Water logging" == "water logging").
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model('Category', categorySchema);
