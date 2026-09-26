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
  Building2,
  Users,
  Briefcase,
  CalendarCheck,
  TrendingUp,
  XCircle,
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
  tenants: KpiValue;
  professionals: KpiValue;
  services: KpiValue;
  appointments: KpiValue;
  conversion: KpiValue & { total: number; activated: number; pending: number; suspended: number };
  cancellation: KpiValue & { cancelled: number };
}

interface AppointmentsPerDay {
  date: string;
  count: number;
}

interface TenantsByStatus {
  status: string;
  count: number;
}

interface NewTenantsPerMonth {
  month: string;
  count: number;
}

interface TopTenant {
  name: string;
  count: number;
}

interface AppointmentStatus {
  status: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  ativo: '#10b981',
  pendente: '#f59e0b',
  suspenso: '#ef4444',
  inativo: '#6b7280',
  pending: '#f59e0b',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  completed: '#2563eb',
};

const TENANT_STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativos',
  pendente: 'Pendentes',
  suspenso: 'Suspensos',
  inativo: 'Inativos',
};

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendentes',
  confirmed: 'Confirmados',
  cancelled: 'Cancelados',
  completed: 'Concluídos',
};

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const PERIODS = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

export default function SuperAdminHome() {
  const { user } = useAuth();
  const [period, setPeriod] = useState(30);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<AppointmentsPerDay[]>([]);
  const [tenantsByStatus, setTenantsByStatus] = useState<TenantsByStatus[]>([]);
  const [newTenantsPerMonth, setNewTenantsPerMonth] = useState<NewTenantsPerMonth[]>([]);
  const [topTenants, setTopTenants] = useState<TopTenant[]>([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [kpisResp, overviewResp, topResp, statusResp] = await Promise.all([
        api.get('/super-admin/metrics/kpis', { params: { period } }),
        api.get('/super-admin/metrics/overview', { params: { period } }),
        api.get('/super-admin/metrics/top-tenants', { params: { period } }),
        api.get('/super-admin/metrics/appointments-by-status', { params: { period } }),
      ]);
      setKpis(kpisResp.data);
      setAppointmentsPerDay(overviewResp.data.appointmentsPerDay);
      setTenantsByStatus(overviewResp.data.tenantsByStatus);
      setNewTenantsPerMonth(overviewResp.data.newTenantsPerMonth);
      setTopTenants(topResp.data);
      setAppointmentsByStatus(statusResp.data);
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

  const firstName = user?.name?.split(' ')[0] || 'Administrador';

  const appointmentsData = appointmentsPerDay.map((item) => {
    const [, month, day] = item.date.split('-');
    return { date: `${day}/${month}`, count: item.count };
  });

  const tenantsStatusData = tenantsByStatus.map((item) => ({
    name: TENANT_STATUS_LABELS[item.status] || item.status,
    value: item.count,
    status: item.status,
  }));

  const newTenantsData = newTenantsPerMonth.map((item) => {
    const [year, month] = item.month.split('-');
    const monthName = MONTH_LABELS[parseInt(month, 10) - 1];
    return { month: `${monthName}/${year.slice(2)}`, count: item.count };
  });

  const appointmentsStatusData = appointmentsByStatus.map((item) => ({
    name: APPOINTMENT_STATUS_LABELS[item.status] || item.status,
    value: item.count,
    status: item.status,
  }));

  const kpiCards = kpis
    ? [
        {
          label: 'Tenants',
          value: kpis.tenants.value,
          trend: kpis.tenants.trend,
          invertTrend: false,
          Icon: Building2,
          color: 'blue',
          trendHint: `novos em ${period}d`,
        },
        {
          label: 'Profissionais',
          value: kpis.professionals.value,
          trend: kpis.professionals.trend,
          invertTrend: false,
          Icon: Users,
          color: 'purple',
          trendHint: `novos em ${period}d`,
        },
        {
          label: 'Serviços',
          value: kpis.services.value,
          trend: kpis.services.trend,
          invertTrend: false,
          Icon: Briefcase,
          color: 'pink',
          trendHint: `novos em ${period}d`,
        },
        {
          label: 'Agendamentos',
          value: kpis.appointments.value,
          trend: kpis.appointments.trend,
          invertTrend: false,
          Icon: CalendarCheck,
          color: 'green',
          trendHint: `últimos ${period}d`,
        },
        {
          label: 'Conversão',
          value: `${kpis.conversion.value}%`,
          trend: kpis.conversion.trend,
          invertTrend: false,
          Icon: TrendingUp,
          color: 'yellow',
          hint: `${kpis.conversion.activated} ativos de ${kpis.conversion.total}`,
        },
        {
          label: 'Cancelamento',
          value: `${kpis.cancellation.value}%`,
          trend: kpis.cancellation.trend,
          invertTrend: true,
          Icon: XCircle,
          color: 'red',
          hint: `${kpis.cancellation.cancelled} cancelados em ${period}d`,
        },
      ]
    : [];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-violet-100', text: 'text-violet-300' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 md:h-72 bg-gray-200 rounded-2xl" />
            ))}
          </div>
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
          Aqui está a visão geral da sua plataforma.
        </p>

        {/* Filtros e atualizar */}
        <div className="flex items-center gap-2 mt-4 md:mt-6">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm flex-1 md:flex-initial">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`flex-1 md:flex-initial px-2 md:px-3 py-1.5 text-xs font-medium rounded-md transition whitespace-nowrap ${
                  period === p.value
                    ? 'bg-violet-300 text-white'
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
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-violet-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition flex-shrink-0"
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
                <p className="text-[10px] text-gray-400 leading-tight mb-0.5">
                  {card.trendHint}
                </p>
              )}
              {card.hint && (
                <p className="text-[10px] text-gray-400 leading-tight">{card.hint}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* 3 gráficos em uma linha (lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Agendamentos por dia */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-300">
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

        {/* Tenants por status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-400">
          <div className="mb-4 md:mb-6">
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Tenants por status</h2>
            <p className="text-xs text-gray-500">Distribuição atual</p>
          </div>

          {tenantsStatusData.length === 0 ? (
            <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tenantsStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {tenantsStatusData.map((entry, index) => (
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

        {/* Novos tenants por mês */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-500">
          <div className="mb-4 md:mb-6">
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Novos tenants por mês</h2>
            <p className="text-xs text-gray-500">Últimos 6 meses</p>
          </div>

          {newTenantsData.length === 0 ? (
            <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newTenantsData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} name="Novos tenants" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top tenants + Agendamentos por status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Top 5 tenants */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-500">
          <div className="mb-4 md:mb-6">
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Top 5 tenants</h2>
            <p className="text-xs text-gray-500">Por número de agendamentos nos últimos {period} dias</p>
          </div>

          {topTenants.length === 0 ? (
            <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTenants} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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

        {/* Agendamentos por status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-500">
          <div className="mb-4 md:mb-6">
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Agendamentos por status</h2>
            <p className="text-xs text-gray-500">Últimos {period} dias</p>
          </div>

          {appointmentsStatusData.length === 0 ? (
            <div className="h-56 md:h-64 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          ) : (
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appointmentsStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {appointmentsStatusData.map((entry, index) => (
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
      </div>

      {/* Ações rápidas */}
      <div className="animate-fade-in-up delay-500">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Link
            to="/super-admin/tenants/new"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 flex items-center gap-4 hover:shadow-md hover:border-violet-200 transition group"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-violet-300 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 group-hover:text-violet-300 transition text-sm md:text-base truncate">
                Criar novo tenant
              </p>
              <p className="text-xs text-gray-500 truncate">
                Cadastre um novo estabelecimento manualmente
              </p>
            </div>
          </Link>

          <Link
            to="/super-admin/users/new"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 flex items-center gap-4 hover:shadow-md hover:border-purple-200 transition group"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition text-sm md:text-base truncate">
                Criar novo usuário
              </p>
              <p className="text-xs text-gray-500 truncate">
                Adicione um administrador a um tenant
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}