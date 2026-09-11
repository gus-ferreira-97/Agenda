import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  Clock,
  Power,
  PowerOff,
} from 'lucide-react';
import api from '../../services/api';

interface Service {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  is_active: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = () => {
    setLoading(true);
    api.get('/services')
      .then((response) => setServices(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/services/${id}`, { isActive: !currentStatus });
      loadServices();
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status do serviço.');
    }
  };

  const deleteService = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este serviço?')) {
      try {
        const response = await api.delete(`/services/${id}`);
        const message = response.data?.message;
        if (message && message.includes('desativado')) {
          alert(message);
        }
        loadServices();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir serviço.');
      }
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Serviços</h1>
          <p className="text-sm text-gray-600">
            Gerencie os serviços oferecidos pelo seu estabelecimento.
          </p>
        </div>
        <Link
          to="/admin/services/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </Link>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando serviços...
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Nenhum serviço cadastrado</h3>
          <p className="text-sm text-gray-600 mb-4">
            Adicione os serviços que você oferece aos seus clientes.
          </p>
          <Link
            to="/admin/services/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Criar serviço
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duração</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      {s.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{s.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {s.duration_minutes} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {formatCurrency(s.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        s.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {s.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(s.id, s.is_active)}
                          title={s.is_active ? 'Desativar' : 'Ativar'}
                          className={`p-1.5 rounded-lg transition ${
                            s.is_active
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {s.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <Link
                          to={`/admin/services/${s.id}/edit`}
                          title="Editar"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteService(s.id)}
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
      )}
    </div>
  );
}