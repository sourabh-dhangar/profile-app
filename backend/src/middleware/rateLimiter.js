const rateLimit = require('express-rate-limit');

// OTP Request Limiter: max 10 requests per 10 minutes (or generous in dev mode)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.OTP_MODE === 'dev' ? 1000 : 10,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Phone Discovery Limiter: max 5 lookups per minute (or generous in dev mode)
const discoveryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.OTP_MODE === 'dev' ? 1000 : 5,
  message: {
    success: false,
    message: 'Discovery rate limit exceeded. You can only search up to 5 numbers per minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  otpLimiter,
  discoveryLimiter,
  generalLimiter,
};
