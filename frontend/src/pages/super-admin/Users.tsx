import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    if (window.confirm('Deseja realmente excluir este usuário?')) {
      try {
        await api.delete(`/users/${id}`);
        loadUsers();
      } catch (err) {
        console.error(err);
      }
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
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Usuários</h1>
          <p className="text-sm text-gray-600">
            Gerencie os administradores da plataforma.
          </p>
        </div>
        <Link
          to="/super-admin/users/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Nenhum usuário cadastrado</h3>
          <p className="text-sm text-gray-600 mb-4">Adicione o primeiro administrador à plataforma.</p>
          <Link
            to="/super-admin/users/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Criar usuário
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/super-admin/users/${u.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}