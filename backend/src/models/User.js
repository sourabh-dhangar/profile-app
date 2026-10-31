const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    select: false,
  },
  name: {
    type: String,
    trim: true,
  },
  mobile: {
    type: String,
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
  // OTP fields (stored temporarily for verification / recovery)
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    purpose: {
      type: String,
      enum: ['registration', 'forgot_password', 'verification', null],
      default: null,
    },
  },
}, {
  timestamps: true,
});

// Pre-save hook: Hash password with bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  // Prevent double-hashing if already a bcrypt hash
  if (typeof this.password === 'string' && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare candidate password with stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword || typeof candidatePassword !== 'string') {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
