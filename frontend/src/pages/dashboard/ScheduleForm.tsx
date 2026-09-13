import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Clock, Coffee } from 'lucide-react';
import api from '../../services/api';

interface Professional {
  id: number;
  name: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export default function ScheduleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalId, setProfessionalId] = useState<number | ''>('');
  const [dayOfWeek, setDayOfWeek] = useState<number | ''>('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const profResp = await api.get('/professionals');
        setProfessionals(profResp.data);

        if (isEditing) {
          const resp = await api.get(`/work-schedules/${id}`);
          setProfessionalId(resp.data.professional_id);
          setDayOfWeek(resp.data.day_of_week);
          setStartTime(resp.data.start_time?.slice(0, 5) || '09:00');
          setEndTime(resp.data.end_time?.slice(0, 5) || '18:00');
          setBreakStart(resp.data.break_start?.slice(0, 5) || '');
          setBreakEnd(resp.data.break_end?.slice(0, 5) || '');
        }
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (professionalId === '' || dayOfWeek === '') {
      setError('Selecione profissional e dia da semana');
      setSaving(false);
      return;
    }

    const payload = {
      professionalId: Number(professionalId),
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      breakStart: breakStart || undefined,
      breakEnd: breakEnd || undefined,
    };

    try {
      if (isEditing) {
        await api.patch(`/work-schedules/${id}`, payload);
      } else {
        await api.post('/work-schedules', payload);
      }
      navigate('/admin/schedules');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
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
        <Link
          to="/admin/schedules"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para horários
        </Link>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Horário' : 'Novo Horário'}
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          {isEditing
            ? 'Atualize as informações do horário de trabalho.'
            : 'Configure o horário de atendimento de um profissional.'}
        </p>
      </div>

      {/* Formulário */}
      <div className="max-w-2xl animate-fade-in-up delay-100">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="professional" className="block text-sm font-medium text-gray-700 mb-2">
                Profissional
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  id="professional"
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  required
                >
                  <option value="">Selecione...</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-2">
                Dia da semana
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  required
                >
                  <option value="">Selecione...</option>
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Horário de início
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                Horário de término
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pausa */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Coffee className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-900">
                Pausa <span className="text-gray-400 font-normal">(opcional)</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="breakStart" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Início da pausa
                </label>
                <input
                  id="breakStart"
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="breakEnd" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Fim da pausa
                </label>
                <input
                  id="breakEnd"
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/admin/schedules"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
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
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}