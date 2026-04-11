import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const INBOX = [
  { from:'Mr. Ssemanda Julius', role:'Head Teacher', subject:'Approval needed: Staff leave request', time:'10:15',   unread:true  },
  { from:'Mr. Kato Emmanuel',   role:'Bursar',       subject:'UGX 3.2M fee shortfall — urgent',     time:'09:42',   unread:true  },
  { from:'System',              role:'Automated',    subject:'Nightly backup completed successfully', time:'02:00',   unread:false },
  { from:'Ms. Nakakande Mary',  role:'Teacher',      subject:'New user account request for HOD',     time:'Yesterday',unread:false },
];

const ANNOUNCEMENTS_SENT = [
  { title:'School Closure Notice — Holiday', audience:'All Users',    sent:'Mar 06',  reach:47  },
  { title:'Term 1 Fee Deadline Reminder',    audience:'Parents',      sent:'Mar 04',  reach:892 },
  { title:'Staff Meeting Rescheduled',        audience:'Staff Only',  sent:'Mar 03',  reach:26  },
];

export default function AdminComms() {
  const [compose, setCompose] = useState(false);
  const [to, setTo]           = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');

  return (
    <div>
      <PageHeader
        title="Communications Hub"
        subtitle="System messages, announcements & admin inbox"
        actions={[
          { label: compose ? '✕ Cancel' : '✏️ Compose',    onClick: () => setCompose(v => !v), variant: 'secondary' },
          { label: '📢 New Announcement', onClick: () => {}, variant: 'primary' },
        ]}
      />

      {compose && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1e293b' }}>✉️ New Message</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>To (role or user)</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="All Staff / Head Teacher / …"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject…"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Type your message here…"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary"   onClick={() => { setCompose(false); setTo(''); setSubject(''); setBody(''); }}>📤 Send</Btn>
              <Btn variant="secondary" onClick={() => {}}>SMS as well</Btn>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: compose ? 18 : 0 }}>
        {/* Inbox */}
        <Card>
          <CardHeader title="📥 Admin Inbox" />
          {INBOX.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9',
              background: m.unread ? '#fafbff' : '',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: m.unread ? '#eef2ff' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6366f1',
              }}>
                {m.from[0]}
              </div>
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
          {ANNOUNCEMENTS_SENT.map((a, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 4 }}>{a.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge variant="indigo" size="sm">👥 {a.audience}</Badge>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>Sent {a.sent} · {a.reach} recipients</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <Btn variant="ghost" size="sm" onClick={() => {}}>View all sent →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
