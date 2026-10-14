const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    reelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ reelId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
