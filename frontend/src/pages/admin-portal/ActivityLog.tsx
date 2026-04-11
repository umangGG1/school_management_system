import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const LOG = [
  { time:'2026-03-07 10:23', user:'Ms. Nakakande Mary',  role:'Teacher',       action:'Logged in',                    ip:'196.96.12.4',  severity:'info'    },
  { time:'2026-03-07 10:05', user:'Mr. Kato Emmanuel',   role:'Bursar',        action:'Updated fee UGX 450,000 — S.4S Nakato Sarah', ip:'196.96.12.9', severity:'info' },
  { time:'2026-03-07 09:50', user:'Unknown',             role:'—',             action:'Failed login (5 attempts) — blocked', ip:'41.220.13.8', severity:'danger' },
  { time:'2026-03-07 09:42', user:'Mr. Ssemanda Julius', role:'Head Teacher',  action:'Approved staff leave request',  ip:'196.96.11.2',  severity:'success' },
  { time:'2026-03-07 09:30', user:'Sr. Nakamya Rose',    role:'Nurse',         action:'Added patient record #MRN-2246',ip:'196.96.12.7',  severity:'info'    },
  { time:'2026-03-07 09:15', user:'Mr. Ssali Brian',     role:'ECA Officer',   action:'Created sport fixture: Rugby U17',ip:'196.96.12.5', severity:'info'   },
  { time:'2026-03-07 08:55', user:'System',              role:'Auto',          action:'Nightly backup completed — 2.3 GB',ip:'127.0.0.1',  severity:'success' },
  { time:'2026-03-07 08:45', user:'System',              role:'Auto',          action:'Session cleanup — 14 expired tokens removed',ip:'127.0.0.1',severity:'info'},
  { time:'2026-03-06 18:30', user:'Mrs. Namukasa Joyce', role:'Counsellor',    action:'Filed welfare report #WEL-081',  ip:'196.96.12.3',  severity:'info'   },
  { time:'2026-03-06 17:45', user:'Mr. Byamugisha Kenneth',role:'Exam Officer',action:'Locked exam vault — Term 1 papers',ip:'196.96.12.6',severity:'success'}
];

const SEV_COLOR: Record<string,string> = { info:'blue', success:'success', danger:'red', warn:'amber' };

export default function AdminActivity() {
  return (
    <div>
      <PageHeader
        title="Activity Log"
        subtitle="Full audit trail — all user actions and system events"
        actions={[
          { label: '📤 Export Log',  onClick: () => {}, variant: 'secondary' },
          { label: '🗑️ Clear Old',   onClick: () => {}, variant: 'danger'    },
        ]}
      />

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Events Today', value: '48',  color: '#6366f1' },
          { label: 'Failed Logins',      value: '3',   color: '#ef4444' },
          { label: 'Data Changes',       value: '12',  color: '#f59e0b' },
          { label: 'System Events',      value: '6',   color: '#10b981' },
        ].map(c => (
          <div key={c.label} style={{
            padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', minWidth: 140,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="🕐 Recent Events" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Time','User','Role','Action','IP Address','Level'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOG.map((l, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid #f8fafc',
                  background: l.severity === 'danger' ? '#fff5f5' : '',
                }}>
                  <td style={{ padding: '9px 10px', color: '#64748b', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 11 }}>{l.time}</td>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: '#1e293b' }}>{l.user}</td>
                  <td style={{ padding: '9px 10px', color: '#94a3b8' }}>{l.role}</td>
                  <td style={{ padding: '9px 10px', color: '#475569', maxWidth: 320 }}>{l.action}</td>
                  <td style={{ padding: '9px 10px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{l.ip}</td>
                  <td style={{ padding: '9px 10px' }}>
                    <Badge variant={SEV_COLOR[l.severity] as any} size="sm">
                      {l.severity === 'danger' ? '⚠️ Alert' : l.severity === 'success' ? '✓ OK' : 'ℹ️ Info'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Showing 10 of 234 events today</span>
          <Btn variant="ghost" size="sm" onClick={() => {}}>Load more →</Btn>
        </div>
      </Card>
    </div>
  );
}
