import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LogOut, X, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../ui/Modal';

interface NavSection {
  label: string;
  items: { label: string; icon: string; path: string; badge?: number; badgeColor?: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',        icon: '🏠', path: '/ht/dashboard' },
      { label: 'Announcements',    icon: '📢', path: '/ht/announcements', badge: 3 },
      { label: 'School Calendar',  icon: '📅', path: '/ht/calendar' },
    ],
  },
  {
    label: 'Academic',
    items: [
      { label: 'Academic Overview', icon: '📚', path: '/ht/academic' },
      { label: 'Staff Management',  icon: '👥', path: '/ht/staff' },
      { label: 'Students',          icon: '🎓', path: '/ht/students' },
      { label: 'Results & Exams',   icon: '📊', path: '/ht/results' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Boarding & Welfare', icon: '🛏️', path: '/ht/boarding',  badge: 2, badgeColor: 'bg-amber-400 text-black' },
      { label: 'Finance',            icon: '💰', path: '/ht/finance' },
      { label: 'Security & Safety',  icon: '🔒', path: '/ht/security' },
      { label: 'Reports',            icon: '📋', path: '/ht/reports' },
    ],
  },
  {
    label: 'Portals',
    items: [
      { label: 'All Portals', icon: '🔗', path: '/ht/portals' },
      { label: 'Messages',    icon: '💬', path: '/ht/messages', badge: 5 },
    ],
  },
];

// ── Announcement Modal
function AnnouncementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="announce" title="📢 New School Announcement">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Announcement Title</label>
          <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" placeholder="e.g. End of Term Exam Schedule" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
              <option>School-Wide</option><option>Academic</option><option>Boarding</option><option>Finance</option><option>Security</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
              <option>Normal</option><option>High</option><option>Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Send To</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
            <option>All Portals (Students, Parents, Staff)</option><option>Staff Only</option><option>Students Only</option><option>Parents Only</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
          <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[100px] resize-y focus:outline-none focus:border-indigo-400" placeholder="Write your announcement here..." />
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => { onClose(); toast('Announcement broadcast to all portals ✓', 'success'); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">📢 Broadcast</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Emergency Modal
function EmergencyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="emergency" title="🚨 Emergency Alert" titleClassName="text-red-600">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 font-semibold">
          ⚠️ This will send an immediate alert to ALL staff and security portals.
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Emergency Type</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-400">
            <option>Medical Emergency</option><option>Fire</option><option>Security Breach</option><option>Missing Student</option><option>Natural Disaster</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Location</label>
          <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-400" placeholder="Where is the emergency?" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Details</label>
          <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[80px] resize-y focus:outline-none focus:border-red-400" placeholder="Describe the emergency..." />
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => { onClose(); toast('🚨 Emergency alert sent to all portals!', 'warning'); }} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">🚨 Send Emergency Alert</button>
        </div>
      </div>
    </Modal>
  );
}

