import mongoose from 'mongoose';

const { Schema } = mongoose;

const actorSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, default: '' },
    actedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['status', 'upvote', 'comment', 'system', 'moderation'],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    targetType: {
      type: String,
      enum: ['Issue', 'Comment', null],
      default: null,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      refPath: 'targetType',
      default: null,
    },

    // Denormalized issue behind the notification. Comment notifications point
    // at a Comment, which has no frontend route of its own, so clients need
    // the owning issue to build a link. Backfilled on write for every type
    // that has an issue behind it.
    issueId: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },

    actors: { type: [actorSchema], default: [] },
    actorCount: { type: Number, default: 0 },

    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isDeleted: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, targetId: 1, read: 1 });

export default mongoose.model('Notification', notificationSchema);