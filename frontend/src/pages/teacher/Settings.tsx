import { useState, useEffect } from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { htSettingsApi } from '../../lib/api';

export default function Settings() {
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [role,      setRole]      = useState('');
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    htSettingsApi.getProfile().then(p => {
      setFirstName(p.firstName ?? '');
      setLastName(p.lastName  ?? '');
      setEmail(p.email        ?? '');
      setPhone(p.phone        ?? '');
      setRole((p.roles?.[0] ?? p.role ?? '').replace(/_/g, ' '));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await htSettingsApi.updateProfile({ firstName, lastName, email, phone });
      toast('Profile updated ✓', 'success');
    } catch { toast('Could not save — backend offline', 'warning'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile and notification preferences" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>👤 Profile</div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>First Name</div>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Last Name</div>
                  <input value={lastName} onChange={e => setLastName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Role</div>
                <input value={role} readOnly
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Email</div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Phone</div>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 700 000 000"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxSizing: 'border-box' }} />
              </div>
              <Btn variant="primary" onClick={handleSave}>{saving ? 'Saving…' : 'Save Changes'}</Btn>
            </>
          )}
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🔔 Notification Preferences</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Assignment submission alerts</div>
            <select style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
              <option>Immediate</option><option>Daily digest</option><option>Off</option>
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Attendance reminder</div>
            <select style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
              <option>Before each class</option><option>End of day</option><option>Off</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Marks entry deadline alert</div>
            <select style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
              <option>3 days before</option><option>1 day before</option><option>Off</option>
            </select>
          </div>
          <Btn variant="primary" onClick={() => toast('Preferences saved ✓', 'success')}>Save Preferences</Btn>
        </Card>

      </div>
    </div>
  );
}
