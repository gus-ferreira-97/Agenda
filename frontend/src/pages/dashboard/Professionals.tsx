import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  Power,
  PowerOff,
  Lock,
} from 'lucide-react';
import api from '../../services/api';
import { usePlan } from '../../hooks/usePlan';

interface Professional {
  id: number;
  name: string;
  specialty: string;
  is_active: boolean;
}

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { plan, reload: reloadPlan } = usePlan();

  const loadProfessionals = () => {
    setLoading(true);
    api.get('/professionals')
      .then((response) => setProfessionals(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfessionals();
    reloadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteProfessional = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este profissional?')) {
      try {
        const response = await api.delete(`/professionals/${id}`);
        const message = response.data?.message;
        if (message && message.includes('desativado')) {
          alert(message);
        }
        loadProfessionals();
        reloadPlan();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir profissional.');
      }
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/professionals/${id}`, { isActive: !currentStatus });
      loadProfessionals();
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status do profissional.');
    }
  };

  const maxProfessionals = plan?.maxProfessionals ?? null;
  const currentCount = professionals.length;
  const limitReached = maxProfessionals !== null && currentCount >= maxProfessionals;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-in-up md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">Profissionais</h1>
          <p className="text-sm md:text-base text-gray-600">
            Gerencie os profissionais do seu estabelecimento.
          </p>
        </div>

        {limitReached ? (
          <div className="relative group self-start md:self-auto">
            <button
              disabled
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-500 px-4 py-2.5 rounded-lg font-medium cursor-not-allowed w-full md:w-auto justify-center"
            >
              <Lock className="w-4 h-4" />
              Novo Profissional
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10">
              Limite do plano atingido. Faça upgrade para adicionar mais.
            </div>
          </div>
        ) : (
          <Link
            to="/admin/professionals/new"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start md:self-auto w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            Novo Profissional
          </Link>
        )}
      </div>

      {/* Banner de limite do plano */}
      {plan && maxProfessionals !== null && (
        <div
          className={`rounded-xl border p-4 mb-4 md:mb-6 flex items-start md:items-center gap-3 animate-fade-in-up delay-100 ${
            limitReached
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-100'
          }`}
        >
          {limitReached ? (
            <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 md:mt-0" />
          ) : (
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 md:mt-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${limitReached ? 'text-yellow-900' : 'text-blue-900'}`}>
              {limitReached
                ? `Você atingiu o limite do plano ${plan.planName}`
                : `Plano ${plan.planName}`}
            </p>
            <p className={`text-xs ${limitReached ? 'text-yellow-800' : 'text-blue-800'}`}>
              {currentCount} de {maxProfessionals} profissional(is) cadastrado(s).
              {limitReached && ' Faça upgrade para adicionar mais.'}
            </p>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando profissionais...
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Nenhum profissional cadastrado</p>
          <p className="text-sm text-gray-600 mb-4">
            Adicione os profissionais que atendem no seu estabelecimento.
          </p>
          <Link
            to="/admin/professionals/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Criar profissional
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Especialidade</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {professionals.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0">
                            {p.name?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.specialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          p.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {p.is_active ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Ativo
                            </>
                          ) : (
                            'Inativo'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(p.id, p.is_active)}
                            title={p.is_active ? 'Desativar' : 'Ativar'}
                            className={`p-1.5 rounded-lg transition ${
                              p.is_active
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {p.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <Link
                            to={`/admin/professionals/${p.id}/edit`}
                            title="Editar"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteProfessional(p.id)}
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
            {professionals.map((p, index) => (
              <div
                key={p.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in-up delay-${Math.min((index + 1) * 100, 500)}`}
              >
                {/* Header do card: avatar + nome + status */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-base font-semibold flex-shrink-0">
                    {p.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.specialty}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                    p.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {p.is_active ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Ativo
                      </>
                    ) : (
                      'Inativo'
                    )}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleStatus(p.id, p.is_active)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                      p.is_active
                        ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                        : 'text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {p.is_active ? (
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
                    to={`/admin/professionals/${p.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteProfessional(p.id)}
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