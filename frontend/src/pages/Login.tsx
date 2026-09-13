import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const REMEMBER_EMAIL_KEY = 'agendaapp_remember_email';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe,
      });
      const token = response.data.access_token;

      const payload = JSON.parse(atob(token.split('.')[1]));

      const user = {
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      };

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      login(token, user);

      if (user.role === 'super_admin') {
        window.location.href = '/super-admin';
      } else {
        window.location.href = '/admin';
      }
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (Array.isArray(message)) {
        setError(message.join(' • '));
      } else {
        setError(message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-6 md:mb-8 animate-fade-in">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900">AgendaApp</span>
          </Link>

          <div className="mb-6 md:mb-8 animate-fade-in-up delay-100">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-gray-600">
              Entre com sua conta para acessar o painel.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 animate-fade-in-up delay-200">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="voce@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link to="/esqueci-senha" className="text-xs text-blue-600 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer select-none">
                Lembrar meu e-mail por 30 dias
              </label>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6 md:mt-8 animate-fade-in delay-300">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="text-blue-600 font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>

          <p className="text-center text-xs text-gray-500 mt-4 md:mt-6">
            <Link to="/" className="hover:text-gray-700">← Voltar para o início</Link>
          </p>
        </div>
      </div>

      {/* Lado direito - Painel visual (oculto em mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 items-center justify-center relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 rounded-full -ml-24 -mb-24 opacity-20" />

        <div className="relative max-w-md text-white animate-fade-in-up delay-200">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Gerencie sua agenda com simplicidade
          </h2>
          <p className="text-blue-100 mb-8">
            Profissionais, serviços, horários e agendamentos — tudo em um só lugar, acessível pelo celular.
          </p>

          <ul className="space-y-4">
            {[
              'Link público de agendamento sem cadastro',
              'Vários profissionais na mesma agenda',
              'Controle total de horários e serviços',
              '7 dias grátis, sem cartão de crédito',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-blue-50">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}