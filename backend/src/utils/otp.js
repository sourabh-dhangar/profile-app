const config = require('../config/env');

const OTP_EXPIRY_MINUTES = 5;

const generateOtp = () => {
  if (config.otpMode === 'dev') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpExpiry = () => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + OTP_EXPIRY_MINUTES);
  return expires;
};

const sendOtp = async (mobile, code) => {
  if (config.otpMode === 'dev') {
    console.log(`\n========================================`);
    console.log(`🔑 DEV OTP FOR ${mobile}: [ ${code} ]`);
    console.log(`========================================\n`);
    return { success: true, mode: 'dev' };
  }
  // Integration point for SMS Gateway (Twilio / Fast2SMS / AWS SNS)
  console.log(`Sending SMS to ${mobile}...`);
  return { success: true, mode: 'sms' };
};

module.exports = {
  generateOtp,
  getOtpExpiry,
  sendOtp,
};
