import api from './api';

export const notificationService = {
  /**
   * Fetch notification list for authenticated user
   * Endpoint: GET /api/notifications
   */
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  /**
   * Mark notification as read by ID
   * Endpoint: PUT /api/notifications/{id}/read
   */
  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
};

export default notificationService;
