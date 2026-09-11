import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  status: string;
}

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTenants = () => {
    setLoading(true);
    api.get('/tenants')
      .then((response) => setTenants(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/tenants/${id}`, { status });
      loadTenants();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTenant = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este tenant?')) {
      try {
        await api.delete(`/tenants/${id}`);
        loadTenants();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspenso':
        return 'bg-red-100 text-red-800';
      case 'inativo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Tenants</h1>
          <p className="text-sm text-gray-600">
            Gerencie os estabelecimentos cadastrados na plataforma.
          </p>
        </div>
        <Link
          to="/super-admin/tenants/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo Tenant
        </Link>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando tenants...
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Nenhum tenant cadastrado</h3>
          <p className="text-sm text-gray-600 mb-4">Comece criando o primeiro estabelecimento.</p>
          <Link
            to="/super-admin/tenants/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Criar tenant
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subdomínio</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{t.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-mono">{t.subdomain}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {t.status !== 'ativo' && (
                        <button
                          onClick={() => updateStatus(t.id, 'ativo')}
                          className="text-green-600 hover:text-green-800"
                        >
                          Ativar
                        </button>
                      )}
                      {t.status === 'ativo' && (
                        <button
                          onClick={() => updateStatus(t.id, 'suspenso')}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          Suspender
                        </button>
                      )}
                      <Link
                        to={`/super-admin/tenants/${t.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => deleteTenant(t.id)}
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