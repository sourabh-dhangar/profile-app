const express = require('express');
const router = express.Router();
const {
  registerRequestOtp,
  registerVerify,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  requestOtp,
  verifyOtp,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { otpLimiter } = require('../middleware/rateLimiter');

// Registration Flow
router.post('/register/request-otp', otpLimiter, registerRequestOtp);
router.post('/register/verify', registerVerify);

// Login & Password Flow
router.post('/login', login);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// User Profile & Session
router.get('/me', authenticate, getMe);

// Legacy Aliases
router.post('/request-otp', otpLimiter, requestOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
