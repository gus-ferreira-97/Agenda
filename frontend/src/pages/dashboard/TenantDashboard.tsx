import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  DollarSign,
  Hand,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Lock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePlan } from '../../hooks/usePlan';

interface KpiValue {
  value: number;
  trend: number | null;
}

interface Kpis {
  appointments: KpiValue;
  confirmed: KpiValue;
  pending: KpiValue;
  cancelled: KpiValue;
  professionals: KpiValue;
  revenue: KpiValue;
}

interface AppointmentsPerDay {
  date: string;
  count: number;
}

interface AppointmentsByStatus {
  status: string;
  count: number;
}

interface AppointmentsByWeekday {
  weekday: number;
  count: number;
}

interface TopItem {
  name: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  completed: '#2563eb',
};

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendentes',
  confirmed: 'Confirmados',
  cancelled: 'Cancelados',
  completed: 'Concluídos',
};

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PERIODS = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

export default function TenantDashboard() {
  const { user } = useAuth();
  const { plan } = usePlan();
  const [period, setPeriod] = useState(30);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<AppointmentsPerDay[]>([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentsByStatus[]>([]);
  const [appointmentsByWeekday, setAppointmentsByWeekday] = useState<AppointmentsByWeekday[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<TopItem[]>([]);
  const [topServices, setTopServices] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const advancedReports = plan?.allowAdvancedReports ?? false;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [kpisResp, overviewResp] = await Promise.all([
        api.get('/tenant-metrics/kpis', { params: { period } }),
        api.get('/tenant-metrics/overview', { params: { period } }),
      ]);
      setKpis(kpisResp.data);
      setAppointmentsPerDay(overviewResp.data.appointmentsPerDay);
      setAppointmentsByStatus(overviewResp.data.appointmentsByStatus);
      setAppointmentsByWeekday(overviewResp.data.appointmentsByWeekday);

      if (advancedReports) {
        const [profResp, servResp] = await Promise.all([
          api.get('/tenant-metrics/top-professionals', { params: { period } }),
          api.get('/tenant-metrics/top-services', { params: { period } }),
        ]);
        setTopProfessionals(profResp.data);
        setTopServices(servResp.data);
      }

      setHasLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period, advancedReports]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const firstName = user?.name?.split(' ')[0] || 'Bem-vindo';

  const appointmentsData = appointmentsPerDay.map((item) => {
    const [, month, day] = item.date.split('-');
    return { date: `${day}/${month}`, count: item.count };
  });

  const statusData = appointmentsByStatus.map((item) => ({
    name: APPOINTMENT_STATUS_LABELS[item.status] || item.status,
    value: item.count,
    status: item.status,
  }));

  const weekdayData = appointmentsByWeekday.map((item) => ({
    weekday: WEEKDAY_LABELS[item.weekday] || `Dia ${item.weekday}`,
    count: item.count,
  }));

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const kpiCards = kpis
    ? [
      {
        label: 'Agendamentos',
        value: kpis.appointments.value,
        trend: kpis.appointments.trend,
        invertTrend: false,
        Icon: CalendarCheck,
        color: 'blue',
        trendHint: `últimos ${period}d`,
      },
      {
        label: 'Confirmados',
        value: kpis.confirmed.value,
        trend: kpis.confirmed.trend,
        invertTrend: false,
        Icon: CheckCircle2,
        color: 'green',
        trendHint: `últimos ${period}d`,
      },
      {
        label: 'Pendentes',
        value: kpis.pending.value,
        trend: kpis.pending.trend,
        invertTrend: true,
        Icon: Clock,
        color: 'yellow',
        trendHint: `aguardando ação`,
      },
      {
        label: 'Cancelados',
        value: kpis.cancelled.value,
        trend: kpis.cancelled.trend,
        invertTrend: true,
        Icon: XCircle,
        color: 'red',
        trendHint: `últimos ${period}d`,
      },
      {
        label: 'Profissionais',
        value: kpis.professionals.value,
        trend: kpis.professionals.trend,
        invertTrend: false,
        Icon: Users,
        color: 'purple',
        trendHint: `ativos`,
      },
      {
        label: 'Faturamento',
        value: formatCurrency(kpis.revenue.value),
        trend: kpis.revenue.trend,
        invertTrend: false,
        Icon: DollarSign,
        color: 'pink',
        trendHint: `confirmados em ${period}d`,
      },
    ]
    : [];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  };

  const renderTrend = (trend: number | null, invert: boolean) => {
    if (trend === null || trend === 0) {
      return <span className="text-xs text-gray-400 font-medium">—</span>;
    }
    const isPositive = trend > 0;
    const isGood = invert ? !isPositive : isPositive;
    const colorClass = isGood ? 'text-green-600' : 'text-red-600';
    const Icon = isPositive ? ArrowUp : ArrowDown;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
        <Icon className="w-3 h-3" />
        {Math.abs(trend)}%
      </span>
    );
  };

  if (loading && !hasLoaded) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2 md:w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 md:h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 md:h-72 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-fade-in-up">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
          Olá, {firstName}
          <Hand className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Aqui está o resumo do seu negócio.
        </p>

        {/* Filtros e atualizar (linha própria no mobile) */}
        <div className="flex items-center gap-2 mt-4 md:mt-6">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm flex-1 md:flex-initial">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`flex-1 md:flex-initial px-2 md:px-3 py-1.5 text-xs font-medium rounded-md transition whitespace-nowrap ${period === p.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadAll}
            disabled={loading}
            title="Atualizar dados"
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
        {kpiCards.map((card, index) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 animate-fade-in-up delay-${(index + 1) * 100}`}
            >
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg ${colorClasses[card.color].bg} flex items-center justify-center mb-2 md:mb-3`}>
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${colorClasses[card.color].text}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1 truncate">{card.label}</p>
              <div className="flex items-baseline gap-1.5 md:gap-2 mb-1 flex-wrap">
                <p className="text-lg md:text-xl font-bold text-gray-900 truncate">{card.value}</p>
                {renderTrend(card.trend, card.invertTrend)}
              </div>
              {card.trendHint && (
                <p className="text-[10px] text-gray-400 leading-tight">
                  {card.trendHint}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Gráfico principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 animate-fade-in-up delay-300">
        <div className="mb-4 md:mb-6">
          <h2 className="text-sm md:text-base font-semibold text-gray-900">Agendamentos por dia</h2>
          <p className="text-xs text-gray-500">Últimos {period} dias</p>
        </div>

        {appointmentsData.length === 0 ? (
          <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">
            Sem dados
          </div>
        ) : (
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentsData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: '10px' }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(1, Math.floor(appointmentsData.length / 5))}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Agendamentos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Gráficos avançados */}
      {advancedReports ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-400">
              <div className="mb-4 md:mb-6">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">Agendamentos por status</h2>
                <p className="text-xs text-gray-500">Últimos {period} dias</p>
              </div>
              {statusData.length === 0 ? (
                <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
              ) : (
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-500">
              <div className="mb-4 md:mb-6">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">Agendamentos por dia da semana</h2>
                <p className="text-xs text-gray-500">Últimos {period} dias</p>
              </div>
              {weekdayData.length === 0 ? (
                <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
              ) : (
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="weekday" stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} name="Agendamentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-500">
              <div className="mb-4 md:mb-6">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">Top 5 profissionais</h2>
                <p className="text-xs text-gray-500">Por número de agendamentos</p>
              </div>
              {topProfessionals.length === 0 ? (
                <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
              ) : (
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProfessionals} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} maxBarSize={24} name="Agendamentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-500">
              <div className="mb-4 md:mb-6">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">Top 5 serviços</h2>
                <p className="text-xs text-gray-500">Por número de agendamentos</p>
              </div>
              {topServices.length === 0 ? (
                <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
              ) : (
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topServices} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} cursor={{ fill: '#f3f4f6' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={24} name="Agendamentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 md:p-10 text-center animate-fade-in-up delay-400">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <p className="text-base md:text-xl font-bold text-gray-900 mb-2">
            Desbloqueie relatórios avançados
          </p>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
            Tenha acesso a gráficos detalhados de agendamentos por status, distribuição por dia da semana,
            ranking de profissionais e serviços mais procurados.
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 max-w-2xl mx-auto mb-6">
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <Sparkles className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Status dos agendamentos</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <Sparkles className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Dias mais movimentados</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <Sparkles className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Top profissionais</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <Sparkles className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-700 font-medium">Top serviços</p>
            </div>
          </div>

          <Link
            to="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base"
          >
            <Sparkles className="w-4 h-4" />
            Fazer upgrade do plano
          </Link>
          <p className="text-xs text-gray-500 mt-3">
            Em breve você poderá fazer upgrade direto pelo painel.
          </p>
        </div>
      )}
    </div>
  );
}