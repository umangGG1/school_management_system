import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── types ── */
type Page =
  | 'dashboard' | 'announcements' | 'registry' | 'sports'
  | 'competitions' | 'cultural' | 'leadership' | 'patrons'
  | 'attendance' | 'timetable' | 'communications' | 'portals' | 'settings';

type Modal =
  | 'addAct' | 'addFixture' | 'addComp' | 'addEvent'
  | 'squad' | 'bookVenue' | 'addLeader' | 'addPatron'
  | 'awards' | 'circular' | null;

type SportTab = 'fixtures' | 'teams' | 'results';
type LeadTab  = 'prefects' | 'guild' | 'clubleaders' | 'election';
type ToastT   = { id: number; msg: string; type: 'success' | 'warning' | 'info' | 'default' };

/* ── palette ── */
const V = {
  acc: '#16a34a', accSoft: '#f0fdf4', accDark: '#14532d',
  success: '#10b981', successSoft: '#ecfdf5',
  danger: '#ef4444', dangerSoft: '#fef2f2',
  warn: '#f59e0b', warnSoft: '#fffbeb',
  blue: '#3b82f6', blueSoft: '#eff6ff',
  purple: '#8b5cf6', purpleSoft: '#f5f3ff',
  orange: '#f97316', orangeSoft: '#fff7ed',
  rose: '#f43f5e', roseSoft: '#fff1f2',
  teal: '#14b8a6', tealSoft: '#f0fdfa',
  indigo: '#6366f1', indigoSoft: '#eef2ff',
  gold: '#d97706', goldSoft: '#fef3c7',
  lime: '#65a30d', limeSoft: '#f7fee7',
  primary: '#1e293b', bg: '#f6fef9', card: '#fff', border: '#e2e8f0',
  text: '#1e293b', muted: '#64748b', light: '#94a3b8',
};

/* ── static data ── */
const activities = [
  { name: 'Football (Boys)',      icon: '⚽', cat: 'sports',     members: 45, patron: 'Mr. Kakooza',   day: 'Sat 8:00 AM',  venue: 'School Pitch',  status: 'gr' },
  { name: 'Netball (Girls)',      icon: '🏐', cat: 'sports',     members: 38, patron: 'Ms. Nambi',     day: 'Tue 4:00 PM',  venue: 'Court',         status: 'gr' },
  { name: 'Athletics',            icon: '🏃', cat: 'sports',     members: 32, patron: 'Mr. Kakooza',   day: 'Thu 4:30 PM',  venue: 'Track',         status: 'gr' },
  { name: 'Swimming',             icon: '🏊', cat: 'sports',     members: 22, patron: 'Mr. Lubwama',   day: 'Sat 7:00 AM',  venue: 'Pool',          status: 'gr' },
  { name: 'Badminton',            icon: '🏸', cat: 'sports',     members: 18, patron: 'Ms. Nakabugo',  day: 'Wed 4:00 PM',  venue: 'Court',         status: 'gr' },
  { name: 'Tennis',               icon: '🎾', cat: 'sports',     members: 16, patron: 'Mrs. Atim',     day: 'Fri 4:00 PM',  venue: 'Tennis Court',  status: 'gr' },
  { name: 'Debate Club',          icon: '🗣️', cat: 'club',       members: 25, patron: 'Ms. Nakato',    day: 'Mon 4:00 PM',  venue: 'Boardroom',     status: 'gr' },
  { name: 'Science Club',         icon: '🔬', cat: 'club',       members: 32, patron: 'Mr. Ssemwanga', day: 'Mon 4:30 PM',  venue: 'Lab 2',         status: 'am' },
  { name: 'Computer Club',        icon: '💻', cat: 'club',       members: 30, patron: 'Ms. Nakabugo',  day: 'Tue 4:00 PM',  venue: 'Computer Lab',  status: 'am' },
  { name: 'Geography Club',       icon: '🌍', cat: 'club',       members: 22, patron: 'Mr. Opolot',    day: 'Wed 3:30 PM',  venue: 'Room 5',        status: 'gr' },
  { name: 'Photography Club',     icon: '📸', cat: 'club',       members: 20, patron: 'Mrs. Atim',     day: 'Tue 4:30 PM',  venue: 'Room 6',        status: 're' },
  { name: 'Environmental Club',   icon: '🌿', cat: 'club',       members: 28, patron: 'Mr. Kato',      day: 'Thu 3:00 PM',  venue: 'Gardens',       status: 'gr' },
  { name: 'School Choir',         icon: '🎵', cat: 'arts',       members: 50, patron: 'Ms. Grace',     day: 'Sat 10:00 AM', venue: 'Music Room',    status: 'gr' },
  { name: 'Drama Club',           icon: '🎭', cat: 'arts',       members: 28, patron: 'Mr. Kato',      day: 'Sat 2:00 PM',  venue: 'School Hall',   status: 'gr' },
  { name: 'Cultural Dance Troupe',icon: '💃', cat: 'arts',       members: 36, patron: 'Ms. Nambi',     day: 'Wed 3:00 PM',  venue: 'School Hall',   status: 'gr' },
  { name: 'Fine Art Club',        icon: '🎨', cat: 'arts',       members: 18, patron: 'Mrs. Atim',     day: 'Fri 3:00 PM',  venue: 'Art Room',      status: 'gr' },
  { name: 'Scripture Union',      icon: '✝️', cat: 'faith',      members: 45, patron: 'Chaplain',      day: 'Thu 4:00 PM',  venue: 'Chapel',        status: 'gr' },
  { name: 'Muslim Students Assoc.',icon: '☪️',cat: 'faith',      members: 31, patron: 'Sheikh Lubega', day: 'Fri 4:00 PM',  venue: 'Room 3',        status: 'am' },
  { name: 'SDA Fellowship',       icon: '📖', cat: 'faith',      members: 18, patron: 'Mr. Lubwama',   day: 'Sat 8:30 AM',  venue: 'Chapel',        status: 'gr' },
  { name: 'Student Guild Council',icon: '🏛️', cat: 'leadership', members: 12, patron: 'ECA Coord.',   day: 'Wed 5:00 PM',  venue: 'Boardroom',     status: 'gr' },
  { name: 'Prefects Council',     icon: '⭐', cat: 'leadership', members: 20, patron: 'DHM',           day: 'Mon 5:00 PM',  venue: 'DHM Office',    status: 'gr' },
  { name: 'Community Service',    icon: '🤝', cat: 'community',  members: 40, patron: 'Mr. Opolot',    day: 'Sat 2:00 PM',  venue: 'Community',     status: 'gr' },
];

const catLabel: Record<string, string> = {
  sports: 'Sports', club: 'Club', arts: 'Arts',
  faith: 'Faith', leadership: 'Leadership', community: 'Community',
};
const catColor: Record<string, [string, string]> = {
  sports: [V.orangeSoft, V.orange], club: [V.blueSoft, V.blue],
  arts: [V.purpleSoft, V.purple], faith: [V.goldSoft, V.gold],
  leadership: [V.roseSoft, V.rose], community: [V.tealSoft, V.teal],
};

const attData: Record<string, string[]> = {
  football: ['Ssemakula Brian', 'Byarugaba Tim', 'Opio Sam', 'Kato Alex', 'Mugisha Brian', 'Nakamya David', 'Ssali Kevin', 'Odongo Eric', 'Waswa Dennis', 'Lubwama Jr'],
  debate:   ['Namukasa Joyce', 'Ssemakula Brian', 'Byarugaba Tim', 'Nakiganda Joy', 'Opio Sam', 'Akello Grace', 'Mugisha Ronald'],
  choir:    ['Akello Rose', 'Apio Grace', 'Nakato Sarah', 'Nambi Diana', 'Ssali Kevin', 'Tukahirwa Paul', 'Wamboga Dennis', 'Nassali Fiona', 'Nankya Deb', 'Nakamya Doris'],
  science:  ['Ssemakula Brian', 'Kato Alex', 'Mugisha Ronald', 'Nakabugo Sandra', 'Oloka Peter', 'Byaruhanga Tim', 'Kibirige Aaron'],
  drama:    ['Apio Grace', 'Opio Sam', 'Nakato Sarah', 'Ssali Kevin', 'Buganda Roy', 'Nakiganda Joy', 'Nabirye Claire'],
};
const attPcts = [92, 88, 78, 95, 65, 100, 84, 90, 72, 88, 96, 80, 75, 88, 92];

/* ── helpers ── */
function chipCols(status: string): [string, string] {
  return status === 'gr' ? [V.successSoft, V.success]
       : status === 're' ? [V.dangerSoft, V.danger]
       : [V.warnSoft, '#b45309'];
}

