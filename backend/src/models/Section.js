const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['about', 'experience', 'education', 'skills', 'services', 'achievements', 'photos', 'portfolio', 'awards', 'videos', 'products', 'rate_card', 'menu', 'faq', 'business_info'],
    required: [true, 'Section type is required'],
  },
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  order: {
    type: Number,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ['public', 'profile-only', 'private'],
    default: 'public',
  },
}, {
  timestamps: true,
});

// Compound index for efficient ordered section queries
SectionSchema.index({ profileId: 1, order: 1 });

module.exports = mongoose.model('Section', SectionSchema);
