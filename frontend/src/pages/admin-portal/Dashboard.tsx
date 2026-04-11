import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard }   from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { PageHeader } from '../../components/ui/PageHeader';
import { adminStatsApi, activityApi, type ApiAdminStats, type ApiActivity } from '../../lib/api';

/* ─── Fallback seed data (shown when backend is offline) ─────────── */
const SEED_STATS: ApiAdminStats = {
  totalUsers: 47, activeUsers: 45, inactiveUsers: 2,
  totalStudents: 1204, pendingApprovals: 2,
  feeCollectedThisTerm: null, systemUptime: '99.9%', openSupportTickets: 1,
};

const SEED_ACTIVITY: ApiActivity[] = [
  { id:'1', type:'USER_LOGIN',      description:'Logged in',                       userName:'Ms. Nakakande Mary',     userRole:'Teacher',      ipAddress:'196.96.12.4', severity:'info',    entityType:'', entityId:'', createdAt: new Date(Date.now()-2*60000).toISOString() },
  { id:'2', type:'FEE_PAYMENT',     description:'Updated fee UGX 450,000',         userName:'Mr. Kato Emmanuel',      userRole:'Bursar',       ipAddress:'196.96.12.9', severity:'info',    entityType:'', entityId:'', createdAt: new Date(Date.now()-18*60000).toISOString() },
  { id:'3', type:'USER_LOGIN_FAILED',description:'Failed login (5 attempts) — blocked',userName:'Unknown',           userRole:'—',            ipAddress:'41.220.13.8', severity:'danger',  entityType:'', entityId:'', createdAt: new Date(Date.now()-60*60000).toISOString() },
  { id:'4', type:'APPROVAL_MADE',   description:'Approved staff leave request',    userName:'Mr. Ssemanda Julius',    userRole:'Head Teacher', ipAddress:'196.96.11.2', severity:'success', entityType:'', entityId:'', createdAt: new Date(Date.now()-90*60000).toISOString() },
  { id:'5', type:'OTHER',           description:'Added patient record #MRN-2246',  userName:'Sr. Nakamya Rose',       userRole:'Nurse',        ipAddress:'196.96.12.7', severity:'info',    entityType:'', entityId:'', createdAt: new Date(Date.now()-2.5*3600000).toISOString() },
  { id:'6', type:'OTHER',           description:'Created sport fixture: Rugby U17', userName:'Mr. Ssali Brian',       userRole:'ECA Officer',  ipAddress:'196.96.12.5', severity:'info',    entityType:'', entityId:'', createdAt: new Date(Date.now()-3*3600000).toISOString() },
];

const SYSTEM_HEALTH = [
  { label: 'Web Server',     status: 'Online',  color: '#10b981' },
  { label: 'Database',       status: 'Online',  color: '#10b981' },
  { label: 'Email Service',  status: 'Online',  color: '#10b981' },
  { label: 'SMS Gateway',    status: 'Online',  color: '#10b981' },
  { label: 'File Storage',   status: 'Online',  color: '#10b981' },
  { label: 'Backup Service', status: 'Running', color: '#f59e0b' },
];

