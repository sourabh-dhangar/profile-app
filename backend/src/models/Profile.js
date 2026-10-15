const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/, 'Username can only contain lowercase letters, numbers, dots, hyphens and underscores'],
  },
  photoUrl: {
    type: String,
    default: '',
  },
  profileType: {
    type: String,
    enum: ['Personal', 'Creator', 'Student', 'Sportsperson', 'Teacher', 'Professional', 'Freelancer', 'ServiceProvider', 'SmallBusiness', 'Engineer', 'Designer'],
    default: 'Personal',
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
  },
  city: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'unpublished'],
    default: 'draft',
  },
  completionPercentage: {
    type: Number,
    default: 20,
    min: 0,
    max: 100,
  },
  qrCodeUrl: {
    type: String,
    default: '',
  },
  socialLinks: [{
    platform: {
      type: String,
      enum: ['instagram', 'youtube', 'facebook', 'linkedin', 'twitter', 'website', 'github'],
    },
    url: {
      type: String,
      trim: true,
    },
  }],
  contactDetails: {
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    showPhone: { type: Boolean, default: false },
    showWhatsapp: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
  },
  theme: {
    type: String,
    enum: ['default', 'dark-neon', 'minimalist-luxe', 'cyberpunk-emerald', 'sunset-gradient'],
    default: 'default',
  },
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    dailyViews: [{
      date: { type: String, required: true },
      views: { type: Number, default: 0 },
    }],
    linkClicks: [{
      label: { type: String, default: '' },
      url: { type: String, default: '' },
      count: { type: Number, default: 0 },
    }],
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  verifiedBadge: {
    type: String,
    enum: ['none', 'verified_pro', 'top_creator', 'verified_engineer', 'featured_artist'],
    default: 'verified_pro',
  },
  isVerifiedBadge: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Calculate completion percentage based on filled fields
ProfileSchema.methods.calculateCompletion = function () {
  let score = 0;
  const weights = {
    name: 15,
    photoUrl: 15,
    bio: 15,
    profileType: 10,
    city: 5,
    username: 10,
    socialLinks: 10,
    contactDetails: 10,
    // Sections contribute via external check
  };

  if (this.name) score += weights.name;
  if (this.photoUrl) score += weights.photoUrl;
  if (this.bio) score += weights.bio;
  if (this.profileType && this.profileType !== 'Personal') score += weights.profileType;
  if (this.city) score += weights.city;
  if (this.username) score += weights.username;
  if (this.socialLinks && this.socialLinks.length > 0) score += weights.socialLinks;
  if (this.contactDetails && (this.contactDetails.phone || this.contactDetails.email)) score += weights.contactDetails;

  this.completionPercentage = Math.min(score, 100);
  return this.completionPercentage;
};

module.exports = mongoose.model('Profile', ProfileSchema);
