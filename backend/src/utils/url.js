/**
 * URL Utilities for normalizing Google Drive, Dropbox, and cloud storage links
 * to direct streamable media and high-resolution thumbnail URLs.
 */

/**
 * URL Utilities for normalizing Google Drive, Dropbox, and cloud storage links
 * to direct streamable media and high-resolution thumbnail URLs.
 */

function getGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim().replace(/^["']|["']$/g, '');
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=|thumbnail\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/;
  const match = trimmed.match(driveRegex);
  return match ? match[1] : null;
}

function getGoogleDrivePreviewUrl(url) {
  const fileId = getGoogleDriveFileId(url);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

function isGoogleDriveUrl(url) {
  return Boolean(getGoogleDriveFileId(url));
}

function normalizeMediaUrl(url, type = 'video') {
  if (!url || typeof url !== 'string') return url;
  let trimmed = url.trim().replace(/^["']|["']$/g, '');

  const fileId = getGoogleDriveFileId(trimmed);
  if (fileId) {
    if (type === 'image' || type === 'thumbnail' || type === 'photo') {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
    // Direct stream / download endpoint for video
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Dropbox direct link converter: dl=0 -> raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/[\?&]dl=0/, '') + (trimmed.includes('?') ? '&raw=1' : '?raw=1');
  }

  // Cloudinary optimization for video streaming (q_auto,f_auto)
  if (trimmed.includes('cloudinary.com') && (type === 'video' || trimmed.includes('/video/upload/'))) {
    if (!trimmed.includes('/q_auto')) {
      return trimmed.replace('/video/upload/', '/video/upload/q_auto,f_auto/');
    }
  }

  return trimmed;
}

function getCloudinaryThumbnail(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  const jpgUrl = url.replace(/\.(mp4|mov|webm|mkv|m4v)($|\?)/i, '.jpg$2');
  if (jpgUrl.includes('/so_0')) return jpgUrl;
  return jpgUrl.replace(
    /\/video\/upload\/(?:q_auto,f_auto\/)?/,
    '/video/upload/so_0,q_auto,f_auto,w_720/'
  );
}

module.exports = {
  normalizeMediaUrl,
  getCloudinaryThumbnail,
  getGoogleDriveFileId,
  getGoogleDrivePreviewUrl,
  isGoogleDriveUrl,
};
