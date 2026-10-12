const QRCode = require('qrcode');

/**
 * Generates a base64 Data URL for a profile URL
 */
const generateQRCodeDataURL = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};

module.exports = {
  generateQRCodeDataURL,
};
