const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  targetType: {
    type: String,
    enum: ['user', 'profile', 'reel', 'report'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for audit trail queries
AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
