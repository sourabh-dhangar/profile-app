const express = require('express');
const router = express.Router();
const {
  getFeed,
  getFollowingFeed,
  createReel,
  getReelById,
  recordView,
  likeReel,
  deleteReel,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/reelController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadReel: reelUploader } = require('../middleware/upload');

// Public feed & specific feeds (MUST be before /:id)
router.get('/feed', getFeed);
router.get('/feed/following', authenticate, getFollowingFeed);

// Comments routes
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, addComment);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

// Reel specific endpoints
router.get('/:id', getReelById);
router.post('/:id/view', recordView);
router.post('/:id/like', optionalAuth, likeReel);

// Authenticated endpoints
router.post('/', authenticate, reelUploader.single('video'), createReel);
router.delete('/:id', authenticate, deleteReel);

module.exports = router;