const PORTAL_SUMMARY = [
  { label: 'Head Teacher',  users: 1,  lastLogin: '5 min ago',  path: '/ht/dashboard'          },
  { label: 'Teacher',       users: 24, lastLogin: '2 min ago',  path: '/teacher/dashboard'     },
  { label: 'Bursar',        users: 2,  lastLogin: '18 min ago', path: '/bursar/dashboard'      },
  { label: 'Exam Officer',  users: 1,  lastLogin: '3 hrs ago',  path: '/exam-officer/dashboard'},
  { label: 'ECA Officer',   users: 2,  lastLogin: '2 hrs ago',  path: '/eca/dashboard'         },
  { label: 'Counsellor',    users: 1,  lastLogin: '3 hrs ago',  path: '/counsellor/dashboard'  },
  { label: 'Nurse',         users: 2,  lastLogin: '45 min ago', path: '/nurse/dashboard'       },
  { label: 'Dorm Master',   users: 3,  lastLogin: '1 hr ago',   path: '/dorm-master/dashboard' },
  { label: 'Security',      users: 4,  lastLogin: '30 min ago', path: '/security/dashboard'    },
  { label: 'Students',      users: '1,204', lastLogin: '1 min ago', path: '/student/dashboard' },
  { label: 'Parents',       users: '892',   lastLogin: '4 min ago', path: '/parent/dashboard'  },
];

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)   return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)} min ago`;
  if (secs < 86400)return `${Math.floor(secs / 3600)} hr${Math.floor(secs/3600)>1?'s':''} ago`;
  return `${Math.floor(secs / 86400)} day${Math.floor(secs/86400)>1?'s':''} ago`;
}

const SEV: Record<string, string> = { info: '✓', success: '✓ OK', danger: '⚠️ Alert', warn: '⚠️' };
const SEV_VARIANT: Record<string, any> = { info: 'blue', success: 'success', danger: 'red', warn: 'amber' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab,  setTab]  = useState<'activity' | 'portals' | 'health'>('activity');
  const [stats,    setStats]    = useState<ApiAdminStats>(SEED_STATS);
  const [activity, setActivity] = useState<ApiActivity[]>(SEED_ACTIVITY);
  const [offline,  setOffline]  = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [s, a] = await Promise.all([
          adminStatsApi.getStats(),
          activityApi.list({ limit: 6 }),
        ]);
        if (!live) return;
        setStats(s);
        setActivity(a.data);
        setOffline(false);
      } catch {
        setOffline(true);
      }
    })();
    return () => { live = false; };
  }, []);

  const STATS = [
    { title: 'Total Users',       value: stats.totalUsers,    icon: '👥', accent: 'indigo' as const, trend: `${stats.activeUsers} active`,   trendType: 'up'   as const },
    { title: 'Active Students',   value: stats.totalStudents, icon: '🎓', accent: 'blue'   as const, trend: 'Enrolled this term',             trendType: 'up'   as const },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: '⏳', accent: 'amber' as const, trend: stats.pendingApprovals > 0 ? 'Action needed' : 'All clear', trendType: stats.pendingApprovals > 0 ? 'down' as const : 'up' as const },
    { title: 'Support Tickets',   value: stats.openSupportTickets, icon: '🎫', accent: 'red' as const, trend: stats.openSupportTickets > 0 ? 'Open' : 'None', trendType: stats.openSupportTickets > 0 ? 'down' as const : 'up' as const },
    { title: 'Fee Collection',    value: stats.feeCollectedThisTerm ? `UGX ${(stats.feeCollectedThisTerm/1e6).toFixed(1)}M` : 'N/A', icon: '💰', accent: 'green' as const, trend: 'This term', trendType: 'up' as const },
    { title: 'System Uptime',     value: stats.systemUptime,  icon: '🟢', accent: 'teal'  as const, trend: '30-day avg',                     trendType: 'up'   as const },
  ];

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        subtitle="SMISSI · Super Admin · Full system overview"
        actions={[
          { label: '📋 Activity Log', onClick: () => navigate('/admin/activity'), variant: 'secondary' },
          { label: '👤 Manage Users', onClick: () => navigate('/admin/users'),    variant: 'primary'   },
        ]}
      />

      {/* Offline banner */}
      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 16, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data. Start the backend to see live stats.
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {STATS.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>

        {/* Left: tabbed panel */}
        <Card>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f8fafc', borderRadius: 8, padding: 4, width: 'fit-content' }}>
            {(['activity', 'portals', 'health'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 16px', borderRadius: 6, border: 'none', fontFamily: 'inherit',
                background: tab === t ? '#6366f1' : 'transparent',
                color: tab === t ? '#fff' : '#64748b',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                textTransform: 'capitalize',
              }}>{t}</button>
            ))}
          </div>

          {/* Activity log */}
          {tab === 'activity' && (
            <div>
              {activity.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#6366f1' }}>
                    {(a.userName || '?').charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{a.userName || 'System'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{a.description} · <span style={{ color: '#94a3b8' }}>{a.userRole}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge variant={SEV_VARIANT[a.severity]} size="sm">{SEV[a.severity] ?? a.severity}</Badge>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Btn variant="ghost" size="sm" onClick={() => navigate('/admin/activity')}>View full log →</Btn>
              </div>
            </div>
          )}

          {/* Portal summary */}
          {tab === 'portals' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {PORTAL_SUMMARY.map(p => (
                <div key={p.label} onClick={() => navigate(p.path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all .15s', background: '#fff' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{p.users} users · Last: {p.lastLogin}</div>
                  </div>
                  <span style={{ color: '#6366f1', fontSize: 14 }}>↗</span>
                </div>
              ))}
            </div>
          )}

          {/* System health */}
          {tab === 'health' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {SYSTEM_HEALTH.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, boxShadow: `0 0 0 3px ${s.color}30`, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.status}</div>
                  </div>
                </div>
              ))}
              <div style={{ gridColumn: '1/-1', padding: '10px 0', textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Last checked: just now · </span>
                <Btn variant="ghost" size="sm" onClick={() => navigate('/admin/integrations')}>View integrations →</Btn>
              </div>
            </div>
          )}
        </Card>

        {/* Right: quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader title="⚡ Quick Actions" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '➕ Add New User',          path: '/admin/users'     },
                { label: `📋 Approve Pending (${stats.pendingApprovals})`, path: '/admin/approvals' },
                { label: '🏫 Edit School Profile',    path: '/admin/school'    },
                { label: '💰 Update Fee Structure',   path: '/admin/fees'      },
                { label: '📊 Generate Report',        path: '/admin/reports'   },
                { label: '🎫 View Support Ticket',    path: '/admin/support'   },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)} style={{ width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#eef2ff'; el.style.borderColor = '#6366f1'; el.style.color = '#4338ca'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#f8fafc'; el.style.borderColor = '#e2e8f0'; el.style.color = '#334155'; }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="📅 Upcoming" />
            {[
              { event: 'Term 1 Fee Deadline',      date: 'Mar 14', color: '#ef4444' },
              { event: 'MoES Data Submission',     date: 'Mar 21', color: '#f59e0b' },
              { event: 'Staff Performance Review', date: 'Mar 28', color: '#6366f1' },
              { event: 'Term 1 End',               date: 'Apr 04', color: '#10b981' },
            ].map(e => (
              <div key={e.event} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 11, color: '#1e293b', fontWeight: 600 }}>{e.event}</div>
                <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>{e.date}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
