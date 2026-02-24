import axios from 'axios';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('unzolo_api_override');
    if (override) return override;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://staging.unzolo.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    // Read token from client-side cookie
    const token = getCookie('admin_token_client');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Simple redirect on 401
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
