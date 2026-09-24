import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as Sentry from '@sentry/react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sincroniza o Sentry quando o provider monta
  // (cobre o caso de usuário já logado ao recarregar a página)
  useEffect(() => {
    if (user) {
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
  }, [user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Sentry: associa o usuário logado
    Sentry.setUser({
      id: String(newUser.userId),
      email: newUser.email,
      username: newUser.name,
    });
    Sentry.setTag('role', newUser.role);
    if (newUser.tenantId) {
      Sentry.setTag('tenantId', String(newUser.tenantId));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Sentry: limpa o usuário (evita associar erros futuros a quem já saiu)
    Sentry.setUser(null);
  };

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