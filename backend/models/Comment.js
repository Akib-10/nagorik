// backend/models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Replies point at the comment they answer; top-level comments have none.
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;