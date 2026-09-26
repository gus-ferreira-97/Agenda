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

// Rotas cujo 401 não deve disparar logout automático
// (evita loop em chamadas anônimas ou de fluxo de auth)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Interceptor de resposta: reage a 401 (não autorizado) fazendo logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthRoute = AUTH_ROUTES.some((route) => url.includes(route));

      if (!isAuthRoute) {
        // Limpa storage imediatamente (evita requests subsequentes com token morto)
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Notifica o AuthContext para limpar state e Sentry sem force reload
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export default api;