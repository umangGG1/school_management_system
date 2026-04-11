import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── helpers ────────────────────────────────────────────────────── */
type ToastT = { id: number; msg: string; type: 'success' | 'warning' | 'info' | 'default' };
type Page = 'dashboard' | 'timetable' | 'security' | 'invigilation' | 'results' | 'analysis' | 'uneb' | 'certificates' | 'communications' | 'announcements' | 'portals' | 'settings';
type TtTab = 'finals' | 'internal' | 'trial';
type ResTab = 'entry' | 'verify' | 'publish';

const V = {
  acc: '#7c3aed', accSoft: '#f5f3ff', accDark: '#4c1d95',
  success: '#10b981', successSoft: '#ecfdf5',
  danger: '#ef4444', dangerSoft: '#fef2f2',
  warn: '#f59e0b', warnSoft: '#fffbeb',
  blue: '#3b82f6', blueSoft: '#eff6ff',
  teal: '#14b8a6', tealSoft: '#f0fdfa',
  orange: '#f97316', orangeSoft: '#fff7ed',
  indigo: '#6366f1', indigoSoft: '#eef2ff',
  gold: '#d97706', goldSoft: '#fef3c7',
  bg: '#faf8ff', card: '#fff', border: '#e2e8f0',
  text: '#1e293b', muted: '#64748b', light: '#94a3b8',
  primary: '#1e293b',
};

const RES_STUDENTS: Record<string, string[]> = {
  S4A: ['Akello Rose', 'Byamugisha Peter', 'Chebet Sarah', 'Ddungu Moses', 'Ezati John', 'Farida Amina', 'Gatete Sam', 'Harriet Nakato', 'Ismail Karim', 'Jjuuko Fred', 'Kamara Levi', 'Lutaaya Dennis'],
  S4B: ['Mugisha Brian', 'Nakamya Doris', 'Opio Charles', 'Ssali Kevin', 'Tumwine Eric', 'Nakabugo Rita', 'Mukasa Joseph', 'Apio Grace', 'Wasswa Daniel', 'Namutebi Joan'],
  S5A: ['Mugisha Ronald', 'Ssemakula Brian', 'Akello Grace', 'Namukasa Donna', 'Byaruhanga Tim', 'Kibirige Aaron', 'Nakabugo Sandra', 'Oloka Peter'],
  S6A: ['Ssemakula Brian', 'Namukasa Joyce', 'Mugisha Ronald', 'Akello Grace', 'Byarugaba Tim', 'Kato Alex', 'Nakiganda Joy', 'Opio Sam'],
};
function getGrade(p: number) {
  if (p >= 80) return { g: 'A', color: '#15803d', bg: '#dcfce7' };
  if (p >= 65) return { g: 'B', color: '#1d4ed8', bg: '#dbeafe' };
  if (p >= 50) return { g: 'C', color: '#854d0e', bg: '#fef9c3' };
  if (p >= 40) return { g: 'D', color: '#b91c1c', bg: '#fee2e2' };
  return { g: 'F', color: '#6b7280', bg: '#f3f4f6' };
}

