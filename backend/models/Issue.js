const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    area: String,
    category: String,
    priority: { type: String, default: 'Medium' },
    date: String,
    description: String,
    address: String,
    photos: [String],
    img: String,
    statusLabel: { type: String, default: 'Open' },
    statusClass: { type: String, default: '' },
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);