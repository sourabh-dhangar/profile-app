/**
 * Utility functions for media URL normalization (Google Drive, Dropbox, cloud storage)
 */

export function normalizeMediaUrl(url, type = 'media') {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Match Google Drive file ID across all standard share and view URL formats:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
  // - https://drive.google.com/file/d/FILE_ID
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://docs.google.com/file/d/FILE_ID/...
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=|thumbnail\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const driveMatch = trimmed.match(driveRegex);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    if (type === 'image' || type === 'thumbnail') {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
    // Direct stream / download endpoint for video
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Dropbox direct link converter: dl=0 -> raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/[\?&]dl=0/, '') + (trimmed.includes('?') ? '&raw=1' : '?raw=1');
  }

  return trimmed;
}

export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com/file');
}
