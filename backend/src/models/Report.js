const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['profile', 'reel'],
    required: [true, 'Report target type is required'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reason: {
    type: String,
    required: [true, 'Report reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending',
    index: true,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'takedown', 'suspension'],
    default: 'none',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Report', ReportSchema);
