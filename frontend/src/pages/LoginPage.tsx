import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, DollarSign, BookOpen, Home, Shield,
  Heart, Scale, UserCheck, Clipboard,
  User, Eye, EyeOff, Lock, Mail,
  AlertCircle, ArrowLeft, CheckCircle, Zap, ChevronRight,
} from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primaryBlue: '#2563eb',
  indigo:      '#4f46e5',
  teal:        '#14b8a6',
  white:       '#ffffff',
  lightGray:   '#f9fafb',
  borderGray:  '#e5e7eb',
  textGray:    '#9ca3af',
  darkText:    '#111827',
  lightBlue:   '#eff6ff',
};

// ─── Portal definitions ────────────────────────────────────────────────────────
interface PortalCard {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  accent: string;
  bg: string;
}

const PORTALS: PortalCard[] = [
  { role: 'HEAD_TEACHER',         label: 'Head Teacher',    description: 'Full school oversight & management',  icon: GraduationCap, accent: C.indigo,      bg: '#f5f3ff' },
  { role: 'DEPUTY_HEAD',          label: 'Deputy Head',     description: 'Academic admin & timetabling',         icon: BookOpen,      accent: '#7c3aed',     bg: '#faf5ff' },
  { role: 'HOD',                  label: 'Head of Dept',    description: 'Departmental oversight',               icon: BookOpen,      accent: '#0891b2',     bg: '#ecfeff' },
  { role: 'EXAMINATIONS_OFFICER', label: 'Exam Officer',    description: 'Exams & results management',           icon: Clipboard,     accent: C.indigo,      bg: '#f5f3ff' },
  { role: 'TEACHER',              label: 'Teacher',         description: 'Attendance, marks & lessons',          icon: BookOpen,      accent: C.primaryBlue, bg: C.lightBlue },
  { role: 'FINANCE_OFFICER',      label: 'Finance',         description: 'Fee management & reports',             icon: DollarSign,    accent: '#16a34a',     bg: '#f0fdf4' },
  { role: 'ECA_OFFICER',          label: 'ECA Officer',     description: 'Sports, clubs & activities',           icon: Clipboard,     accent: '#d97706',     bg: '#fffbeb' },
  { role: 'SCHOOL_COUNSELOR',     label: 'Counsellor',      description: 'Student welfare & guidance',           icon: Scale,         accent: C.teal,        bg: '#f0fdfa' },
  { role: 'NURSE',                label: 'Nurse / Medical', description: 'Student health & clinic',              icon: Heart,         accent: '#e11d48',     bg: '#fff1f2' },
  { role: 'BOARDING_MASTER',      label: 'Dorm Master',     description: 'Dormitory & boarding',                 icon: Home,          accent: '#f97316',     bg: '#fff7ed' },
  { role: 'GATE_GUARD',           label: 'Security',        description: 'Gate access & visitor logs',           icon: Shield,        accent: '#dc2626',     bg: '#fef2f2' },
  { role: 'PARENT',               label: 'Parent',          description: 'Child progress & fee payment',         icon: UserCheck,     accent: '#059669',     bg: '#f0fdf4' },
  { role: 'SUPER_ADMIN',          label: 'Super Admin',     description: 'Full system control',                  icon: Shield,        accent: C.indigo,      bg: '#f5f3ff' },
  { role: 'STUDENT',              label: 'Student',         description: 'Results, timetable & notices',         icon: User,          accent: C.primaryBlue, bg: C.lightBlue },
];

