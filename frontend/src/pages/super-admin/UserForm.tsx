import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

interface Tenant {
  id: number;
  name: string;
}

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant_admin');
  const [tenantId, setTenantId] = useState<number | ''>('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const tenantsResp = await api.get('/tenants');
        setTenants(tenantsResp.data);

        if (isEditing) {
          const userResp = await api.get(`/users/${id}`);
          setName(userResp.data.name);
          setEmail(userResp.data.email);
          setRole(userResp.data.role);
          setTenantId(userResp.data.tenant_id || '');
        }
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload: any = {
      name,
      email,
      role,
      tenantId: role === 'tenant_admin' && tenantId !== '' ? Number(tenantId) : null,
    };

    if (!isEditing || password) {
      payload.password = password;
    }

    try {
      if (isEditing) {
        await api.patch(`/users/${id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      navigate('/super-admin/users');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <Link
          to="/super-admin/users"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para usuários
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {isEditing ? 'Atualize as informações do usuário.' : 'Adicione um novo administrador à plataforma.'}
        </p>
      </div>

      {/* Formulário */}
      <div className="max-w-2xl animate-fade-in-up delay-100">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Ex.: Maria Silva"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="voce@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha {isEditing && <span className="text-gray-400 font-normal">(deixe em branco para manter)</span>}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required={!isEditing}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Papel
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="tenant_admin">Admin Tenant</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {role === 'tenant_admin' && (
            <div>
              <label htmlFor="tenant" className="block text-sm font-medium text-gray-700 mb-2">
                Tenant associado
              </label>
              <select
                id="tenant"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              >
                <option value="">Selecione...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/super-admin/users"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}