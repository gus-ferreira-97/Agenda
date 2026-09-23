import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import api from '../services/api';
import PasswordChecklist, { isPasswordStrong } from '../components/PasswordChecklist';
import SEO from '../components/SEO';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token ausente na URL. Solicite um novo link.');
      return;
    }

    if (!isPasswordStrong(password)) {
      setError('A senha não atende todos os requisitos de segurança.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' • ') : msg || 'Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Redefinir senha - Agendy"
        description="Crie uma nova senha para sua conta Agendy."
      />
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
              <span className="text-lg md:text-xl font-bold text-gray-900">Agendy</span>
            </Link>

            {success ? (
              <div className="text-center py-6 animate-fade-in-up">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Senha redefinida!</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Ir para o login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 md:mb-8 animate-fade-in-up delay-100">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Criar nova senha
                  </h1>
                  <p className="text-sm text-gray-600">
                    Escolha uma senha forte para manter sua conta segura.
                  </p>
                </div>

                {!token && (
                  <div className="mb-5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      Nenhum token foi encontrado. Solicite um novo link em{' '}
                      <Link to="/esqueci-senha" className="underline font-medium">
                        esqueci minha senha
                      </Link>
                      .
                    </span>
                  </div>
                )}

                {error && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 animate-fade-in-up delay-200">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Nova senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        maxLength={128}
                        value={password}
                        autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Crie uma senha forte"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordChecklist password={password} show={password.length > 0} />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Repita a nova senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        maxLength={128}
                        value={confirmPassword}
                        autoComplete="new-password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${confirmPassword.length > 0 && confirmPassword !== password
                            ? 'border-red-300'
                            : 'border-gray-300'
                          }`}
                        placeholder="Digite a senha novamente"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && confirmPassword !== password && (
                      <p className="text-xs text-red-600 mt-1">As senhas não coincidem</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      'Redefinir senha'
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6 md:mt-8 animate-fade-in delay-300">
                  <Link to="/login" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Lado direito - Painel visual (oculto em mobile) */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 items-center justify-center relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 rounded-full -ml-24 -mb-24 opacity-20" />

          <div className="relative max-w-md text-white animate-fade-in-up delay-200">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Quase tudo pronto
            </h2>
            <p className="text-blue-100">
              Crie uma nova senha e recupere o acesso à sua agenda em segundos.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}