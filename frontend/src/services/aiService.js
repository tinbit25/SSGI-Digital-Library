import api from './api';

export const aiService = {
  /**
   * Send user question to RAG AI chat endpoint
   * Endpoint: POST /api/ai/chat
   */
  async sendChat(payload) {
    const response = await api.post('/ai/chat', payload);
    return response.data;
  },

  /**
   * Request AI-powered resource recommendations
   * Endpoint: POST /api/ai/recommend
   */
  async getRecommendations(payload) {
    const response = await api.post('/ai/recommend', payload);
    return response.data;
  },

  /**
   * Request AI-generated summary of a specific document
   * Endpoint: POST /api/ai/summary
   */
  async getSummary(payload) {
    const response = await api.post('/ai/summary', payload);
    return response.data;
  },
};

export default aiService;
