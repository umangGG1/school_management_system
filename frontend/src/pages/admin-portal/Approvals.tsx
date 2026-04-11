import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const PENDING = [
  { id:'APV-001', user:'Mr. Tumwesigye Ronald',  role:'Teacher',      email:'r.tumwesigye@smissi.ac.ug', requested:'New account request — form tutor S.4W', date:'Today 09:12', type:'new_account' },
  { id:'APV-002', user:'Ms. Nakagolo Patricia',  role:'HOD (English)',email:'p.nakagolo@smissi.ac.ug',   requested:'Role upgrade request — from Teacher to HOD', date:'Today 08:45', type:'role_change' },
  { id:'APV-003', user:'Mr. Kabugo James',       role:'Parent',       email:'j.kabugo@gmail.com',        requested:'Password reset request', date:'Yesterday 18:30', type:'reset' },
];

const APPROVED = [
  { id:'APV-A01', user:'Sr. Nakamya Rose',  role:'Nurse',     action:'Account activated',     date:'Yesterday 10:00', by:'System Admin' },
  { id:'APV-A02', user:'Mr. Opolot Fred',   role:'Dorm Master',action:'Role updated',           date:'Mar 09 14:22',    by:'System Admin' },
  { id:'APV-A03', user:'Nakato Sarah',      role:'Student',   action:'New account created',    date:'Mar 09 09:15',    by:'System Admin' },
  { id:'APV-A04', user:'Mr. Okello Moses',  role:'Gate Guard',action:'Account re-activated',   date:'Mar 08 11:00',    by:'System Admin' },
];

const TYPE_COLORS: Record<string, 'amber'|'blue'|'indigo'> = {
  new_account: 'blue', role_change: 'amber', reset: 'indigo',
};
const TYPE_LABELS: Record<string, string> = {
  new_account: '👤 New Account', role_change: '🔄 Role Change', reset: '🔑 Password Reset',
};

export default function AdminApprovals() {
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const approve = (id: string) => setApproved(p => [...p, id]);
  const reject  = (id: string) => setRejected(p => [...p, id]);

  const pending = PENDING.filter(p => !approved.includes(p.id) && !rejected.includes(p.id));

  return (
    <div>
      <PageHeader
        title="Pending Approvals"
        subtitle={`${pending.length} action${pending.length !== 1 ? 's' : ''} awaiting your review`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Pending */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 14 }}>
            ⏳ Pending ({pending.length})
          </div>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>No pending approvals</div>
            </div>
          ) : pending.map(p => (
            <div key={p.id} style={{
              border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Badge variant={TYPE_COLORS[p.type]} size="sm">{TYPE_LABELS[p.type]}</Badge>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.date}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{p.user}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{p.role} · {p.email}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4, fontStyle: 'italic' }}>{p.requested}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn variant="primary" size="sm" onClick={() => approve(p.id)}>✓ Approve</Btn>
                <Btn variant="danger"  size="sm" onClick={() => reject(p.id)}>✗ Reject</Btn>
                <Btn variant="ghost"   size="sm" onClick={() => {}}>View Details</Btn>
              </div>
            </div>
          ))}
        </Card>

        {/* Approved history */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 14 }}>
            ✅ Recently Approved
          </div>
          {[...APPROVED, ...approved.map(id => {
            const p = PENDING.find(x => x.id === id)!;
            return { id, user: p.user, role: p.role, action: TYPE_LABELS[p.type], date: 'Just now', by: 'You' };
          })].map(a => (
            <div key={a.id} style={{
              display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#f0fdf4',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
              }}>✅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{a.user}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{a.action} · {a.role}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{a.date}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>by {a.by}</div>
              </div>
            </div>
          ))}

          {rejected.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#ef4444', marginBottom: 8 }}>
                🚫 Rejected ({rejected.length})
              </div>
              {rejected.map(id => {
                const p = PENDING.find(x => x.id === id)!;
                return (
                  <div key={id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: 12 }}>🚫</span>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{p.user} — {TYPE_LABELS[p.type]}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
