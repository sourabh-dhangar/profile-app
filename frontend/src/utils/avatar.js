export const DEFAULT_AVATAR_ICON =
  'https://ui-avatars.com/api/?name=%20&background=1e293b&color=94a3b8&size=256';

export const getProfileAvatar = (photoUrl, name = '') => {
  if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim().length > 0 && !photoUrl.includes('photo-1534528741775')) {
    return photoUrl;
  }
  if (name && typeof name === 'string' && name.trim().length > 0) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1e293b&color=10b981&bold=true&size=256`;
  }
  return DEFAULT_AVATAR_ICON;
};

export default getProfileAvatar;
