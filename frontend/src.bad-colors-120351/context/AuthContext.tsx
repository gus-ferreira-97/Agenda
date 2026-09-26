import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { isTokenValid } from '../utils/jwt';

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  tenantId?: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Carrega o usuário do localStorage apenas se o token existir e for válido.
 * Limpa o storage caso contrário (evita usuário fantasma com token expirado).
 */
function loadInitialUser(): User | null {
  try {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser || !isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

/**
 * Sincroniza o contexto do usuário no Sentry.
 * Chamado no login, no boot e no logout (com null).
 */
function syncSentryUser(user: User | null): void {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({
    id: String(user.userId),
    email: user.email,
    username: user.name,
  });
  Sentry.setTag('role', user.role);
  if (user.tenantId) {
    Sentry.setTag('tenantId', String(user.tenantId));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem('token');
    return t && isTokenValid(t) ? t : null;
  });
  const [user, setUser] = useState<User | null>(loadInitialUser);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    syncSentryUser(null);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    syncSentryUser(newUser);
  }, []);

  // Sincroniza o Sentry sempre que o user mudar (boot + login + logout)
  useEffect(() => {
    syncSentryUser(user);
  }, [user]);

  // Escuta o evento disparado pelo interceptor do axios quando o token expira
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}