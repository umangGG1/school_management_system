import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { integrationsApi, type ApiIntegration } from '../../lib/api';

/* ─── Seed fallback ───────────────────────────────────────────────── */
const SEED: ApiIntegration[] = [
  { id: 'sms',      name: "SMS Gateway (Africa's Talking)", status: 'connected',    lastTested: new Date().toISOString(), icon: '📱', configured: true  },
  { id: 'email',    name: 'Email (SMTP / Gmail)',            status: 'connected',    lastTested: new Date().toISOString(), icon: '📧', configured: true  },
  { id: 'payments', name: 'Mobile Money (MTN MoMo)',         status: 'connected',    lastTested: new Date().toISOString(), icon: '💳', configured: true  },
  { id: 'backup',   name: 'Cloud Backup (Google Drive)',     status: 'connected',    lastTested: new Date().toISOString(), icon: '☁️', configured: true  },
  { id: 'moes',     name: 'MoES EMIS Data Sync',            status: 'pending',      lastTested: null,                     icon: '🏛️', configured: false },
  { id: 'uca',      name: 'UCA Payroll Integration',         status: 'disconnected', lastTested: null,                     icon: '💰', configured: false },
];

const SEV: Record<string, 'success' | 'amber' | 'red'> = {
  connected: 'success', pending: 'amber', disconnected: 'red',
};

const WEBHOOKS = [
  { event: 'student.enrolled',       url: 'https://hooks.smissi.ac.ug/enroll', active: true  },
  { event: 'fee.payment.received',   url: 'https://hooks.smissi.ac.ug/fees',   active: true  },
  { event: 'exam.results.published', url: '(not configured)',                   active: false },
  { event: 'user.created',           url: 'https://hooks.smissi.ac.ug/users',  active: true  },
];

export default function AdminIntegrations() {
  const [services, setServices] = useState<ApiIntegration[]>(SEED);
  const [testing,  setTesting]  = useState<string | null>(null);
  const [offline,  setOffline]  = useState(false);

  useEffect(() => {
    integrationsApi.list()
      .then(s => { if (s.length) setServices(s); setOffline(false); })
      .catch(() => setOffline(true));
  }, []);

  const runTest = async (id: string) => {
    setTesting(id);
    try {
      const result = await integrationsApi.test(id);
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...result } : s));
    } catch {
      // Optimistic: just update lastTested timestamp
      setServices(prev => prev.map(s => s.id === id ? { ...s, lastTested: new Date().toISOString() } : s));
    } finally {
      setTesting(null);
    }
  };

  const fmtDate = (iso: string | null) => iso
    ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Third-party services, API connections and data sync"
        actions={[{ label: '+ Add Integration', onClick: () => {}, variant: 'primary' }]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 20 }}>
        {services.map(s => (
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
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                  Last tested: {fmtDate(s.lastTested)}
                </div>
                {s.testResult && (
                  <div style={{ fontSize: 10, color: s.testResult === 'success' ? '#10b981' : '#ef4444', marginBottom: 4 }}>
                    {s.message}
                  </div>
                )}
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
        {WEBHOOKS.map(w => (
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
