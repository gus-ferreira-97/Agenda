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
  const [optionCounts, setOptionCounts] = useState<Record<number, number>>({});

  const loadServices = () => {
    setLoading(true);
    Promise.all([
      api.get('/services'),
      api.get('/service-options'),
    ])
      .then(([servicesResp, optionsResp]) => {
        setServices(servicesResp.data);

        // Conta as variações por serviço
        const counts: Record<number, number> = {};
        optionsResp.data.forEach((option: any) => {
          counts[option.service_id] = (counts[option.service_id] || 0) + 1;
        });
        setOptionCounts(counts);
      })
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
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in-up md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">Serviços</h1>
          <p className="text-sm md:text-base text-gray-600">
            Gerencie os serviços oferecidos pelo seu estabelecimento.
          </p>
        </div>
        <Link
          to="/admin/services/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start md:self-auto w-full md:w-auto"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center animate-fade-in-up">
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
        <>
          {/* Tabela (desktop) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duração</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variações</th>
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
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${s.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {s.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {optionCounts[s.id] ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {optionCounts[s.id]} {optionCounts[s.id] === 1 ? 'variação' : 'variações'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(s.id, s.is_active)}
                            title={s.is_active ? 'Desativar' : 'Ativar'}
                            className={`p-1.5 rounded-lg transition ${s.is_active
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

          {/* Cards (mobile) */}
          <div className="md:hidden space-y-3">
            {services.map((s, index) => (
              <div
                key={s.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in-up delay-${Math.min((index + 1) * 100, 500)}`}
              >
                {/* Header do card: nome + status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                    {s.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{s.description}</p>
                    )}
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${s.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {s.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Detalhes */}
                <div className="flex items-center gap-4 mb-2 text-sm text-gray-700 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {s.duration_minutes} min
                  </div>
                  {s.price !== undefined && s.price !== null && (
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(s.price)}
                    </div>
                  )}
                </div>
                {optionCounts[s.id] > 0 && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {optionCounts[s.id]} {optionCounts[s.id] === 1 ? 'variação' : 'variações'}
                    </span>
                  </div>
                )}
                {optionCounts[s.id] === 0 || !optionCounts[s.id] ? (
                  <div className="mb-4" />
                ) : null}

                {/* Ações */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleStatus(s.id, s.is_active)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${s.is_active
                      ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                      : 'text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                  >
                    {s.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Ativar
                      </>
                    )}
                  </button>
                  <Link
                    to={`/admin/services/${s.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteService(s.id)}
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