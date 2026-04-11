import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const SERVICES = [
  { id:'sms',      name:'SMS Gateway (Africa\'s Talking)', status:'connected', lastTest:'Mar 07 09:00', key:'AT-LIVE-xxxxxxx', icon:'📱' },
  { id:'email',    name:'Email (SMTP / Gmail)',             status:'connected', lastTest:'Mar 07 09:00', key:'smtp.gmail.com',  icon:'📧' },
  { id:'payments', name:'Mobile Money (MTN MoMo)',          status:'connected', lastTest:'Mar 07 09:01', key:'MTN-*****1234',   icon:'💳' },
  { id:'backup',   name:'Cloud Backup (Google Drive)',      status:'connected', lastTest:'Mar 06 23:00', key:'smissi-backup@…', icon:'☁️' },
  { id:'moes',     name:'MoES EMIS Data Sync',             status:'pending',   lastTest:'Never',        key:'API key required',icon:'🏛️' },
  { id:'uca',      name:'UCA Payroll Integration',          status:'disconnected',lastTest:'Feb 15',    key:'Not configured',  icon:'💰' },
];

const SEV: Record<string,'success'|'amber'|'red'> = {
  connected: 'success', pending: 'amber', disconnected: 'red',
};

export default function AdminIntegrations() {
  const [testing, setTesting] = useState<string | null>(null);

  const runTest = (id: string) => {
    setTesting(id);
    setTimeout(() => setTesting(null), 1800);
  };

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Third-party services, API connections and data sync"
        actions={[{ label: '+ Add Integration', onClick: () => {}, variant: 'primary' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 20 }}>
        {SERVICES.map(s => (
          <Card key={s.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
              }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{s.name}</span>
                  <Badge variant={SEV[s.status]} size="sm">
                    {s.status === 'connected' ? '🟢 Connected' : s.status === 'pending' ? '🟡 Pending' : '🔴 Disconnected'}
                  </Badge>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                  API Key: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{s.key}</span>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Last tested: {s.lastTest}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn variant={s.status === 'connected' ? 'ghost' : 'primary'} size="sm" onClick={() => runTest(s.id)}>
                    {testing === s.id ? '⏳ Testing…' : s.status === 'connected' ? '🔁 Re-test' : '🔌 Connect'}
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => {}}>Configure</Btn>
                  {s.status === 'connected' && (
                    <Btn variant="danger" size="sm" onClick={() => {}}>Disconnect</Btn>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="⚙️ Webhook Events" />
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
          Events fired when key actions happen in SMISSI. Set endpoint URLs to receive live data.
        </div>
        {[
          { event: 'student.enrolled',      url: 'https://hooks.smissi.ac.ug/enroll', active: true  },
          { event: 'fee.payment.received',  url: 'https://hooks.smissi.ac.ug/fees',   active: true  },
          { event: 'exam.results.published',url: '(not configured)',                   active: false },
          { event: 'user.created',          url: 'https://hooks.smissi.ac.ug/users',  active: true  },
        ].map(w => (
          <div key={w.event} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 10px', borderRadius: 8, marginBottom: 6,
            background: w.active ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${w.active ? '#bbf7d0' : '#e2e8f0'}`,
          }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6366f1', minWidth: 220 }}>{w.event}</span>
            <span style={{ flex: 1, fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{w.url}</span>
            <Badge variant={w.active ? 'success' : 'secondary'} size="sm">{w.active ? 'Active' : 'Inactive'}</Badge>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <Btn variant="ghost" size="sm" onClick={() => {}}>+ Add Webhook</Btn>
        </div>
      </Card>
    </div>
  );
}
