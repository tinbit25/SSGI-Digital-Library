import api from './api';

export const resourceService = {
  /** GET /api/resources */
  async getResources(params = {}) {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  /** GET /api/resources/{id} */
  async getResourceById(id) {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  /** GET /api/resources/{id}/viewer */
  async getViewerData(id, page = 1) {
    const response = await api.get(`/resources/${id}/viewer`, { params: { page } });
    return response.data;
  },

  /** GET /api/categories */
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Upload new resource with metadata and files
   * Endpoint: POST /api/resources
   * Uses multipart/form-data for file upload
   */
  async createResource(formData) {
    const response = await api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update resource metadata
   * Endpoint: PUT /api/resources/{id}
   */
  async updateResource(id, data) {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  },

  /**
   * Archive (soft-delete) a resource
   * Endpoint: DELETE /api/resources/{id}
   */
  async archiveResource(id) {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },

  /**
   * Create a new category
   * Endpoint: POST /api/categories
   */
  async createCategory(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },

  /**
   * Update an existing category
   * Endpoint: PUT /api/categories/{id}
   */
  async updateCategory(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
};

export default resourceService;
