const express = require('express');
const router = express.Router();
const {
  getFeed,
  createReel,
  getReelById,
  recordView,
  likeReel,
  deleteReel,
} = require('../controllers/reelController');
const { authenticate } = require('../middleware/auth');
const { uploadReel: reelUploader } = require('../middleware/upload');

// Public endpoints
router.get('/feed', getFeed);
router.get('/:id', getReelById);
router.post('/:id/view', recordView);

// Authenticated endpoints
router.post('/', authenticate, reelUploader.single('video'), createReel);
router.post('/:id/like', authenticate, likeReel);
router.delete('/:id', authenticate, deleteReel);

module.exports = router;