/* ── sub-components ─────────────────────────────────────────────── */
function Chip({ col, children }: { col: string; children: React.ReactNode }) {
  const map: Record<string, [string, string]> = {
    gr: [V.successSoft, V.success], re: [V.dangerSoft, V.danger],
    am: [V.warnSoft, '#b45309'], bl: [V.blueSoft, V.blue],
    pu: [V.accSoft, V.acc], te: [V.tealSoft, V.teal],
    gy: ['#f1f5f9', V.muted], go: [V.goldSoft, V.gold],
  };
  const [bg, color] = map[col] ?? ['#f1f5f9', V.muted];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: bg, color }}>
      <span style={{ fontSize: 7 }}>●</span>{children}
    </span>
  );
}
function Btn({ variant = 'se', size = 'md', onClick, children, disabled }: { variant?: string; size?: string; onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  const colors: Record<string, [string, string, string]> = {
    pr: [V.acc, '#fff', 'transparent'], se: ['#f8fafc', V.text, V.border],
    da: [V.dangerSoft, V.danger, 'rgba(239,68,68,.2)'], wa: [V.warnSoft, '#b45309', 'rgba(245,158,11,.2)'],
    su: [V.successSoft, V.success, 'rgba(16,185,129,.2)'], dk: [V.primary, '#fff', 'transparent'],
  };
  const [bg, color, border] = colors[variant] ?? colors.se;
  const pad = size === 'sm' ? '4px 10px' : '7px 14px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <button disabled={disabled} onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: pad, borderRadius: 8,
      fontSize: fs, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', border: `1px solid ${border}`,
      background: bg, color, fontFamily: 'inherit', transition: 'all .15s', opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: V.card, borderRadius: 12, border: `1px solid ${V.border}`, boxShadow: '0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)', padding: 18, ...style }}>{children}</div>;
}
function CardHead({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>{action}</div>;
}
function Progress({ label, value, pct, col }: { label: string; value: string; pct: number; col: string }) {
  const colMap: Record<string, string> = { gr: V.success, bl: V.blue, am: V.warn, re: V.danger, pu: V.acc, go: V.gold };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: V.muted }}>{value}</span>
      </div>
      <div style={{ height: 7, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: colMap[col] ?? V.acc }} />
      </div>
    </div>
  );
}
function StatCard({ col, icon, val, label, badge, onClick }: { col: string; icon: string; val: string; label: string; badge?: [string, string]; onClick?: () => void }) {
  const topCols: Record<string, string> = { gr: V.success, re: V.danger, am: V.warn, bl: V.blue, te: V.teal, or: V.orange, pu: V.acc, go: V.gold, '': V.acc };
  const bgCols: Record<string, string> = { gr: V.successSoft, re: V.dangerSoft, am: V.warnSoft, bl: V.blueSoft, te: V.tealSoft, or: V.orangeSoft, pu: V.accSoft, go: V.goldSoft, '': V.accSoft };
  return (
    <div onClick={onClick} style={{ background: V.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${V.border}`, borderTop: `3px solid ${topCols[col] ?? V.acc}`, boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: onClick ? 'pointer' : 'default', transition: 'all .2s' }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'none')}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: bgCols[col] ?? V.accSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{icon}</div>
        {badge && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: badge[0] === 'up' ? V.successSoft : badge[0] === 'dn' ? V.dangerSoft : '#f1f5f9', color: badge[0] === 'up' ? V.success : badge[0] === 'dn' ? V.danger : V.muted }}>{badge[1]}</span>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{val}</div>
      <div style={{ fontSize: 11, color: V.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ── Modal wrapper ───────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.42)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: V.card, borderRadius: 14, padding: 24, width: 520, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)', animation: 'mIn .2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${V.border}`, background: '#f8fafc', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 700, color: V.muted, marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</label>{children}</div>;
}
function FI({ placeholder, value, type = 'text' }: { placeholder?: string; value?: string; type?: string }) {
  return <input defaultValue={value} type={type} placeholder={placeholder} style={{ width: '100%', padding: '8px 11px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#f8fafc', color: V.text, outline: 'none', boxSizing: 'border-box' }} />;
}
function FS({ children }: { children: React.ReactNode }) {
  return <select style={{ width: '100%', padding: '8px 11px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#f8fafc', color: V.text, outline: 'none' }}>{children}</select>;
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function ExamOfficerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>('dashboard');
  const [ttTab, setTtTab] = useState<TtTab>('finals');
  const [resTab, setResTab] = useState<ResTab>('entry');
  const [resClass, setResClass] = useState('S4A');
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<ToastT[]>([]);

  // Modals
  const [modals, setModals] = useState({ addExam: false, examDetail: false, paperLog: false, invig: false, circular: false, cert: false });
  const openModal = (k: keyof typeof modals) => setModals(m => ({ ...m, [k]: true }));
  const closeModal = (k: keyof typeof modals) => setModals(m => ({ ...m, [k]: false }));

  const toast = useCallback((msg: string, type: ToastT['type'] = 'default') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  // init marks
  useEffect(() => {
    const init: Record<string, number> = {};
    Object.entries(RES_STUDENTS).forEach(([cls, students]) => {
      students.forEach((_, i) => { init[cls + i] = Math.floor(Math.random() * 35 + 30); });
    });
    setMarks(init);
  }, []);

  // init toasts
  useEffect(() => {
    setTimeout(() => toast('3 papers not yet secured in vault — action needed', 'warning'), 800);
    setTimeout(() => toast('UNEB inspection in 6 days — checklist has 6 items outstanding', 'info'), 2400);
  }, [toast]);

  const students = RES_STUDENTS[resClass] ?? RES_STUDENTS.S4A;
  const scores = students.map((name, i) => ({ name, m: marks[resClass + i] ?? 50, pct: Math.round((marks[resClass + i] ?? 50) / 80 * 100) }));
  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x.pct, 0) / scores.length) : 0;
  const pass = scores.filter(x => x.pct >= 50).length;
  const sorted = [...scores].sort((a, b) => b.pct - a.pct);

  const pageTitle: Record<Page, string> = {
    dashboard: 'Dashboard', timetable: 'Exam Timetable', security: 'Paper Security',
    invigilation: 'Invigilation', results: 'Results Entry', analysis: 'Results Analysis',
    uneb: 'UNEB Registration', certificates: 'Certificates & Transcripts',
    communications: 'Communications', announcements: 'Announcements', portals: 'Portals', settings: 'Settings',
  };

  const navSections = [
    { label: 'Overview', items: [{ id: 'dashboard', icon: '🏠', label: 'Dashboard' }, { id: 'announcements', icon: '📣', label: 'Announcements', badge: 2, badgeT: 're' }] },
    { label: 'Examinations', items: [{ id: 'timetable', icon: '📅', label: 'Exam Timetable' }, { id: 'security', icon: '🔒', label: 'Paper Security', badge: 3, badgeT: 'am' }, { id: 'invigilation', icon: '👁️', label: 'Invigilation' }, { id: 'results', icon: '✅', label: 'Results Entry' }] },
    { label: 'Analysis & Records', items: [{ id: 'analysis', icon: '📊', label: 'Results Analysis' }, { id: 'uneb', icon: '🇺🇬', label: 'UNEB Registration' }, { id: 'certificates', icon: '🎓', label: 'Certificates' }] },
    { label: 'Admin', items: [{ id: 'communications', icon: '💬', label: 'Communications', badge: 4, badgeT: 're' }, { id: 'portals', icon: '🔗', label: 'Portals' }] },
  ];

  /* ── Sidebar ── */
  const Sidebar = () => (
    <div style={{ width: 256, background: V.primary, minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,.22)', border: '1px solid rgba(124,58,237,.38)', borderRadius: 8, padding: '7px 10px', marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: V.acc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📝</div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.9)', letterSpacing: '.07em', textTransform: 'uppercase' }}>SMISSI</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Examination Officer</div></div>
        </div>
      </div>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>EO</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.name ?? 'Mr. Examinations Officer'}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.38)' }}>Exams & Assessment</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: V.success, marginLeft: 'auto', boxShadow: '0 0 0 2px rgba(16,185,129,.25)' }} />
      </div>
      {navSections.map(sec => (
        <div key={sec.label} style={{ padding: '10px 8px 2px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', letterSpacing: '.12em', padding: '0 6px', marginBottom: 3 }}>{sec.label}</div>
          {sec.items.map(item => (
            <div key={item.id} onClick={() => setPage(item.id as Page)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 8px', borderRadius: 7, cursor: 'pointer',
              color: page === item.id ? '#fff' : 'rgba(255,255,255,.52)', fontSize: 12, fontWeight: 500, marginBottom: 1,
              background: page === item.id ? 'rgba(124,58,237,.3)' : 'transparent', position: 'relative',
              transition: 'all .15s',
            }}>
              {page === item.id && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: V.acc, borderRadius: '0 3px 3px 0' }} />}
              <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: item.badgeT === 'am' ? V.warn : V.danger, color: item.badgeT === 'am' ? '#000' : '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 20 }}>{item.badge}</span>}
            </div>
          ))}
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: 10, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div onClick={() => setPage('settings')} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 8px', borderRadius: 7, cursor: 'pointer', color: 'rgba(255,255,255,.52)', fontSize: 12, marginBottom: 7 }}>
          <span>⚙️</span> Settings
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none', background: 'rgba(239,68,68,.12)', color: '#fca5a5', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );

  /* ── Topbar ── */
  const Topbar = () => (
    <header style={{ height: 60, background: V.card, borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{pageTitle[page]}</div>
        <div style={{ fontSize: 11, color: V.muted, marginTop: 1 }}>Examination Officer · Term 1, Week 8 · UNEB Inspection in 6 days</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ background: V.dangerSoft, color: V.danger, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: `1px solid rgba(239,68,68,.2)`, animation: 'pulse 2s infinite' }}>🚨 UNEB in 6 days</span>
        <span style={{ background: V.accSoft, color: V.acc, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>Sat, 07 Mar 2026</span>
        <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${V.border}`, background: V.card, cursor: 'pointer', fontSize: 15, position: 'relative', color: V.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🔔<span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, background: V.danger, borderRadius: '50%', border: '1.5px solid #fff' }} />
        </button>
      </div>
    </header>
  );

  /* ── PAGES ── */

  /* Dashboard */
  const PageDashboard = () => (
    <div>
      {/* Greeting */}
      <div style={{ background: 'linear-gradient(135deg,#4c1d95 0%,#7c3aed 55%,#db2777 100%)', borderRadius: 12, padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Examination Office — Term 1, 2026 📝</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.62)', marginTop: 3 }}>Mr. Examinations Officer · SMISSI Senior Secondary School · Sat 07 Mar 2026</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[['🚨 UNEB Inspection: Thu 13 Mar', true], ['📅 Finals: 18–28 Mar', false], ['🔒 3 papers pending collection', false], ['🇺🇬 1,247 UNEB candidates', false]].map(([t, red]) => (
              <span key={String(t)} style={{ background: red ? 'rgba(239,68,68,.35)' : 'rgba(255,255,255,.14)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{String(t)}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {[['1,247', 'Candidates'], ['42', 'Exam Papers'], ['18', 'Invigilators'], ['6', 'Days to UNEB']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.48)', marginTop: 1 }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <Btn variant="pr" onClick={() => setPage('timetable')}>📅 View Timetable</Btn>
        <Btn onClick={() => setPage('security')}>🔒 Paper Log</Btn>
        <Btn onClick={() => setPage('invigilation')}>👁️ Assign Invigilators</Btn>
        <Btn onClick={() => setPage('results')}>✅ Enter Results</Btn>
        <Btn variant="dk" onClick={() => setPage('uneb')}>🇺🇬 UNEB Status</Btn>
        <Btn onClick={() => openModal('circular')}>📤 Send Circular</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="re" icon="🔒" val="3" label="Papers Pending Collect" badge={['dn', 'Urgent']} onClick={() => setPage('security')} />
        <StatCard col="am" icon="👁️" val="2" label="Invigilation Gaps" badge={['fl', '2 gaps']} onClick={() => setPage('invigilation')} />
        <StatCard col="" icon="✅" val="28/42" label="Results Entered" badge={['fl', 'Term 1']} onClick={() => setPage('results')} />
        <StatCard col="gr" icon="🇺🇬" val="1,211" label="UNEB Registered" badge={['up', '97%']} onClick={() => setPage('uneb')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="bl" icon="📊" val="74%" label="School Pass Rate" badge={['up', '↑ 4%']} onClick={() => setPage('analysis')} />
        <StatCard col="go" icon="🎓" val="12" label="Certs Awaiting Print" badge={['fl', '12 pending']} onClick={() => setPage('certificates')} />
        <StatCard col="te" icon="📅" val="11 days" label="Finals Countdown" badge={['fl', '18 Mar']} />
        <StatCard col="or" icon="🏛️" val="6 days" label="UNEB Inspection" badge={['fl', 'Thu 13 Mar']} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        <Card>
          <CardHead title="⚠️ Urgent Actions Required" />
          {[['re', 'Chemistry paper not yet collected from HOD — still in classroom', 'Mr. Byamugisha absent · Paper unsecured · Urgent', 'Secure Now', 'security'],
            ['re', 'S4 Biology exam paper awaiting HOD moderation sign-off', 'Deadline: Wed 11 Mar · HOD must approve before printing', 'Chase HOD', 'circular'],
            ['re', 'Comp Sci S4 practical paper — no invigilator assigned for Lab', 'Date: Fri 20 Mar · Lab 1 · Needs 2 invigilators', 'Assign', 'invigilation'],
            ['am', '36 students not yet registered for UNEB — deadline Mon 09 Mar', 'Missing: Index numbers, passport photos, fees', 'Review', 'uneb'],
            ['am', 'Results Analysis report due to Head Teacher by Friday', 'Term 1 Test 2 results — all classes', 'Generate', 'analysis'],
            ['bl', 'UNEB inspection checklist — 6 items outstanding', 'Thu 13 Mar · Requires Head Teacher sign-off', 'Checklist', 'uneb'],
          ].map(([dot, title, sub, action, dest]) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: `1px solid ${V.border}` }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: dot === 're' ? V.danger : dot === 'am' ? V.warn : V.blue }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 10, color: V.muted, marginTop: 1 }}>{sub}</div>
              </div>
              <span onClick={() => dest === 'circular' ? openModal('circular') : setPage(dest as Page)} style={{ fontSize: 10, fontWeight: 700, color: V.acc, cursor: 'pointer', padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>{action}</span>
            </div>
          ))}
        </Card>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <CardHead title="📅 Upcoming Exams" action={<span onClick={() => setPage('timetable')} style={{ fontSize: 11, color: V.acc, fontWeight: 600, cursor: 'pointer' }}>Full →</span>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['#3b82f6', 'Physics S6A/S6B Trial Exam', 'Tue 10 Mar · 3 hrs · Hall A · 72 candidates', 'gr', 'Paper approved ✓'],
                ['#f59e0b', 'Biology S4A/S4B End of Term', 'Wed 11 Mar · 2h 30min · Halls A&B · 76 students', 'am', 'Pending moderation'],
                ['#ef4444', 'Chemistry S5 Monthly Test', 'Thu 12 Mar · 1 hr · Rooms 10–12', 're', 'Paper in draft — teacher absent'],
                ['#7c3aed', 'Finals Begin — All Classes', 'Wed 18 Mar · 11 days · Hall A, B & C', 'pu', 'Timetable published'],
              ].map(([border, title, sub, chipCol, chipText]) => (
                <div key={title} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: 10, color: V.muted }}>{sub}</div>
                  <div style={{ marginTop: 6 }}><Chip col={chipCol}>{chipText}</Chip></div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHead title="📦 Paper Status" />
            <Progress label="Papers set" value="39/42" pct={93} col="pu" />
            <Progress label="Moderated" value="34/42" pct={81} col="bl" />
            <Progress label="Secured in vault" value="31/42" pct={74} col="gr" />
          </Card>
        </div>
      </div>
    </div>
  );

  /* Timetable */
  const PageTimetable = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Exam Timetable</div><div style={{ fontSize: 12, color: V.muted }}>Term 1 Final Exams · 18–28 March 2026 · Published</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={() => toast('Timetable exported to PDF', 'info')}>📄 Export PDF</Btn>
          <Btn onClick={() => toast('Timetable sent to all teachers & students', 'success')}>📤 Distribute</Btn>
          <Btn variant="pr" onClick={() => openModal('addExam')}>➕ Add Exam</Btn>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 16, gap: 2 }}>
        {(['finals', 'internal', 'trial'] as TtTab[]).map(t => (
          <button key={t} onClick={() => setTtTab(t)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: ttTab === t ? V.acc : 'transparent', color: ttTab === t ? '#fff' : V.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t === 'finals' ? 'Finals (18–28 Mar)' : t === 'internal' ? 'Internal Tests' : 'Trial Exams'}
          </button>
        ))}
      </div>
      {ttTab === 'finals' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Date', 'Day', 'Exam', 'Class(es)', 'Duration', 'Venue', 'Candidates', 'Paper Status', 'Invigilators', ''].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', letterSpacing: '.06em', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['18 Mar', 'Wed', 'Physics Paper 1', 'Mr. Mwesige', 'S4A, S4B', '2h 30min', 'Hall A', '76', 'gr', 'Paper approved ✓', 'gr', '3 assigned', 'view'],
                  ['19 Mar', 'Thu', 'Biology Paper 1', 'Mr. Kato', 'S4A, S4B', '2h 30min', 'Hall A, B', '76', 'am', 'Pending mod.', 'gr', '4 assigned', 'view'],
                  ['20 Mar', 'Fri', 'Chemistry Paper 1', 'Mr. Byamugisha', 'S4A, S4B', '2h', 'Hall B', '76', 're', 'Draft — urgent', 'am', '2 assigned', 'chase'],
                  ['21 Mar', 'Sat', 'Mathematics Paper 1', 'Ms. Nakakande', 'S4A, S4B, S5A', '3h', 'Halls A & B', '114', 'gr', 'Approved ✓', 'gr', '5 assigned', 'view'],
                  ['24 Mar', 'Tue', 'English Paper 1 & 2', 'Mrs. Atim Norah', 'All S4, S5, S6', '3h + 2h', 'All Halls', '312', 'gr', 'Approved ✓', 'gr', '8 assigned', 'view'],
                  ['25 Mar', 'Wed', 'History / Geography', 'Mr. Opolot', 'S4A, S4B, S5A', '2h 30min', 'Hall A, B', '114', 'gr', 'Approved ✓', 'am', '3 assigned — 1 gap', 'fix'],
                  ['26 Mar', 'Thu', 'Computer Science Practical', 'Ms. Nakabugo', 'S4A, S5B', '2h', 'Lab 1, Lab 2', '68', 'gr', 'Approved ✓', 're', '0 assigned — URGENT', 'assign'],
                  ['28 Mar', 'Sat', 'Agriculture Practical', 'Mr. Kakooza', 'S4B, S5A', '2h', 'Farm + Hall B', '72', 'am', 'Submitted to HOD', 'gr', '3 assigned', 'view'],
                ].map(([date, day, exam, teacher, cls, dur, venue, cands, pCol, pTxt, iCol, iTxt, act]) => (
                  <tr key={date + exam}>
                    {[date, day].map((v, i) => <td key={i} style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, borderBottom: `1px solid ${V.border}` }}>{v}</td>)}
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${V.border}` }}><div style={{ fontWeight: 600, fontSize: 12 }}>{exam}</div><div style={{ fontSize: 10, color: V.muted }}>{teacher}</div></td>
                    {[cls, dur, venue, cands].map((v, i) => <td key={i} style={{ padding: '10px 12px', fontSize: 12, borderBottom: `1px solid ${V.border}` }}>{v}</td>)}
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${V.border}` }}><Chip col={pCol}>{pTxt}</Chip></td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${V.border}` }}><Chip col={iCol}>{iTxt}</Chip></td>
                    <td style={{ padding: '10px 12px', borderBottom: `1px solid ${V.border}` }}>
                      {act === 'chase' && <Btn variant="da" size="sm" onClick={() => openModal('circular')}>Chase</Btn>}
                      {act === 'fix' && <Btn variant="wa" size="sm" onClick={() => setPage('invigilation')}>Fix Gap</Btn>}
                      {act === 'assign' && <Btn variant="da" size="sm" onClick={() => setPage('invigilation')}>Assign Now</Btn>}
                      {act === 'view' && <Btn size="sm" onClick={() => openModal('examDetail')}>View</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {ttTab === 'internal' && (
        <Card>
          <CardHead title="Internal Tests — Term 1" action={<Btn variant="pr" size="sm" onClick={() => openModal('addExam')}>+ Add</Btn>} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Date', 'Subject', 'Class', 'Marks', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['Wed 11 Mar', 'Biology', 'S4A, S4B', '80', 'am', 'Pending mod.'], ['Thu 12 Mar', 'Chemistry', 'S5A', '40', 're', 'Draft — urgent'], ['Wed 11 Mar', 'Physics', 'S4A', '40', 'gr', 'Approved ✓'], ['Fri 13 Mar', 'Mathematics', 'S3A, S3B', '60', 'gr', 'Approved ✓']].map(([date, sub, cls, marks_, col, txt]) => (
                  <tr key={date + sub} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{date}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{sub}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{cls}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{marks_}</td>
                    <td style={{ padding: '10px 12px' }}><Chip col={col}>{txt}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {ttTab === 'trial' && (
        <Card>
          <CardHead title="Trial Exams (UNEB Format) — S6" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Date', 'Subject', 'Format', 'Candidates', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['Tue 10 Mar', 'Physics', '3h — Papers 1 & 2', '72', 'gr', 'Approved ✓'], ['Mon 09 Mar', 'Mathematics', '3h — Papers 1 & 2', '72', 'gr', 'Approved ✓'], ['Mon 16 Mar', 'English', '3h — Papers 1, 2 & 3', '72', 'am', 'Paper 3 pending']].map(([date, sub, fmt, cands, col, txt]) => (
                  <tr key={date + sub} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{date}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{sub}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{fmt}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{cands}</td>
                    <td style={{ padding: '10px 12px' }}><Chip col={col}>{txt}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  /* Security */
  const PageSecurity = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Exam Paper Security & Chain of Custody</div><div style={{ fontSize: 12, color: V.muted }}>Track every paper from setting → vault → exam hall</div></div>
        <div style={{ display: 'flex', gap: 8 }}><Btn onClick={() => toast('Security log exported', 'info')}>📄 Export Log</Btn><Btn variant="pr" onClick={() => openModal('paperLog')}>📥 Log Paper Receipt</Btn></div>
      </div>
      <div style={{ background: V.dangerSoft, border: `1px solid rgba(239,68,68,.25)`, borderRadius: 10, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>🚨</span>
        <div><div style={{ fontSize: 12, fontWeight: 700, color: V.danger }}>3 exam papers not yet secured in vault — UNEB inspection in 6 days</div><div style={{ fontSize: 11, color: V.muted }}>Chemistry (teacher absent), Biology S4 (pending moderation), Agriculture S5 (draft)</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="gr" icon="🔒" val="31" label="Secured in Vault" />
        <StatCard col="am" icon="📬" val="8" label="Collected from Teachers" />
        <StatCard col="re" icon="⚠️" val="3" label="Not Yet Secured" />
        <StatCard col="bl" icon="📋" val="42" label="Total Papers This Term" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title="🔒 Vault Status — All Papers" action={<span onClick={() => openModal('paperLog')} style={{ fontSize: 11, color: V.acc, fontWeight: 600, cursor: 'pointer' }}>+ Log Receipt</span>} />
          <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[{ icon: '⚗️', bg: V.dangerSoft, name: 'Chemistry S4/S5 — Mr. Byamugisha', sub: 'Teacher absent · Paper location unknown', chip: 're', chipTxt: 'NOT SECURED', action: 'Chase DHM', act: 'circular' as const },
              { icon: '🧬', bg: V.warnSoft, name: 'Biology S4A/S4B — Mr. Kato', sub: 'Submitted · Pending HOD moderation sign-off', chip: 'am', chipTxt: 'PENDING', action: 'Remind HOD', act: 'toast' as const },
              { icon: '🌿', bg: V.warnSoft, name: 'Agriculture S5 — Mr. Kakooza', sub: 'Still in draft · SoW not submitted', chip: 'am', chipTxt: 'DRAFT', action: 'Chase Teacher', act: 'circular' as const },
              { icon: '⚡', bg: V.successSoft, name: 'Physics S6A/S6B — Mr. Mwesige', sub: 'Collected: 05 Mar · Vault Slot A-04', chip: 'gr', chipTxt: 'IN VAULT ✓', action: null, act: 'none' as const },
              { icon: '📐', bg: V.successSoft, name: 'Mathematics S4/S5 — Ms. Nakakande', sub: 'Collected: 04 Mar · Vault Slot A-06', chip: 'gr', chipTxt: 'IN VAULT ✓', action: null, act: 'none' as const },
              { icon: '📖', bg: V.successSoft, name: 'English S4/S5/S6 — Mrs. Atim Norah', sub: 'Collected: 03 Mar · Vault Slot B-02', chip: 'gr', chipTxt: 'IN VAULT ✓', action: null, act: 'none' as const },
              { icon: '💻', bg: V.successSoft, name: 'Computer Science S4/S5 — Ms. Nakabugo', sub: 'Collected: 06 Mar · Vault Slot A-09', chip: 'gr', chipTxt: 'IN VAULT ✓', action: null, act: 'none' as const },
            ].map(row => (
              <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 9, border: `1px solid ${V.border}` }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{row.icon}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{row.name}</div><div style={{ fontSize: 10, color: V.muted }}>{row.sub}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Chip col={row.chip}>{row.chipTxt}</Chip>
                  {row.action && <Btn variant={row.chip === 're' ? 'da' : 'wa'} size="sm" onClick={() => row.act === 'circular' ? openModal('circular') : toast('Reminder sent to HOD', 'info')}>{row.action}</Btn>}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <CardHead title="🏛️ Vault Access Log — Today" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {[['07:42 AM — Vault opened', 'Mr. Examinations Officer · Routine check'], ['08:15 AM — Paper added: Physics S6', 'Received from Mr. Mwesige · Vault Slot A-04'], ['08:47 AM — Vault locked', 'Sealed by Mr. Examinations Officer · Witnessed: Deputy HM']].map(([t, sub]) => (
                <div key={t} style={{ background: '#f8fafc', borderRadius: 7, padding: '9px 12px' }}><div style={{ fontWeight: 600 }}>{t}</div><div style={{ color: V.muted, marginTop: 2 }}>{sub}</div></div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHead title="📋 Distribution Checklist" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
              {[['Vault sealed & locked daily ✓', true], ['Deputy HM has countersign key ✓', true], ['Chemistry paper secured', false], ['All papers moderated before vault', false], ['Access log maintained ✓', true], ['Printing room secured ✓', true], ['UNEB security briefing done', false]].map(([lbl, checked]) => (
                <label key={String(lbl)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" defaultChecked={Boolean(checked)} style={{ accentColor: V.acc }} /> {String(lbl)}</label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  /* Invigilation */
  const PageInvigilation = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Invigilation Assignments</div><div style={{ fontSize: 12, color: V.muted }}>Assign invigilators · avoid conflicts · cover all venues</div></div>
        <div style={{ display: 'flex', gap: 8 }}><Btn onClick={() => toast('Invigilation schedule sent to all staff', 'success')}>📤 Distribute Schedule</Btn><Btn variant="pr" onClick={() => openModal('invig')}>➕ Assign Invigilator</Btn></div>
      </div>
      <div style={{ background: V.dangerSoft, border: `1px solid rgba(239,68,68,.22)`, borderRadius: 9, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🚨</span>
        <div style={{ fontSize: 12, fontWeight: 700, color: V.danger }}>2 invigilation gaps — Computer Science Lab (26 Mar) & Geography Hall (25 Mar)</div>
        <Btn variant="da" size="sm" onClick={() => openModal('invig')}>Assign Now</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Full Invigilation Schedule — Finals (18–28 Mar)" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Date', 'Exam', 'Venue', 'Time', 'Chief Invigilator', 'Assistant 1', 'Assistant 2', 'Extra'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {[['18 Mar', 'Physics S4', 'Hall A', '8:00 AM', ['Mr. Mwesige', false], ['Mrs. Atim', false], ['Mr. Kakooza', false], [null, false]],
                ['19 Mar', 'Biology S4', 'Halls A&B', '8:00 AM', ['Mr. Kato', false], ['Ms. Nakabugo', false], ['Mr. Opolot', false], ['Ms. Nakakande', false]],
                ['20 Mar', 'Chemistry S4', 'Hall B', '8:00 AM', ['Mr. Byamugisha', false], ['Mr. Lubwama', false], ['— Unassigned', true], [null, false]],
                ['25 Mar', 'History/Geog', 'Halls A&B', '8:00 AM', ['Mr. Opolot', false], ['Mr. Kato', false], ['Mrs. Atim', false], ['— 1 Gap', true]],
                ['26 Mar', 'Comp Sci Practical', 'Lab 1, Lab 2', '8:00 AM', ['— URGENT', true], ['— URGENT', true], [null, false], [null, false]],
                ['28 Mar', 'Agriculture Practical', 'Farm + Hall B', '8:00 AM', ['Mr. Kakooza', false], ['Mr. Mwesige', false], ['Mr. Lubwama', false], [null, false]],
              ].map(([date, exam, venue, time, ...slots]) => (
                <tr key={String(date) + String(exam)} style={{ borderBottom: `1px solid ${V.border}` }}>
                  {[date, exam, venue, time].map((v, i) => <td key={i} style={{ padding: '10px 12px', fontSize: 12, fontWeight: i < 2 ? 600 : 400 }}>{String(v)}</td>)}
                  {(slots as [string | null, boolean][]).map(([name, empty], i) => (
                    <td key={i} style={{ padding: '10px 12px' }}>
                      {name ? <span style={{ background: empty ? V.dangerSoft : V.accSoft, borderRadius: 7, padding: '6px 10px', fontSize: 11, fontWeight: 600, color: empty ? V.danger : V.acc, display: 'inline-block' }}>{name}</span> : <span style={{ color: V.muted }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title="👥 Available Invigilators" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Teacher', 'Dept', 'Assigned', 'Availability'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['Mr. Mwesige P.', 'Sciences', '2', 'gr', 'Available'], ['Mr. Kato Peter', 'Sciences', '2', 'gr', 'Available'], ['Ms. Nakabugo R.', 'Sciences', '1', 'gr', 'Available'], ['Ms. Nakakande', 'Maths', '1', 'gr', 'Available'], ['Mrs. Atim Norah', 'Languages', '2', 'am', 'Busy 25 Mar AM'], ['Mr. Opolot S.', 'Humanities', '2', 'am', 'Exam own class 25 Mar'], ['Mr. Lubwama M.', 'Technical', '1', 'gr', 'Available'], ['Mr. Kakooza D.', 'Sciences', '2', 'gr', 'Available']].map(([name, dept, cnt, col, avail]) => (
                  <tr key={name} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{name}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{dept}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{cnt}</td>
                    <td style={{ padding: '10px 12px' }}><Chip col={col}>{avail}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHead title="📋 Invigilation Rules" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12, color: V.muted, lineHeight: 1.6 }}>
            {['No teacher invigilates their own class — conflicts are flagged automatically.', 'Minimum 2 invigilators per venue — 1 chief + 1 assistant per 40 candidates.', 'Chief Invigilator duties: collect sealed paper from vault, read instructions, time exam, collect scripts, return to EO.', 'Report any irregularities immediately to the Examination Officer.'].map(rule => (
              <div key={rule} style={{ background: '#f8fafc', borderRadius: 7, padding: '9px 12px' }}><b style={{ color: V.text }}>•</b> {rule}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  /* Results */
  const PageResults = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Results Entry</div><div style={{ fontSize: 12, color: V.muted }}>Capture, verify and publish marks · Term 1, 2026</div></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={resClass} onChange={e => setResClass(e.target.value)} style={{ padding: '6px 10px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#f8fafc', color: V.text, width: 150 }}>
            {['S4A', 'S4B', 'S5A', 'S6A'].map(c => <option key={c} value={c}>{c} — Physics</option>)}
          </select>
          <Btn onClick={() => toast('Results exported', 'info')}>📄 Export</Btn>
          <Btn variant="pr" onClick={() => toast('Results saved and published ✓', 'success')}>💾 Save & Publish</Btn>
        </div>
      </div>
      <div style={{ display: 'flex', background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 16, gap: 2 }}>
        {(['entry', 'verify', 'publish'] as ResTab[]).map(t => (
          <button key={t} onClick={() => setResTab(t)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: resTab === t ? V.acc : 'transparent', color: resTab === t ? '#fff' : V.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t === 'entry' ? '✏️ Data Entry' : t === 'verify' ? '✅ Verification' : '📤 Published Results'}
          </button>
        ))}
      </div>
      {resTab === 'entry' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{resClass} — Physics · End of Term Exam</div>
            <div style={{ marginLeft: 'auto', fontSize: 11, background: V.warnSoft, color: '#b45309', padding: '4px 8px', borderRadius: 5, fontWeight: 600 }}>⚠️ Not yet published</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['#', 'Student Name', 'Marks (/80)', '%', 'Grade', 'Rank', 'Verified'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {sorted.map((s, rank) => {
                  const gr = getGrade(s.pct);
                  const origIdx = students.indexOf(s.name);
                  return (
                    <tr key={s.name} style={{ borderBottom: `1px solid ${V.border}` }}>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: V.muted }}>{students.indexOf(s.name) + 1}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <input type="number" min={0} max={80} value={s.m} onChange={e => setMarks(prev => ({ ...prev, [resClass + origIdx]: +e.target.value }))} style={{ width: 54, padding: '4px 6px', border: `1px solid ${V.border}`, borderRadius: 6, fontSize: 12, textAlign: 'center', fontFamily: 'inherit', background: '#f8fafc', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>{s.pct}%</td>
                      <td style={{ padding: '10px 12px' }}><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: gr.bg, color: gr.color }}>{gr.g}</span></td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: V.muted }}>{rank + 1}</td>
                      <td style={{ padding: '10px 12px' }}><input type="checkbox" defaultChecked={s.pct >= 50} style={{ accentColor: V.acc }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 18px', borderTop: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 14, background: '#f8fafc', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12 }}><b>Class Avg:</b> <span style={{ color: V.acc, fontWeight: 700 }}>{avg}%</span></div>
            <div style={{ fontSize: 12 }}><b>Pass Rate:</b> <span style={{ fontWeight: 700 }}>{pass}/{scores.length} ({Math.round(pass / scores.length * 100)}%)</span></div>
            <div style={{ fontSize: 12 }}><b>Top Student:</b> <span style={{ color: V.success, fontWeight: 700 }}>{sorted[0]?.name} ({sorted[0]?.pct}%)</span></div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <Btn size="sm" onClick={() => toast('Sent to class teacher for verification', 'info')}>📤 Send for Verification</Btn>
              <Btn variant="pr" size="sm" onClick={() => toast('Results published to student portal ✓', 'success')}>📣 Publish Results</Btn>
            </div>
          </div>
        </Card>
      )}
      {resTab === 'verify' && (
        <Card>
          <CardHead title="✅ Verification Status — All Classes" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Class', 'Subject', 'Marks Entered', 'Teacher Verified', 'HOD Verified', 'EO Sign-off', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['S6A', 'Physics', '36/36', 'gr', '✓', 'gr', '✓', 'gr', '✓', 'gr', 'Published'], ['S5A', 'Physics', '34/34', 'gr', '✓', 'gr', '✓', 'am', 'Pending', 'am', 'Pending EO'], ['S4A', 'Physics', '38/38', 'gr', '✓', 'am', 'Pending', 'gy', 'Not yet', 'am', 'In review'], ['S4B', 'Biology', '38/38', 'am', 'Pending', 'gy', 'Not yet', 'gy', 'Not yet', 'gy', 'Not started']].map(([cls, sub, cnt, tc, tt, hc, ht, ec, et, sc, st]) => (
                  <tr key={String(cls) + String(sub)} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{cls}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{sub}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{cnt}</td>
                    <td style={{ padding: '10px 12px' }}><Chip col={String(tc)}>{tt}</Chip></td>
                    <td style={{ padding: '10px 12px' }}><Chip col={String(hc)}>{ht}</Chip></td>
                    <td style={{ padding: '10px 12px' }}><Chip col={String(ec)}>{et}</Chip></td>
                    <td style={{ padding: '10px 12px' }}><Chip col={String(sc)}>{st}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {resTab === 'publish' && (
        <Card>
          <CardHead title="📤 Published Results" />
          <div style={{ background: V.successSoft, borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 600, color: V.success, marginBottom: 14 }}>✅ S6A Physics results published — visible on Student Portal and Parent Portal</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Class', 'Subject', 'Published', 'Avg', 'Pass Rate', ''].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['S6A', 'Physics', '04 Mar 2026', '91%', '100%'], ['S6B', 'Physics', '04 Mar 2026', '72%', '86%'], ['S5A', 'Physics', '05 Mar 2026', '74%', '91%']].map(([cls, sub, dt, avg_, pass_]) => (
                  <tr key={cls + sub} style={{ borderBottom: `1px solid ${V.border}` }}>
                    {[cls, sub, dt, avg_, pass_].map((v, i) => <td key={i} style={{ padding: '10px 12px', fontSize: 12, fontWeight: i === 0 ? 600 : 400 }}>{v}</td>)}
                    <td style={{ padding: '10px 12px' }}><Btn size="sm" onClick={() => toast('Report printed', 'info')}>🖨️ Print</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  /* Analysis */
  const PageAnalysis = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Results Analysis & Reports</div><div style={{ fontSize: 12, color: V.muted }}>School performance trends · per subject · per class</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={() => toast('Analysis report exported to PDF', 'info')}>📄 Export Report</Btn>
          <Btn variant="dk" onClick={() => toast('Summary sent to Head Teacher ✓', 'success')}>📤 Send to HT</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="gr" icon="📈" val="74%" label="School Pass Rate" badge={['up', '↑ 4%']} />
        <StatCard col="bl" icon="🏆" val="91%" label="Best Dept: Sciences" />
        <StatCard col="am" icon="⚠️" val="42%" label="Lowest: Technical" />
        <StatCard col="pu" icon="🎓" val="89%" label="S6 Distinction Rate" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <Card>
          <CardHead title="📊 Performance by Department" />
          <Progress label="Sciences" value="91%" pct={91} col="gr" />
          <Progress label="Languages" value="82%" pct={82} col="bl" />
          <Progress label="Mathematics" value="78%" pct={78} col="pu" />
          <Progress label="Humanities" value="72%" pct={72} col="am" />
          <Progress label="Arts" value="65%" pct={65} col="go" />
          <Progress label="Technical ⚠" value="42%" pct={42} col="re" />
        </Card>
        <Card>
          <CardHead title="📊 Performance by Level" />
          <Progress label="S6 (UACE Finalists)" value="89%" pct={89} col="gr" />
          <Progress label="S5" value="77%" pct={77} col="bl" />
          <Progress label="S4" value="68%" pct={68} col="am" />
          <Progress label="S3" value="65%" pct={65} col="am" />
          <Progress label="S2" value="71%" pct={71} col="pu" />
          <Progress label="S1" value="74%" pct={74} col="pu" />
        </Card>
      </div>
      <Card>
        <CardHead title="🏆 Top 10 Students — Overall" action={<Btn size="sm" onClick={() => toast('Top students report printed', 'info')}>🖨️ Print</Btn>} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Rank', 'Student', 'Class', 'Best Subject', 'Overall Avg', 'Grade'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {[['🥇', 'Namukasa Joyce', 'S6A', 'Chemistry (98%)', '94%', 'A'], ['🥈', 'Ssemakula Brian', 'S6A', 'Physics (96%)', '91%', 'A'], ['🥉', 'Mugisha Ronald', 'S4A', 'Biology (91%)', '87%', 'A'], ['4', 'Akello Grace', 'S6A', 'Biology (89%)', '84%', 'A'], ['5', 'Byarugaba Tim', 'S6B', 'Physics (88%)', '82%', 'B']].map(([rank, name, cls, best, avg_, grade]) => {
                const gr = getGrade(grade === 'A' ? 85 : grade === 'B' ? 70 : 55);
                return (
                  <tr key={name} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 14 }}>{rank}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{name}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{cls}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{best}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>{avg_}</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: gr.bg, color: gr.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{grade}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* UNEB */
  const PageUneb = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>UNEB Registration & Coordination</div><div style={{ fontSize: 12, color: V.muted }}>Uganda National Examinations Board · UCE & UACE 2026</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={() => toast('UNEB checklist exported', 'info')}>📄 Export Checklist</Btn>
          <Btn variant="pr" onClick={() => toast('Registration report submitted to UNEB ✓', 'success')}>📤 Submit to UNEB</Btn>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#1e293b,#374151)', borderRadius: 12, padding: 18, color: '#fff', border: `2px solid rgba(124,58,237,.4)`, marginBottom: 12 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,.3)', border: '1px solid rgba(124,58,237,.5)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, marginBottom: 10 }}>🇺🇬 UNEB INSPECTION — THURSDAY 13 MARCH 2026</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>6 days remaining · All documentation must be in order</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>UNEB team will inspect: candidate registrations, index numbers, exam security arrangements, schemes of work, attendance records</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn variant="pr" size="sm" onClick={() => toast('UNEB briefing scheduled for Wed 12 Mar, 8 AM', 'success')}>📅 Schedule Staff Briefing</Btn>
          <Btn size="sm" onClick={() => toast('Checklist printed', 'info')}>🖨️ Print Checklist</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title="📋 UNEB Inspection Checklist" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            {[['Candidate registration list submitted to UNEB', '1,211 of 1,247 registered', true, ''],
              ['All 36 unregistered candidates resolved', 'Deadline: Mon 09 Mar — 2 days', false, 'danger'],
              ['Index numbers issued to all registered candidates', 'Complete ✓', true, ''],
              ['Exam security arrangements documented', 'Chemistry paper still unsecured', false, 'danger'],
              ['Examination timetable published and distributed', 'Distributed to all students ✓', true, ''],
              ['Schemes of work for all teachers filed', '2 missing: Byamugisha, Kakooza', false, 'danger'],
              ['Attendance registers complete and up to date', 'Verified by Deputy HM ✓', true, ''],
              ['UNEB staff briefing conducted', 'Scheduled: Wed 12 Mar 8:00 AM', false, 'danger'],
            ].map(([lbl, sub, checked, subC]) => (
              <label key={String(lbl)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: '#f8fafc', borderRadius: 7, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={Boolean(checked)} style={{ width: 14, height: 14, accentColor: V.acc }} />
                <div><b>{String(lbl)}</b><div style={{ color: subC === 'danger' ? V.danger : V.muted }}>{String(sub)}</div></div>
              </label>
            ))}
          </div>
        </Card>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <CardHead title="🎓 Candidate Summary" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['72', 'S6 (UACE)', V.acc], ['76', 'S4 (UCE)', V.blue], ['1,211', 'Registered', V.success], ['36', 'Outstanding', V.danger]].map(([n, lbl, color]) => (
                <div key={String(lbl)} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: String(color) }}>{n}</div>
                  <div style={{ fontSize: 11, color: V.muted }}>{lbl}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHead title="⚠️ Unregistered Candidates (36)" action={<span onClick={() => toast('Full list exported', 'info')} style={{ fontSize: 11, color: V.acc, fontWeight: 600, cursor: 'pointer' }}>Export →</span>} />
            <div style={{ fontSize: 12, color: V.muted, marginBottom: 10 }}>Missing index numbers, passport photos or fees — deadline Mon 09 Mar</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Student', 'Class', 'Issue'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[['Tumwine Eric', 'S4B', 're', 'Fees unpaid'], ['Nansubuga Rita', 'S4A', 'am', 'No passport photo'], ['Okwir James', 'S3B', 'am', 'Missing docs'], ['Ssali Kevin', 'S4B', 're', 'Fees unpaid']].map(([name, cls, col, issue]) => (
                    <tr key={name} style={{ borderBottom: `1px solid ${V.border}` }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{name}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>{cls}</td>
                      <td style={{ padding: '10px 12px' }}><Chip col={col}>{issue}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Btn variant="pr" onClick={() => openModal('circular')} style={{ marginTop: 10, width: '100%' } as React.CSSProperties}>📱 Alert Parents of All 36</Btn>
          </Card>
        </div>
      </div>
    </div>
  );

  /* Certificates */
  const PageCertificates = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Certificates & Transcripts</div><div style={{ fontSize: 12, color: V.muted }}>Issue · track · archive</div></div>
        <Btn variant="pr" onClick={() => openModal('cert')}>🎓 Issue Certificate</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="go" icon="🎓" val="12" label="Awaiting Print" />
        <StatCard col="gr" icon="✅" val="284" label="Issued This Year" />
        <StatCard col="bl" icon="📄" val="47" label="Transcripts Requested" />
        <StatCard col="am" icon="⏳" val="8" label="Pending Verification" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title="🎓 Pending Certificates — Awaiting Print" />
          {[{ icon: '🏆', bg: V.goldSoft, name: 'Namukasa Joyce — UCE 2025 Certificate', sub: 'S6A · Aggregate 4 · Distinction · Verified by UNEB', btn: 'su', btnTxt: '🖨️ Print', act: 'printed' },
            { icon: '🏆', bg: V.goldSoft, name: 'Ssemakula Brian — UCE 2025 Certificate', sub: 'S6A · Aggregate 6 · Distinction · Verified by UNEB', btn: 'su', btnTxt: '🖨️ Print', act: 'printed' },
            { icon: '📄', bg: V.goldSoft, name: 'Mugisha Ronald — Academic Transcript', sub: 'S4A · Official transcript for university application', btn: 'se', btnTxt: 'Generate', act: 'generated' },
            { icon: '📄', bg: V.goldSoft, name: 'Akello Grace — Academic Transcript', sub: 'S6A · Official transcript · Bursar clearance pending', btn: 'wa', btnTxt: 'Chase Bursar', act: 'chased' },
          ].map(row => (
            <div key={row.name} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{row.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{row.name}</div><div style={{ fontSize: 11, color: V.muted }}>{row.sub}</div></div>
              <Btn variant={row.btn} size="sm" onClick={() => toast(`Certificate ${row.act} ✓`, 'success')}>{row.btnTxt}</Btn>
            </div>
          ))}
        </Card>
        <Card>
          <CardHead title="🔍 Search & Issue" />
          <FG label="Student Name or Index No."><FI placeholder="Search student..." /></FG>
          <FG label="Document Type"><FS><option>UCE / UACE Certificate</option><option>Academic Transcript</option><option>Leaving Certificate</option><option>Proof of Enrolment</option></FS></FG>
          <FG label="Purpose"><FS><option>University application</option><option>Employment</option><option>Further studies</option><option>Personal records</option></FS></FG>
          <FG label="Requested By"><FI placeholder="Student / Parent name" /></FG>
          <Btn variant="pr" onClick={() => toast('Certificate generated and logged ✓', 'success')}>🎓 Generate Document</Btn>
        </Card>
      </div>
    </div>
  );

  /* Communications */
  const PageCommunications = () => (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Communications</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title="Inbox (4 unread)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[{ initials: 'HT', bg: V.primary, title: 'Results analysis report requested by Friday', sub: 'Head Teacher · 1 hr ago · Unread' },
              { initials: 'DHM', bg: V.primary, title: 'UNEB checklist — confirm status by today', sub: 'Deputy HM · 2 hrs ago · Unread' },
              { initials: 'KP', bg: '#059669', title: 'Biology paper moderation completed — ready', sub: 'HOD Sciences (Mr. Kato) · 3 hrs ago · Unread' },
              { initials: 'PR', bg: V.danger, title: 'UNEB registration query — my daughter Nansubuga', sub: 'Parent · This morning · Unread' },
            ].map(msg => (
              <div key={msg.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 6px', background: '#f5f3ff', borderRadius: 8, marginBottom: 6, cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{msg.initials}</div>
                <div><div style={{ fontSize: 12, fontWeight: 600 }}>{msg.title}</div><div style={{ fontSize: 10, color: V.muted, marginTop: 1 }}>{msg.sub}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="📤 Compose / Circular" />
          <FG label="Send To"><FS><option>🏫 Head Teacher</option><option>🏫 Deputy HM</option><option>📗 All HODs</option><option>👩🏫 All Teachers</option><option>👨👩👧 All Parents (UNEB candidates)</option><option>🎒 All S6 Students</option><option>🎒 All S4 Students</option></FS></FG>
          <FG label="Subject"><FI placeholder="e.g. UNEB Registration Deadline Reminder" /></FG>
          <FG label="Message"><textarea placeholder="Your message or circular..." style={{ width: '100%', padding: '8px 11px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#f8fafc', color: V.text, outline: 'none', resize: 'vertical', minHeight: 70, boxSizing: 'border-box' }} /></FG>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn onClick={() => toast('Draft saved', 'info')}>💾 Draft</Btn>
            <Btn variant="pr" onClick={() => toast('Circular sent ✓', 'success')}>📤 Send</Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  /* Announcements */
  const PageAnnouncements = () => (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Announcements</div>
      <div style={{ background: V.dangerSoft, border: `1px solid rgba(239,68,68,.22)`, borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ background: V.danger, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>URGENT · Head Teacher</span>
          <div style={{ fontSize: 13, fontWeight: 700 }}>UNEB Inspection — Examination Office Readiness</div>
        </div>
        <div style={{ fontSize: 12, color: V.muted, lineHeight: 1.6 }}>All exam papers must be secured in vault by Wednesday. UNEB registration for outstanding 36 candidates must be completed by Monday. Exam timetable must be posted in all classrooms and hostels.</div>
        <div style={{ fontSize: 11, color: V.light, marginTop: 8 }}>06 Mar 2026 · Head Teacher</div>
      </div>
      <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ background: V.acc, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>EXAMS · Exam Officer</span>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Term 1 Final Exam Timetable — Now Published</div>
        </div>
        <div style={{ fontSize: 12, color: V.muted }}>Final exam timetable for all classes is now published. Exams begin Wednesday 18 March. All students should collect their personal timetable from the examination office.</div>
        <div style={{ fontSize: 11, color: V.light, marginTop: 8 }}>05 Mar 2026 · Examination Officer</div>
      </div>
    </div>
  );

  /* Portals */
  const PagePortals = () => (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Portal Quick Access</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[['🏫', '#059669', V.successSoft, 'Head Teacher', 'Mr. Ssemanda Julius', '/ht/dashboard'],
          ['📋', '#0ea5e9', '#f0f9ff', 'Deputy HM', 'Mr. Tumwebaze', '/deputy-hm'],
          ['📗', '#059669', V.successSoft, 'HOD Portal', 'All HODs', '/hod'],
          ['👩🏫', V.acc, V.accSoft, 'Teacher Portal', 'All teachers', '/teacher'],
          ['💰', V.warn, V.warnSoft, 'Bursar', 'Fees & finance', '/bursar'],
          ['🎒', '#f43f5e', '#fff1f2', 'Student Portal', 'Results & timetable', '/student'],
        ].map(([icon, border, bg, title, sub, path]) => (
          <div key={String(title)} onClick={() => navigate(String(path))} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, cursor: 'pointer', borderLeft: `4px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: String(bg), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
            <div><div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div><div style={{ fontSize: 10, color: V.muted }}>{sub}</div></div>
            <span style={{ marginLeft: 'auto', color: V.light }}>↗</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* Settings */
  const PageSettings = () => (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Settings</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Profile</div>
          <FG label="Full Name"><FI value="Mr. Examinations Officer" /></FG>
          <FG label="Role"><FI value="Examination Officer" /></FG>
          <FG label="Email"><FI value="exams@smissi.ac.ug" type="email" /></FG>
          <FG label="Phone"><FI value="+256 700 000 020" /></FG>
          <Btn variant="pr" onClick={() => toast('Profile updated ✓', 'success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Preferences</div>
          <FG label="Alert when paper not collected"><FS><option>3 days before exam</option><option>5 days before exam</option><option>1 week before exam</option></FS></FG>
          <FG label="Results publish confirmation"><FS><option>Require HOD + EO sign-off</option><option>EO sign-off only</option></FS></FG>
          <FG label="UNEB deadline reminders"><FS><option>7 days + 3 days + 1 day before</option><option>3 days + 1 day before</option></FS></FG>
          <Btn variant="pr" onClick={() => toast('Preferences saved ✓', 'success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );

  /* ── render ── */
  return (
    <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
      <Sidebar />
      <div style={{ marginLeft: 256, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <div style={{ padding: 20, flex: 1 }}>
          {page === 'dashboard' && <PageDashboard />}
          {page === 'timetable' && <PageTimetable />}
          {page === 'security' && <PageSecurity />}
          {page === 'invigilation' && <PageInvigilation />}
          {page === 'results' && <PageResults />}
          {page === 'analysis' && <PageAnalysis />}
          {page === 'uneb' && <PageUneb />}
          {page === 'certificates' && <PageCertificates />}
          {page === 'communications' && <PageCommunications />}
          {page === 'announcements' && <PageAnnouncements />}
          {page === 'portals' && <PagePortals />}
          {page === 'settings' && <PageSettings />}
        </div>
      </div>

      {/* Modals */}
      <Modal open={modals.addExam} onClose={() => closeModal('addExam')} title="📅 Add Exam to Timetable">
        <FG label="Exam Title"><FI placeholder="e.g. Physics S4 End of Term" /></FG>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FG label="Date"><FI type="date" value="2026-03-18" /></FG>
          <FG label="Duration"><FI placeholder="e.g. 2h 30min" /></FG>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FG label="Venue"><FI placeholder="e.g. Hall A" /></FG>
          <FG label="Candidates"><FI placeholder="e.g. 76" type="number" /></FG>
        </div>
        <FG label="Class(es)"><FI placeholder="e.g. S4A, S4B" /></FG>
        <FG label="Subject Teacher"><FS><option>Mr. Mwesige (Physics)</option><option>Mr. Kato (Biology)</option><option>Ms. Nakabugo (Comp Sci)</option><option>Ms. Nakakande (Maths)</option><option>Mr. Byamugisha (Chemistry)</option></FS></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Btn onClick={() => closeModal('addExam')}>Cancel</Btn>
          <Btn variant="pr" onClick={() => { closeModal('addExam'); toast('Exam added to timetable ✓', 'success'); }}>Add to Timetable</Btn>
        </div>
      </Modal>

      <Modal open={modals.examDetail} onClose={() => closeModal('examDetail')} title="📋 Exam Details">
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Physics S4A/S4B — End of Term Exam</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            {[['Date', 'Wed 18 Mar 2026'], ['Duration', '2h 30min'], ['Venue', 'Hall A'], ['Candidates', '76'], ['Setter', 'Mr. Mwesige']].map(([lbl, val]) => <div key={lbl}><span style={{ color: V.muted }}>{lbl}:</span> {val}</div>)}
            <div><span style={{ color: V.muted }}>Paper Status:</span> <Chip col="gr">Approved ✓</Chip></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn onClick={() => closeModal('examDetail')}>Close</Btn>
          <Btn onClick={() => { closeModal('examDetail'); toast('Paper printed', 'info'); }}>🖨️ Print Paper</Btn>
          <Btn variant="pr" onClick={() => { closeModal('examDetail'); setPage('invigilation'); }}>👁️ Invigilation</Btn>
        </div>
      </Modal>

      <Modal open={modals.paperLog} onClose={() => closeModal('paperLog')} title="📥 Log Paper Receipt">
        <FG label="Paper / Exam"><FS><option>Chemistry S4/S5 — Mr. Byamugisha</option><option>Biology S4 — Mr. Kato</option><option>Agriculture S5 — Mr. Kakooza</option></FS></FG>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FG label="Date Received"><FI type="date" value="2026-03-07" /></FG>
          <FG label="Time"><FI type="time" value="08:00" /></FG>
        </div>
        <FG label="Received From"><FI placeholder="Teacher name" /></FG>
        <FG label="Vault Slot Assigned"><FI placeholder="e.g. A-12" /></FG>
        <FG label="Witness"><FI placeholder="e.g. Deputy HM" /></FG>
        <FG label="Condition / Notes"><textarea placeholder="Any notes on the paper condition, seal status..." style={{ width: '100%', padding: '8px 11px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#f8fafc', outline: 'none', resize: 'vertical', minHeight: 70, boxSizing: 'border-box' }} /></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn onClick={() => closeModal('paperLog')}>Cancel</Btn>
          <Btn variant="pr" onClick={() => { closeModal('paperLog'); toast('Paper logged and secured in vault ✓', 'success'); }}>Log Receipt</Btn>
        </div>
      </Modal>

      <Modal open={modals.invig} onClose={() => closeModal('invig')} title="👁️ Assign Invigilator">
        <FG label="Exam"><FS><option>Computer Science Practical — 26 Mar (URGENT)</option><option>History/Geography — 25 Mar (1 gap)</option><option>Chemistry S4 — 20 Mar</option></FS></FG>
        <FG label="Role"><FS><option>Chief Invigilator</option><option>Assistant Invigilator</option></FS></FG>
        <FG label="Teacher"><FS><option>Mr. Mwesige P. (Available)</option><option>Mr. Lubwama M. (Available)</option><option>Ms. Nakakande (Available)</option><option>Mr. Kakooza D. (Available)</option></FS></FG>
        <div style={{ background: V.warnSoft, borderRadius: 8, padding: 10, fontSize: 11, color: '#b45309', marginBottom: 14 }}>⚠️ A teacher cannot invigilate their own class — conflicts are blocked.</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn onClick={() => closeModal('invig')}>Cancel</Btn>
          <Btn variant="pr" onClick={() => { closeModal('invig'); toast('Invigilator assigned and notified ✓', 'success'); }}>Assign & Notify</Btn>
        </div>
      </Modal>

      <Modal open={modals.circular} onClose={() => closeModal('circular')} title="📤 Send Circular / Alert">
        <FG label="Send To"><FS><option>All Teachers</option><option>All HODs</option><option>Head Teacher + Deputy HM</option><option>Specific Teacher</option><option>All Parents (S4/S6 candidates)</option><option>All S4/S6 Students</option></FS></FG>
        <FG label="Subject"><FI placeholder="e.g. UNEB Registration Deadline Reminder" /></FG>
        <FG label="Message"><textarea placeholder="Your circular or alert message..." style={{ width: '100%', padding: '8px 11px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#f8fafc', outline: 'none', resize: 'vertical', minHeight: 100, boxSizing: 'border-box' }} /></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn onClick={() => closeModal('circular')}>Cancel</Btn>
          <Btn variant="pr" onClick={() => { closeModal('circular'); toast('Circular sent ✓', 'success'); }}>📤 Send</Btn>
        </div>
      </Modal>

      <Modal open={modals.cert} onClose={() => closeModal('cert')} title="🎓 Issue Certificate / Transcript">
        <FG label="Student Name / Index No."><FI placeholder="Search student..." /></FG>
        <FG label="Document Type"><FS><option>UCE Certificate</option><option>UACE Certificate</option><option>Academic Transcript</option><option>Leaving Certificate</option><option>Proof of Enrolment</option></FS></FG>
        <FG label="Purpose"><FS><option>University application</option><option>Employment</option><option>Further studies</option><option>Personal</option></FS></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Btn onClick={() => closeModal('cert')}>Cancel</Btn>
          <Btn variant="pr" onClick={() => { closeModal('cert'); toast('Document generated and logged ✓', 'success'); }}>🎓 Generate</Btn>
        </div>
      </Modal>

      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'success' ? '#064e3b' : t.type === 'warning' ? '#78350f' : t.type === 'info' ? '#1e3a5f' : V.text,
            color: '#fff', padding: '10px 16px', borderRadius: 9, fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 8px 24px rgba(0,0,0,.2)',
            borderLeft: `3px solid ${t.type === 'success' ? V.success : t.type === 'warning' ? V.warn : t.type === 'info' ? V.blue : V.muted}`,
            maxWidth: 300, animation: 'sIn .25s ease',
          }}>
            <span>{t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '💬'}</span>
            {t.msg}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes mIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes sIn{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
        body{margin:0}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
