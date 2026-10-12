const mongoose = require('mongoose');

const ProfileLookupSchema = new mongoose.Schema({
  hashedPhone: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  allowDiscovery: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProfileLookup', ProfileLookupSchema);
