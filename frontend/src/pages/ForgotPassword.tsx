import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao processar solicitação.');
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
              Esqueceu sua senha?
            </h1>
            <p className="text-sm text-gray-600">
              Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          {message && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 animate-fade-in-up delay-200">
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
                    Enviando...
                  </>
                ) : (
                  'Enviar link de redefinição'
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-600 mt-6 md:mt-8 animate-fade-in delay-300">
            Lembrou a senha?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Voltar para o login
            </Link>
          </p>

          <p className="text-center text-xs text-gray-500 mt-4 md:mt-6">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-gray-700">
              <ArrowLeft className="w-3 h-3" />
              Voltar para o início
            </Link>
          </p>
        </div>
      </div>

      {/* Lado direito - Painel visual (oculto em mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 items-center justify-center relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 rounded-full -ml-24 -mb-24 opacity-20" />

        <div className="relative max-w-md text-white animate-fade-in-up delay-200">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Recupere seu acesso em poucos minutos
          </h2>
          <p className="text-blue-100">
            Basta informar seu e-mail e enviaremos um link seguro para você criar uma nova senha.
          </p>
        </div>
      </div>
    </div>
  );
}