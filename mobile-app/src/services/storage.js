import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const AUTH_FILE_NAME = 'myprofile_auth_session.json';
const AUTH_FILE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}${AUTH_FILE_NAME}`
  : null;

// In-memory session cache for instant access
let memorySession = null;

/**
 * Persist authentication session (token & user profile) to disk and web storage.
 * Keeps user logged in across app restarts, tab switches, and reloads until explicit logout.
 */
export const saveAuthSession = async (token, user) => {
  if (!token) return;

  const payload = {
    token,
    user: user || null,
    savedAt: new Date().toISOString(),
  };

  memorySession = payload;

  // 1. Web LocalStorage (for web browsers)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('myprofile_mobile_token', token);
      if (user) {
        window.localStorage.setItem('myprofile_mobile_user', JSON.stringify(user));
      }
    }
  } catch (e) {
    // Ignore localStorage errors (e.g. private browsing quota)
  }

  // 2. Native FileSystem (Persistent on Android and iOS disk)
  try {
    if (AUTH_FILE_URI) {
      await FileSystem.writeAsStringAsync(AUTH_FILE_URI, JSON.stringify(payload));
      console.log('[AuthStorage] Session saved to disk:', AUTH_FILE_URI);
    }
  } catch (e) {
    console.log('[AuthStorage] FileSystem write error:', e?.message);
  }
};

/**
 * Retrieve saved authentication session on app start.
 */
export const loadAuthSession = async () => {
  // 1. Try Native FileSystem first
  try {
    if (AUTH_FILE_URI) {
      const info = await FileSystem.getInfoAsync(AUTH_FILE_URI);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(AUTH_FILE_URI);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.token) {
            memorySession = parsed;
            console.log('[AuthStorage] Session restored from disk for user:', parsed.user?.profile?.username || 'user');
            return parsed;
          }
        }
      }
    }
  } catch (e) {
    console.log('[AuthStorage] FileSystem read error:', e?.message);
  }

  // 2. Try Web LocalStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedToken = window.localStorage.getItem('myprofile_mobile_token');
      const savedUserStr = window.localStorage.getItem('myprofile_mobile_user');
      if (savedToken) {
        let user = null;
        if (savedUserStr) {
          try {
            user = JSON.parse(savedUserStr);
          } catch (err) {}
        }
        const session = { token: savedToken, user };
        memorySession = session;
        console.log('[AuthStorage] Session restored from localStorage');
        return session;
      }
    }
  } catch (e) {
    console.log('[AuthStorage] localStorage read error:', e?.message);
  }

  // 3. Fallback to memory
  if (memorySession && memorySession.token) {
    return memorySession;
  }

  return null;
};

/**
 * Clear authentication session explicitly (called only on user Logout).
 */
export const clearAuthSession = async () => {
  memorySession = null;

  // 1. Clear Web LocalStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('myprofile_mobile_token');
      window.localStorage.removeItem('myprofile_mobile_user');
    }
  } catch (e) {}

  // 2. Clear Native FileSystem file
  try {
    if (AUTH_FILE_URI) {
      await FileSystem.deleteAsync(AUTH_FILE_URI, { idempotent: true });
      console.log('[AuthStorage] Session file removed from disk');
    }
  } catch (e) {}
};
