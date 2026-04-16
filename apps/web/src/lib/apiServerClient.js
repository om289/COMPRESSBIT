const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiServerClient {
  async fetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const defaultOptions = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    const response = await fetch(url, defaultOptions);
    return response;
  }
}

const apiServerClient = new ApiServerClient();
export default apiServerClient;
