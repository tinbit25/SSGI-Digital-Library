import api from './api';

export const searchService = {
  /**
   * Search for resources using metadata (MySQL filters)
   * Endpoint: GET /api/search
   */
  async searchMetadata(filters) {
    const response = await api.get('/resources/search', { params: filters });
    return response.data;
  },

  /**
   * Semantic search using Qdrant/RAG (AI Assistant)
   * Endpoint: POST /api/ai/search
   */
  async searchSemantic(query) {
    const response = await api.post('/ai/search', { query });
    return response.data;
  }
};

export default searchService;
