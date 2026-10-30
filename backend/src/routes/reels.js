const express = require('express');
const router = express.Router();
const {
  getFeed,
  getFollowingFeed,
  getSavedReels,
  toggleBookmark,
  togglePinReel,
  createReel,
  getReelById,
  recordView,
  likeReel,
  shareReel,
  deleteReel,
  addComment,
  getComments,
  deleteComment,
  getMyReels,
  updateReel,
  updateReelVisibility,
  streamReelVideo,
  uploadMedia,
  getCloudinaryConfig,
} = require('../controllers/reelController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadReel: reelUploader } = require('../middleware/upload');

// Public feed & specific feeds (MUST be before /:id)
router.get('/cloudinary-config', getCloudinaryConfig);
router.get('/my-reels', authenticate, getMyReels);
router.get('/feed', getFeed);
router.get('/feed/following', authenticate, getFollowingFeed);
router.get('/feed/saved', authenticate, getSavedReels);

// Cloudinary media direct upload endpoint
router.post('/upload', authenticate, reelUploader.single('media'), uploadMedia);

// Comments routes
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, addComment);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

// Reel specific endpoints
router.get('/:id/stream', streamReelVideo);
router.get('/:id', getReelById);
router.post('/:id/view', recordView);
router.post('/:id/like', optionalAuth, likeReel);
router.post('/:id/share', optionalAuth, shareReel);
router.post('/:id/bookmark', authenticate, toggleBookmark);
router.post('/:id/pin', authenticate, togglePinReel);

// Authenticated endpoints
router.post('/', authenticate, reelUploader.single('video'), createReel);
router.put('/:id/visibility', authenticate, updateReelVisibility);
router.put('/:id', authenticate, updateReel);
router.delete('/:id', authenticate, deleteReel);

module.exports = router;
