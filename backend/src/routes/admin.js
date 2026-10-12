const express = require('express');
const router = express.Router();
const {
  getReports,
  resolveReport,
  getUsers,
  updateUserStatus,
  getAnalytics,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Admin & Moderator routes
router.use(authenticate);

// Reports moderation
router.get('/reports', authorize('admin', 'moderator'), getReports);
router.put('/reports/:id', authorize('admin', 'moderator'), resolveReport);

// User management (admin only)
router.get('/users', authorize('admin'), getUsers);
router.put('/users/:id/status', authorize('admin'), updateUserStatus);

// Analytics
router.get('/analytics', authorize('admin'), getAnalytics);

module.exports = router;
