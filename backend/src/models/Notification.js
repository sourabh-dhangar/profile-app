const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      default: null,
    },
    type: {
      type: String,
      enum: ['like', 'follow', 'bookmark', 'inquiry', 'comment', 'vouch', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entityType: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user notifications in reverse chronological order
NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
