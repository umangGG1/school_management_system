import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

/* ── Types ────────────────────────────────────────────────── */
export interface NavItem {
  label      : string;
  icon       : string;
  path       : string;
  badge?     : number;
  badgeColor?: 'red' | 'amber' | 'green' | 'blue';
}
export interface NavSection {
  label : string;
  items : NavItem[];
}

export interface PortalConfig {
  /** Short name shown in sidebar logomark */
  portalName   : string;
  /** Role label shown underneath the user's name */
  roleLabel    : string;
  /** Emoji icon for the sidebar badge */
  portalIcon   : string;
  /** Hex colour for the sidebar badge background tint */
  accentColor  : string;
  /** Lighter tint of accentColor for the badge border */
  accentLight  : string;
  /** Dark tint used for text contrasts */
  accentDark?  : string;
  /** Sidebar navigation sections */
  navSections  : NavSection[];
  /** Path to the settings page (for bottom nav link) */
  settingsPath : string;
  /** Topbar sub-info string (e.g. "Term 1, Week 8 · Sat 07 Mar") */
  topbarSub    : string;
  /** Extra chips to show in topbar — [label, bg, color] */
  topbarChips? : [string, string, string][];
}

/* ── Badge colour map ─────────────────────────────────────── */
const badgeBg: Record<string, string> = {
  red   : '#ef4444',
  amber : '#f59e0b',
  green : '#16a34a',
  blue  : '#3b82f6',
};
const badgeFg: Record<string, string> = {
  red   : '#fff',
  amber : '#000',
  green : '#fff',
  blue  : '#fff',
};

