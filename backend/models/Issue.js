const mongoose = require('mongoose');

// Issue (report) document schema — MongoDB-তে যা যা field সেভ হয়
const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },          // report-এর শিরোনাম (বাধ্যতামূলক)
    area: String,                                     // area / landmark
    category: String,                                 // Roads, Water Logging, ...
    priority: { type: String, default: 'Medium' },    // Low / Medium / High
    date: String,                                     // user-এর "date noticed"
    description: String,                              // বিস্তারিত বর্ণনা
    address: String,                                  // full address (Road/Block/Thana/City)
    photos: [String],                                 // base64 photo strings (max 3)
    img: String,                                      // first photo shortcut (card thumbnail)
    statusLabel: { type: String, default: 'Open' },   // Open / In progress / Resolved
    statusClass: { type: String, default: '' },       // tailwind badge class
    up: { type: Number, default: 0 },                 // upvote count
    down: { type: Number, default: 0 },               // downvote count
    comments: { type: Number, default: 0 },           // comment count
    // কোন user report করেছে — login (protect) থেকে আসে
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  // স্বয়ংক্রিয় createdAt / updatedAt timestamp দিয়ে রাখে
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);