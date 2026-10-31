const nodemailer = require('nodemailer');
const config = require('./env');

let transporter = null;

const isSmtpConfigured = () => {
  return Boolean(config.smtp?.host && config.smtp?.user && config.smtp?.pass);
};

const getTransporter = () => {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    try {
      transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });
    } catch (err) {
      console.warn('⚠️  Failed to initialize Nodemailer SMTP transporter:', err.message);
      transporter = null;
    }
  }
  return transporter;
};

/**
 * Base email dispatch with dev resilience fallback
 */
const sendMail = async ({ to, subject, html, text, otp }) => {
  const activeTransporter = getTransporter();

  // If SMTP is properly configured, attempt real email delivery
  if (activeTransporter && isSmtpConfigured()) {
    try {
      const info = await activeTransporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        text,
        html,
      });
      console.log(`📧 [Nodemailer] Email successfully dispatched to ${to}. MessageId: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (sendError) {
      console.warn(`⚠️ [Nodemailer] SMTP send error: ${sendError.message}`);
      throw new Error(`Failed to deliver email to ${to}: ${sendError.message}`);
    }
  }

  throw new Error('SMTP email service is not configured. Please check SMTP settings.');
};

/**
 * Send 6-Digit Email Registration Verification Code
 */
const sendRegistrationOtp = async (email, otp) => {
  const subject = `${otp} is your MyProfile verification code`;
  const text = `Welcome to MyProfile!\n\nYour 6-digit registration verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .brand { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: -0.5px; margin-bottom: 24px; }
        h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; }
        .otp-box { background: #0b0f19; border: 2px dashed #10b981; border-radius: 12px; text-align: center; padding: 18px; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #10b981; }
        .expiry { font-size: 12px; color: #64748b; margin-top: 6px; }
        .footer { border-top: 1px solid #1e293b; padding-top: 18px; font-size: 11px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">✨ MyProfile Platform</div>
        <h1>Verify your email address</h1>
        <p>Thank you for starting your creator journey. Please use the verification code below to complete your account setup and publish your digital profile:</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="expiry">Valid for 10 minutes • Do not share this code with anyone</div>
        </div>

        <p>If you did not request this account registration, you can safely ignore this email.</p>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} MyProfile. Empowering digital identities & creators worldwide.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({ to: email, subject, text, html, otp });
};

/**
 * Send 6-Digit Password Reset OTP
 */
const sendPasswordResetOtp = async (email, otp) => {
  const subject = `${otp} is your MyProfile password reset code`;
  const text = `Reset your MyProfile password\n\nYour 6-digit password reset code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request a password reset, please secure your account immediately.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .brand { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; margin-bottom: 24px; }
        h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; }
        .otp-box { background: #0b0f19; border: 2px dashed #38bdf8; border-radius: 12px; text-align: center; padding: 18px; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; }
        .expiry { font-size: 12px; color: #64748b; margin-top: 6px; }
        .alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 12px; font-size: 12px; color: #f87171; margin-bottom: 16px; }
        .footer { border-top: 1px solid #1e293b; padding-top: 18px; font-size: 11px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">🔒 MyProfile Security</div>
        <h1>Password Reset Request</h1>
        <p>We received a request to reset the password for your MyProfile account. Use the code below to set a new password:</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="expiry">Valid for 10 minutes • Expires soon</div>
        </div>

        <div class="alert">
          <strong>Security Notice:</strong> If you did not make this request, someone else may be attempting to access your account.
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} MyProfile. Empowering digital identities & creators worldwide.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({ to: email, subject, text, html, otp });
};

module.exports = {
  sendMail,
  sendRegistrationOtp,
  sendPasswordResetOtp,
};
