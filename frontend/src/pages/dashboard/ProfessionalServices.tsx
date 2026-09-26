import { useEffect, useState } from 'react';
import { Plus, Trash2, Link2, User, Briefcase } from 'lucide-react';
import api from '../../services/api';

interface Professional {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

interface ProfessionalService {
  professional_id: number;
  service_id: number;
  professional?: Professional;
  service?: Service;
}

export default function ProfessionalServices() {
  const [associations, setAssociations] = useState<ProfessionalService[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | ''>('');
  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [assocResp, profResp, servResp] = await Promise.all([
        api.get('/professional-services'),
        api.get('/professionals'),
        api.get('/services'),
      ]);
      setAssociations(assocResp.data);
      setProfessionals(profResp.data);
      setServices(servResp.data);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedProfessional === '' || selectedService === '') {
      setError('Selecione profissional e serviço');
      return;
    }

    setSaving(true);
    try {
      await api.post('/professional-services', {
        professionalId: Number(selectedProfessional),
        serviceId: Number(selectedService),
      });
      setSuccess('Associação criada com sucesso');
      setSelectedProfessional('');
      setSelectedService('');
      const assocResp = await api.get('/professional-services');
      setAssociations(assocResp.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar associação');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (professionalId: number, serviceId: number) => {
    if (window.confirm('Deseja realmente remover esta associação?')) {
      try {
        await api.delete(`/professional-services/${professionalId}/${serviceId}`);
        const assocResp = await api.get('/professional-services');
        setAssociations(assocResp.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao remover associação');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-violet-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-fade-in-up">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
          Associações Profissional-Serviço
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Defina quais serviços cada profissional está habilitado a realizar.
        </p>
      </div>

      {/* Formulário de criação */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4 md:mb-6 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-violet-600" />
          <h2 className="text-sm font-semibold text-gray-700">Adicionar nova associação</h2>
        </div>

        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Profissional</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white"
                  required
                >
                  <option value="">Selecione um profissional...</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Serviço</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white"
                  required
                >
                  <option value="">Selecione um serviço...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition w-full md:w-auto"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar Associação
              </>
            )}
          </button>
        </form>
      </div>

      {/* Listagem */}
      {associations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center animate-fade-in-up delay-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Link2 className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Nenhuma associação cadastrada</p>
          <p className="text-sm text-gray-600">
            Use o formulário acima para vincular serviços aos seus profissionais.
          </p>
        </div>
      ) : (
        <>
          {/* Tabela (desktop) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up delay-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Profissional</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {associations.map((a, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-semibold flex-shrink-0">
                            {a.professional?.name?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div className="font-medium text-gray-900">{a.professional?.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          {a.service?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleRemove(a.professional_id, a.service_id)}
                          title="Remover"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden space-y-3">
            {associations.map((a, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in-up delay-${Math.min((index + 1) * 100, 500)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-semibold flex-shrink-0">
                    {a.professional?.name?.[0]?.toUpperCase() || 'P'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{a.professional?.name}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{a.service?.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(a.professional_id, a.service_id)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition flex-shrink-0"
                    title="Remover"
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