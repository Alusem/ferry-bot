import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1'
});

// Interceptor para adicionar o token automaticamente a todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      delete api.defaults.headers.common['Authorization'];
      // Redirecionar para login se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


