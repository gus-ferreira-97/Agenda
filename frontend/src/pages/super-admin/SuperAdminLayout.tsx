import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Calendar,
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    to: '/super-admin',
    label: 'Dashboard',
    exact: true,
    icon: LayoutDashboard,
  },
  {
    to: '/super-admin/tenants',
    label: 'Tenants',
    icon: Building2,
  },
  {
    to: '/super-admin/users',
    label: 'Usuários',
    icon: Users,
  },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen z-40">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <Link to="/super-admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm block leading-tight">AgendaApp</span>
              <span className="text-xs text-gray-400">Super Admin</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Logado como</p>
              <p className="text-sm text-white truncate">{user?.email}</p>
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
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}