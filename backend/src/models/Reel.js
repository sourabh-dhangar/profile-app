const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    maxlength: [300, 'Caption cannot exceed 300 characters'],
    default: '',
  },
  durationSeconds: {
    type: Number,
    required: [true, 'Duration is required'],
    max: [60, 'Reel duration cannot exceed 60 seconds'],
  },
  visibility: {
    type: String,
    enum: ['public', 'profile-only', 'private'],
    default: 'public',
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'flagged', 'taken_down'],
    default: 'active',
    index: true,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  bookmarksCount: {
    type: Number,
    default: 0,
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true,
  },
  audioTrack: {
    title: {
      type: String,
      default: 'Original Sound',
      trim: true,
    },
    artist: {
      type: String,
      default: 'Creator',
      trim: true,
    },
  },
}, {
  timestamps: true,
});

// Index for feed queries: active + public + newest first
ReelSchema.index({ status: 1, visibility: 1, createdAt: -1 });

module.exports = mongoose.model('Reel', ReelSchema);
