// Configurable API URL: Use localhost or your machine LAN IP for physical device testing
export const API_BASE_URL = 'http://localhost:5000/api/v1';

export const fetchPublicProfile = async (username) => {
  const res = await fetch(`${API_BASE_URL}/profiles/${username}`);
  return res.json();
};

export const fetchReels = async () => {
  const res = await fetch(`${API_BASE_URL}/reels/feed`);
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
