import axios from 'axios';

// Create Axios instance consuming API base URL from Vite environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Sanctum session / CORS cookie compatibility
  timeout: 15000,        // 15 second timeout — prevents infinite hangs
});

// Request Interceptor: Attach Sanctum Bearer token from localStorage to every API request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ssgi_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global handling for auth and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Session expired — clear stale credentials and redirect to login
        localStorage.removeItem('ssgi_auth_token');
        localStorage.removeItem('ssgi_user');
        // Only redirect if not already on a public page
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
      if (error.response.status === 403) {
        console.warn('SSGI API: Access forbidden — insufficient role permissions for this endpoint.');
      }
      if (error.response.status >= 500) {
        console.error('SSGI API: Server error occurred. Laravel backend may be unavailable.', error.response.data);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.warn('SSGI API: Request timed out after 15 seconds. Backend may be offline.');
    } else {
      console.warn('SSGI API: Network error — backend server unreachable. Running in offline/mock mode.');
    }
    return Promise.reject(error);
  }
);

export default api;
