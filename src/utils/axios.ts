import axios from 'axios';

const api = axios.create({
  baseURL: '/api/proxy',
  headers: { 'Content-Type': 'application/json' },
});

if (typeof window !== 'undefined') {
  console.log('[Axios] Initialized with baseURL:', api.defaults.baseURL);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
