import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Clock, Coffee } from 'lucide-react';
import api from '../../services/api';

interface WorkSchedule {
  id: number;
  professional_id: number;
  professional?: {
    name: string;
  };
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Schedules() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = () => {
    setLoading(true);
    api.get('/work-schedules')
      .then((response) => setSchedules(response.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const deleteSchedule = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este horário?')) {
      try {
        await api.delete(`/work-schedules/${id}`);
        loadSchedules();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir horário.');
      }
    }
  };

  // Agrupa por profissional para melhor visualização
  const grouped = schedules.reduce<Record<string, WorkSchedule[]>>((acc, schedule) => {
    const key = schedule.professional?.name || `Profissional #${schedule.professional_id}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(schedule);
    return acc;
  }, {});

  const formatTime = (time: string) => time?.slice(0, 5) || '';

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Horários de Trabalho</h1>
          <p className="text-sm text-gray-600">
            Configure os horários de atendimento de cada profissional.
          </p>
        </div>
        <Link
          to="/admin/schedules/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Horário
        </Link>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando horários...
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center animate-fade-in-up">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Nenhum horário cadastrado</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure quando seus profissionais estarão disponíveis para atender.
          </p>
          <Link
            to="/admin/schedules/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Criar horário
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([professionalName, items], groupIndex) => (
            <div
              key={professionalName}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up delay-${Math.min((groupIndex + 1) * 100, 500)}`}
            >
              {/* Header do grupo */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0">
                  {professionalName[0]?.toUpperCase() || 'P'}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{professionalName}</h2>
                  <p className="text-xs text-gray-500">
                    {items.length} {items.length === 1 ? 'dia configurado' : 'dias configurados'}
                  </p>
                </div>
              </div>

              {/* Tabela do grupo */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dia</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Horário</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pausa</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items
                      .sort((a, b) => a.day_of_week - b.day_of_week)
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                              {DAYS_OF_WEEK[s.day_of_week]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatTime(s.start_time)} — {formatTime(s.end_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {s.break_start && s.break_end ? (
                              <div className="flex items-center gap-1.5">
                                <Coffee className="w-4 h-4 text-gray-400" />
                                {formatTime(s.break_start)} — {formatTime(s.break_end)}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                to={`/admin/schedules/${s.id}/edit`}
                                title="Editar"
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => deleteSchedule(s.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}