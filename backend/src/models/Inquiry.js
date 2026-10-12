const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'Profile reference is required'],
    index: true,
  },
  senderName: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true,
    maxlength: [100, 'Sender name cannot exceed 100 characters'],
  },
  senderEmail: {
    type: String,
    required: [true, 'Sender email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  senderPhone: {
    type: String,
    trim: true,
    default: '',
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters'],
    default: 'General Inquiry',
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread',
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inquiry', InquirySchema);
