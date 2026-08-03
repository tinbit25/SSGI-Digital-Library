import api from './api';

export const authService = {
  /**
   * Send login credentials to backend
   * Endpoint: POST /api/login
   */
  async login(credentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  /**
   * Send new user registration payload to backend
   * Endpoint: POST /api/register
   */
  async register(userData) {
    const response = await api.post('/register', userData);
    return response.data;
  },

  /**
   * Revoke authentication session
   * Endpoint: POST /api/logout
   */
  async logout() {
    const response = await api.post('/logout');
    return response.data;
  },

  /**
   * Fetch authenticated user details
   * Endpoint: GET /api/profile
   */
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },
};

export default authService;
