import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Calendar,
  LayoutDashboard,
  Users,
  Briefcase,
  Clock,
  Link2,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  X,
  ExternalLink,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TrialBanner from './TrialBanner';
import TrialBlockedScreen from './TrialBlockedScreen';
import { useTrial } from '../hooks/useTrial';
import { useTenantInfo } from '../hooks/useTenantInfo';

const navItems = [
  {
    to: '/admin',
    label: 'Dashboard',
    exact: true,
    icon: LayoutDashboard,
  },
  {
    to: '/admin/appointments',
    label: 'Agendamentos',
    icon: Calendar,
  },
  {
    to: '/admin/professionals',
    label: 'Profissionais',
    icon: Users,
  },
  {
    to: '/admin/services',
    label: 'Serviços',
    icon: Briefcase,
  },
  {
    to: '/admin/schedules',
    label: 'Horários',
    icon: Clock,
  },
  {
    to: '/admin/professional-services',
    label: 'Associações',
    icon: Link2,
  },
  {
    to: '/admin/settings',
    label: 'Configurações',
    icon: SettingsIcon,
  },
  {
    to: '/admin/profile',
    label: 'Meu Perfil',
    icon: UserCircle,
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { trial, loading: trialLoading } = useTrial();
  const { tenant } = useTenantInfo();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Bloqueia scroll do body quando o menu está aberto em mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  // Derived state (antes do SidebarContent — evita closure frágil)
  const publicUrl = tenant?.subdomain
    ? `${window.location.protocol}//${window.location.host}/agendar`
    : null;

  // Early return: trial expirado bloqueia o painel
  if (!trialLoading && trial?.isExpired) {
    return <TrialBlockedScreen />;
  }

  const SidebarContent = () => (
      <>
        {/* Logo */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm block leading-tight">Agendy</span>
              <span className="text-xs text-gray-400">Painel</span>
            </div>
          </Link>

          {/* Botão fechar (apenas em mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link para a agenda pública */}
        {publicUrl && (
          <div className="p-4 border-t border-gray-800">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-violet-300 hover:bg-violet-600/10 hover:text-violet-200 transition group"
            >
              <ExternalLink className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 truncate">Ver minha agenda</span>
            </a>
          </div>
        )}



        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuário + Sair */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Logado como</p>
              <p className="text-sm text-white truncate">{user?.name || user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar desktop (fixa) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 text-gray-300 shrink-0 md:sticky md:top-0 md:h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-gray-300 flex flex-col z-50 md:hidden animate-slide-in">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar mobile */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 p-1"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Agendy</span>
          </Link>

          <div className="w-6" /> {/* Espaçador para centralizar a logo */}
        </header>

        <main className="flex-1 min-w-0">
          {trial && !trialLoading && <TrialBanner trial={trial} />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}