import api from './api';

export const adminService = {
  /**
   * Fetch all users with roles
   * Endpoint: GET /api/admin/users
   */
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  /**
   * Update user role
   * Endpoint: PUT /api/admin/users/{id}/role
   */
  async updateUserRole(id, role) {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Deactivate a user account
   * Endpoint: DELETE /api/admin/users/{id}
   */
  async deactivateUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Fetch system activity reports
   * Endpoint: GET /api/admin/reports
   */
  async getReports() {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  /**
   * Fetch document access logs
   * Endpoint: GET /api/admin/reports/access-logs
   */
  async getAccessLogs() {
    const response = await api.get('/admin/reports/access-logs');
    return response.data;
  },
};

export default adminService;
