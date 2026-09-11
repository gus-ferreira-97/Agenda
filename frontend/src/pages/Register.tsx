import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTenantNameChange = (value: string) => {
    setTenantName(value);
    // Gera automaticamente o subdomínio a partir do nome (apenas se o usuário ainda não editou)
    if (!subdomain || subdomain === slugify(tenantName)) {
      setSubdomain(slugify(value));
    }
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

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
      });
      setSuccess(response.data.message);
      // Limpa o formulário
      setOwnerName('');
      setEmail('');
      setPassword('');
      setTenantName('');
      setSubdomain('');
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (Array.isArray(message)) {
        setError(message.join(' '));
      } else {
        setError(message || 'Erro ao realizar o cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            AgendaApp
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Crie sua conta grátis</h1>
          <p className="text-gray-600 text-sm mt-2">
            7 dias grátis, sem cartão de crédito.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cadastro realizado!</h2>
              <p className="text-sm text-gray-600 mb-6">{success}</p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Voltar para o início
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Como devemos te chamar?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="voce@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do estabelecimento
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => handleTenantNameChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex.: Estúdio Maria"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço da sua agenda
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="bg-gray-100 text-gray-600 text-sm px-3 py-2 border-r border-gray-300">
                    https://
                  </span>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    className="flex-1 px-3 py-2 focus:outline-none"
                    placeholder="seu-subdominio"
                    pattern="[a-z0-9-]+"
                    title="Use apenas letras minúsculas, números e hífens"
                    required
                  />
                  <span className="bg-gray-100 text-gray-600 text-sm px-3 py-2 border-l border-gray-300">
                    .agendaapp.com.br
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este será o link que seus clientes vão usar para agendar.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>

              <p className="text-xs text-gray-500 text-center">
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