/* ── tiny UI components ── */
function Chip({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: bg, color }}>
      <span style={{ fontSize: 7 }}>●</span>{children}
    </span>
  );
}
function Btn({ variant = 'se', size = 'md', onClick, style: ext, children }: { variant?: string; size?: string; onClick?: () => void; style?: React.CSSProperties; children: React.ReactNode }) {
  const c: Record<string, [string, string, string]> = {
    pr: [V.acc, '#fff', 'transparent'], se: ['#f8fafc', V.text, V.border],
    da: [V.dangerSoft, V.danger, 'rgba(239,68,68,.2)'], wa: [V.warnSoft, '#b45309', 'rgba(245,158,11,.2)'],
    su: [V.successSoft, V.success, 'rgba(16,185,129,.2)'], or: [V.orangeSoft, V.orange, 'rgba(249,115,22,.2)'],
    dk: [V.primary, '#fff', 'transparent'],
  };
  const [bg, fg, bd] = c[variant] ?? c.se;
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: size === 'sm' ? '4px 10px' : '7px 14px', borderRadius: 8, fontSize: size === 'sm' ? 11 : 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${bd}`, background: bg, color: fg, fontFamily: 'inherit', transition: 'all .15s', ...ext }}>
      {children}
    </button>
  );
}
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: V.card, borderRadius: 12, border: `1px solid ${V.border}`, boxShadow: '0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)', padding: 18, ...style }}>{children}</div>;
}
function CardHead({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>{action}</div>;
}
function Prog({ label, value, pct, col = 'gr' }: { label: string; value: string; pct: number; col?: string }) {
  const cc: Record<string, string> = { gr: V.acc, bl: V.blue, am: V.warn, re: V.danger, or: V.orange, pu: V.purple, te: V.teal, go: V.gold };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: V.muted }}>{value}</span>
      </div>
      <div style={{ height: 7, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: cc[col] ?? V.acc, transition: 'width .4s ease' }} />
      </div>
    </div>
  );
}
function StatCard({ col = 'gr', icon, val, label, badge, onClick }: { col?: string; icon: string; val: string; label: string; badge?: [string, string]; onClick?: () => void }) {
  const t: Record<string, string> = { gr: V.acc, grs: V.success, re: V.danger, am: V.warn, bl: V.blue, pu: V.purple, or: V.orange, te: V.teal, go: V.gold, ro: V.rose };
  const b: Record<string, string> = { gr: V.accSoft, grs: V.successSoft, re: V.dangerSoft, am: V.warnSoft, bl: V.blueSoft, pu: V.purpleSoft, or: V.orangeSoft, te: V.tealSoft, go: V.goldSoft, ro: V.roseSoft };
  return (
    <div onClick={onClick} style={{ background: V.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${V.border}`, borderTop: `3px solid ${t[col] ?? V.acc}`, boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: onClick ? 'pointer' : 'default', transition: 'all .2s' }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'none')}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: b[col] ?? V.accSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{icon}</div>
        {badge && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: badge[0] === 'up' ? V.successSoft : badge[0] === 'dn' ? V.dangerSoft : '#f1f5f9', color: badge[0] === 'up' ? V.success : badge[0] === 'dn' ? V.danger : V.muted }}>{badge[1]}</span>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{val}</div>
      <div style={{ fontSize: 11, color: V.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}
function ModalWrap({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: V.card, borderRadius: 14, padding: 24, width: wide ? 700 : 520, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)', animation: 'mIn .2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${V.border}`, background: '#f8fafc', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
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
function FTA({ placeholder, minH = 70 }: { placeholder?: string; minH?: number }) {
  return <textarea placeholder={placeholder} style={{ width: '100%', padding: '8px 11px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#f8fafc', color: V.text, outline: 'none', resize: 'vertical', minHeight: minH, boxSizing: 'border-box' }} />;
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}
function AlertBanner({ color, children }: { color: 'warn' | 'danger'; children: React.ReactNode }) {
  const [bg, bc, tc] = color === 'warn'
    ? [V.warnSoft, 'rgba(245,158,11,.25)', '#b45309']
    : [V.dangerSoft, 'rgba(239,68,68,.25)', V.danger];
  return <div style={{ background: bg, border: `1px solid ${bc}`, borderRadius: 9, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600, color: tc }}>{children}</div>;
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function ECAPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>('dashboard');
  const [modal, setModal] = useState<Modal>(null);
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const [sportTab, setSportTab] = useState<SportTab>('fixtures');
  const [leadTab, setLeadTab] = useState<LeadTab>('prefects');
  const [actFilter, setActFilter] = useState('all');
  const [attAct, setAttAct] = useState('football');

  const toast = useCallback((msg: string, type: ToastT['type'] = 'default') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    setTimeout(() => toast('⚽ Football transport still not arranged for Sat 14 Mar', 'warning'), 900);
    setTimeout(() => toast('🏆 Debate registration closes Monday — action needed', 'info'), 2400);
  }, [toast]);

  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard', announcements: 'Announcements', registry: 'Activities Registry',
    sports: 'Sports & Fixtures', competitions: 'Competitions & Inter-School Events',
    cultural: 'Cultural & Arts Events', leadership: 'Student Leadership', patrons: 'Teacher Patrons',
    attendance: 'ECA Attendance', timetable: 'Timetable & Venues', communications: 'Communications',
    portals: 'Portals', settings: 'Settings',
  };

  const navSections = [
    { label: 'Overview', items: [{ id: 'dashboard', icon: '🏠', label: 'Dashboard' }, { id: 'announcements', icon: '📣', label: 'Announcements', badge: 2 }] },
    { label: 'Activities', items: [
      { id: 'registry', icon: '🎯', label: 'Activities Registry' },
      { id: 'sports', icon: '⚽', label: 'Sports & Fixtures', badge: 2, badgeColor: V.warn },
      { id: 'competitions', icon: '🏆', label: 'Competitions', badge: 3, badgeColor: V.acc },
      { id: 'cultural', icon: '🎭', label: 'Cultural & Arts' },
    ]},
    { label: 'People', items: [
      { id: 'leadership', icon: '🏛️', label: 'Student Leadership' },
      { id: 'patrons', icon: '👩‍🏫', label: 'Teacher Patrons' },
    ]},
    { label: 'Management', items: [
      { id: 'attendance', icon: '✅', label: 'ECA Attendance' },
      { id: 'timetable', icon: '📅', label: 'Timetable & Venues' },
    ]},
    { label: 'Admin', items: [
      { id: 'communications', icon: '💬', label: 'Communications', badge: 3 },
      { id: 'portals', icon: '🔗', label: 'Portals' },
    ]},
  ];

  /* ── Sidebar ── */
  const Sidebar = () => (
    <div style={{ width: 258, background: V.primary, minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,.22)', border: '1px solid rgba(22,163,74,.4)', borderRadius: 8, padding: '7px 10px', marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: V.acc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⭐</div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.9)', letterSpacing: '.07em', textTransform: 'uppercase' }}>SMISSI</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>ECA Office</div></div>
        </div>
      </div>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>EC</div>
        <div><div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.name ?? 'ECA Coordinator'}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.38)' }}>Extra-Curricular Activities</div></div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: V.success, marginLeft: 'auto', boxShadow: '0 0 0 2px rgba(16,185,129,.25)' }} />
      </div>
      {navSections.map(sec => (
        <div key={sec.label} style={{ padding: '10px 8px 2px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', letterSpacing: '.12em', padding: '0 6px', marginBottom: 3 }}>{sec.label}</div>
          {sec.items.map(item => (
            <div key={item.id} onClick={() => setPage(item.id as Page)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 8px', borderRadius: 7, cursor: 'pointer', color: page === item.id ? '#fff' : 'rgba(255,255,255,.52)', fontSize: 12, fontWeight: 500, marginBottom: 1, background: page === item.id ? 'rgba(22,163,74,.3)' : 'transparent', position: 'relative', transition: 'all .15s' }}>
              {page === item.id && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: V.acc, borderRadius: '0 3px 3px 0' }} />}
              <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span style={{ marginLeft: 'auto', background: item.badgeColor ?? V.danger, color: item.badgeColor === V.acc ? V.accDark : item.badgeColor === V.warn ? '#78350f' : '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 20 }}>{item.badge}</span>
              )}
            </div>
          ))}
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: 10, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div onClick={() => setPage('settings')} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 8px', borderRadius: 7, cursor: 'pointer', color: 'rgba(255,255,255,.52)', fontSize: 12, marginBottom: 7 }}>⚙️ Settings</div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none', background: 'rgba(239,68,68,.12)', color: '#fca5a5', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>🚪 Logout</button>
      </div>
    </div>
  );

  /* ── Topbar ── */
  const Topbar = () => (
    <header style={{ height: 60, background: V.card, borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
      <div><div style={{ fontSize: 15, fontWeight: 700 }}>{pageTitles[page]}</div><div style={{ fontSize: 11, color: V.muted, marginTop: 1 }}>ECA Coordinator · Term 1, Week 8 · Sat 07 Mar 2026</div></div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ background: V.accSoft, color: V.accDark, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(22,163,74,.2)' }}>⭐ Term 1, Week 8</span>
        <span style={{ background: V.orangeSoft, color: V.orange, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(249,115,22,.2)' }}>🏆 3 comps upcoming</span>
        <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${V.border}`, background: V.card, cursor: 'pointer', fontSize: 15, position: 'relative', color: V.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🔔<span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, background: V.danger, borderRadius: '50%', border: '1.5px solid #fff' }} />
        </button>
      </div>
    </header>
  );

  /* ─────────── DASHBOARD ─────────── */
  const PageDashboard = () => (
    <div>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg,#14532d 0%,#16a34a 55%,#f97316 100%)', borderRadius: 12, padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>ECA Office — Term 1, 2026 ⭐</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 3 }}>SMISSI Senior Secondary School · Sat 07 Mar 2026 · Week 8 of 13</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[['⚽ District Football: Sat 14 Mar', false], ['🏆 National Drama: Thu 19 Mar', true], ['🎤 School Concert: Fri 27 Mar', false], ['📋 Prefect elections: Wed 11 Mar', false]].map(([t, hot]) => (
              <span key={String(t)} style={{ background: hot ? 'rgba(249,115,22,.4)' : 'rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{String(t)}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {[['22', 'Activities'], ['614', 'Enrolled'], ['18', 'Patrons'], ['6', 'Competitions']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <Btn variant="pr" onClick={() => setModal('addAct')}>➕ Add Activity</Btn>
        <Btn onClick={() => setPage('sports')}>⚽ Fixtures</Btn>
        <Btn variant="or" onClick={() => setPage('competitions')}>🏆 Competitions</Btn>
        <Btn onClick={() => setPage('cultural')}>🎭 Cultural Events</Btn>
        <Btn onClick={() => setPage('attendance')}>✅ Take Attendance</Btn>
        <Btn variant="dk" onClick={() => setModal('circular')}>📢 Send Circular</Btn>
      </div>

      {/* Stat rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 14 }}>
        <StatCard col="gr" icon="🎯" val="22" label="Total Activities" badge={['fl', 'Active']} onClick={() => setPage('registry')} />
        <StatCard col="grs" icon="👥" val="614" label="Enrolled Students" badge={['up', '↑ 48']} onClick={() => setPage('registry')} />
        <StatCard col="or" icon="⚽" val="8" label="Sports Teams" badge={['fl', '8 teams']} onClick={() => setPage('sports')} />
        <StatCard col="bl" icon="📚" val="10" label="Clubs & Societies" badge={['fl', '10 active']} onClick={() => setPage('registry')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="pu" icon="🎭" val="4" label="Arts Groups" badge={['fl', '4 groups']} onClick={() => setPage('cultural')} />
        <StatCard col="go" icon="🏆" val="6" label="Competitions (Term)" badge={['up', '3 upcoming']} onClick={() => setPage('competitions')} />
        <StatCard col="ro" icon="🏛️" val="42" label="Student Leaders" badge={['fl', '42 leaders']} onClick={() => setPage('leadership')} />
        <StatCard col="te" icon="✅" val="82%" label="ECA Attendance Rate" badge={['up', '82%']} onClick={() => setPage('attendance')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Actions needed */}
        <Card>
          <CardHead title="⚠️ Action Required" />
          {[
            { dot: 'am', t: '⚽ Football transport not yet arranged — District Championship Sat 14 Mar', s: '26-player squad · Municipal Stadium · Bus needed by Wednesday', action: 'Arrange →', pg: 'sports' },
            { dot: 're', t: '🎭 Drama costumes budget approval needed — National Drama Thu 19 Mar', s: 'UGX 180,000 required · Submit to Bursar by Mon 09 Mar', action: 'Chase →', pg: null },
            { dot: 'am', t: '📋 Patron report overdue — Science Club (Mr. Ssemwanga)', s: 'Term 1 activity report due last Friday · No submission', action: 'Chase →', pg: 'patrons' },
            { dot: 'am', t: '🏛️ Prefect election notices not yet posted — vote Wed 11 Mar', s: 'Notices must go up today · Candidates confirmed', action: 'Post →', pg: 'leadership' },
            { dot: 'bl', t: '🎤 School Concert programme needs Head Teacher approval', s: 'Concert Fri 27 Mar · Programme drafted · Submit to HT by Tue 10 Mar', action: 'Submit', pg: 'cultural' },
            { dot: 'bl', t: '📋 Debate Club — National competition registration closes Mon 09 Mar', s: 'Team of 4 selected · Entry fee UGX 40,000 · Pay to Bursar', action: 'Register →', pg: 'competitions' },
          ].map(a => {
            const dotColor = a.dot === 're' ? V.danger : a.dot === 'am' ? V.warn : V.blue;
            const dotBg = a.dot === 're' ? V.dangerSoft : a.dot === 'am' ? V.warnSoft : V.blueSoft;
            return (
              <div key={a.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: `1px solid ${V.border}` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: dotColor, boxShadow: `0 0 0 3px ${dotBg}` }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{a.t}</div><div style={{ fontSize: 10, color: V.muted, marginTop: 1 }}>{a.s}</div></div>
                <span onClick={() => a.pg ? setPage(a.pg as Page) : toast('Action triggered', 'info')} style={{ fontSize: 10, fontWeight: 700, color: V.acc, cursor: 'pointer', padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>{a.action}</span>
              </div>
            );
          })}
        </Card>

        <div>
          {/* Upcoming events */}
          <Card style={{ marginBottom: 16 }}>
            <CardHead title="📅 Upcoming Events" action={<span onClick={() => setPage('timetable')} style={{ fontSize: 11, color: V.acc, fontWeight: 600, cursor: 'pointer' }}>Full calendar →</span>} />
            {[
              { label: 'District Football Championship', sub: 'Sat 14 Mar · Municipal Stadium · SMISSI vs Namilyango', bl: V.orange, chip: 'Transport pending', cc: [V.warnSoft, '#b45309'] as [string,string] },
              { label: 'National Drama Festival', sub: 'Thu 19 Mar · National Theatre, Kampala', bl: V.purple, chip: 'Costumes budget pending', cc: [V.dangerSoft, V.danger] as [string,string] },
              { label: 'Prefect Elections', sub: 'Wed 11 Mar · Main Hall · All students vote', bl: V.blue, chip: 'Notices needed', cc: [V.warnSoft, '#b45309'] as [string,string] },
              { label: 'End-of-Term Concert', sub: 'Fri 27 Mar · School Hall · All activities performing', bl: V.acc, chip: 'Planning underway', cc: [V.successSoft, V.success] as [string,string] },
            ].map(ev => (
              <div key={ev.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${ev.bl}`, marginBottom: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{ev.label}</div>
                <div style={{ fontSize: 10, color: V.muted }}>{ev.sub}</div>
                <Chip bg={ev.cc[0]} color={ev.cc[1]}>{ev.chip}</Chip>
              </div>
            ))}
          </Card>

          {/* Participation */}
          <Card>
            <CardHead title="📊 Participation by Category" />
            <Prog label="Sports" value="228 students" pct={85} col="or" />
            <Prog label="Clubs & Societies" value="186" pct={70} col="bl" />
            <Prog label="Arts & Culture" value="124" pct={47} col="pu" />
            <Prog label="Faith & Community" value="76" pct={29} col="go" />
          </Card>
        </div>
      </div>
    </div>
  );

  /* ─────────── ACTIVITIES REGISTRY ─────────── */
  const filteredActs = actFilter === 'all' ? activities : activities.filter(a => a.cat === actFilter);
  const PageRegistry = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Activities Registry</div><div style={{ fontSize: 12, color: V.muted }}>22 active activities · 614 students enrolled · Term 1, 2026</div></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={actFilter} onChange={e => setActFilter(e.target.value)} style={{ padding: '6px 10px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, background: '#f8fafc', fontFamily: 'inherit' }}>
            <option value="all">All Activities</option>
            <option value="sports">Sports</option>
            <option value="club">Clubs</option>
            <option value="arts">Arts</option>
            <option value="faith">Faith</option>
            <option value="leadership">Leadership</option>
          </select>
          <Btn onClick={() => toast('Registry exported', 'info')}>📄 Export</Btn>
          <Btn variant="pr" onClick={() => setModal('addAct')}>➕ Add Activity</Btn>
        </div>
      </div>
      <div>
        {filteredActs.map(a => {
          const [bg, color] = catColor[a.cat] ?? [V.accSoft, V.accDark];
          const [sbg, sc] = chipCols(a.status);
          const statusLabel = a.status === 'gr' ? 'Active' : a.status === 'am' ? 'Report due' : 'Low att.';
          return (
            <div key={a.name} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all .2s' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: V.muted, marginTop: 2 }}>Patron: {a.patron} · {a.day} · {a.venue}</div>
              </div>
              <Chip bg={bg} color={color}>{catLabel[a.cat]}</Chip>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: V.acc }}>{a.members}</div>
                <div style={{ fontSize: 10, color: V.muted }}>students</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                <Chip bg={sbg} color={sc}>{statusLabel}</Chip>
                <Btn size="sm" onClick={() => toast(`${a.name} edited`, 'info')}>Edit</Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ─────────── SPORTS & FIXTURES ─────────── */
  const PageSports = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Sports & Fixtures</div><div style={{ fontSize: 12, color: V.muted }}>8 teams · Term 1 fixtures · Results & standings</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={() => toast('Fixture list exported', 'info')}>📄 Export</Btn>
          <Btn variant="pr" onClick={() => setModal('addFixture')}>➕ Add Fixture</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="or" icon="⚽" val="8" label="Teams" />
        <StatCard col="grs" icon="🏆" val="5" label="Wins (Term)" />
        <StatCard col="re" icon="❌" val="2" label="Losses" />
        <StatCard col="am" icon="📅" val="3" label="Upcoming Fixtures" />
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 4, width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: 16, gap: 2 }}>
        {(['fixtures', 'teams', 'results'] as SportTab[]).map(t => (
          <button key={t} onClick={() => setSportTab(t)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: sportTab === t ? V.acc : 'transparent', color: sportTab === t ? '#fff' : V.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
            {t === 'fixtures' ? '📅 Fixtures' : t === 'teams' ? '👥 Teams & Squads' : '📊 Results & Standings'}
          </button>
        ))}
      </div>

      {sportTab === 'fixtures' && (
        <div>
          <AlertBanner color="warn">
            <span>⚠️</span>
            <div style={{ flex: 1 }}>Football transport to Municipal Stadium not yet arranged for Sat 14 Mar — deadline Wednesday 11 Mar</div>
            <Btn variant="wa" size="sm" onClick={() => toast('Transport request sent to Bursar', 'info')}>Request Bus →</Btn>
          </AlertBanner>
          {[
            { accent: V.orange, tag: 'Sat 14 Mar · 10:00 AM', loc: 'Home Ground', title: '⚽ Football — District Championship', matchup: 'SMISSI vs Namilyango College · Municipal Stadium, Mukono', chips: [['Transport pending', [V.dangerSoft, V.danger]], ['Permission slips: 24/26', [V.warnSoft, '#b45309']]], actions: [{ label: '👥 View Squad', fn: () => setModal('squad') }, { label: '🚌 Transport', fn: () => toast('Bus request sent to Bursar','info'), v: 'wa' }, { label: '📋 Result Form', fn: () => toast('Result form ready','info'), v: 'pr' }] },
            { accent: V.orange, tag: 'Thu 19 Mar · 2:00 PM', loc: 'Away', title: '🏐 Netball — Inter-schools League', matchup: 'SMISSI vs Gayaza High School · Gayaza · Coach: Ms. Nambi', chips: [['Transport arranged ✓', [V.successSoft, V.success]], ['Permission slips: 14/14', [V.successSoft, V.success]]], actions: [{ label: '👥 Squad', fn: () => setModal('squad') }, { label: '📋 Result Form', fn: () => {}, v: 'pr' }] },
            { accent: V.border, tag: 'Sat 21 Mar · 9:00 AM', loc: '', title: '🏃 Athletics — District Track & Field', matchup: 'SMISSI Athletics Team · District Sports Grounds · Coach: Mr. Kakooza', chips: [['Squad selection pending', [V.warnSoft, '#b45309']]], actions: [{ label: '👥 Select Squad', fn: () => setModal('squad'), v: 'pr' }] },
          ].map((f, i) => (
            <div key={i} style={{ background: V.card, border: `1px solid ${V.border}`, borderLeft: `4px solid ${f.accent}`, borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <Chip bg={V.warnSoft} color="#b45309">{f.tag}</Chip>
                {f.loc && <Chip bg={V.orangeSoft} color={V.orange}>{f.loc}</Chip>}
                <div style={{ fontSize: 13, fontWeight: 700 }}>{f.title}</div>
              </div>
              <div style={{ fontSize: 12, marginBottom: 8 }}><b>Match:</b> {f.matchup}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {f.chips.map(([label, [bg, c]]) => <Chip key={String(label)} bg={bg as string} color={c as string}>{String(label)}</Chip>)}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {f.actions.map(a => <Btn key={a.label} size="sm" variant={(a as { v?: string }).v ?? 'se'} onClick={a.fn}>{a.label}</Btn>)}
              </div>
            </div>
          ))}
          {/* Past results */}
          {[['Done · Sat 28 Feb', '⚽ Football — Friendly vs St. Mary\'s Kitende', 'Result: SMISSI 3 – 1 St. Mary\'s Kitende · Goals: Ssemakula (2), Byarugaba (1)', 'MOTM: Ssemakula Brian · Attendance: ~200 students'],
            ['Done · Sat 21 Feb', '🏐 Netball — FUBA Schools League', 'Result: SMISSI 38 – 22 Makerere College', 'Player of match: Akello Rose (S4A)'],
          ].map(([tag, title, result, sub], i) => (
            <div key={i} style={{ background: V.card, border: `1px solid ${V.border}`, borderLeft: `4px solid ${V.blue}`, borderRadius: 10, padding: 14, marginBottom: 10, opacity: .85 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Chip bg={V.successSoft} color={V.success}>{tag}</Chip>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{result}</div>
              <div style={{ fontSize: 11, color: V.muted }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {sportTab === 'teams' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[['⚽', 'Football (Boys)', 'Mr. Mwesige · Coach: Mr. Kakooza', 26, 88, 'or'],
            ['🏐', 'Netball (Girls)', 'Ms. Nambi', 14, 92, 'bl'],
            ['🏸', 'Badminton', 'Ms. Nakabugo', 18, 79, 'pu'],
            ['🏃', 'Athletics', 'Mr. Kakooza', 32, 85, 'te'],
            ['🏊', 'Swimming', 'Mr. Lubwama', 22, 76, 'bl'],
            ['🎾', 'Tennis', 'Mrs. Atim', 16, 81, 'go'],
          ].map(([icon, name, patron, squad, att, col]) => (
            <Card key={String(name)}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{icon} {name}</div>
              <div style={{ fontSize: 11, color: V.muted, marginBottom: 10 }}>Patron: {patron}</div>
              <Prog label="Squad size" value={String(squad)} pct={Math.round(Number(squad) / 50 * 100)} col={String(col)} />
              <Prog label="Training attendance" value={`${att}%`} pct={Number(att)} col="gr" />
              <Btn size="sm" onClick={() => setModal('squad')}>View Squad</Btn>
            </Card>
          ))}
        </div>
      )}

      {sportTab === 'results' && (
        <Card>
          <CardHead title="📊 Term 1 Results — All Sports" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Date', 'Sport', 'Opponent', 'H/A', 'Result', 'Score', 'MOTM'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['28 Feb', '⚽ Football', 'St. Mary\'s Kitende', 'Home', 'WIN', '3 – 1', 'Ssemakula B.'],
                  ['21 Feb', '🏐 Netball', 'Makerere College', 'Home', 'WIN', '38 – 22', 'Akello Rose'],
                  ['14 Feb', '⚽ Football', 'Namilyango College', 'Away', 'LOSS', '1 – 2', 'Byarugaba T.'],
                  ['07 Feb', '🏸 Badminton', 'Gayaza High', 'Home', 'WIN', '5 – 2', 'Nakato S.'],
                  ['31 Jan', '🏐 Netball', 'Buganda Road P/S', 'Away', 'LOSS', '24 – 30', 'Namukasa J.'],
                  ['24 Jan', '⚽ Football', 'St. Henry\'s Kitovu', 'Away', 'WIN', '2 – 0', 'Opio C.'],
                ].map(([date, sport, opp, ha, res, score, motm]) => (
                  <tr key={date + sport} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{date}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{sport}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{opp}</td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={ha === 'Home' ? V.accSoft : V.orangeSoft} color={ha === 'Home' ? V.accDark : V.orange}>{ha}</Chip></td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={res === 'WIN' ? V.successSoft : V.dangerSoft} color={res === 'WIN' ? V.success : V.danger}>{res}</Chip></td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>{score}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{motm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  /* ─────────── COMPETITIONS ─────────── */
  const PageCompetitions = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Competitions & Inter-School Events</div><div style={{ fontSize: 12, color: V.muted }}>6 competitions this term · Represent SMISSI</div></div>
        <Btn variant="pr" onClick={() => setModal('addComp')}>➕ Register Competition</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="bl" icon="📅" val="3" label="Upcoming" />
        <StatCard col="go" icon="🏆" val="2" label="Trophies Won (Term)" />
        <StatCard col="grs" icon="🥇" val="1st" label="Best Result: Debate" />
        <StatCard col="am" icon="💰" val="UGX 280k" label="Pending Entry Fees" />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: V.orange }}>🔥 Upcoming — Needs Action</div>
      {/* Football */}
      <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 14, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <Chip bg={V.blueSoft} color={V.blue}>📅 Sat 14 Mar</Chip>
        <div style={{ fontSize: 14, fontWeight: 700, margin: '8px 0 4px' }}>⚽ District Football Championship — Zone B</div>
        <div style={{ fontSize: 12, color: V.muted, marginBottom: 10 }}>Municipal Stadium, Mukono · SMISSI vs Namilyango College (Qtr Final) · KO: 10:00 AM</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
          {[['26', 'Squad'], ['❌', 'No transport', '#fee2e2', V.danger], ['24/26', 'Permissions']].map(([val, lbl, bg, color]) => (
            <div key={String(lbl)} style={{ background: bg ?? '#f8fafc', borderRadius: 7, padding: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: color as string | undefined }}>{val}</div>
              <div style={{ fontSize: 10, color: color ?? V.muted }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn variant="da" size="sm" onClick={() => toast('Bus request sent to Bursar', 'info')}>🚌 Arrange Transport</Btn>
          <Btn size="sm" onClick={() => setModal('squad')}>👥 Squad List</Btn>
          <Btn size="sm" onClick={() => toast('Permission slips printed', 'info')}>📄 Permission Slips</Btn>
        </div>
      </div>

      {/* Drama */}
      <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 14, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <Chip bg={V.warnSoft} color="#b45309">🎭 Thu 19 Mar</Chip>
        <div style={{ fontSize: 14, fontWeight: 700, margin: '8px 0 4px' }}>🎭 National Drama Festival</div>
        <div style={{ fontSize: 12, color: V.muted, marginBottom: 10 }}>National Theatre, Kampala · Play: "The Burden of Tomorrow" · Director: Mr. Kato</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
          {[['18', 'Cast & Crew'], ['UGX 180k', 'Budget needed', V.warnSoft, '#b45309'], ['8', 'Rehearsals left']].map(([val, lbl, bg, color]) => (
            <div key={String(lbl)} style={{ background: bg ?? '#f8fafc', borderRadius: 7, padding: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: color as string | undefined }}>{val}</div>
              <div style={{ fontSize: 10, color: color ?? V.muted }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="wa" size="sm" onClick={() => toast('Budget request sent to Bursar', 'info')}>💰 Request Budget</Btn>
          <Btn size="sm" onClick={() => toast('Rehearsal schedule opened', 'info')}>📅 Rehearsal Schedule</Btn>
          <Btn size="sm" onClick={() => toast('Cast list printed', 'info')}>📋 Cast List</Btn>
        </div>
      </div>

      {/* Debate */}
      <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 14, marginBottom: 22, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <Chip bg={V.blueSoft} color={V.blue}>📅 Mon 09 Mar (deadline)</Chip>
        <div style={{ fontSize: 14, fontWeight: 700, margin: '8px 0 4px' }}>🗣️ National Schools Debate Competition</div>
        <div style={{ fontSize: 12, color: V.muted, marginBottom: 8 }}>Kampala High School · Motion: "The digital economy benefits Uganda's youth more than agriculture" · 4-member team</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Chip bg={V.dangerSoft} color={V.danger}>Registration closes Mon 09 Mar</Chip>
          <Chip bg={V.warnSoft} color="#b45309">UGX 40k entry fee unpaid</Chip>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="da" size="sm" onClick={() => toast('Debate registration submitted, fee sent to Bursar', 'success')}>🚨 Register Now</Btn>
          <Btn size="sm">👥 Team</Btn>
        </div>
      </div>

      <div style={{ height: 1, background: V.border, margin: '14px 0' }} />
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: V.accDark }}>🏆 Completed — Term 1</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { badge: '🥇 1st Place', bg: V.accSoft, bc: V.acc, title: '🗣️ District Debate Competition', sub: 'Sat 14 Feb · SMISSI won the district trophy · Best speaker: Namukasa Joyce (S6A)' },
          { badge: '🥈 2nd Place', bg: V.goldSoft, bc: V.gold, title: '🎵 Inter-schools Music Festival', sub: 'Sat 21 Feb · SMISSI Choir placed 2nd of 12 schools · Conductor: Ms. Grace' },
        ].map(c => (
          <div key={c.title} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, marginBottom: 8, background: c.bg, color: c.bc, border: `1px solid ${c.bc}30` }}>{c.badge}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: V.muted, marginBottom: 8 }}>{c.sub}</div>
            <Btn size="sm" variant="su" onClick={() => toast('Certificate printed', 'info')}>🏆 Print Certificate</Btn>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─────────── CULTURAL & ARTS ─────────── */
  const PageCultural = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Cultural & Arts Events</div><div style={{ fontSize: 12, color: V.muted }}>Drama · Choir · Cultural Dance · Talent · End-of-term Concert</div></div>
        <Btn variant="pr" onClick={() => setModal('addEvent')}>🎭 Add Event</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
        {[['🎭', V.purple, 'Drama Club', '28 members · Patron: Mr. Kato', '2nd yr running', 'National Festival · 19 Mar'],
          ['🎵', V.acc, 'School Choir', '50 members · Patron: Ms. Grace', '🥈 2nd Place', 'Music Festival · 21 Feb'],
          ['💃', V.orange, 'Cultural Dance Troupe', '36 members · Patron: Ms. Nambi', 'Concert ready', 'Performing 27 Mar'],
        ].map(([icon, col, name, sub, stat, ev]) => (
          <Card key={String(name)} style={{ textAlign: 'center', borderTop: `3px solid ${col}` }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
            <div style={{ fontSize: 11, color: V.muted }}>{sub}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: String(col), margin: '8px 0' }}>{stat}</div>
            <div style={{ fontSize: 11, color: V.muted }}>{ev}</div>
            <Btn size="sm" style={{ marginTop: 8 }} onClick={() => toast(`${name} details opened`, 'info')}>View Details</Btn>
          </Card>
        ))}
      </div>

      {/* Concert planning */}
      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title={<div><div className="">🎤 End-of-Term Concert — Fri 27 March 2026</div><div style={{ fontSize: 11, color: V.muted, fontWeight: 400 }}>School Hall · Open to parents · All activities performing</div></div>}
          action={<div style={{ display: 'flex', gap: 8 }}><Btn size="sm" onClick={() => toast('Programme exported', 'info')}>📄 Programme</Btn><Btn size="sm" variant="pr" onClick={() => toast('Submitted to Head Teacher for approval', 'success')}>📤 Submit to HT</Btn></div>}
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['#', 'Act', 'Group', 'Duration', 'Patron', 'Status', ''].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                [1, 'Opening — National Anthem', 'All students', '3 min', '—', 'gr', 'Confirmed', null],
                [2, 'Welcome address', 'Head Girl / Head Boy', '5 min', 'Leadership', 'gr', 'Confirmed', null],
                [3, 'Choir: "Tukutendereza"', 'School Choir', '8 min', 'Ms. Grace', 'gr', 'Ready ✓', null],
                [4, 'Baganda Cultural Dance', 'Cultural Dance Troupe', '10 min', 'Ms. Nambi', 'gr', 'Rehearsing ✓', null],
                [5, 'Drama: excerpt', 'Drama Club', '15 min', 'Mr. Kato', 'am', 'Costume pending', null],
                [6, 'Talent Show', 'Open', '20 min', 'ECA Coord.', 'am', 'Auditions Fri 13 Mar', null],
                [7, 'Scripture Union Praise', 'SU Group', '10 min', 'Chaplain', 'gr', 'Confirmed', null],
                [8, 'Awards — ECA Achievers', 'ECA Coordinator', '12 min', 'ECA Coord.', 'bl', 'Awards TBC', 'Set Awards'],
                [9, 'HT Closing Remarks', 'Head Teacher', '8 min', '—', 'gr', 'Confirmed', null],
              ].map(([num, act, grp, dur, patron, sc, slabel, btn]) => {
                const [cbg, cc] = sc === 'gr' ? [V.successSoft, V.success] : sc === 'am' ? [V.warnSoft, '#b45309'] : [V.blueSoft, V.blue];
                return (
                  <tr key={Number(num)} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{num}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{act}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{grp}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{dur}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{patron}</td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={cbg} color={cc}>{String(slabel)}</Chip></td>
                    <td style={{ padding: '10px 12px' }}>{btn && <Btn size="sm" onClick={() => setModal('awards')}>{String(btn)}</Btn>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Talent show */}
      <Card>
        <CardHead title="🌟 Talent Show — Auditions Fri 13 Mar" action={<Btn size="sm" variant="pr" onClick={() => setModal('addEvent')}>+ Register Act</Btn>} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Student', 'Class', 'Act Type', 'Title', 'Duration', 'Audition'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {[['Namukasa Joyce', 'S6A', '🎤 Vocal', '"Personally" — original composition', '4 min'],
                ['Mugisha Brian', 'S1B', '🎸 Instrument', 'Guitar solo — "Tewali suubi"', '3 min'],
                ['Apio Grace', 'S4A', '💃 Dance', 'Afrobeat solo', '3 min'],
                ['Ssali Kevin', 'S4A', '🎭 Comedy', 'Stand-up set', '5 min'],
              ].map(([name, cls, type, title, dur]) => (
                <tr key={String(name)} style={{ borderBottom: `1px solid ${V.border}` }}>
                  <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{name}</td>
                  <td style={{ padding: '10px 12px' }}><Chip bg={V.blueSoft} color={V.blue}>{String(cls)}</Chip></td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{type}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{title}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{dur}</td>
                  <td style={{ padding: '10px 12px' }}><Chip bg={V.warnSoft} color="#b45309">Fri 13 Mar</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─────────── STUDENT LEADERSHIP ─────────── */
  const PageLeadership = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Student Leadership</div><div style={{ fontSize: 12, color: V.muted }}>Prefects · Guild Council · Club Presidents · Term 1, 2026</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="or" onClick={() => toast('Election notices printed and ready for posting', 'success')}>📋 Post Election Notices</Btn>
          <Btn variant="pr" onClick={() => setModal('addLeader')}>➕ Add Leader</Btn>
        </div>
      </div>
      <AlertBanner color="warn">
        <span>📋</span>
        <div style={{ flex: 1 }}>Prefect election day: Wednesday 11 March — election notices must be posted on noticeboards today</div>
        <Btn variant="wa" size="sm" onClick={() => toast('Notices sent to print', 'success')}>🖨️ Print Notices</Btn>
      </AlertBanner>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 4, width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: 16, gap: 2, flexWrap: 'wrap' }}>
        {(['prefects', 'guild', 'clubleaders', 'election'] as LeadTab[]).map(t => {
          const labels = { prefects: '🏛️ Prefects', guild: '🗳️ Guild Council', clubleaders: '📚 Club Presidents', election: '🗳️ 2026 Election' };
          return <button key={t} onClick={() => setLeadTab(t)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: leadTab === t ? V.acc : 'transparent', color: leadTab === t ? '#fff' : V.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>{labels[t]}</button>;
        })}
      </div>

      {leadTab === 'prefects' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Head Prefects</div>
            {[['🧑', 'Ssemakula Brian', 'S6A · Head Boy', 'Head Boy', V.accSoft, V.accDark],
              ['👧', 'Namukasa Joyce', 'S6A · Head Girl', 'Head Girl', V.roseSoft, V.rose],
              ['🧑', 'Mugisha Ronald', 'S5A · Deputy Head Boy', 'Dep. Head Boy', V.blueSoft, V.blue],
              ['👧', 'Akello Grace', 'S5A · Deputy Head Girl', 'Dep. Head Girl', V.purpleSoft, V.purple],
            ].map(([, name, sub, role, bg, color]) => (
              <div key={String(name)} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${color},${V.acc})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{String(name).split(' ').map(p => p[0]).join('').slice(0, 2)}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{name}</div><div style={{ fontSize: 11, color: V.muted }}>{sub}</div></div>
                <Chip bg={bg as string} color={color as string}>{role as string}</Chip>
              </div>
            ))}
          </div>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>House & Day Prefects</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Name', 'Class', 'Role'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[['Byarugaba Tim', 'S6B', 'Dormitory Prefect (Nile House)'], ['Nakiganda Joy', 'S6A', "Girls' Dormitory Prefect"], ['Opio Sam', 'S5A', 'Dining Hall Prefect'], ['Nankya Deb', 'S5B', 'Library Prefect'], ['Odongo Eric', 'S4A', 'Sports Prefect'], ['Tukahirwa Paul', 'S4B', 'Chapel Prefect'], ['Nabirye Claire', 'S4A', 'Environment Prefect']].map(([name, cls, role]) => (
                    <tr key={String(name)} style={{ borderBottom: `1px solid ${V.border}` }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{name}</td>
                      <td style={{ padding: '10px 12px' }}><Chip bg={V.blueSoft} color={V.blue}>{String(cls)}</Chip></td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {leadTab === 'guild' && (
        <Card>
          <CardHead title="🗳️ Guild Student Council 2025/26" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Position', 'Name', 'Class', 'Elected', 'Key Responsibilities'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['Guild President', 'Ssemakula Brian', 'S6A', 'Oct 2025', 'Represents student body to HT/DHM'],
                  ['Vice President (Girls)', 'Namukasa Joyce', 'S6A', 'Oct 2025', 'Girls welfare, girls sports'],
                  ['Secretary General', 'Mugisha Ronald', 'S5A', 'Oct 2025', 'Minutes, notices, communication'],
                  ['Treasurer', 'Akello Grace', 'S5A', 'Oct 2025', 'Guild accounts, budgets'],
                  ['Sports Minister', 'Odongo Eric', 'S4A', 'Oct 2025', 'Sports teams, competition logistics'],
                  ['Culture Minister', 'Apio Grace', 'S4A', 'Oct 2025', 'Drama, choir, cultural events'],
                  ['Health Minister', 'Nakiganda Joy', 'S6A', 'Oct 2025', 'Welfare, sanitation, health days'],
                ].map(([pos, name, cls, el, resp]) => (
                  <tr key={String(pos)} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>{pos}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{name}</td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={V.accSoft} color={V.accDark}>{String(cls)}</Chip></td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{el}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{resp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {leadTab === 'clubleaders' && (
        <Card>
          <CardHead title="📚 Club & Society Presidents" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Club', 'President', 'Class', 'Secretary', 'Patron', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['📖 Debate Club', 'Namukasa Joyce', 'S6A', 'Byarugaba T.', 'Ms. Nakato', 'gr', 'Active'],
                  ['🔬 Science Club', 'Ssemakula Brian', 'S6A', 'Kato Alex', 'Mr. Ssemwanga', 'gr', 'Active'],
                  ['💻 Computer Club', 'Nakabugo Sandra', 'S5A', 'Oloka Peter', 'Ms. Nakabugo', 'gr', 'Active'],
                  ['✝️ Scripture Union', 'Tukahirwa Paul', 'S4B', 'Nakiganda Joy', 'Chaplain', 'gr', 'Active'],
                  ['☪️ Muslim Students', 'Ismail Karim', 'S4A', 'Farida Amina', 'Sheikh Lubega', 'gr', 'Active'],
                  ['🌍 Geography Club', 'Opolot Sam', 'S5A', 'Nakamya Doris', 'Mr. Opolot', 'am', 'Report pending'],
                  ['📸 Photography Club', 'Wasswa Daniel', 'S4A', 'Ssali Kevin', 'Mrs. Atim', 'gr', 'Active'],
                ].map(([club, pres, cls, sec, patron, sc, slbl]) => {
                  const [cbg, cc] = sc === 'gr' ? [V.successSoft, V.success] : [V.warnSoft, '#b45309'];
                  return <tr key={String(club)} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{club}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{pres}</td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={V.accSoft} color={V.accDark}>{String(cls)}</Chip></td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{sec}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{patron}</td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={cbg} color={cc}>{String(slbl)}</Chip></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {leadTab === 'election' && (
        <Card>
          <CardHead title="🗳️ Prefect Elections — Wed 11 March 2026" />
          <div style={{ background: V.accSoft, borderRadius: 8, padding: 12, fontSize: 12, fontWeight: 600, color: V.accDark, marginBottom: 14 }}>Election day: Wednesday 11 March · Main Hall · 10:00 AM · All students vote</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Position', 'Candidates', 'Class', 'Nomination Status'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {[['Head Boy', 'Byarugaba Tim, Opio Sam', 'S5', 'Confirmed ✓', 'gr'],
                  ['Head Girl', 'Nakiganda Joy, Nassali Fiona', 'S5', 'Confirmed ✓', 'gr'],
                  ['Dep. Head Boy', 'Odongo Eric, Kato Alex', 'S4', 'Confirmed ✓', 'gr'],
                  ['Dep. Head Girl', 'Nankya Deb, Apio Grace', 'S4', 'Confirmed ✓', 'gr'],
                  ['Sports Prefect', 'Tukahirwa Paul', 'S4', 'Unopposed', 'bl'],
                ].map(([pos, cands, cls, status, sc]) => {
                  const [cbg, cc] = sc === 'gr' ? [V.successSoft, V.success] : [V.blueSoft, V.blue];
                  return <tr key={String(pos)} style={{ borderBottom: `1px solid ${V.border}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>{pos}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{cands}</td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={V.accSoft} color={V.accDark}>{String(cls)}</Chip></td>
                    <td style={{ padding: '10px 12px' }}><Chip bg={cbg} color={cc}>{String(status)}</Chip></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn variant="pr" onClick={() => toast('Election notices sent to print', 'success')}>🖨️ Print Ballot Papers</Btn>
            <Btn onClick={() => toast('Notices printed', 'info')}>📋 Print Notices</Btn>
            <Btn onClick={() => toast('Results form ready', 'info')}>📊 Results Form</Btn>
          </div>
        </Card>
      )}
    </div>
  );

  /* ─────────── ECA ATTENDANCE ─────────── */
  const attStudents = attData[attAct] ?? attData.football;
  const attTotals = attStudents.map((_, i) => attPcts[i % attPcts.length]);
  const attAvg = Math.round(attTotals.reduce((a, b) => a + b, 0) / attTotals.length);
  const attNames: Record<string, string> = { football: '⚽ Football (Boys)', debate: '🗣️ Debate Club', choir: '🎵 School Choir', science: '🔬 Science Club', drama: '🎭 Drama Club' };

  const PageAttendance = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>ECA Attendance Tracking</div><div style={{ fontSize: 12, color: V.muted }}>Monitor participation · Flag absenteeism · Term 1</div></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={attAct} onChange={e => setAttAct(e.target.value)} style={{ padding: '6px 10px', border: `1px solid ${V.border}`, borderRadius: 8, fontSize: 12, background: '#f8fafc', fontFamily: 'inherit' }}>
            <option value="football">⚽ Football (Boys)</option>
            <option value="debate">🗣️ Debate Club</option>
            <option value="choir">🎵 School Choir</option>
            <option value="science">🔬 Science Club</option>
            <option value="drama">🎭 Drama Club</option>
          </select>
          <Btn variant="pr" onClick={() => toast('Attendance saved ✓', 'success')}>💾 Save</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="grs" icon="✅" val="82%" label="Overall ECA Attendance" />
        <StatCard col="am" icon="⚠️" val="14" label="Students Below 70%" />
        <StatCard col="bl" icon="👥" val="614" label="Total Enrolled" />
        <StatCard col="re" icon="❌" val="6" label="Dropped Out (Term)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title={attNames[attAct]} />
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {attStudents.map((name, i) => {
              const p = attPcts[i % attPcts.length];
              const col = p >= 80 ? V.success : p >= 70 ? V.warn : V.danger;
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: `1px solid ${V.border}` }}>
                  <span style={{ fontSize: 11, color: V.muted, width: 22 }}>{i + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{name}</span>
                  <div style={{ width: 80, height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden', marginRight: 8 }}>
                    <div style={{ width: `${p}%`, height: '100%', background: col, borderRadius: 10 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: col, width: 30, textAlign: 'right' }}>{p}%</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, padding: 10, background: '#f8fafc', borderRadius: 8, display: 'flex', gap: 16, fontSize: 12 }}>
            <span><b style={{ color: V.success }}>{attAvg}%</b> Avg attendance</span>
            <span><b>{attStudents.length}</b> members</span>
          </div>
        </Card>
        <Card>
          <CardHead title="📊 Attendance by Activity" />
          <Prog label="⚽ Football" value="88%" pct={88} col="gr" />
          <Prog label="🏐 Netball" value="92%" pct={92} col="gr" />
          <Prog label="🎵 Choir" value="85%" pct={85} col="gr" />
          <Prog label="🗣️ Debate Club" value="79%" pct={79} col="am" />
          <Prog label="🎭 Drama Club" value="76%" pct={76} col="am" />
          <Prog label="📸 Photography ⚠️" value="58%" pct={58} col="re" />
          <div style={{ height: 1, background: V.border, margin: '14px 0' }} />
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: V.danger }}>⚠️ Below 70% — Action Needed</div>
          {[{ t: 'Photography Club — 58% attendance', s: 'Mrs. Atim (Patron) notified · Review meeting needed' },
            { t: 'Geography Club — 67% attendance', s: 'Mr. Opolot · Patron report overdue' },
          ].map(a => (
            <div key={a.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 0', borderBottom: `1px solid ${V.border}` }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: V.danger, boxShadow: `0 0 0 3px ${V.dangerSoft}` }} />
              <div><div style={{ fontSize: 12, fontWeight: 600 }}>{a.t}</div><div style={{ fontSize: 10, color: V.muted, marginTop: 1 }}>{a.s}</div></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  /* ─────────── TIMETABLE & VENUES ─────────── */
  const PageTimetable = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>ECA Timetable & Venue Booking</div><div style={{ fontSize: 12, color: V.muted }}>Avoid clashes · Book venues · Week 8, Term 1</div></div>
        <Btn variant="pr" onClick={() => setModal('bookVenue')}>📅 Book Venue</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title="📅 This Week — ECA Schedule" />
          {[
            { day: 'Saturday 07 Mar (Today)', slots: [
              { time: '8:00 AM', name: '⚽ Football Training', sub: 'School Pitch · Mr. Kakooza', tag: 'Pitch', bg: V.accSoft, col: V.accDark },
              { time: '10:00 AM', name: '🎵 Choir Rehearsal', sub: 'Music Room · Ms. Grace', tag: 'Music Rm', bg: V.blueSoft, col: V.blue },
              { time: '2:00 PM', name: '🎭 Drama Rehearsal', sub: 'School Hall · Mr. Kato', tag: 'Hall', bg: V.purpleSoft, col: V.purple },
            ]},
            { day: 'Monday 09 Mar', slots: [
              { time: '4:00 PM', name: '🗣️ Debate Club — Practice', sub: 'Boardroom · Ms. Nakato · National comp prep', tag: 'Boardroom', bg: V.orangeSoft, col: V.orange },
              { time: '4:30 PM', name: '🔬 Science Club Meeting', sub: 'Lab 2 · Mr. Ssemwanga', tag: 'Lab 2', bg: V.tealSoft, col: V.teal },
            ]},
            { day: 'Wednesday 11 Mar', slots: [
              { time: '10:00 AM', name: '🗳️ Prefect Elections', sub: 'Main Hall · All students · 2 hrs', tag: '⚠️ Clash', bg: V.dangerSoft, col: V.danger, conflict: true },
              { time: '3:00 PM', name: '💃 Cultural Dance Rehearsal', sub: 'School Hall (if free) · Ms. Nambi', tag: 'Pending', bg: V.warnSoft, col: '#b45309' },
            ]},
          ].map(section => (
            <div key={section.day}>
              <div style={{ fontSize: 11, fontWeight: 700, color: V.muted, textTransform: 'uppercase', margin: '12px 0 8px', paddingTop: 10, borderTop: `1px solid ${V.border}`, letterSpacing: '.04em' }}>{section.day}</div>
              {section.slots.map(slot => (
                <div key={slot.time + slot.name} style={{ background: slot.conflict ? V.dangerSoft : V.accSoft, borderRadius: 8, padding: '10px 12px', marginBottom: 7, border: `1px solid ${slot.conflict ? 'rgba(239,68,68,.25)' : 'rgba(22,163,74,.25)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: slot.conflict ? V.danger : V.muted, width: 55, flexShrink: 0 }}>{slot.time}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{slot.name}</div><div style={{ fontSize: 10, color: V.muted }}>{slot.sub}</div></div>
                  <Chip bg={slot.bg} color={slot.col}>{slot.tag}</Chip>
                </div>
              ))}
            </div>
          ))}
        </Card>

        <div>
          <Card style={{ marginBottom: 16 }}>
            <CardHead title="🏟️ Venue Status" action={<Btn variant="pr" size="sm" onClick={() => setModal('bookVenue')}>📅 Book a Venue</Btn>} />
            {[
              { name: 'School Pitch (Football)', info: 'In use: Sat mornings · Sun afternoons', col: V.acc },
              { name: 'School Hall', info: 'Drama Sat 2 PM · Elections Wed 10 AM · Conflicts: check Wed', col: V.blue },
              { name: 'Music Room', info: 'Choir Sat 10 AM · Free most afternoons', col: V.purple },
              { name: 'Boardroom', info: 'Debate Mon 4 PM · Free most days', col: V.orange },
              { name: '⚠️ Hall conflict — Wed 11 Mar', info: 'Elections (10 AM) vs Drama (scheduled 2 PM) — check with DHM re: overlap', col: V.danger },
            ].map(v => (
              <div key={v.name} style={{ background: v.col === V.danger ? '#fff9f9' : '#f8fafc', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${v.col}`, marginBottom: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{v.name}</div>
                <div style={{ fontSize: 11, color: v.col === V.danger ? V.danger : V.muted }}>{v.info}</div>
              </div>
            ))}
          </Card>

          <Card>
            <CardHead title="🔁 Weekly ECA Timetable" />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Day', 'Time', 'Activity', 'Venue'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[['Mon', '4:00 PM', 'Debate Club', 'Boardroom'], ['Mon', '4:30 PM', 'Science Club', 'Lab 2'], ['Tue', '4:00 PM', 'Computer Club', 'Computer Lab'], ['Tue', '4:30 PM', 'Photography Club', 'Room 6'], ['Wed', '3:00 PM', 'Cultural Dance', 'School Hall'], ['Thu', '4:00 PM', 'Scripture Union', 'Chapel'], ['Sat', '8:00 AM', 'Football Training', 'School Pitch'], ['Sat', '10:00 AM', 'Choir Rehearsal', 'Music Room'], ['Sat', '2:00 PM', 'Drama Rehearsal', 'School Hall']].map(([day, time, act, venue]) => (
                    <tr key={day + time + act} style={{ borderBottom: `1px solid ${V.border}` }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{day}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{time}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{act}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{venue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  /* ─────────── TEACHER PATRONS ─────────── */
  const PagePatrons = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>Teacher Patrons</div><div style={{ fontSize: 12, color: V.muted }}>18 patrons · Supervision, attendance & term reports</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="wa" onClick={() => toast('Reminders sent to all patrons with overdue reports', 'info')}>📤 Chase Overdue Reports</Btn>
          <Btn variant="pr" onClick={() => setModal('addPatron')}>➕ Assign Patron</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard col="grs" icon="✅" val="14" label="Reports Submitted" />
        <StatCard col="am" icon="⏳" val="4" label="Reports Overdue" />
        <StatCard col="bl" icon="👩‍🏫" val="18" label="Total Patrons" />
        <StatCard col="or" icon="📋" val="2" label="Without Patron" />
      </div>
      <Card>
        <CardHead title="👩‍🏫 All Patron Assignments" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Teacher', 'Activity', 'Type', 'Members', 'Meeting Day', 'Term Report', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                ['Mr. Kato Peter', '🎭 Drama Club', 'Arts', V.purpleSoft, V.purple, 28, 'Sat 2 PM', true],
                ['Ms. Grace Atim', '🎵 School Choir', 'Arts', V.purpleSoft, V.purple, 50, 'Sat 10 AM', true],
                ['Ms. Nambi Rose', '🏐 Netball + 💃 Cultural', 'Sports', V.orangeSoft, V.orange, 50, 'Tue + Wed', true],
                ['Mr. Kakooza D.', '⚽ Football + 🏃 Athletics', 'Sports', V.orangeSoft, V.orange, 58, 'Sat 8 AM', true],
                ['Ms. Nakato R.', '🗣️ Debate Club', 'Club', V.blueSoft, V.blue, 25, 'Mon 4 PM', true],
                ['Mr. Ssemwanga', '🔬 Science Club', 'Club', V.blueSoft, V.blue, 32, 'Mon 4:30 PM', false],
                ['Ms. Nakabugo', '💻 Computer Club', 'Club', V.blueSoft, V.blue, 30, 'Tue 4 PM', false],
                ['Mrs. Atim Norah', '📸 Photography Club', 'Club', V.blueSoft, V.blue, 20, 'Tue 4:30 PM', false],
                ['Chaplain', '✝️ Scripture Union', 'Faith', V.goldSoft, V.gold, 45, 'Thu 4 PM', true],
                ['Sheikh Lubega', '☪️ Muslim Students', 'Faith', V.goldSoft, V.gold, 31, 'Fri 4 PM', false],
              ].map(([teacher, act, type, tbg, tc, members, day, submitted], i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${V.border}` }}>
                  <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>{teacher}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{act}</td>
                  <td style={{ padding: '10px 12px' }}><Chip bg={tbg as string} color={tc as string}>{type as string}</Chip></td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{members as number}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: V.muted }}>{day as string}</td>
                  <td style={{ padding: '10px 12px' }}>{submitted ? <Chip bg={V.successSoft} color={V.success}>Submitted ✓</Chip> : <Chip bg={V.warnSoft} color="#b45309">OVERDUE</Chip>}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {submitted
                      ? <Btn size="sm" onClick={() => toast('Report viewed', 'info')}>View</Btn>
                      : <Btn size="sm" variant="wa" onClick={() => toast(`Reminder sent to ${teacher}`, 'info')}>Remind</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─────────── COMMUNICATIONS ─────────── */
  const PageCommunications = () => (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Communications</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHead title="📬 Inbox (3 unread)" />
          {[
            { init: 'HT', bg: V.primary, from: 'Head Teacher', title: 'Concert programme approval pending — please submit', sub: '1 hr ago · Unread' },
            { init: 'NK', bg: V.acc, from: 'Ms. Nakato (Debate)', title: 'Debate team ready for nationals — registration?', sub: '2 hrs ago · Unread' },
            { init: 'SB', bg: V.orange, from: 'Guild President (Ssemakula)', title: 'Guild council wants a meeting re: concert planning', sub: 'Yesterday · Unread' },
            { init: 'DHM', bg: V.primary, from: 'Deputy HM', title: 'Confirm student transport request for football fixture', sub: '2 days ago' },
          ].map(m => (
            <div key={m.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 6px', background: m.sub.includes('Unread') ? V.accSoft : 'transparent', borderRadius: 8, marginBottom: 5, cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{m.init}</div>
              <div><div style={{ fontSize: 12, fontWeight: 600 }}>{m.title}</div><div style={{ fontSize: 10, color: V.muted, marginTop: 1 }}>{m.from} · {m.sub}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHead title="📢 Compose / Circular" />
          <FG label="Send To"><FS><option>🏫 Head Teacher</option><option>🏫 Deputy HM</option><option>👩‍🏫 All Patrons</option><option>💰 Bursar (budget/transport)</option><option>🏛️ Guild President</option><option>🎒 All Students</option></FS></FG>
          <FG label="Subject"><FI placeholder="e.g. Patron Report Reminder — Term 1" /></FG>
          <FG label="Message"><FTA placeholder="Your message or circular..." /></FG>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn onClick={() => toast('Draft saved', 'info')}>💾 Draft</Btn>
            <Btn variant="pr" onClick={() => toast('Circular sent ✓', 'success')}>📤 Send</Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  /* ─────────── ANNOUNCEMENTS ─────────── */
  const PageAnnouncements = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Announcements</div>
        <Btn variant="pr" onClick={() => setModal('circular')}>📢 New Announcement</Btn>
      </div>
      {[
        { tag: 'ECA OFFICE', tagBg: V.orange, title: 'End-of-Term Concert — All Activities Performing Fri 27 March', body: 'All clubs, sports teams, arts groups and societies are invited to perform at the End-of-Term Concert on Friday 27 March. Patrons must submit their group\'s act details to the ECA office by Tuesday 10 March. Talent show auditions: Friday 13 March, 3 PM.', date: '07 Mar 2026', borderCol: V.orange },
        { tag: 'ELECTIONS', tagBg: V.acc, title: 'Prefect Elections — Wednesday 11 March, 10:00 AM', body: 'All students are required to vote in the annual prefect elections on Wednesday 11 March at 10:00 AM in the Main Hall. Candidates are posted on all noticeboards. Voting is by secret ballot. Results announced Thursday morning.', date: '07 Mar 2026', borderCol: V.acc },
      ].map(a => (
        <div key={a.title} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: 12, borderLeft: `4px solid ${a.borderCol}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ background: a.tagBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>{a.tag}</span>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{a.title}</div>
          </div>
          <div style={{ fontSize: 12, color: V.muted, lineHeight: 1.7 }}>{a.body}</div>
          <div style={{ fontSize: 11, color: V.light, marginTop: 8 }}>{a.date} · ECA Coordinator</div>
        </div>
      ))}
    </div>
  );

  /* ─────────── PORTALS ─────────── */
  const PagePortals = () => (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Portal Quick Access</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[['🏫', '#059669', V.successSoft, 'Head Teacher', '/ht/dashboard'],
          ['📋', '#0ea5e9', '#f0f9ff', 'Deputy HM', '/deputy-hm'],
          ['💰', V.warn, V.warnSoft, 'Bursar', '/bursar'],
          ['👩‍🏫', V.blue, V.blueSoft, 'Teacher Portal', '/teacher'],
          ['💚', V.teal, V.tealSoft, 'Counsellor', '/counsellor'],
          ['🎒', V.purple, V.purpleSoft, 'Student Portal', '/student'],
        ].map(([icon, border, bg, title, path]) => (
          <div key={String(title)} onClick={() => navigate(String(path))} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: V.card, border: `1px solid ${V.border}`, borderRadius: 10, cursor: 'pointer', borderLeft: `4px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,.06)', transition: 'all .2s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: String(bg), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>
            <span style={{ marginLeft: 'auto', color: V.light }}>↗</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─────────── SETTINGS ─────────── */
  const PageSettings = () => (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Settings</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Profile</div>
          <FG label="Full Name"><FI value={user?.name ?? 'ECA Coordinator'} /></FG>
          <FG label="Role"><FI value="Extra-Curricular Activities Coordinator" /></FG>
          <FG label="Email"><FI value="eca@smissi.ac.ug" type="email" /></FG>
          <Btn variant="pr" onClick={() => toast('Profile updated ✓', 'success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Preferences</div>
          <FG label="Patron report reminder"><FS><option>1 week before deadline</option><option>3 days before</option></FS></FG>
          <FG label="Attendance alert threshold"><FS><option>Below 70%</option><option>Below 60%</option><option>Below 80%</option></FS></FG>
          <FG label="Competition deadline alerts"><FS><option>7 days + 3 days + day before</option><option>3 days + day before</option></FS></FG>
          <Btn variant="pr" onClick={() => toast('Preferences saved ✓', 'success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );

  /* ═══════════════════════════
     RENDER
  ═══════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
      <Sidebar />
      <div style={{ marginLeft: 258, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <div style={{ padding: 20, flex: 1 }}>
          {page === 'dashboard'      && <PageDashboard />}
          {page === 'announcements'  && <PageAnnouncements />}
          {page === 'registry'       && <PageRegistry />}
          {page === 'sports'         && <PageSports />}
          {page === 'competitions'   && <PageCompetitions />}
          {page === 'cultural'       && <PageCultural />}
          {page === 'leadership'     && <PageLeadership />}
          {page === 'patrons'        && <PagePatrons />}
          {page === 'attendance'     && <PageAttendance />}
          {page === 'timetable'      && <PageTimetable />}
          {page === 'communications' && <PageCommunications />}
          {page === 'portals'        && <PagePortals />}
          {page === 'settings'       && <PageSettings />}
        </div>
      </div>

      {/* ── MODALS ── */}
      <ModalWrap open={modal === 'addAct'} onClose={() => setModal(null)} title="➕ Add Activity">
        <FG label="Activity Name"><FI placeholder="e.g. Basketball, Art Club..." /></FG>
        <Grid2>
          <FG label="Category"><FS><option>Sports</option><option>Club</option><option>Arts</option><option>Faith</option><option>Leadership</option><option>Community Service</option></FS></FG>
          <FG label="Day & Time"><FI placeholder="e.g. Mon 4:00 PM" /></FG>
        </Grid2>
        <Grid2>
          <FG label="Venue"><FI placeholder="e.g. Pitch, Hall..." /></FG>
          <FG label="Max Members"><FI type="number" placeholder="e.g. 30" /></FG>
        </Grid2>
        <FG label="Teacher Patron"><FS><option>Mr. Kato Peter</option><option>Ms. Nambi Rose</option><option>Mr. Kakooza D.</option><option>Ms. Nakabugo R.</option><option>Mrs. Atim Norah</option><option>Unassigned</option></FS></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Activity added to registry ✓', 'success'); }}>Add Activity</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'addFixture'} onClose={() => setModal(null)} title="📅 Add Fixture">
        <FG label="Sport"><FS><option>Football</option><option>Netball</option><option>Athletics</option><option>Badminton</option><option>Swimming</option><option>Tennis</option></FS></FG>
        <Grid2>
          <FG label="Date"><FI type="date" /></FG>
          <FG label="Kick-off / Start"><FI type="time" value="10:00" /></FG>
        </Grid2>
        <FG label="Opponent"><FI placeholder="School name" /></FG>
        <Grid2>
          <FG label="Home / Away"><FS><option>Home</option><option>Away</option><option>Neutral</option></FS></FG>
          <FG label="Venue"><FI placeholder="e.g. Municipal Stadium" /></FG>
        </Grid2>
        <FG label="Transport Needed?"><FS><option>Yes — request bus from Bursar</option><option>No — home fixture</option></FS></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Fixture added ✓', 'success'); }}>Add Fixture</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'addComp'} onClose={() => setModal(null)} title="🏆 Register Competition">
        <FG label="Competition Name"><FI placeholder="e.g. National Drama Festival" /></FG>
        <Grid2>
          <FG label="Date"><FI type="date" /></FG>
          <FG label="Registration Deadline"><FI type="date" /></FG>
        </Grid2>
        <FG label="Activity / Team"><FS><option>Football</option><option>Netball</option><option>Debate Club</option><option>Drama Club</option><option>Choir</option><option>Athletics</option></FS></FG>
        <FG label="Venue / Location"><FI placeholder="e.g. National Theatre, Kampala" /></FG>
        <Grid2>
          <FG label="Entry Fee (UGX)"><FI type="number" placeholder="e.g. 40000" /></FG>
          <FG label="Transport Cost (UGX)"><FI type="number" placeholder="e.g. 150000" /></FG>
        </Grid2>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Competition registered ✓', 'success'); }}>Register</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'addEvent'} onClose={() => setModal(null)} title="🎭 Add Cultural / Arts Event">
        <FG label="Event Name"><FI placeholder="e.g. End-of-Term Concert" /></FG>
        <Grid2>
          <FG label="Date"><FI type="date" /></FG>
          <FG label="Venue"><FI placeholder="e.g. School Hall" /></FG>
        </Grid2>
        <FG label="Groups Performing"><FTA placeholder="List groups / acts..." /></FG>
        <FG label="Budget Required (UGX)"><FI type="number" placeholder="e.g. 200000" /></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Event added ✓', 'success'); }}>Add Event</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'squad'} onClose={() => setModal(null)} title="👥 Squad / Team List" wide>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
          <b>⚽ Football Squad — District Championship Sat 14 Mar</b>
          <div style={{ color: V.muted, marginTop: 2 }}>Coach: Mr. Kakooza · Venue: Municipal Stadium</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['#', 'Name', 'Class', 'Position', 'Permission'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: V.muted, textTransform: 'uppercase', padding: '9px 12px', background: '#f8fafc', borderBottom: `1px solid ${V.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {[['1', 'Ssemakula Brian (C)', 'S6A', 'Striker', true], ['2', 'Byarugaba Tim', 'S6B', 'Midfielder', true], ['3', 'Opio Sam', 'S5A', 'Midfielder', true], ['4', 'Kato Alex', 'S6A', 'Defender', true], ['5', 'Mugisha Brian', 'S1B', 'GK', false], ['6', 'Nakamya David', 'S4A', 'Defender', false]].map(([num, name, cls, pos, ok]) => (
                <tr key={String(name)} style={{ borderBottom: `1px solid ${V.border}` }}>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{num}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600 }}>{name}</td>
                  <td style={{ padding: '10px 12px' }}><Chip bg={V.accSoft} color={V.accDark}>{String(cls)}</Chip></td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{pos}</td>
                  <td style={{ padding: '10px 12px' }}><Chip bg={ok ? V.successSoft : V.warnSoft} color={ok ? V.success : '#b45309'}>{ok ? '✓' : 'Pending'}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          <Btn size="sm" onClick={() => toast('Squad list printed', 'info')}>🖨️ Print</Btn>
          <Btn size="sm" variant="pr" onClick={() => setModal(null)}>Close</Btn>
        </div>
      </ModalWrap>

      <ModalWrap open={modal === 'bookVenue'} onClose={() => setModal(null)} title="📅 Book a Venue">
        <FG label="Venue"><FS><option>School Hall</option><option>School Pitch</option><option>Music Room</option><option>Boardroom</option><option>Computer Lab</option><option>Lab 1 / Lab 2</option><option>Chapel</option></FS></FG>
        <Grid2>
          <FG label="Date"><FI type="date" /></FG>
          <FG label="Time"><FI type="time" /></FG>
        </Grid2>
        <FG label="Activity / Group"><FI placeholder="e.g. Drama Club rehearsal" /></FG>
        <FG label="Duration"><FS><option>1 hour</option><option>2 hours</option><option>Half day</option><option>Full day</option></FS></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Venue booked ✓', 'success'); }}>Book Venue</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'addLeader'} onClose={() => setModal(null)} title="🏛️ Add Student Leader">
        <Grid2>
          <FG label="Student Name"><FI /></FG>
          <FG label="Class"><FI /></FG>
        </Grid2>
        <FG label="Leadership Role"><FS><option>Head Boy</option><option>Head Girl</option><option>Dep. Head Boy</option><option>Dep. Head Girl</option><option>Dormitory Prefect</option><option>Sports Prefect</option><option>Guild President</option><option>Club President</option><option>Other Prefect</option></FS></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Leader added ✓', 'success'); }}>Add</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'addPatron'} onClose={() => setModal(null)} title="👩‍🏫 Assign Patron">
        <FG label="Teacher"><FS><option>Mr. Mwesige Paul</option><option>Mr. Kato Peter</option><option>Ms. Nakabugo R.</option><option>Mr. Opolot S.</option><option>Mr. Lubwama M.</option></FS></FG>
        <FG label="Activity"><FS><option>Football</option><option>Netball</option><option>Debate Club</option><option>Science Club</option><option>Computer Club</option><option>Photography Club</option><option>Geography Club</option></FS></FG>
        <FG label="Responsibilities"><FTA placeholder="What is the patron expected to do?" /></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Patron assigned and notified ✓', 'success'); }}>Assign</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'awards'} onClose={() => setModal(null)} title="🏆 Set ECA Awards — Concert">
        <div style={{ fontSize: 12, color: V.muted, marginBottom: 14 }}>Awards to be presented at End-of-Term Concert, Fri 27 Mar</div>
        <FG label="Sports Person of the Year"><FI placeholder="Student name..." /></FG>
        <FG label="Best Club / Society"><FI placeholder="Club name..." /></FG>
        <FG label="Outstanding Leadership Award"><FI placeholder="Student name..." /></FG>
        <FG label="Best Arts Performance"><FI placeholder="Student / group..." /></FG>
        <FG label="ECA Spirit Award"><FI placeholder="Student showing most commitment..." /></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Awards saved · certificates will be printed', 'success'); }}>Save Awards</Btn></div>
      </ModalWrap>

      <ModalWrap open={modal === 'circular'} onClose={() => setModal(null)} title="📢 Send Circular">
        <FG label="To"><FS><option>All Patrons</option><option>All Students</option><option>Head Teacher + Deputy HM</option><option>Bursar</option><option>Guild Council</option></FS></FG>
        <FG label="Subject"><FI placeholder="Subject..." /></FG>
        <FG label="Message"><FTA /></FG>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={() => { setModal(null); toast('Circular sent ✓', 'success'); }}>📤 Send</Btn></div>
      </ModalWrap>

      {/* ── Toasts ── */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.type === 'success' ? '#064e3b' : t.type === 'warning' ? '#78350f' : t.type === 'info' ? '#164e63' : V.primary, color: '#fff', padding: '10px 16px', borderRadius: 9, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 8px 24px rgba(0,0,0,.2)', borderLeft: `3px solid ${t.type === 'success' ? V.success : t.type === 'warning' ? V.warn : t.type === 'info' ? V.blue : V.muted}`, maxWidth: 320, animation: 'sIn .25s ease' }}>
            <span>{t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '💬'}</span>{t.msg}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes mIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes sIn { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        body { margin: 0; } * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
