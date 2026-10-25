export const DEFAULT_AVATAR_ICON =
  'https://ui-avatars.com/api/?name=%20&background=1e293b&color=94a3b8&size=256';

export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim().replace(/^["']|["']$/g, '');

  // Google Drive link converter
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=|thumbnail\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  }

  // Dropbox link converter
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/[\?&]dl=0/, '') + (trimmed.includes('?') ? '&raw=1' : '?raw=1');
  }

  return trimmed;
};

export const getProfileAvatar = (photoUrl, name = '') => {
  if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim().length > 0 && !photoUrl.includes('photo-1534528741775')) {
    return normalizeImageUrl(photoUrl);
  }
  if (name && typeof name === 'string' && name.trim().length > 0) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1e293b&color=10b981&bold=true&size=256`;
  }
  return DEFAULT_AVATAR_ICON;
};

export default getProfileAvatar;
