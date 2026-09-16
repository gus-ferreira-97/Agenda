import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Building2, Power, PowerOff, Clock } from 'lucide-react';
import api from '../../services/api';

interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  plan: string;
  trial_ends_at: string | null;
  trial_used: boolean;
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
    if (!window.confirm('Deseja realmente excluir este tenant?')) return;

    try {
      const response = await api.delete(`/tenants/${id}`);
      const message = response.data?.message;
      if (message && message.includes('sucesso')) {
        // Sucesso silencioso, apenas recarrega a lista
        loadTenants();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao excluir tenant.');
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aguardando_verificacao':
        return 'bg-sky-100 text-sky-800';
      case 'suspenso':
        return 'bg-red-100 text-red-800';
      case 'trial_expirado':
        return 'bg-orange-100 text-orange-800';
      case 'inativo':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'pendente':
        return 'Pendente';
      case 'aguardando_verificacao':
        return 'Aguardando e-mail';
      case 'suspenso':
        return 'Suspenso';
      case 'trial_expirado':
        return 'Trial expirado';
      case 'inativo':
        return 'Inativo';
      default:
        return status;
    }
  };

  const planLabel = (plan: string) => {
    switch (plan) {
      case 'basico': return 'Básico';
      case 'profissional': return 'Profissional';
      case 'premium': return 'Premium';
      default: return plan;
    }
  };

  const planColor = (plan: string) => {
    switch (plan) {
      case 'basico': return 'bg-gray-100 text-gray-800';
      case 'profissional': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTrialDate = (iso: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const trialDaysLeft = (iso: string | null) => {
    if (!iso) return null;
    const now = new Date();
    const end = new Date(iso);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const diff = Math.round((startOfEnd.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in-up md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">Tenants</h1>
          <p className="text-sm md:text-base text-gray-600">
            Gerencie os estabelecimentos cadastrados na plataforma.
          </p>
        </div>
        <Link
          to="/super-admin/tenants/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start md:self-auto w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Nenhum tenant cadastrado</h3>
          <p className="text-sm text-gray-600 mb-4">Comece criando o primeiro estabelecimento.</p>
          <Link
            to="/super-admin/tenants/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Criar tenant
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subdomínio</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trial</th>
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
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${planColor(t.plan)}`}>
                          {planLabel(t.plan)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(t.status)}`}>
                          {statusLabel(t.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {t.trial_ends_at ? (
                          (() => {
                            const daysLeft = trialDaysLeft(t.trial_ends_at);
                            if (t.status === 'trial_expirado' || (daysLeft !== null && daysLeft < 0)) {
                              return (
                                <span className="text-orange-600 font-medium">
                                  Expirado em {formatTrialDate(t.trial_ends_at)}
                                </span>
                              );
                            }
                            const colorClass =
                              daysLeft !== null && daysLeft <= 1
                                ? 'text-red-600'
                                : daysLeft !== null && daysLeft <= 3
                                  ? 'text-yellow-600'
                                  : 'text-gray-600';
                            return (
                              <span className={colorClass}>
                                {daysLeft === 0
                                  ? 'Termina hoje'
                                  : daysLeft === 1
                                    ? 'Termina amanhã'
                                    : `${daysLeft} dias restantes`}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="inline-flex items-center gap-2">
                          {t.status !== 'ativo' && t.status !== 'aguardando_verificacao' && (
                            <button
                              onClick={() => updateStatus(t.id, 'ativo')}
                              title="Ativar"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                          {t.status === 'ativo' && (
                            <button
                              onClick={() => updateStatus(t.id, 'suspenso')}
                              title="Suspender"
                              className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition"
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/super-admin/tenants/${t.id}/edit`}
                            title="Editar"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteTenant(t.id)}
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
            {tenants.map((t, index) => (
              <div
                key={t.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in-up delay-${Math.min((index + 1) * 100, 500)}`}
              >
                {/* Header do card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{t.name}</p>
                      <p className="text-xs text-gray-500 font-mono truncate">{t.subdomain}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColor(t.status)}`}>
                    {statusLabel(t.status)}
                  </span>
                </div>

                {/* Plano */}
                <div className="mb-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${planColor(t.plan)}`}>
                    Plano {planLabel(t.plan)}
                  </span>
                </div>

                {/* Trial */}
                {t.trial_ends_at && (
                  <div className="mb-3 text-xs">
                    {(() => {
                      const daysLeft = trialDaysLeft(t.trial_ends_at);
                      if (t.status === 'trial_expirado' || (daysLeft !== null && daysLeft < 0)) {
                        return (
                          <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Trial expirado em {formatTrialDate(t.trial_ends_at)}
                          </span>
                        );
                      }
                      const colorClass =
                        daysLeft !== null && daysLeft <= 1
                          ? 'text-red-600'
                          : daysLeft !== null && daysLeft <= 3
                            ? 'text-yellow-600'
                            : 'text-gray-600';
                      return (
                        <span className={`inline-flex items-center gap-1 ${colorClass} font-medium`}>
                          <Clock className="w-3.5 h-3.5" />
                          {daysLeft === 0
                            ? 'Trial termina hoje'
                            : daysLeft === 1
                              ? 'Trial termina amanhã'
                              : `${daysLeft} dias de trial restantes`}
                        </span>
                      );
                    })()}
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  {t.status !== 'ativo' && t.status !== 'aguardando_verificacao' && (
                    <button
                      onClick={() => updateStatus(t.id, 'ativo')}
                      title="Ativar"
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                  {t.status === 'ativo' && (
                    <button
                      onClick={() => updateStatus(t.id, 'suspenso')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition"
                    >
                      <PowerOff className="w-4 h-4" />
                      Suspender
                    </button>
                  )}
                  <Link
                    to={`/super-admin/tenants/${t.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteTenant(t.id)}
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