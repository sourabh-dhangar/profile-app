const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  uploadPhoto,
  publishProfile,
  checkUsername,
  getPublicProfile,
  getProfileQR,
  getVCard,
  trackProfileView,
  trackLinkClick,
  getProfileAnalytics,
  createInquiry,
  getMyInquiries,
  updateInquiryStatus,
  replyToInquiry,
  toggleFollow,
  getFollowStatus,
  getFollowers,
  vouchSkill,
} = require('../controllers/profileController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadPhoto: photoUploader } = require('../middleware/upload');

// Specific routes first
router.get('/check-username/:username', checkUsername);

// Authenticated endpoints for current user (MUST be before /:username)
router.get('/me', authenticate, getMyProfile);
router.get('/me/analytics', authenticate, getProfileAnalytics);
router.get('/me/inquiries', authenticate, getMyInquiries);
router.put('/me/inquiries/:id/status', authenticate, updateInquiryStatus);
router.post('/me/inquiries/:id/reply', authenticate, replyToInquiry);
router.put('/me', authenticate, updateMyProfile);
router.post('/me/photo', authenticate, photoUploader.single('photo'), uploadPhoto);
router.post('/me/publish', authenticate, publishProfile);

// Specific sub-resource parametric routes
router.get('/:username/qr', getProfileQR);
router.get('/:username/vcard', getVCard);
router.post('/:username/view', trackProfileView);
router.post('/:username/click', trackLinkClick);
router.post('/:username/inquiries', createInquiry);
router.post('/:username/skills/vouch', optionalAuth, vouchSkill);

// Follow / Social routes
router.post('/:username/follow', authenticate, toggleFollow);
router.get('/:username/follow-status', optionalAuth, getFollowStatus);
router.get('/:username/followers', getFollowers);

// Catch-all profile resolution
router.get('/:username', getPublicProfile);

module.exports = router;
