const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    index: true,
    trim: true,
  },
  countryCode: {
    type: String,
    default: '+91',
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user',
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active',
  },
  ageConsent: {
    isAdult: { type: Boolean, default: true },
    guardianConsent: { type: Boolean, default: false },
  },
  // OTP fields (stored temporarily for verification)
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Index for OTP cleanup
UserSchema.index({ 'otp.expiresAt': 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', UserSchema);
