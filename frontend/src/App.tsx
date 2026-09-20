import type { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PublicBooking from './pages/PublicBooking';
import DashboardLayout from './components/DashboardLayout';
import Professionals from './pages/dashboard/Professionals';
import Services from './pages/dashboard/Services';
import Schedules from './pages/dashboard/Schedules';
import ProfessionalForm from './pages/dashboard/ProfessionalForm';
import ServiceForm from './pages/dashboard/ServiceForm';
import ScheduleForm from './pages/dashboard/ScheduleForm';
import Appointments from './pages/dashboard/Appointments';
import ProfessionalServices from './pages/dashboard/ProfessionalServices';
import SuperAdminLayout from './pages/super-admin/SuperAdminLayout';
import Tenants from './pages/super-admin/Tenants';
import TenantForm from './pages/super-admin/TenantForm';
import Users from './pages/super-admin/Users';
import UserForm from './pages/super-admin/UserForm';
import SuperAdminHome from './pages/super-admin/SuperAdminHome';
import LandingPage from './pages/LandingPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TenantDashboard from './pages/dashboard/TenantDashboard';
import Settings from './pages/dashboard/Settings';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import IdleManager from './components/IdleManager';
import TenantNoIndex from './components/TenantNoIndex';

function PrivateRoute({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TenantNoIndex />
        <ScrollToTop />
        <CookieConsent />
        <IdleManager />
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/agendar" element={<PublicBooking />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<TenantDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="professionals" element={<Professionals />} />
            <Route path="services" element={<Services />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="professionals/new" element={<ProfessionalForm />} />
            <Route path="professionals/:id/edit" element={<ProfessionalForm />} />
            <Route path="services/new" element={<ServiceForm />} />
            <Route path="services/:id/edit" element={<ServiceForm />} />
            <Route path="schedules/new" element={<ScheduleForm />} />
            <Route path="schedules/:id/edit" element={<ScheduleForm />} />
            <Route path="professional-services" element={<ProfessionalServices />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/super-admin"
            element={
              <PrivateRoute>
                <SuperAdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<SuperAdminHome />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="tenants/new" element={<TenantForm />} />
            <Route path="tenants/:id/edit" element={<TenantForm />} />
            <Route path="users" element={<Users />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/:id/edit" element={<UserForm />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<PublicBooking />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;