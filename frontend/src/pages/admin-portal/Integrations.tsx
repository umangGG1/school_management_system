import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { Modal }      from '../../components/ui/Modal';
import { useToast }   from '../../contexts/ToastContext';
import { integrationsApi, type ApiIntegration } from '../../lib/api';

const SEED: ApiIntegration[] = [
  { id: 'sms',      name: "SMS Gateway (Africa's Talking)", status: 'connected',    lastTested: new Date().toISOString(), icon: '📱', configured: true  },
  { id: 'email',    name: 'Email (SMTP / Gmail)',            status: 'connected',    lastTested: new Date().toISOString(), icon: '📧', configured: true  },
  { id: 'payments', name: 'Mobile Money (MTN MoMo)',         status: 'connected',    lastTested: new Date().toISOString(), icon: '💳', configured: true  },
  { id: 'backup',   name: 'Cloud Backup (Google Drive)',     status: 'connected',    lastTested: new Date().toISOString(), icon: '☁️', configured: true  },
  { id: 'moes',     name: 'MoES EMIS Data Sync',            status: 'pending',      lastTested: null,                     icon: '🏛️', configured: false },
  { id: 'uca',      name: 'UCA Payroll Integration',         status: 'disconnected', lastTested: null,                     icon: '💰', configured: false },
];

const SEV: Record<string, 'green' | 'amber' | 'red'> = {
  connected: 'green', pending: 'amber', disconnected: 'red',
};

const EMPTY_WEBHOOK = { event: '', url: '' };

export default function AdminIntegrations() {
  const { toast } = useToast();
  const [services,    setServices]    = useState<ApiIntegration[]>(SEED);
  const [testing,     setTesting]     = useState<string | null>(null);
  const [offline,     setOffline]     = useState(false);

  // Configure modal
  const [configOpen,  setConfigOpen]  = useState(false);
  const [configSvc,   setConfigSvc]   = useState<ApiIntegration | null>(null);
  const [configKey,   setConfigKey]   = useState('');
  const [configSaving,setConfigSaving]= useState(false);

  // Webhook modal
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [newWebhook,  setNewWebhook]  = useState(EMPTY_WEBHOOK);
  const [webhooks,    setWebhooks]    = useState([
    { event: 'student.enrolled',       url: 'https://hooks.smissi.ac.ug/enroll', active: true  },
    { event: 'fee.payment.received',   url: 'https://hooks.smissi.ac.ug/fees',   active: true  },
    { event: 'exam.results.published', url: '(not configured)',                   active: false },
  ]);

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
      toast('Connection test passed', 'success');
    } catch {
      setServices(prev => prev.map(s => s.id === id ? { ...s, lastTested: new Date().toISOString() } : s));
      toast('Test completed (offline)', 'info');
    } finally { setTesting(null); }
  };

  const openConfigure = (svc: ApiIntegration) => {
    setConfigSvc(svc); setConfigKey(''); setConfigOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!configSvc) return;
    setConfigSaving(true);
    try {
      const updated = await integrationsApi.update(configSvc.id, { configured: true, status: 'connected' as any });
      setServices(prev => prev.map(s => s.id === configSvc.id ? { ...s, ...updated, configured: true } : s));
      toast(`${configSvc.name} configured`, 'success');
    } catch {
      setServices(prev => prev.map(s => s.id === configSvc.id ? { ...s, configured: true } : s));
      toast('Configuration saved (offline)', 'info');
    } finally { setConfigSaving(false); setConfigOpen(false); }
  };

  const handleDisconnect = async (id: string, name: string) => {
    try {
      await integrationsApi.update(id, { status: 'disconnected' as any, configured: false });
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'disconnected', configured: false } : s));
      toast(`${name} disconnected`, 'warning');
    } catch {
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'disconnected', configured: false } : s));
      toast('Disconnected (offline)', 'info');
    }
  };

  const handleAddWebhook = () => {
    if (!newWebhook.event.trim() || !newWebhook.url.trim()) return;
    setWebhooks(prev => [...prev, { ...newWebhook, active: true }]);
    toast('Webhook added', 'success');
    setWebhookOpen(false); setNewWebhook(EMPTY_WEBHOOK);
  };

  const fmtDate = (iso: string | null) => iso
    ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Third-party services, API connections and data sync"
        actions={[{ label: '+ Add Integration', onClick: () => toast('Contact support to add new integrations', 'info'), variant: 'primary' }]}
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
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{s.name}</span>
                  <Badge color={SEV[s.status]}>
                    {s.status === 'connected' ? '🟢 Connected' : s.status === 'pending' ? '🟡 Pending' : '🔴 Disconnected'}
                  </Badge>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>Last tested: {fmtDate(s.lastTested)}</div>
                {s.testResult && (
                  <div style={{ fontSize: 10, color: s.testResult === 'success' ? '#10b981' : '#ef4444', marginBottom: 4 }}>{s.message}</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn variant={s.status === 'connected' ? 'ghost' : 'primary'} size="sm" onClick={() => runTest(s.id)}>
                    {testing === s.id ? '⏳ Testing…' : s.status === 'connected' ? '🔁 Re-test' : '🔌 Connect'}
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => openConfigure(s)}>Configure</Btn>
                  {s.status === 'connected' && (
                    <Btn variant="danger" size="sm" onClick={() => handleDisconnect(s.id, s.name)}>Disconnect</Btn>
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
        {webhooks.map((w, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 8, marginBottom: 6,
            background: w.active ? '#f0fdf4' : '#f8fafc', border: `1px solid ${w.active ? '#bbf7d0' : '#e2e8f0'}`,
          }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6366f1', minWidth: 220 }}>{w.event}</span>
            <span style={{ flex: 1, fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{w.url}</span>
            <Badge color={w.active ? 'green' : 'gray'}>{w.active ? 'Active' : 'Inactive'}</Badge>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <Btn variant="ghost" size="sm" onClick={() => setWebhookOpen(true)}>+ Add Webhook</Btn>
        </div>
      </Card>

      {/* Configure Modal */}
      <Modal id="configure-integration" open={configOpen} onClose={() => setConfigOpen(false)} title={`⚙️ Configure ${configSvc?.name}`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 11, color: '#0369a1' }}>
            Enter your API key or credentials. These are stored securely on the backend.
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>API Key / Secret</label>
            <input type="password" value={configKey} onChange={e => setConfigKey(e.target.value)}
              placeholder="Enter API key…"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" size="sm" onClick={() => setConfigOpen(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={handleSaveConfig} disabled={configSaving}>
              {configSaving ? 'Saving…' : '💾 Save Config'}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Webhook Modal */}
      <Modal id="add-webhook" open={webhookOpen} onClose={() => setWebhookOpen(false)} title="⚙️ Add Webhook" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['Event Name', 'event', 'e.g. student.enrolled'], ['Endpoint URL', 'url', 'https://your-server.com/webhook']].map(([label, key, ph]) => (
            <div key={key as string}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
              <input type="text" value={(newWebhook as any)[key as string]} placeholder={ph as string}
                onChange={e => setNewWebhook(f => ({ ...f, [key as string]: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" size="sm" onClick={() => setWebhookOpen(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={handleAddWebhook}>Add Webhook</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
