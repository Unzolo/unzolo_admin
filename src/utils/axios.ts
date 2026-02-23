import axios from 'axios';

const api = axios.create({
  // All requests go to our Next.js API proxy, which adds the httpOnly token server-side.
  // This is more reliable than reading document.cookie and avoids CORS/403 issues.
  baseURL: '/api/proxy',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
