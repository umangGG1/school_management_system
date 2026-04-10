import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USER: User = {
  id: 'usr-001',
  name: 'Mr. Musoke',
  email: 'musoke@smissi.ug',
  roles: ['HEAD_TEACHER', 'DEPUTY_HEAD', 'TEACHER'],
  activeRole: 'HEAD_TEACHER',
  schoolName: 'Kampala Secondary School',
  schoolId: 'sch-001',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (_email: string, _password: string, role: UserRole): Promise<void> => {
    // Mock login — always succeeds
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    setUser({ ...MOCK_USER, activeRole: role });
  };

  const logout = () => setUser(null);

  const switchRole = (role: UserRole) => {
    if (user) setUser({ ...user, activeRole: role });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
