/**
 * Utility functions for media URL normalization (Google Drive, Dropbox, cloud storage)
 */

export function getGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim().replace(/^["']|["']$/g, '');
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=|thumbnail\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/;
  const driveMatch = trimmed.match(driveRegex);
  return driveMatch ? driveMatch[1] : null;
}

export function getGoogleDrivePreviewUrl(url) {
  const fileId = getGoogleDriveFileId(url);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

export function normalizeMediaUrl(url, type = 'media') {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim().replace(/^["']|["']$/g, '');

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

  // Cloudinary streaming optimization: auto quality & auto format (H.264/AAC fast stream)
  if (trimmed.includes('cloudinary.com') && (type === 'video' || trimmed.includes('/video/upload/'))) {
    if (!trimmed.includes('/q_auto')) {
      return trimmed.replace('/video/upload/', '/video/upload/q_auto,f_auto/');
    }
  }

  return trimmed;
}

/**
 * Creates an instant poster frame (.jpg at 0s) from a Cloudinary video URL.
 * Enables zero-buffer, instant preview before the video begins playing.
 */
export function getCloudinaryThumbnail(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  const jpgUrl = url.replace(/\.(mp4|mov|webm|mkv|m4v)($|\?)/i, '.jpg$2');
  if (jpgUrl.includes('/so_0')) return jpgUrl;
  return jpgUrl.replace(
    /\/video\/upload\/(?:q_auto,f_auto\/)?/,
    '/video/upload/so_0,q_auto,f_auto,w_720/'
  );
}

export function isGoogleDriveUrl(url) {
  return Boolean(getGoogleDriveFileId(url));
}
