import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, DollarSign, BookOpen, Home, Shield,
  Heart, Scale, UserCheck, Clipboard,
  User, ChevronRight, Eye, EyeOff, Lock, Mail,
  AlertCircle, Zap, ArrowLeft, CheckCircle,
} from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PortalCard {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: string;
  gradient: string;
}

const PORTALS: PortalCard[] = [
  { role:'HEAD_TEACHER',        label:'Head Teacher',     description:'Full school oversight & management',   icon:GraduationCap, accent:'#6366f1', gradient:'linear-gradient(135deg,#4338ca,#312e81)' },
  { role:'DEPUTY_HEAD',         label:'Deputy HM',        description:'Academic admin & timetabling',          icon:BookOpen,      accent:'#0ea5e9', gradient:'linear-gradient(135deg,#0369a1,#0c4a6e)' },
  { role:'HOD',                 label:'Head of Dept',     description:'Departmental oversight & syllabi',       icon:BookOpen,      accent:'#8b5cf6', gradient:'linear-gradient(135deg,#5b21b6,#4c1d95)' },
  { role:'EXAMINATIONS_OFFICER',label:'Exam Officer',     description:'Exams, results & paper security',        icon:Clipboard,     accent:'#7c3aed', gradient:'linear-gradient(135deg,#6d28d9,#4c1d95)' },
  { role:'TEACHER',             label:'Teacher',          description:'Attendance, marks & lesson notes',       icon:BookOpen,      accent:'#2563eb', gradient:'linear-gradient(135deg,#1d4ed8,#1e3a8a)' },
  { role:'FINANCE_OFFICER',     label:'Bursar / Finance', description:'Fee management & financial reports',     icon:DollarSign,    accent:'#0f766e', gradient:'linear-gradient(135deg,#0d5f5a,#064e3b)' },
  { role:'ECA_OFFICER',         label:'ECA Officer',      description:'Sports, clubs & extra-curricular',       icon:Clipboard,     accent:'#16a34a', gradient:'linear-gradient(135deg,#15803d,#14532d)' },
  { role:'SCHOOL_COUNSELOR',    label:'Counsellor',       description:'Student welfare & guidance',             icon:Scale,         accent:'#0d9488', gradient:'linear-gradient(135deg,#0f766e,#064e3b)' },
  { role:'NURSE',               label:'Nurse / Medical',  description:'Student health & clinic records',        icon:Heart,         accent:'#ec4899', gradient:'linear-gradient(135deg,#be185d,#9d174d)' },
  { role:'BOARDING_MASTER',     label:'Dorm Master',      description:'Dormitory & boarding management',        icon:Home,          accent:'#f97316', gradient:'linear-gradient(135deg,#c2410c,#9a3412)' },
  { role:'GATE_GUARD',          label:'Security / Gate',  description:'Student entry/exit tracking',            icon:Shield,        accent:'#dc2626', gradient:'linear-gradient(135deg,#991b1b,#7f1d1d)' },
  { role:'PARENT',              label:'Parent',           description:'View child progress & pay fees',         icon:UserCheck,     accent:'#059669', gradient:'linear-gradient(135deg,#065f46,#064e3b)' },
  { role:'SUPER_ADMIN',         label:'Super Admin',      description:'Full system control & configuration',   icon:Shield,        accent:'#7c3aed', gradient:'linear-gradient(135deg,#4c1d95,#3730a3)' },
  { role:'STUDENT',             label:'Student',          description:'Results, timetable & notices',           icon:User,          accent:'#7c3aed', gradient:'linear-gradient(135deg,#4c1d95,#3730a3)' },
];

