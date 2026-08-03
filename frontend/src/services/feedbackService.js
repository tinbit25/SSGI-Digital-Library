import api from './api';

export const feedbackService = {
  /**
   * Submit new feedback or missing resource request
   * Endpoint: POST /api/feedback
   */
  async submitFeedback(data) {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  /**
   * Fetch feedback submissions list for Admin / Librarian
   * Endpoint: GET /api/admin/feedback
   */
  async getFeedbackList() {
    const response = await api.get('/admin/feedback');
    return response.data;
  },
};

export default feedbackService;