const ROLE_ROUTES: Partial<Record<string, string>> = {
  HEAD_TEACHER:           '/ht/dashboard',
  DEPUTY_HEAD:            '/deputy-hm/dashboard',
  HOD:                    '/hod/dashboard',
  EXAMINATIONS_OFFICER:   '/exam-officer/dashboard',
  TEACHER:                '/teacher/dashboard',
  SEN_TEACHER:            '/teacher/dashboard',
  FINANCE_OFFICER:        '/bursar/dashboard',
  PAYROLL_OFFICER:        '/bursar/dashboard',
  HR_OFFICER:             '/bursar/dashboard',
  BOARDING_MASTER:        '/dorm-master/dashboard',
  HEAD_OF_BOARDING:       '/dorm-master/dashboard',
  NURSE:                  '/nurse/dashboard',
  GATE_GUARD:             '/security/dashboard',
  HEAD_OF_SECURITY:       '/security/dashboard',
  ECA_OFFICER:            '/eca/dashboard',
  SCHOOL_COUNSELOR:       '/counsellor/dashboard',
  COMMUNICATIONS_OFFICER: '/eca/dashboard',
  UNIFORM_OFFICER:        '/ht/dashboard',
  FACILITIES_MANAGER:     '/ht/dashboard',
  STUDENT:                '/student/dashboard',
  PARENT:                 '/parent/dashboard',
  SUPER_ADMIN:            '/admin/dashboard',
};

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [selectedPortal, setSelectedPortal] = useState<PortalCard | null>(null);
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [showPassword,   setShowPassword]   = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  useEffect(() => { document.title = 'Sign In — SMISSI Portal'; }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPortal) return;
    setLoading(true); setError('');
    try {
      await login(email, password, selectedPortal.role);
      navigate(ROLE_ROUTES[selectedPortal.role] ?? '/ht/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const acc = selectedPortal?.accent ?? C.primaryBlue;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji'",
    }}>

      {/* ═══ LEFT PANEL ════════════════════════════════════════════════════════ */}
      <div style={{
        width: '42%', flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '36px 40px',
        background: 'linear-gradient(160deg, #dbeafe 0%, #ede9fe 55%, #ecfdf5 100%)',
        borderRight: `1px solid rgba(229,231,235,0.5)`,
        position: 'relative', overflow: 'hidden',
      }} className="login-left">

        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -100, right: -80, width: 380, height: 380, borderRadius: '50%', background: `radial-gradient(circle, ${C.primaryBlue}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${C.teal}15 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* ── Top: Logo + Back ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 18px ${C.primaryBlue}40` }}>
              <Shield size={20} color="white" strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 19, color: C.darkText, letterSpacing: '-0.5px' }}>SMISSI</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 1 }}>🇺🇬 Uganda Edition 2025</div>
            </div>
          </div>

          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.75)', border: `1px solid rgba(255,255,255,0.9)`,
            color: '#374151', fontSize: 13, fontWeight: 600, padding: '8px 14px',
            borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            backdropFilter: 'blur(8px)',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.95)'; el.style.color = C.primaryBlue; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.75)'; el.style.color = '#374151'; }}
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>

        {/* ── Middle: Headline + Features ── */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 32, paddingBottom: 32 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,0.1)', border: `1px solid ${C.primaryBlue}35`, borderRadius: 20, padding: '6px 14px', marginBottom: 18, width: 'fit-content' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primaryBlue, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✓ Certified & Aligned</span>
          </div>

          {/* Headline */}
          <h2 style={{ fontSize: 'clamp(26px, 2.8vw, 38px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', color: C.darkText, marginBottom: 14 }}>
            Transform Your<br />
            <span style={{ background: `linear-gradient(135deg, ${C.primaryBlue}, ${C.indigo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              School Management
            </span>
          </h2>

          <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 320 }}>
            Complete management solution for Uganda schools. Trusted by 500+ institutions serving 1M+ students.
          </p>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { icon: '📊', title: 'Real-Time Analytics', desc: 'Attendance, grades & reports' },
              { icon: '💰', title: 'Fee Management',      desc: 'UGX payments & tracking'     },
              { icon: '🔐', title: 'Role-Based Access',   desc: '28 staff & community roles'  },
              { icon: '⚙️', title: 'Framework Aligned',   desc: 'NCDC, UNEB & MoES'           },
            ].map(f => (
              <div key={f.title} style={{
                padding: '12px 14px', borderRadius: 11,
                background: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.9)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.65)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 18, marginBottom: 5 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.darkText, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)', marginBottom: 20 }} />

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { number: '28',   label: 'User Roles', icon: '👥' },
              { number: '500+', label: 'Schools',    icon: '🏫' },
              { number: '99.9%',label: 'Uptime',     icon: '⚡' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.primaryBlue, letterSpacing: '-0.5px' }}>{s.number}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 3 }}>
                  <span style={{ fontSize: 12 }}>{s.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#4b5563' }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom: Trust badges ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>🏆 Trusted by Institutions</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['NCDC', 'UNEB', 'MoES', 'REB'].map(org => (
              <div key={org} style={{
                padding: '5px 12px', borderRadius: 14,
                background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)',
                fontSize: 11, fontWeight: 800, color: C.primaryBlue, backdropFilter: 'blur(8px)',
              }}>{org}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto', padding: '32px 24px', background: C.white,
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Heading */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.darkText, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Secure Access Portal
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
              Select your role and securely log in to manage your school.
            </p>
          </div>

          {/* Role label */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
            Select Your Portal Role
          </div>

          {/* Role grid — 7 per row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 22 }} className="role-grid">
            {PORTALS.map(portal => {
              const active = selectedPortal?.role === portal.role;
              return (
                <button
                  key={portal.role}
                  onClick={() => { setSelectedPortal(portal); setError(''); }}
                  title={portal.description}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 6px 10px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'inherit',
                    border: `1.5px solid ${active ? portal.accent : C.borderGray}`,
                    background: active ? portal.bg : C.white,
                    boxShadow: active ? `0 0 0 3px ${portal.accent}18` : 'none',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = portal.accent;
                      el.style.background = portal.bg;
                      el.style.transform = 'translateY(-2px)';
                      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = C.borderGray;
                      el.style.background = C.white;
                      el.style.transform = 'none';
                      el.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: active ? portal.accent : portal.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${active ? 'transparent' : portal.accent + '28'}`,
                    transition: 'all 0.18s',
                    flexShrink: 0,
                  }}>
                    <portal.icon size={15} color={active ? C.white : portal.accent} strokeWidth={1.8} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: active ? portal.accent : '#4b5563',
                    textAlign: 'center', lineHeight: 1.3,
                    width: '100%', overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {portal.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected portal banner */}
          {selectedPortal ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 16px', borderRadius: 11, marginBottom: 24,
              background: selectedPortal.bg,
              border: `1.5px solid ${selectedPortal.accent}45`,
              animation: 'fadeIn 0.2s ease',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: selectedPortal.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <selectedPortal.icon size={17} color={C.white} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.darkText }}>{selectedPortal.label} Portal</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{selectedPortal.description}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${selectedPortal.accent}15`, borderRadius: 16, padding: '4px 10px', flexShrink: 0, border: `1px solid ${selectedPortal.accent}25` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: selectedPortal.accent, animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: selectedPortal.accent }}>ACTIVE</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '12px 16px', borderRadius: 11, marginBottom: 24, background: '#f9fafb', border: `1.5px dashed ${C.borderGray}`, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Please select a role above to continue
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.darkText, marginBottom: 7 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="email" type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@school.ac.ug"
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px', borderRadius: 9,
                    background: '#f9fafb', border: `1.5px solid ${C.borderGray}`,
                    color: C.darkText, fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { const el = e.target as HTMLInputElement; el.style.borderColor = acc; el.style.background = C.white; el.style.boxShadow = `0 0 0 3px ${acc}15`; }}
                  onBlur={e => { const el = e.target as HTMLInputElement; el.style.borderColor = C.borderGray; el.style.background = '#f9fafb'; el.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.darkText }}>Password</label>
                <a href="#" style={{ fontSize: 13, color: C.primaryBlue, textDecoration: 'none', fontWeight: 600 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
                >Forgot Password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  style={{
                    width: '100%', padding: '11px 42px 11px 40px', borderRadius: 9,
                    background: '#f9fafb', border: `1.5px solid ${C.borderGray}`,
                    color: C.darkText, fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { const el = e.target as HTMLInputElement; el.style.borderColor = acc; el.style.background = C.white; el.style.boxShadow = `0 0 0 3px ${acc}15`; }}
                  onBlur={e => { const el = e.target as HTMLInputElement; el.style.borderColor = C.borderGray; el.style.background = '#f9fafb'; el.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{
                  position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                  padding: 4, display: 'flex', borderRadius: 5, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = acc; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 9, marginBottom: 16, background: '#fef2f2', border: `1px solid #fca5a5`, color: '#991b1b', fontSize: 13, animation: 'fadeIn 0.2s ease' }}>
                <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!selectedPortal || loading}
              style={{
                width: '100%', padding: '13px 18px', borderRadius: 9, border: 'none',
                background: selectedPortal ? acc : '#e5e7eb',
                color: selectedPortal ? C.white : '#9ca3af',
                fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                cursor: selectedPortal ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: selectedPortal ? `0 4px 20px ${acc}35` : 'none',
              }}
              onMouseEnter={e => { if (selectedPortal && !loading) { const el = e.currentTarget as HTMLElement; el.style.opacity = '0.9'; el.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = '1'; el.style.transform = 'none'; }}
            >
              {loading ? (
                <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: C.white, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} />
              ) : selectedPortal ? (
                <><Zap size={15} strokeWidth={2} /> Sign in to {selectedPortal.label} <ChevronRight size={15} strokeWidth={2} /></>
              ) : (
                'Select a role above to continue'
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.borderGray}`, flexWrap: 'wrap', gap: 10 }}>
            <p style={{ color: '#6b7280', fontSize: 13 }}>
              🆘 Need assistance?{' '}
              <a href="mailto:support@smissi.ac.ug" style={{ color: C.primaryBlue, fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}
              >Contact support</a>
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['🏛 NCDC', '✅ UNEB', '📚 MoES'].map(b => (
                <span key={b} style={{ background: C.lightBlue, border: `1px solid #bfdbfe`, color: '#1e40af', fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 6 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
        input::placeholder { color: #a6aeb7; }

        @media (max-width: 900px) {
          .login-left { display: none !important; }
        }
        @media (max-width: 560px) {
          .role-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 380px) {
          .role-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
