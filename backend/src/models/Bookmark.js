const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ userId: 1, reelId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
