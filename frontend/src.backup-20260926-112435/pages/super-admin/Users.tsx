import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users as UsersIcon, Shield, Building2 } from 'lucide-react';
import api from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant_id: number | null;
  tenant?: {
    name: string;
  };
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    api.get('/users')
      .then((response) => setUsers(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUser = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este usuário?')) return;

    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao excluir usuário.');
    }
  };

  const roleLabel = (role: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'tenant_admin') return 'Admin Tenant';
    return role;
  };

  const roleColor = (role: string) => {
    return role === 'super_admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in-up md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">Usuários</h1>
          <p className="text-sm md:text-base text-gray-600">
            Gerencie os administradores da plataforma.
          </p>
        </div>
        <Link
          to="/super-admin/users/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start md:self-auto w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Link>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando usuários...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <UsersIcon className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Nenhum usuário cadastrado</p>
          <p className="text-sm text-gray-600 mb-4">Adicione o primeiro administrador à plataforma.</p>
          <Link
            to="/super-admin/users/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Criar usuário
          </Link>
        </div>
      ) : (
        <>
          {/* Tabela (desktop) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Papel</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.tenant?.name || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${roleColor(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/super-admin/users/${u.id}/edit`}
                            title="Editar"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteUser(u.id)}
                            title="Excluir"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden space-y-3">
            {users.map((u, index) => (
              <div
                key={u.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in-up delay-${Math.min((index + 1) * 100, 500)}`}
              >
                {/* Header do card: avatar + nome + role */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${u.role === 'super_admin' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                    {u.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Detalhes */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColor(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </div>
                  {u.tenant?.name && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{u.tenant.name}</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/super-admin/users/${u.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}