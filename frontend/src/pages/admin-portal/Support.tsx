import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const TICKETS = [
  { id:'TKT-001', title:'Login not working for new teacher account', user:'Ms. Nakagolo Patricia', role:'Teacher',   priority:'high',   status:'open',       created:'Today 08:12',  category:'account' },
  { id:'TKT-002', title:'Fee receipt not generating after payment',  user:'Mr. Ochieng David',    role:'Parent',    priority:'medium', status:'in_progress',created:'Yesterday',     category:'billing' },
  { id:'TKT-003', title:'Attendance report showing wrong dates',     user:'Mr. Kato Emmanuel',    role:'Bursar',    priority:'low',    status:'resolved',   created:'Mar 05',        category:'bug'     },
  { id:'TKT-004', title:'Unable to upload lesson notes (> 10MB)',    user:'Ms. Nakakande Mary',   role:'Teacher',   priority:'medium', status:'resolved',   created:'Mar 04',        category:'upload'  },
];

const PRI_COLOR: Record<string,'red'|'amber'|'blue'> = { high:'red', medium:'amber', low:'blue' };
const STA_COLOR: Record<string,'amber'|'blue'|'success'> = { open:'amber', in_progress:'blue', resolved:'success' };
const STA_LABEL: Record<string,string> = { open:'🔴 Open', in_progress:'🔵 In Progress', resolved:'✅ Resolved' };

export default function AdminSupport() {
  const [selected, setSelected] = useState<string|null>('TKT-001');
  const ticket = TICKETS.find(t => t.id === selected);

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle="1 open · 1 in progress · 2 resolved"
        actions={[{ label: '+ New Ticket', onClick: () => {}, variant: 'primary' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18 }}>
        {/* Ticket list */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TICKETS.map(t => (
              <div key={t.id} onClick={() => setSelected(t.id)} style={{
                padding: '11px 13px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${selected === t.id ? '#6366f1' : '#e2e8f0'}`,
                background: selected === t.id ? '#eef2ff' : '#fff',
                transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{t.id}</span>
                  <Badge variant={PRI_COLOR[t.priority]} size="sm">{t.priority}</Badge>
                  <Badge variant={STA_COLOR[t.status]}  size="sm">{STA_LABEL[t.status]}</Badge>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>{t.created}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{t.user} · {t.role}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Detail panel */}
        {ticket ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', marginBottom: 10 }}>{ticket.title}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <Badge variant={PRI_COLOR[ticket.priority]} size="sm">{ticket.priority} priority</Badge>
                <Badge variant={STA_COLOR[ticket.status]}  size="sm">{STA_LABEL[ticket.status]}</Badge>
                <Badge variant="indigo"                    size="sm">{ticket.category}</Badge>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                <strong>Reporter:</strong> {ticket.user} ({ticket.role})
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                <strong>Created:</strong> {ticket.created}
              </div>
              <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                User is unable to complete the action. Detailed steps have been provided. This appears to be a system-level issue requiring admin intervention.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn variant="primary"   size="sm" onClick={() => {}}>Mark Resolved</Btn>
                <Btn variant="secondary" size="sm" onClick={() => {}}>Assign to IT</Btn>
                <Btn variant="ghost"     size="sm" onClick={() => {}}>Reply</Btn>
              </div>
            </Card>

            <Card>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 10 }}>💬 Conversation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: '#475569' }}>
                  <strong>{ticket.user}:</strong> I tried logging in but it keeps saying "Invalid credentials" even though I just set my password.
                </div>
                <div style={{ background: '#eef2ff', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: '#4338ca', marginLeft: 20 }}>
                  <strong>Admin:</strong> Please try clearing your browser cache and using an incognito window. If the issue persists, we'll reset your session token.
                </div>
              </div>
              <textarea
                placeholder="Type your reply…"
                rows={3}
                style={{
                  width: '100%', marginTop: 10, padding: '8px 10px',
                  borderRadius: 8, border: '1px solid #e2e8f0',
                  fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Btn variant="primary" size="sm" onClick={() => {}}>Send Reply</Btn>
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 32 }}>🎫</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>Select a ticket to view details</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
