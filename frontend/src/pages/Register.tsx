import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Building2, CheckCircle2, Globe, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'basico';
  const validPlans = ['basico', 'profissional', 'premium'];
  const initialPlan = validPlans.includes(planFromUrl) ? planFromUrl : 'basico';

  const [plan] = useState(initialPlan);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleTenantNameChange = (value: string) => {
    setTenantName(value);
    if (!subdomain || subdomain === slugify(tenantName)) {
      setSubdomain(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/public/register', {
        ownerName,
        email,
        password,
        tenantName,
        subdomain,
        plan
      });
      setSuccess(response.data.message);
      setOwnerName('');
      setEmail('');
      setPassword('');
      setTenantName('');
      setSubdomain('');
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (Array.isArray(message)) {
        setError(message.join(' • '));
      } else {
        setError(message || 'Erro ao realizar o cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900">AgendaApp</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
            Crie sua conta grátis
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            7 dias grátis, sem cartão de crédito.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 animate-fade-in-up delay-100">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Cadastro realizado!</h2>
              <p className="text-sm text-gray-600 mb-6">{success}</p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700"
              >
                Voltar para o início
              </Link>
            </div>
          ) : (
            <>
              {plan !== 'basico' && (
                <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs md:text-sm text-blue-900">
                    Você está se cadastrando no plano{' '}
                    <strong className="capitalize">
                      {plan === 'profissional' ? 'Profissional' : 'Premium'}
                    </strong>
                    . Após criar a conta, você poderá finalizar a assinatura.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu nome
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Como devemos te chamar?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="voce@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do estabelecimento
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={tenantName}
                      onChange={(e) => handleTenantNameChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Ex.: Estúdio Maria"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço da sua agenda
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
                    <div className="hidden sm:flex items-center pl-3 pr-1 text-gray-400 pointer-events-none">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline text-gray-600 text-sm py-2.5 pr-2 whitespace-nowrap">
                      https://
                    </span>
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) =>
                        setSubdomain(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '')
                            .replace(/-+/g, '-')
                            .replace(/^-/, '')
                        )
                      }
                      className="flex-1 min-w-0 px-3 sm:px-0 py-2.5 focus:outline-none text-sm"
                      placeholder="seu-subdominio"
                      pattern="[a-z0-9-]+"
                      title="Use apenas letras minúsculas, números e hífens"
                      required
                    />
                    <span className="hidden sm:inline text-gray-600 text-xs py-2.5 px-3 whitespace-nowrap">
                      .agendaapp.com.br
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    {subdomain
                      ? `Sua URL: ${subdomain}.agendaapp.com.br`
                      : 'Este será o link que seus clientes vão usar para agendar.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta grátis'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Ao criar sua conta você aceita nossos{' '}
                  <Link to="/termos" className="text-blue-600 hover:underline">
                    Termos de Uso
                  </Link>{' '}
                  e nossa{' '}
                  <Link to="/privacidade" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}