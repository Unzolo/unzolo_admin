import axios from 'axios';
import { toast } from 'sonner';

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
    const message = error.response?.data?.message || error.message || "An error occurred";
    
    if (error.response?.status === 401) {
      toast.error(`Session Expired: ${message}`, { duration: 5000 });
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error(`Permission Denied: ${message}`, { duration: 5000 });
      // Don't redirect on 403 so they can see the error
    } else {
      toast.error(message, { duration: 4000 });
    }
    return Promise.reject(error);
  }
);

export default api;
