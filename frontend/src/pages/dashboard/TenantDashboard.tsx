import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
  const [period, setPeriod] = useState(30);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<AppointmentsPerDay[]>([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentsByStatus[]>([]);
  const [appointmentsByWeekday, setAppointmentsByWeekday] = useState<AppointmentsByWeekday[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<TopItem[]>([]);
  const [topServices, setTopServices] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [kpisResp, overviewResp, profResp, servResp] = await Promise.all([
        api.get('/tenant-metrics/kpis', { params: { period } }),
        api.get('/tenant-metrics/overview', { params: { period } }),
        api.get('/tenant-metrics/top-professionals', { params: { period } }),
        api.get('/tenant-metrics/top-services', { params: { period } }),
      ]);
      setKpis(kpisResp.data);
      setAppointmentsPerDay(overviewResp.data.appointmentsPerDay);
      setAppointmentsByStatus(overviewResp.data.appointmentsByStatus);
      setAppointmentsByWeekday(overviewResp.data.appointmentsByWeekday);
      setTopProfessionals(profResp.data);
      setTopServices(servResp.data);
      setHasLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

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
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-72 bg-gray-200 rounded-2xl" />
            <div className="h-72 bg-gray-200 rounded-2xl" />
            <div className="h-72 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            Olá, {firstName}
            <Hand className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 text-sm">
            Aqui está o resumo do seu negócio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  period === p.value
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
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpiCards.map((card, index) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in-up delay-${(index + 1) * 100}`}
            >
              <div className={`w-10 h-10 rounded-lg ${colorClasses[card.color].bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${colorClasses[card.color].text}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-xl font-bold text-gray-900 truncate">{card.value}</p>
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

      {/* Linha 1: 3 gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Agendamentos por dia */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up delay-300">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Agendamentos por dia</h2>
            <p className="text-xs text-gray-500">Últimos {period} dias</p>
          </div>

          {appointmentsData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Sem dados
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.max(1, Math.floor(appointmentsData.length / 6))}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Agendamentos" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Agendamentos por status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up delay-400">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Agendamentos por status</h2>
            <p className="text-xs text-gray-500">Últimos {period} dias</p>
          </div>

          {statusData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Agendamentos por dia da semana */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up delay-500">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Agendamentos por dia da semana</h2>
            <p className="text-xs text-gray-500">Últimos {period} dias</p>
          </div>

          {weekdayData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="weekday" stroke="#9ca3af" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} name="Agendamentos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Linha 2: Top profissionais + Top serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 profissionais */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up delay-500">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Top 5 profissionais</h2>
            <p className="text-xs text-gray-500">Por número de agendamentos</p>
          </div>

          {topProfessionals.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProfessionals} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} maxBarSize={28} name="Agendamentos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top 5 serviços */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up delay-500">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Top 5 serviços</h2>
            <p className="text-xs text-gray-500">Por número de agendamentos</p>
          </div>

          {topServices.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={28} name="Agendamentos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}