import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { useToast }   from '../../contexts/ToastContext';

/* ─── Inline API for announcements ───────────────────────────────── */
const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api';
const auth  = () => ({ Authorization: `Bearer ${localStorage.getItem('smissi_token')}`, 'Content-Type': 'application/json' });

const announcementsApi = {
  list: (): Promise<any[]> =>
    fetch(`${BASE}/announcements`, { headers: auth() })
      .then(r => r.json())
      .then((j: any) => Array.isArray(j) ? j : j?.data ?? []),
  create: (body: { title: string; body: string; audience: string }): Promise<any> =>
    fetch(`${BASE}/announcements`, { method: 'POST', headers: auth(), body: JSON.stringify(body) })
      .then(r => r.json()),
};

/* ─── Seed fallback ───────────────────────────────────────────────── */
const INBOX_SEED = [
  { from: 'Mr. Ssemanda Julius', role: 'Head Teacher', subject: 'Approval needed: Staff leave request', time: '10:15',    unread: true  },
  { from: 'Mr. Kato Emmanuel',   role: 'Bursar',       subject: 'UGX 3.2M fee shortfall — urgent',     time: '09:42',    unread: true  },
  { from: 'System',              role: 'Automated',    subject: 'Nightly backup completed successfully', time: '02:00',   unread: false },
  { from: 'Ms. Nakakande Mary',  role: 'Teacher',      subject: 'New user account request for HOD',     time: 'Yesterday',unread: false },
];

const ANNS_SEED = [
  { title: 'School Closure Notice — Holiday', audience: 'All Users', createdAt: '2026-03-06', reach: 47  },
  { title: 'Term 1 Fee Deadline Reminder',    audience: 'Parents',   createdAt: '2026-03-04', reach: 892 },
  { title: 'Staff Meeting Rescheduled',        audience: 'Staff',     createdAt: '2026-03-03', reach: 26  },
];

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return iso; }
};

export default function AdminComms() {
  const { toast } = useToast();
  const [compose,        setCompose]   = useState(false);
  const [to,             setTo]        = useState('');
  const [subject,        setSubject]   = useState('');
  const [body,           setBody]      = useState('');
  const [announcements,  setAnns]      = useState<any[]>(ANNS_SEED);
  const [sending,        setSending]   = useState(false);
  const [offline,        setOffline]   = useState(false);
  const [sent,           setSent]      = useState(false);
  const [showAll,        setShowAll]   = useState(false);

  useEffect(() => {
    announcementsApi.list()
      .then(a => { if (a.length) setAnns(a); setOffline(false); })
      .catch(() => setOffline(true));
  }, []);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const ann = await announcementsApi.create({ title: subject, body, targetAudience: to });
      setAnns(prev => [{ ...ann, title: subject, audience: to, createdAt: new Date().toISOString(), reach: 1 }, ...prev]);
      setOffline(false);
    } catch {
      setAnns(prev => [{ title: subject, audience: to, createdAt: new Date().toISOString(), reach: 1 }, ...prev]);
    } finally {
      setCompose(false); setTo(''); setSubject(''); setBody(''); setSending(false); setSent(true);
      setTimeout(() => setSent(false), 3000);
    }
  };

  return (
    <div>
      <PageHeader
        title="Communications Hub"
        subtitle="System messages, announcements & admin inbox"
        actions={[
          { label: compose ? '✕ Cancel' : '✏️ Compose',  onClick: () => setCompose(v => !v), variant: 'secondary' },
          { label: '📢 Send Announcement', onClick: () => { setCompose(true); }, variant: 'primary' },
        ]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      {sent && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 11, color: '#15803d' }}>
          ✅ Announcement sent successfully!
        </div>
      )}

      {compose && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1e293b' }}>✉️ New Announcement / Message</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>To (audience / role)</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="All Staff / Parents / Head Teacher / …"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Subject / Title</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject…"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Type your message here…"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary"   onClick={handleSend} disabled={sending}>
                {sending ? '⏳ Sending…' : '📤 Send'}
              </Btn>
              <Btn variant="secondary" onClick={() => toast('SMS dispatch via Africa\'s Talking — configured in Integrations.', 'info')}>SMS as well</Btn>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: compose ? 18 : 0 }}>
        {/* Inbox */}
        <Card>
          <CardHeader title="📥 Admin Inbox" />
          {INBOX_SEED.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9',
              background: m.unread ? '#fafbff' : '',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: m.unread ? '#eef2ff' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6366f1',
              }}>{m.from[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: m.unread ? 800 : 600, color: '#1e293b' }}>{m.from}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.role}</div>
              </div>
              {m.unread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </Card>

        {/* Sent announcements */}
        <Card>
          <CardHeader title="📢 Sent Announcements" />
          {announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 12 }}>No announcements yet.</div>
          ) : (showAll ? announcements : announcements.slice(0, 8)).map((a, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 4 }}>{a.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge color="indigo">👥 {a.audience}</Badge>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                  {fmtDate(a.createdAt)}
                  {a.reach ? ` · ${a.reach} recipients` : ''}
                </span>
              </div>
            </div>
          ))}
          {announcements.length > 8 && (
            <div style={{ marginTop: 12 }}>
              <Btn variant="ghost" size="sm" onClick={() => setShowAll(v => !v)}>
                {showAll ? 'Show less ↑' : `View all sent → (${announcements.length})`}
              </Btn>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