/* ════════════════════════════════════════════════════════════
   PORTAL LAYOUT
═══════════════════════════════════════════════════════════════ */
export function PortalLayout({ config }: { config: PortalConfig }) {
  const { user, logout } = useAuth();
  const { toast }        = useToast();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dateStr,     setDateStr]     = useState('');
  const [pageLabel,   setPageLabel]   = useState(config.portalName);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs, setNotifs] = useState([
    { id:1, icon:'📢', title:'New Announcement',       body:'End-of-term exam schedule published.',          time:'2 min ago',  unread:true  },
    { id:2, icon:'⚠️', title:'Action Required',         body:'3 exam papers still not secured in vault.',    time:'45 min ago', unread:true  },
    { id:3, icon:'💰', title:'Fee Collection Update',   body:'UGX 4.2M collected today — 3 arrears pending.',time:'1 hr ago',   unread:true  },
    { id:4, icon:'📋', title:'Report Due',              body:'Term 1 ECA patron reports due Friday.',         time:'3 hrs ago',  unread:false },
    { id:5, icon:'🔔', title:'System',                  body:'Your session expires in 30 minutes.',           time:'5 hrs ago',  unread:false },
  ]);
  const notifRef = useRef<HTMLDivElement>(null);

  /* click outside → close notification panel */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const unreadCount = notifs.filter(n => n.unread).length;

  const markRead = (id: number) =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

  const markAllRead = () =>
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));

  /* ── Date clock ── */
  useEffect(() => {
    const update = () => setDateStr(
      new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    );
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);

  /* ── Dynamic document.title ── */
  useEffect(() => {
    // Flatten all nav items (including settings) into one searchable list
    const allItems = [
      ...config.navSections.flatMap(s => s.items),
      { label: 'Settings', icon: '⚙️', path: config.settingsPath },
    ];

    // Find the best matching item — prefer exact match, fall back to longest prefix
    const exactMatch  = allItems.find(item => item.path === location.pathname);
    const prefixMatch = allItems
      .filter(item => location.pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0];

    const active = exactMatch ?? prefixMatch;

    // Strip emoji from label for a clean title
    const cleanLabel = active
      ? active.label.replace(/^[\p{Emoji}\s]+/u, '').trim()
      : config.portalName;

    setPageLabel(cleanLabel);
    document.title = `${cleanLabel} — ${config.portalName} | SMISSI`;
  }, [location.pathname, config]);

  const initials = (user?.name ?? config.roleLabel)
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ── Sidebar content ── */
  const sidebar = (
    <div className="flex flex-col h-full" style={{ background: '#1e293b' }}>
      {/* Logomark */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${config.accentColor}30`,
          border: `1px solid ${config.accentColor}60`,
          borderRadius: 8, padding: '7px 10px',
        }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: config.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
            {config.portalIcon}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.9)', letterSpacing: '.07em', textTransform: 'uppercase' }}>
              SMISSI
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{config.portalName}</div>
          </div>
        </div>
      </div>

      {/* User row */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `linear-gradient(135deg, ${config.accentColor}, ${config.accentDark ?? config.accentColor})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.name ?? config.roleLabel}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.38)' }}>{config.roleLabel}</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginLeft: 'auto', boxShadow: '0 0 0 2px rgba(16,185,129,.25)' }} />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 4px' }}>
        {config.navSections.map(section => (
          <div key={section.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', letterSpacing: '.12em', padding: '0 6px', marginBottom: 3 }}>
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  'flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] font-medium transition-all mb-px relative',
                  isActive
                    ? 'text-white'
                    : 'text-white/55 hover:bg-white/7 hover:text-white'
                )}
                style={({ isActive }) => isActive
                  ? { background: `${config.accentColor}30` }
                  : {}}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: config.accentColor, borderRadius: '0 3px 3px 0' }} />
                    )}
                    <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge !== undefined && (
                      <span style={{ background: badgeBg[item.badgeColor ?? 'red'], color: badgeFg[item.badgeColor ?? 'red'], fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 20, minWidth: 16, textAlign: 'center' }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <NavLink
          to={config.settingsPath}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] font-medium transition-all mb-1.5',
            isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/7 hover:text-white'
          )}
        >
          <span>⚙️</span> Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-[12px] font-medium bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/45" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn('md:hidden fixed left-0 top-0 h-full w-[260px] z-40 transition-transform duration-200', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] z-30">
        {sidebar}
      </aside>

      {/* Main content area */}
      <div className="md:ml-[260px] flex flex-col min-h-screen" style={{ background: '#f8fafc' }}>
        {/* Topbar */}
        <header style={{
          height: 60, background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center',
          padding: '0 22px', gap: 14,
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          {/* Dynamic page title */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              {pageLabel}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              {config.roleLabel} · {config.topbarSub}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: `${config.accentColor}15`,
              color: config.accentDark ?? config.accentColor,
              fontSize: 11, fontWeight: 600, padding: '4px 10px',
              borderRadius: 20, border: `1px solid ${config.accentColor}30`,
            }}>
              {dateStr}
            </span>
            {config.topbarChips?.map(([label, bg, fg]) => (
              <span key={label} style={{ background: bg, color: fg, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                {label}
              </span>
            ))}
            {/* ── Notification Bell + Dropdown ── */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: `1px solid ${notifOpen ? config.accentColor : '#e2e8f0'}`,
                  background: notifOpen ? `${config.accentColor}10` : '#fff',
                  cursor: 'pointer', fontSize: 15, position: 'relative',
                  color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    minWidth: 16, height: 16, borderRadius: 20,
                    background: '#ef4444', border: '2px solid #fff',
                    fontSize: 9, fontWeight: 800, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px',
                  }}>{unreadCount}</span>
                )}
              </button>

              {/* Dropdown panel */}
              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 42, right: 0,
                  width: 340, background: '#fff',
                  border: '1px solid #e2e8f0', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
                  zIndex: 200, overflow: 'hidden',
                  animation: 'notifSlide .15s ease',
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px 10px', borderBottom: '1px solid #f1f5f9',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span style={{ marginLeft: 6, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 20 }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ fontSize: 11, color: config.accentColor, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {notifs.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          display: 'flex', gap: 10, padding: '11px 14px',
                          borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                          background: n.unread ? `${config.accentColor}08` : '#fff',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.unread ? `${config.accentColor}08` : '#fff'}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                          background: n.unread ? `${config.accentColor}15` : '#f1f5f9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                        }}>{n.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: n.unread ? 700 : 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                            {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: config.accentColor, flexShrink: 0 }} />}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <button
                      onClick={() => { setNotifOpen(false); navigate(config.settingsPath.replace('/settings', '/communications')); }}
                      style={{ fontSize: 11, color: config.accentColor, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      View all in Communications →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content — rendered by child routes */}
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
