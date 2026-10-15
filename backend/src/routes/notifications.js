const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All notification endpoints require user authentication
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.post('/read-all', markAllRead);

module.exports = router;
