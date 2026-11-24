import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.startsWith('http://') || rawBaseUrl.startsWith('https://')
  ? rawBaseUrl
  : `https://${rawBaseUrl}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach bearer token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medtrax_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Avoid infinite loop on auth endpoints
    if (
      originalRequest.url?.includes('/api/auth/refresh-token/') ||
      originalRequest.url?.includes('/api/auth/login/') ||
      originalRequest.url?.includes('/api/auth/signup/')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const storedRefreshToken = localStorage.getItem('medtrax_refresh_token');
        const refreshRes = await api.post('/api/auth/refresh-token/', {
          refresh_token: storedRefreshToken || undefined,
        });
        if (refreshRes.data?.access_token) {
          localStorage.setItem('medtrax_token', refreshRes.data.access_token);
        }
        if (refreshRes.data?.refresh_token) {
          localStorage.setItem('medtrax_refresh_token', refreshRes.data.refresh_token);
        }
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('medtrax_user');
        localStorage.removeItem('medtrax_token');
        localStorage.removeItem('medtrax_refresh_token');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;