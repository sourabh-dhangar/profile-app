const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { otpLimiter } = require('../middleware/rateLimiter');

router.post('/request-otp', otpLimiter, requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authenticate, getMe);

module.exports = router;
