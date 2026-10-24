import { Platform } from 'react-native';

const AUTH_FILE_NAME = 'myprofile_auth_session.json';

// Safe resolver for Expo FileSystem supporting ES imports, CJS require, and unwrap
const getFileSystemModule = () => {
  try {
    const fs = require('expo-file-system');
    if (fs) {
      if (fs.documentDirectory || fs.cacheDirectory || fs.writeAsStringAsync) {
        return fs;
      }
      if (fs.default && (fs.default.documentDirectory || fs.default.cacheDirectory || fs.default.writeAsStringAsync)) {
        return fs.default;
      }
    }
    return fs || null;
  } catch (err) {
    console.log('[AuthStorage] FileSystem loader note:', err?.message);
    return null;
  }
};

const getCandidateFileUris = () => {
  const fs = getFileSystemModule();
  const uris = [];
  if (fs) {
    if (fs.documentDirectory) {
      uris.push(`${fs.documentDirectory}${AUTH_FILE_NAME}`);
    }
    if (fs.cacheDirectory) {
      uris.push(`${fs.cacheDirectory}${AUTH_FILE_NAME}`);
    }
  }
  return uris;
};

// In-memory runtime session cache
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
  if (typeof global !== 'undefined') {
    global.__MYPROFILE_AUTH_SESSION__ = payload;
  }

  // 1. Web LocalStorage (for web browsers)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('myprofile_mobile_token', token);
      if (user) {
        window.localStorage.setItem('myprofile_mobile_user', JSON.stringify(user));
      }
      console.log('[AuthStorage] Session saved to web localStorage');
    }
  } catch (e) {
    // Ignore web private mode quota errors
  }

  // 2. Native FileSystem (Persistent on Android and iOS disk across app termination)
  try {
    const fs = getFileSystemModule();
    const uris = getCandidateFileUris();
    if (fs && fs.writeAsStringAsync && uris.length > 0) {
      const payloadStr = JSON.stringify(payload);
      for (const uri of uris) {
        try {
          await fs.writeAsStringAsync(uri, payloadStr);
          console.log('[AuthStorage] Session saved to disk:', uri);
        } catch (writeErr) {
          console.log('[AuthStorage] FileSystem write error on', uri, writeErr?.message);
        }
      }
    }
  } catch (e) {
    console.log('[AuthStorage] FileSystem save error:', e?.message);
  }
};

/**
 * Retrieve saved authentication session on app start.
 */
export const loadAuthSession = async () => {
  // 1. Try Native FileSystem disk files first (Android & iOS)
  try {
    const fs = getFileSystemModule();
    const uris = getCandidateFileUris();
    if (fs && fs.readAsStringAsync && uris.length > 0) {
      for (const uri of uris) {
        try {
          let exists = true;
          if (fs.getInfoAsync) {
            const info = await fs.getInfoAsync(uri);
            exists = Boolean(info && info.exists);
          }
          if (exists) {
            const raw = await fs.readAsStringAsync(uri);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.token) {
                memorySession = parsed;
                if (typeof global !== 'undefined') {
                  global.__MYPROFILE_AUTH_SESSION__ = parsed;
                }
                console.log(
                  '[AuthStorage] Session restored from disk:',
                  uri,
                  'user:',
                  parsed.user?.profile?.username || 'user'
                );
                return parsed;
              }
            }
          }
        } catch (readErr) {
          console.log('[AuthStorage] FileSystem read attempt note on', uri, readErr?.message);
        }
      }
    }
  } catch (e) {
    console.log('[AuthStorage] FileSystem read error:', e?.message);
  }

  // 2. Try Web LocalStorage (for web browsers)
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

  // 3. Fallback to memory / global
  if (memorySession && memorySession.token) {
    return memorySession;
  }
  if (typeof global !== 'undefined' && global.__MYPROFILE_AUTH_SESSION__?.token) {
    memorySession = global.__MYPROFILE_AUTH_SESSION__;
    return memorySession;
  }

  return null;
};

/**
 * Clear authentication session explicitly (called only on user Logout).
 */
export const clearAuthSession = async () => {
  memorySession = null;
  if (typeof global !== 'undefined') {
    delete global.__MYPROFILE_AUTH_SESSION__;
  }

  // 1. Clear Web LocalStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('myprofile_mobile_token');
      window.localStorage.removeItem('myprofile_mobile_user');
    }
  } catch (e) {}

  // 2. Clear Native FileSystem disk files
  try {
    const fs = getFileSystemModule();
    const uris = getCandidateFileUris();
    if (fs && fs.deleteAsync && uris.length > 0) {
      for (const uri of uris) {
        try {
          await fs.deleteAsync(uri, { idempotent: true });
          console.log('[AuthStorage] Session file removed from disk:', uri);
        } catch (delErr) {}
      }
    }
  } catch (e) {}
};
