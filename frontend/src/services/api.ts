import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor de requisição: adiciona o token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: reage a 401 (não autorizado) fazendo logout automático
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      // Ignora rotas de login e recuperação de senha para não criar loop
      const isAuthRoute =
        url.includes('/auth/login') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password') ||
        url.includes('/public/register') ||
        url.includes('/public/verify-email');

      if (!isAuthRoute) {
        // Limpa credenciais
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Evita redirecionar se já está em /login (evita loop)
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;