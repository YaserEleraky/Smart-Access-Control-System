import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  timeout: 5000, // 5 second timeout
});

// Add request interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout: Backend may be offline");
    } else if (!error.response) {
      console.error("Network error: Backend may be unreachable");
    }
    return Promise.reject(error);
  }
);

export default api;