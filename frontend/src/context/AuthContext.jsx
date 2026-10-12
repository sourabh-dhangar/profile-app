import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('myprofile_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data.user);
          setProfile(res.data.data.profile);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = (newToken, userData, profileData) => {
    localStorage.setItem('myprofile_token', newToken);
    setToken(newToken);
    setUser(userData);
    setProfile(profileData);
  };

  const logout = () => {
    localStorage.removeItem('myprofile_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, token, loading, login, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
