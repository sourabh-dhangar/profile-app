const express = require('express');
const router = express.Router();
const {
  searchByPhone,
  getDiscoverySettings,
  updateDiscoverySettings,
} = require('../controllers/discoveryController');
const { authenticate } = require('../middleware/auth');
const { discoveryLimiter } = require('../middleware/rateLimiter');

// Search endpoint with strict 5-per-minute rate limit and 404 on privacy/not-found
router.post('/search-by-phone', discoveryLimiter, searchByPhone);

// Privacy settings for current user
router.get('/settings', authenticate, getDiscoverySettings);
router.put('/settings', authenticate, updateDiscoverySettings);

module.exports = router;