const ROLE_ROUTES: Partial<Record<string, string>> = {
  HEAD_TEACHER          : '/ht/dashboard',
  DEPUTY_HEAD           : '/deputy-hm/dashboard',
  HOD                   : '/hod/dashboard',
  EXAMINATIONS_OFFICER  : '/exam-officer/dashboard',
  TEACHER               : '/teacher/dashboard',
  SEN_TEACHER           : '/teacher/dashboard',
  FINANCE_OFFICER       : '/bursar/dashboard',
  PAYROLL_OFFICER       : '/bursar/dashboard',
  HR_OFFICER            : '/bursar/dashboard',
  BOARDING_MASTER       : '/dorm-master/dashboard',
  HEAD_OF_BOARDING      : '/dorm-master/dashboard',
  NURSE                 : '/nurse/dashboard',
  GATE_GUARD            : '/security/dashboard',
  HEAD_OF_SECURITY      : '/security/dashboard',
  ECA_OFFICER           : '/eca/dashboard',
  SCHOOL_COUNSELOR      : '/counsellor/dashboard',
  COMMUNICATIONS_OFFICER: '/eca/dashboard',
  UNIFORM_OFFICER       : '/ht/dashboard',
  FACILITIES_MANAGER    : '/ht/dashboard',
  STUDENT               : '/student/dashboard',
  PARENT                : '/parent/dashboard',
  SUPER_ADMIN           : '/admin/dashboard',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedPortal, setSelectedPortal] = useState<PortalCard | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Login — SMISSI Portal';
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPortal) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password, selectedPortal.role);
      navigate(ROLE_ROUTES[selectedPortal.role] ?? '/ht/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const acc = selectedPortal?.accent ?? '#10b981';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif", background: '#0f172a' }}>

      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <div style={{
        width: '42%', flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '40px 48px',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d2418 50%, #0a1628 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden',
      }} className="login-left">

        {/* Orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 65%)', animation: 'orb 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', animation: 'orb 11s ease-in-out infinite 3s' }} />
          <div style={{ position: 'absolute', top: '50%', right: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)', animation: 'orb 13s ease-in-out infinite 5s' }} />
        </div>

        {/* Top: logo + back button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
              <Shield size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#f8fafc', letterSpacing: '-0.3px' }}>SMISSI</div>
              <div style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>Uganda Edition 2025</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)', color: '#64748b', fontSize: 12, fontWeight: 600,
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(16,185,129,0.12)'; el.style.borderColor = 'rgba(16,185,129,0.3)'; el.style.color = '#34d399'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.12)'; el.style.color = '#64748b'; }}
          >
            <ArrowLeft size={12} /> Back
          </button>
        </div>

        {/* Middle: headline */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '5px 12px', marginBottom: 22 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#34d399', fontSize: 11, fontWeight: 600 }}>NCDC · UNEB · MoES Aligned</span>
          </div>

          <h2 style={{ fontSize: 'clamp(24px, 2.5vw, 36px)', fontWeight: 900, lineHeight: 1.13, letterSpacing: '-1px', color: '#f8fafc', marginBottom: 14 }}>
            School Management<br />
            <span style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Information System
            </span><br />
            for Uganda Schools
          </h2>

          <p style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.7, marginBottom: 28 }}>
            A unified platform empowering every stakeholder in Uganda's education ecosystem with role-specific portals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              'Real-time attendance & academic performance',
              'Streamlined fee collection in UGX',
              'Role-based access for all 28 staff & community roles',
              'Aligned with NCDC, UNEB & MoES frameworks',
            ].map(f => (
              <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: stats */}
        <div style={{ display: 'flex', gap: 28, position: 'relative' }}>
          {[['28', 'User Roles'], ['500+', 'Schools'], ['99.9%', 'Uptime']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981', letterSpacing: '-0.3px' }}>{n}</div>
              <div style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '32px 24px', background: '#111827' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Heading */}
          <div style={{ marginBottom: 26 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.4px', marginBottom: 4 }}>
              Access Your Portal
            </h1>
            <p style={{ color: '#475569', fontSize: 13.5 }}>
              Select your role, then sign in with your credentials.
            </p>
          </div>

          {/* Role label */}
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#374151', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 10 }}>
            Select Your Role
          </div>

          {/* Role grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            {PORTALS.map(portal => {
              const active = selectedPortal?.role === portal.role;
              return (
                <button
                  key={portal.role}
                  onClick={() => setSelectedPortal(portal)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    padding: '12px 4px 10px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${active ? portal.accent : 'rgba(255,255,255,0.07)'}`,
                    background: active ? `${portal.accent}14` : 'rgba(255,255,255,0.03)',
                    boxShadow: active ? `0 0 0 3px ${portal.accent}25, 0 4px 12px rgba(0,0,0,0.3)` : 'none',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.06)'; el.style.borderColor = `${portal.accent}50`; } }}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; } }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: active ? portal.gradient : `${portal.accent}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                  }}>
                    <portal.icon size={16} color={active ? 'white' : portal.accent} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#e2e8f0' : '#475569', textAlign: 'center', lineHeight: 1.3 }}>
                    {portal.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected portal banner */}
          {selectedPortal && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 14px', borderRadius: 11, marginBottom: 20,
              background: `${selectedPortal.accent}0e`,
              border: `1.5px solid ${selectedPortal.accent}30`,
              animation: 'slideDown 0.2s ease',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: selectedPortal.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${selectedPortal.accent}40` }}>
                <selectedPortal.icon size={15} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{selectedPortal.label} Portal</div>
                <div style={{ fontSize: 11.5, color: '#475569' }}>{selectedPortal.description}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${selectedPortal.accent}20`, borderRadius: 20, padding: '3px 9px', flexShrink: 0 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: selectedPortal.accent }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: selectedPortal.accent }}>Active</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#6b7280', marginBottom: 7 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#374151" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="email" type="email" required value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@school.ug"
                  style={{
                    width: '100%', padding: '11px 12px 11px 36px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)',
                    color: '#e2e8f0', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = acc; (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.07)'; (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${acc}20`; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.05)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#6b7280' }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#374151" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{
                    width: '100%', padding: '11px 40px 11px 36px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)',
                    color: '#e2e8f0', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = acc; (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.07)'; (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${acc}20`; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.05)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, display: 'flex' }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 9, marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: 13 }}>
                <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!selectedPortal || loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: selectedPortal ? selectedPortal.gradient : 'rgba(255,255,255,0.06)',
                color: selectedPortal ? 'white' : '#374151',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                cursor: selectedPortal ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.25s',
                boxShadow: selectedPortal ? `0 4px 20px ${selectedPortal.accent}40` : 'none',
              }}
              onMouseEnter={e => { if (selectedPortal && !loading) { const el = e.currentTarget as HTMLElement; el.style.opacity = '0.88'; el.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = '1'; el.style.transform = 'none'; }}
            >
              {loading ? (
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              ) : selectedPortal ? (
                <><Zap size={15} />Sign in to {selectedPortal.label}<ChevronRight size={15} /></>
              ) : (
                'Select a role above to continue'
              )}
            </button>
          </form>

          <p style={{ color: '#1f2937', fontSize: 12, textAlign: 'center', marginTop: 20, lineHeight: 1.7 }}>
            Can't access your account?{' '}
            <a href="mailto:support@smissi.ac.ug" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
              Contact your administrator
            </a>
          </p>

          {/* Compliance badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            {['NCDC', 'UNEB', 'MoES'].map(b => (
              <span key={b} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#10b981', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orb { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box}
        input::placeholder{color:#1f2937}
        @media(max-width:860px){ .login-left{display:none!important} }
      `}</style>
    </div>
  );
}