export function HeadTeacherLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [announceOpen,  setAnnounceOpen]  = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [pageTitle, setPageTitle] = useState('Head Teacher Portal');
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs, setNotifs] = useState([
    { id:1, icon:'📢', title:'New School Announcement',  body:'End-of-term exam timetable published to all portals.',    time:'5 min ago',  unread:true  },
    { id:2, icon:'💰', title:'Finance Update',           body:'Bursar: UGX 4.2M collected. 38 arrears still pending.',  time:'1 hr ago',   unread:true  },
    { id:3, icon:'⚠️', title:'Welfare Alert',            body:'Counsellor flagged 2 high-risk students — see Welfare.', time:'2 hrs ago',  unread:true  },
    { id:4, icon:'🔒', title:'Exam Office Alert',        body:'3 exam papers not secured in vault — action needed.',    time:'3 hrs ago',  unread:true  },
    { id:5, icon:'📊', title:'Monthly Report Due',       body:'Submit Term 1 statistics to MoES by Friday 14 Mar.',    time:'Yesterday',  unread:false },
    { id:6, icon:'👥', title:'Staff Meeting',            body:'HOD meeting rescheduled to Monday 10 Mar at 9:00 AM.',  time:'Yesterday',  unread:false },
  ]);
  const notifRef = useRef<HTMLDivElement>(null);

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
  const markRead    = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));

  /* ── Date clock ── */
  useEffect(() => {
    const update = () => {
      setDateStr(new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  /* ── Dynamic page title ── */
  useEffect(() => {
    const allItems = [
      ...NAV_SECTIONS.flatMap(s => s.items),
      { label: 'Settings', icon: '⚙️', path: '/ht/settings' },
    ];
    const exact  = allItems.find(item => item.path === location.pathname);
    const prefix = allItems
      .filter(item => location.pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0];
    const active = exact ?? prefix;
    const cleanLabel = active
      ? active.label.replace(/^[\p{Emoji}\s]+/u, '').trim()
      : 'Head Teacher Portal';
    setPageTitle(cleanLabel);
    document.title = `${cleanLabel} — Head Teacher Portal | SMISSI`;
  }, [location.pathname]);

  const initials = user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'HT';

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebar = (
    <div className="flex flex-col h-full bg-[#1a1f3a]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3 bg-indigo-600/30 border border-indigo-500/40 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-base">🏫</div>
          <div>
            <div className="text-white font-bold text-[13px] uppercase tracking-wide">SMISSI</div>
            <div className="text-white/45 text-[10px]">School Management System</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[13px] font-semibold truncate">{user?.name ?? 'Mr. Ssemanda Julius'}</div>
          <div className="text-white/45 text-[11px]">Head Teacher</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 ring-2 ring-emerald-400/30" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            <div className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all mb-0.5 relative',
                  isActive
                    ? 'bg-indigo-600/35 text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-indigo-400 before:rounded-r'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                )}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={cn('text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1.5 rounded-full', item.badgeColor ?? 'bg-red-500 text-white')}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 border-t border-white/8 pt-3 space-y-1">
        <NavLink
          to="/ht/settings"
          className={({ isActive }) => cn('flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all', isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white')}
        >
          <span>⚙️</span> Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium w-full bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/45" onClick={() => setMobileOpen(false)} />}

      {/* Mobile sidebar */}
      <aside className={cn('md:hidden fixed left-0 top-0 h-full w-[260px] z-40 transition-transform duration-200', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] z-30">
        {sidebar}
      </aside>

      {/* Main area */}
      <div className="md:ml-[260px] flex flex-col min-h-screen bg-[#f8f9fc]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <div className="flex-1">
            <div className="text-[15px] font-bold text-gray-900" id="topbarTitle">{pageTitle}</div>
            <div className="text-[12px] text-gray-400 mt-0.5">
              Head Teacher · {user?.name ?? 'Mr. Ssemanda'} · Term 1, Week 8
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-indigo-50 text-indigo-600 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-indigo-200">{dateStr}</span>
            <button onClick={() => setAnnounceOpen(true)} className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-base hover:bg-gray-50 transition-colors" title="New Announcement">📢</button>

            {/* ── Notification dropdown ── */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className={`relative w-9 h-9 rounded-lg border flex items-center justify-center text-base transition-all ${notifOpen ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 44, right: 0, width: 360,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
                  zIndex: 200, overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px 10px', borderBottom:'1px solid #f1f5f9' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span style={{ marginLeft:6, background:'#ef4444', color:'#fff', fontSize:10, fontWeight:800, padding:'1px 6px', borderRadius:20 }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize:11, color:'#6366f1', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification rows */}
                  <div style={{ maxHeight:360, overflowY:'auto' }}>
                    {notifs.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          display:'flex', gap:10, padding:'11px 14px',
                          borderBottom:'1px solid #f8fafc', cursor:'pointer',
                          background: n.unread ? 'rgba(99,102,241,.05)' : '#fff',
                          transition:'background .15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='#f8fafc'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.unread ? 'rgba(99,102,241,.05)' : '#fff'}
                      >
                        <div style={{ width:34, height:34, borderRadius:8, flexShrink:0, background: n.unread ? 'rgba(99,102,241,.12)' : '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{n.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:4 }}>
                            <span style={{ fontSize:12, fontWeight: n.unread ? 700 : 600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.title}</span>
                            {n.unread && <span style={{ width:7, height:7, borderRadius:'50%', background:'#6366f1', flexShrink:0 }} />}
                          </div>
                          <div style={{ fontSize:11, color:'#64748b', marginTop:2, lineHeight:1.4 }}>{n.body}</div>
                          <div style={{ fontSize:10, color:'#94a3b8', marginTop:3 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ padding:'8px 14px', borderTop:'1px solid #f1f5f9', textAlign:'center' }}>
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/ht/messages'); }}
                      style={{ fontSize:11, color:'#6366f1', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
                    >
                      View all in Messages →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setEmergencyOpen(true)} className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center text-base hover:bg-red-100 transition-colors" title="Emergency Alert">🚨</button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <AnnouncementModal open={announceOpen} onClose={() => setAnnounceOpen(false)} />
      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </>
  );
}
