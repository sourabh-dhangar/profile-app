import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if JWT token is stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('myprofile_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('myprofile_token');
      localStorage.removeItem('myprofile_user');
      // optional redirect if needed
    }
    return Promise.reject(error);
  }
);

export default api;
