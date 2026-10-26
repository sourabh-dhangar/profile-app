const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'gphexfmz',
  api_key: process.env.CLOUDINARY_API_KEY || '969249891311492',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'XiBXEinl9MwLCfJ6KZmQTKnQcOg',
  secure: true,
});

/**
 * Optimizes a Cloudinary video URL for Instagram-style fast streaming:
 * Injects q_auto,f_auto into the path.
 */
function optimizeCloudinaryVideoUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  if (url.includes('/q_auto')) return url;
  return url.replace('/video/upload/', '/video/upload/q_auto,f_auto/');
}

/**
 * Generates an instant first-frame poster thumbnail from a Cloudinary video URL:
 * Changes extension to .jpg and adds so_0 (start-offset 0), q_auto, f_auto, w_720.
 */
function getCloudinaryVideoThumbnail(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  const jpgUrl = url.replace(/\.(mp4|mov|webm|mkv|m4v)($|\?)/i, '.jpg$2');
  if (jpgUrl.includes('/so_0')) return jpgUrl;
  return jpgUrl.replace(
    /\/video\/upload\/(?:q_auto,f_auto\/)?/,
    '/video/upload/so_0,q_auto,f_auto,w_720/'
  );
}

module.exports = {
  cloudinary,
  optimizeCloudinaryVideoUrl,
  getCloudinaryVideoThumbnail,
};
