import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import {
  authApi, getToken, setToken, setRefreshToken, clearTokens,
} from '../lib/api';

interface AuthContextValue {
  user: User | null;
  login:      (email: string, password: string, role: UserRole) => Promise<void>;
  logout:     () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Mock fallback — used when backend is unreachable ───────────── */
const MOCK_USERS: Record<string, Partial<User>> = {
  HEAD_TEACHER:        { id: 'usr-001', name: 'Mr. Ssemanda Julius',    email: 'j.ssemanda@smissi.ac.ug'    },
  FINANCE_OFFICER:     { id: 'usr-002', name: 'Mr. Kato Emmanuel',      email: 'e.kato@smissi.ac.ug'        },
  TEACHER:             { id: 'usr-003', name: 'Ms. Nakakande Mary',     email: 'm.nakakande@smissi.ac.ug'   },
  BOARDING_MASTER:     { id: 'usr-004', name: 'Mr. Opolot Fred',        email: 'f.opolot@smissi.ac.ug'      },
  GATE_GUARD:          { id: 'usr-005', name: 'Mr. Okello Moses',       email: 'o.moses@smissi.ac.ug'       },
  NURSE:               { id: 'usr-006', name: 'Sr. Nakamya Rose',       email: 'r.nakamya@smissi.ac.ug'     },
  PAYROLL_OFFICER:     { id: 'usr-007', name: 'Ms. Akello Grace',       email: 'g.akello@smissi.ac.ug'      },
  ECA_OFFICER:         { id: 'usr-008', name: 'Mr. Ssali Brian',        email: 'b.ssali@smissi.ac.ug'       },
  SCHOOL_COUNSELOR:    { id: 'usr-009', name: 'Mrs. Namukasa Joyce',    email: 'j.namukasa@smissi.ac.ug'    },
  UNIFORM_OFFICER:     { id: 'usr-010', name: 'Mr. Mugisha Paul',       email: 'p.mugisha@smissi.ac.ug'     },
  PARENT:              { id: 'usr-011', name: 'Mr. Ochieng David',      email: 'd.ochieng@gmail.com'        },
  STUDENT:             { id: 'usr-012', name: 'Nakato Sarah',           email: 'sarah.nakato@smissi.ac.ug'  },
  DEPUTY_HEAD:         { id: 'usr-013', name: 'Ms. Achieng Prossy',     email: 'p.achieng@smissi.ac.ug'     },
  HOD:                 { id: 'usr-014', name: 'Mrs. Atim Norah',        email: 'n.atim@smissi.ac.ug'        },
  EXAMINATIONS_OFFICER:{ id: 'usr-015', name: 'Mr. Byamugisha Kenneth', email: 'k.byamugisha@smissi.ac.ug'  },
  HEAD_OF_SECURITY:    { id: 'usr-016', name: 'Sgt. Byaruhanga Peter',  email: 'p.byaruhanga@smissi.ac.ug'  },
  SUPER_ADMIN:         { id: 'usr-017', name: 'Super Admin',            email: 'admin@smissi.ac.ug'          },
};

/* ─── Provider ───────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /* Re-hydrate session from stored token on page reload */
  useEffect(() => {
    const token = getToken();
    if (!token || user) return;

    authApi.me()
      .then(u => {
        setUser({
          id:         u.id,
          name:       u.name,
          email:      u.email,
          roles:      u.roles,
          activeRole: u.activeRole ?? u.roles[0],
          schoolName: u.schoolName ?? '',
          schoolId:   u.schoolId  ?? '',
        });
      })
      .catch(() => clearTokens()); // token expired / invalid — clear it
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── login ────────────────────────────────────────────────────── */
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    try {
      /* ── Try real backend ── */
      const res = await authApi.login(email, password, role);
      setToken(res.accessToken);
      setRefreshToken(res.refreshToken);

      setUser({
        id:         res.user.id,
        name:       res.user.name,
        email:      res.user.email,
        roles:      res.user.roles,
        activeRole: res.user.activeRole ?? role,
        schoolName: res.user.schoolName ?? '',
        schoolId:   res.user.schoolId   ?? '',
      });

    } catch (err: any) {
      /* ── Backend unavailable → fall back to mock ── */
      const networkErr = err?.message?.includes('fetch')
        || err?.message?.includes('Failed to fetch')
        || err?.message?.includes('NetworkError');

      if (!networkErr) {
        // Real auth error (wrong password, invalid role) — propagate
        throw err;
      }

      console.warn('[AuthContext] Backend unreachable — using mock user');
      await new Promise<void>(r => setTimeout(r, 400));
      const mockData = MOCK_USERS[role] ?? { id: 'usr-000', name: 'Unknown User', email };
      setUser({
        id:         mockData.id!,
        name:       mockData.name!,
        email:      mockData.email!,
        roles:      [role],
        activeRole: role,
        schoolName: 'SMISSI Secondary School',
        schoolId:   'sch-001',
      });
    }
  };

  /* ── logout ───────────────────────────────────────────────────── */
  const logout = () => {
    clearTokens();
    setUser(null);
  };

  /* ── switchRole ───────────────────────────────────────────────── */
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
