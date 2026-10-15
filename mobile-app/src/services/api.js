// Configurable API URL: Supports EXPO_PUBLIC_API_URL or defaults to localhost/live Vercel API
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:5000/api/v1'
    : 'https://backend-eight-black-60.vercel.app/api/v1');

export const fetchPublicProfile = async (username) => {
  const res = await fetch(`${API_BASE_URL}/profiles/${username}`);
  return res.json();
};

export const fetchMyProfile = async (token) => {
  const res = await fetch(`${API_BASE_URL}/profiles/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const updateMyProfile = async (token, profileData) => {
  const res = await fetch(`${API_BASE_URL}/profiles/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return res.json();
};

export const fetchReels = async (page = 1, limit = 20, tag = '', search = '') => {
  let url = `${API_BASE_URL}/reels/feed?page=${page}&limit=${limit}`;
  if (tag && tag.toLowerCase() !== 'all') {
    url += `&tag=${encodeURIComponent(tag)}`;
  }
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  const res = await fetch(url);
  return res.json();
};

export const searchByPhone = async (phone, countryCode = '+91') => {
  const res = await fetch(`${API_BASE_URL}/discovery/search-by-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, countryCode }),
  });
  return res.json();
};

export const requestOtp = async (mobile, countryCode = '+91') => {
  const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, countryCode }),
  });
  return res.json();
};

export const verifyOtp = async (mobile, otp, countryCode = '+91') => {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp, countryCode }),
  });
  return res.json();
};

export const getVCardUrl = (username) => `${API_BASE_URL}/profiles/${username}/vcard`;

export const createSection = async (token, sectionData) => {
  const res = await fetch(`${API_BASE_URL}/sections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sectionData),
  });
  return res.json();
};

export const updateSection = async (token, sectionId, sectionData) => {
  const res = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sectionData),
  });
  return res.json();
};

export const deleteSection = async (token, sectionId) => {
  const res = await fetch(`${API_BASE_URL}/sections/${sectionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const trackProfileView = async (username) => {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/${username}/view`, { method: 'POST' });
    return res.json();
  } catch (e) {
    return { success: false };
  }
};

export const trackLinkClick = async (username, label, url) => {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/${username}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, url }),
    });
    return res.json();
  } catch (e) {
    return { success: false };
  }
};


export const createReel = async (token, reelData) => {
  const res = await fetch(`${API_BASE_URL}/reels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reelData),
  });
  return res.json();
};

export const likeReelApi = async (reelId, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}/reels/${reelId}/like`, {
    method: 'POST',
    headers,
  });
  return res.json();
};

export const recordReelView = async (reelId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/view`, {
      method: 'POST',
    });
    return res.json();
  } catch (e) {
    return { success: false };
  }
};

export const deleteReelApi = async (token, reelId) => {
  const res = await fetch(`${API_BASE_URL}/reels/${reelId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const fetchProfileAnalytics = async (token) => {
  const res = await fetch(`${API_BASE_URL}/profiles/me/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const sendInquiry = async (username, inquiryData) => {
  const res = await fetch(`${API_BASE_URL}/profiles/${username}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inquiryData),
  });
  return res.json();
};

export const fetchMyInquiries = async (token, status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE_URL}/profiles/me/inquiries${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const updateInquiryStatus = async (token, inquiryId, status) => {
  const res = await fetch(`${API_BASE_URL}/profiles/me/inquiries/${inquiryId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// ==========================================
// Super Admin Platform APIs
// ==========================================
export const fetchAdminUsers = async (token, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  const qs = searchParams.toString();
  const url = `${API_BASE_URL}/admin/users${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const fetchAdminAnalytics = async (token) => {
  const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const updateAdminUserStatus = async (token, userId, updates) => {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return res.json();
};

export const fetchAdminReports = async (token) => {
  const res = await fetch(`${API_BASE_URL}/admin/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const resolveAdminReport = async (token, reportId, data) => {
  const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchReelComments = async (reelId) => {
  const res = await fetch(`${API_BASE_URL}/reels/${reelId}/comments`);
  return res.json();
};

export const addReelComment = async (token, reelId, text) => {
  const res = await fetch(`${API_BASE_URL}/reels/${reelId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
  return res.json();
};

export const deleteReelComment = async (token, reelId, commentId) => {
  const res = await fetch(`${API_BASE_URL}/reels/${reelId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const fetchFollowingReels = async (token, page = 1, limit = 20) => {
  const res = await fetch(`${API_BASE_URL}/reels/feed/following?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const toggleFollowCreator = async (token, username) => {
  const res = await fetch(`${API_BASE_URL}/profiles/${username}/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const checkFollowStatus = async (token, username) => {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/profiles/${username}/follow-status`, { headers });
  return res.json();
};

export const fetchFollowers = async (username) => {
  const res = await fetch(`${API_BASE_URL}/profiles/${username}/followers`);
  return res.json();
};

export const toggleBookmarkReel = async (token, reelId) => {
  const res = await fetch(`${API_BASE_URL}/reels/${reelId}/bookmark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const fetchSavedReels = async (token, page = 1, limit = 20) => {
  const res = await fetch(`${API_BASE_URL}/reels/feed/saved?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const replyToInquiry = async (token, inquiryId, message) => {
  const res = await fetch(`${API_BASE_URL}/profiles/me/inquiries/${inquiryId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  return res.json();
};

// ==========================================
// Notifications & Expansion Hub APIs
// ==========================================
export const fetchNotifications = async (token, page = 1, limit = 20) => {
  const res = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const markNotificationRead = async (token, notificationId) => {
  const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const markAllNotificationsRead = async (token) => {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const togglePinReel = async (token, reelId) => {
  const res = await fetch(`${API_BASE_URL}/reels/${reelId}/pin`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const vouchSkill = async (token, username, skillName) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}/profiles/${username}/skills/vouch`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ skillName }),
  });
  return res.json();
};



