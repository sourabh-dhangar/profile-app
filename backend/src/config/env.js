const dotenv = require('dotenv');
dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myprofile',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  otpMode: process.env.OTP_MODE || 'dev',
  phoneHashSecret: process.env.PHONE_HASH_SECRET || 'fallback-hmac-secret',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate critical config
const required = ['mongoUri', 'jwt.secret', 'phoneHashSecret'];
for (const key of required) {
  const value = key.split('.').reduce((obj, k) => obj?.[k], config);
  if (!value || value.includes('fallback')) {
    console.warn(`⚠️  Config warning: ${key} is using a fallback value. Set it in .env for production.`);
  }
}

module.exports = config;
