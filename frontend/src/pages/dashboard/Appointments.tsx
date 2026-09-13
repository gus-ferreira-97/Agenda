import { useEffect, useState } from 'react';
import {
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  Clock,
  User,
  Briefcase,
} from 'lucide-react';
import api from '../../services/api';

interface Appointment {
  id: number;
  customer_name: string;
  customer_contact: string;
  start_time: string;
  end_time: string;
  status: string;
  professional: {
    name: string;
  };
  service: {
    name: string;
  };
}

interface Professional {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [professionalId, setProfessionalId] = useState<number | ''>('');
  const [serviceId, setServiceId] = useState<number | ''>('');

  useEffect(() => {
    Promise.all([
      api.get('/professionals'),
      api.get('/services'),
    ])
      .then(([profResp, servResp]) => {
        setProfessionals(profResp.data);
        setServices(servResp.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const loadAppointments = () => {
    const params: any = {};
    if (dateFilter) params.date = dateFilter;
    if (professionalId !== '') params.professionalId = professionalId;
    if (serviceId !== '') params.serviceId = serviceId;

    setLoading(true);
    api.get('/appointments', { params })
      .then((response) => setAppointments(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, [dateFilter, professionalId, serviceId]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/appointments/${id}`, { status });
      loadAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este agendamento?')) {
      try {
        await api.delete(`/appointments/${id}`);
        loadAppointments();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const clearFilters = () => {
    setDateFilter('');
    setProfessionalId('');
    setServiceId('');
  };

  const hasFilters = dateFilter || professionalId !== '' || serviceId !== '';

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-fade-in-up">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">Agendamentos</h1>
        <p className="text-sm md:text-base text-gray-600">
          Acompanhe e gerencie todos os agendamentos do seu estabelecimento.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 mb-4 md:mb-6 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Profissional</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Todos</option>
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
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Todos</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando agendamentos...
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Nenhum agendamento encontrado</h3>
          <p className="text-sm text-gray-600">
            {hasFilters
              ? 'Tente ajustar os filtros para ver outros resultados.'
              : 'Quando seus clientes agendarem, eles aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabela (desktop) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Profissional</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{a.customer_name}</div>
                        <div className="text-xs text-gray-500">{a.customer_contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.professional?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.service?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatDate(a.start_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(a.status)}`}>
                          {statusLabel(a.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {a.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(a.id, 'confirmed')}
                              title="Confirmar"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(a.id, 'cancelled')}
                              title="Cancelar"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAppointment(a.id)}
                            title="Excluir"
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
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
            {appointments.map((a, index) => (
              <div
                key={a.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in-up delay-${Math.min((index + 1) * 100, 500)}`}
              >
                {/* Header do card: cliente + status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{a.customer_name}</p>
                    <p className="text-xs text-gray-500 truncate">{a.customer_contact}</p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColor(a.status)}`}>
                    {statusLabel(a.status)}
                  </span>
                </div>

                {/* Detalhes */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {formatDate(a.start_time)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{a.professional?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{a.service?.name}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  {a.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(a.id, 'confirmed')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar
                    </button>
                  )}
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(a.id, 'cancelled')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => deleteAppointment(a.id)}
                    className={`${
                      a.status === 'cancelled' || a.status === 'completed' ? 'flex-1' : ''
                    } inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition`}
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