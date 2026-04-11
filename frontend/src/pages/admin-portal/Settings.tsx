import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { FormField }  from '../../components/ui/FormField';

const SECTIONS = ['General', 'Security', 'Appearance', 'Notifications', 'Backup'];

const GENERAL = {
  siteName: 'SMISSI School Management Portal',
  timezone: 'Africa/Kampala (UTC+3)',
  dateFormat: 'DD/MM/YYYY',
  currency: 'UGX — Ugandan Shilling',
  language: 'English (EN-UG)',
  maxFileUpload: '10 MB',
};

const SECURITY = [
  { label: 'Two-Factor Authentication',  value: 'Enabled (Admin only)',    toggle: true  },
  { label: 'Session Timeout',             value: '30 minutes',             toggle: false },
  { label: 'Password Minimum Length',     value: '8 characters',           toggle: false },
  { label: 'Force Password Reset',        value: 'Every 90 days',          toggle: false },
  { label: 'IP Allowlist',                value: 'Disabled',               toggle: true  },
  { label: 'Failed Login Lockout',        value: 'After 5 attempts (1 hr)',toggle: false },
];

const NOTIF = [
  { label: 'Email — New User Created',   on: true  },
  { label: 'Email — Failed Login (≥3x)', on: true  },
  { label: 'Email — Daily Backup',       on: true  },
  { label: 'SMS — Fee Payment Alert',    on: false },
  { label: 'SMS — Emergency Broadcast',  on: true  },
  { label: 'Push — Support Ticket',      on: true  },
];

export default function AdminSettings() {
  const [active, setActive] = useState('General');
  const [general, setGeneral] = useState(GENERAL);
  const [notif, setNotif] = useState(NOTIF);
  const set = (k: keyof typeof GENERAL) => (v: string) => setGeneral(d => ({ ...d, [k]: v }));

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Global configuration for the SMISSI portal" />

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18 }}>
        {/* Sidebar nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActive(s)} style={{
              padding: '9px 14px', borderRadius: 8, border: 'none', textAlign: 'left',
              background: active === s ? '#6366f1' : 'transparent',
              color: active === s ? '#fff' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{s}</button>
          ))}
        </div>

        {/* Content */}
        <div>

          {/* General */}
          {active === 'General' && (
            <Card>
              <CardHeader title="⚙️ General Settings" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FormField label="Portal Name"    value={general.siteName}    onChange={set('siteName')}    />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="Timezone"     value={general.timezone}    onChange={set('timezone')}    />
                  <FormField label="Date Format"  value={general.dateFormat}  onChange={set('dateFormat')}  />
                  <FormField label="Currency"     value={general.currency}    onChange={set('currency')}    />
                  <FormField label="Language"     value={general.language}    onChange={set('language')}    />
                </div>
                <FormField label="Max File Upload" value={general.maxFileUpload} onChange={set('maxFileUpload')} />
                <Btn variant="primary" onClick={() => {}}>💾 Save Settings</Btn>
              </div>
            </Card>
          )}

          {/* Security */}
          {active === 'Security' && (
            <Card>
              <CardHeader title="🔒 Security Settings" />
              {SECURITY.map(s => (
                <div key={s.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #f1f5f9',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.value}</div>
                  </div>
                  <Btn variant="ghost" size="sm" onClick={() => {}}>Edit</Btn>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <Btn variant="danger" size="sm" onClick={() => {}}>🗑️ Clear All Sessions</Btn>
              </div>
            </Card>
          )}

          {/* Appearance */}
          {active === 'Appearance' && (
            <Card>
              <CardHeader title="🎨 Appearance" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Accent Color</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['#6366f1','#0f766e','#2563eb','#7c3aed','#16a34a','#dc2626','#f59e0b'].map(c => (
                      <div key={c} style={{ width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer', border: c === '#6366f1' ? '3px solid #1e293b' : '3px solid transparent' }} />
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>School Logo</div>
                  <div style={{
                    border: '2px dashed #e2e8f0', borderRadius: 10, padding: '24px',
                    textAlign: 'center', color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                  }}>
                    🏫 Click to upload logo (PNG, max 2MB)
                  </div>
                </div>
                <Btn variant="primary" onClick={() => {}}>💾 Save Appearance</Btn>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {active === 'Notifications' && (
            <Card>
              <CardHeader title="🔔 Notification Preferences" />
              {notif.map((n, i) => (
                <div key={n.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #f1f5f9',
                }}>
                  <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 600 }}>{n.label}</span>
                  <button onClick={() => setNotif(prev => prev.map((x, j) => j === i ? { ...x, on: !x.on } : x))} style={{
                    width: 40, height: 22, borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: n.on ? '#6366f1' : '#e2e8f0', position: 'relative', transition: 'background .2s',
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3, left: n.on ? 21 : 3, transition: 'left .2s',
                    }} />
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <Btn variant="primary" onClick={() => {}}>💾 Save Preferences</Btn>
              </div>
            </Card>
          )}

          {/* Backup */}
          {active === 'Backup' && (
            <Card>
              <CardHeader title="☁️ Backup & Recovery" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Last Full Backup',   value: 'Mar 06, 2026 at 23:00 · 2.3 GB', color: '#10b981' },
                  { label: 'Backup Frequency',   value: 'Daily at 11 PM (Africa/Kampala)', color: '#6366f1' },
                  { label: 'Retention Period',   value: '30 days',                          color: '#6366f1' },
                  { label: 'Storage Used',       value: '47.3 GB / 100 GB',                 color: '#f59e0b' },
                  { label: 'Backup Destination', value: 'Google Drive — smissi-backup@…',   color: '#6366f1' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <Btn variant="primary"   onClick={() => {}}>⚡ Run Backup Now</Btn>
                  <Btn variant="secondary" onClick={() => {}}>📥 Download Backup</Btn>
                  <Btn variant="danger"    onClick={() => {}}>🔄 Restore</Btn>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
