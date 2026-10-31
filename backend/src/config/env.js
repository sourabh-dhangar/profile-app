const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const FRONTEND_PRODUCTION_URL = 'https://myprofile-official-web.vercel.app';
const API_PRODUCTION_URL = 'https://myprofile-official-api.vercel.app';

let frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl || (isProduction && frontendUrl.includes('localhost'))) {
  frontendUrl = FRONTEND_PRODUCTION_URL;
}

let publicUrl = process.env.PUBLIC_URL;
if (!publicUrl || (isProduction && publicUrl.includes('localhost'))) {
  publicUrl = API_PRODUCTION_URL;
}

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
  publicUrl,
  frontendUrl,
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'MyProfile <noreply@myprofile.com>',
  },
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
