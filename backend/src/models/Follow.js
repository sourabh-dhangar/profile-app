const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    followerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    followingProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only follow another user once
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', FollowSchema);
