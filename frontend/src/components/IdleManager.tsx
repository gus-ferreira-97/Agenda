import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIdleTimeout } from '../hooks/useIdleTimeout';
import IdleWarningModal from './IdleWarningModal';

// 30 minutos de inatividade
const IDLE_TIMEOUT = 30 * 60 * 1000;
// Aviso com 1 minuto de antecedência
const WARNING_BEFORE = 60 * 1000;

export default function IdleManager() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isProtectedRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin');

  const enabled = !!token && isProtectedRoute;

  const handleTimeout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const { showWarning, secondsLeft, reset } = useIdleTimeout({
    timeout: IDLE_TIMEOUT,
    warningBefore: WARNING_BEFORE,
    onTimeout: handleTimeout,
    enabled,
  });

  if (!enabled) return null;

  const handleStay = () => {
    reset();
  };

  const handleLogoutNow = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <IdleWarningModal
      show={showWarning}
      secondsLeft={secondsLeft}
      onStay={handleStay}
      onLogout={handleLogoutNow}
    />
  );
}