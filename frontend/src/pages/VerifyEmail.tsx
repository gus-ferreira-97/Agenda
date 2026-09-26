import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import SEO from '../components/SEO';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificação ausente. Solicite um novo link.');
        return;
      }

      try {
        const response = await api.post('/public/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message);
      } catch (err: any) {
        const msg = err.response?.data?.message;
        setStatus('error');
        setMessage(
          Array.isArray(msg)
            ? msg.join(' ')
            : msg || 'Não foi possível verificar o e-mail. O link pode estar expirado.',
        );
      }
    }
    verify();
  }, [token]);

  return (
    <>
      <SEO
        title="Verificar e-mail - Agendy"
        description="Confirme seu e-mail para ativar sua conta Agendy."
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6 md:mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900">Agendy</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center animate-fade-in-up">
            {/* Loading */}
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                </div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Verificando seu e-mail...
                </h1>
                <p className="text-sm text-gray-600">
                  Aguarde só um instante.
                </p>
              </>
            )}

            {/* Success */}
            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  E-mail verificado!
                </h1>
                <p className="text-sm text-gray-600 mb-6">{message}</p>

                <div className="bg-violet-50 border border-violet-100 rounded-lg px-4 py-3 text-left mb-6">
                  <p className="text-xs text-violet-900 leading-relaxed">
                    <strong>Próximos passos:</strong> seu cadastro está em análise.
                    Assim que for aprovado, você poderá fazer login e começar a usar
                    o Agendy.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-block w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
                >
                  Ir para o login
                </Link>
              </>
            )}

            {/* Error */}
            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Não foi possível verificar
                </h1>
                <p className="text-sm text-gray-600 mb-6">{message}</p>

                <div className="space-y-3">
                  <Link
                    to="/cadastro"
                    className="inline-flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
                  >
                    <Mail className="w-4 h-4" />
                    Fazer um novo cadastro
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            <Link to="/" className="hover:text-gray-700">← Voltar para o início</Link>
          </p>
        </div>
      </div>
    </>
  );
}