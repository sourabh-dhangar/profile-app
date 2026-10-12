const crypto = require('crypto');
const config = require('../config/env');

/**
 * Normalizes phone number: strips non-numeric chars except leading +,
 * ensures standard country code format (e.g. +91XXXXXXXXXX)
 */
const normalizePhone = (phone, countryCode = '+91') => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (!cleaned.startsWith('+')) {
    // If standard 10 digit Indian number without country code
    if (cleaned.length === 10) {
      cleaned = countryCode + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
};

/**
 * Creates deterministic HMAC-SHA256 hash using the secret key.
 * This guarantees privacy while allowing lookup matches.
 */
const hashPhone = (phone, countryCode = '+91') => {
  const normalized = normalizePhone(phone, countryCode);
  return crypto
    .createHmac('sha256', config.phoneHashSecret)
    .update(normalized)
    .digest('hex');
};

module.exports = {
  normalizePhone,
  hashPhone,
};
