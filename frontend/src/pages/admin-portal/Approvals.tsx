import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { approvalsApi, type ApiApproval } from '../../lib/api';

const TYPE_COLORS: Record<string, 'amber' | 'blue' | 'indigo' | 'red' | 'purple'> = {
  LEAVE_REQUEST:  'amber',
  STUDENT_EXEAT:  'blue',
  PAYROLL:        'indigo',
  PURCHASE_ORDER: 'purple',
  FEE_WAIVER:     'red',
  REPORT_CARD:    'blue',
  OTHER:          'indigo',
};
const TYPE_LABELS: Record<string, string> = {
  LEAVE_REQUEST:  '🏖️ Leave Request',
  STUDENT_EXEAT:  '🚪 Student Exeat',
  PAYROLL:        '💰 Payroll',
  PURCHASE_ORDER: '🛒 Purchase Order',
  FEE_WAIVER:     '💳 Fee Waiver',
  REPORT_CARD:    '📄 Report Card',
  OTHER:          '📋 Other',
};

function relativeTime(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)    return 'Just now';
  if (secs < 3600)  return `${Math.floor(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} hr${Math.floor(secs/3600) > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function AdminApprovals() {
  const [pending,  setPending]  = useState<ApiApproval[]>([]);
  const [history,  setHistory]  = useState<ApiApproval[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [offline,  setOffline]  = useState(false);
  const [acting,   setActing]   = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [pend, all] = await Promise.all([
        approvalsApi.listPending(),
        approvalsApi.listAll(),
      ]);
      setPending(pend);
      setHistory(all.filter(a => a.status !== 'PENDING'));
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleApprove = async (id: string) => {
    setActing(id);
    try {
      await approvalsApi.approve(id);
      await reload();
    } catch {
      // Optimistic update when backend is offline
      setPending(p => p.filter(x => x.id !== id));
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try {
      await approvalsApi.reject(id);
      await reload();
    } catch {
      setPending(p => p.filter(x => x.id !== id));
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pending Approvals"
        subtitle={`${pending.length} action${pending.length !== 1 ? 's' : ''} awaiting your review`}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — changes are local only and won't persist.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* Pending */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 14 }}>
            ⏳ Pending ({pending.length})
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 12 }}>Loading…</div>
          ) : pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>No pending approvals</div>
            </div>
          ) : pending.map(p => (
            <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Badge variant={TYPE_COLORS[p.type] ?? 'indigo'} size="sm">
                  {TYPE_LABELS[p.type] ?? p.type}
                </Badge>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{relativeTime(p.createdAt)}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                {p.requestedBy
                  ? `${p.requestedBy.firstName} ${p.requestedBy.lastName}`
                  : p.title}
              </div>
              {p.requestedBy && (
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {p.requestedBy.roles?.[0] ?? ''} · {p.requestedBy.email}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
                {p.description || p.title}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn variant="primary" size="sm" disabled={acting === p.id} onClick={() => handleApprove(p.id)}>
                  {acting === p.id ? '…' : '✓ Approve'}
                </Btn>
                <Btn variant="danger" size="sm" disabled={acting === p.id} onClick={() => handleReject(p.id)}>
                  {acting === p.id ? '…' : '✗ Reject'}
                </Btn>
              </div>
            </div>
          ))}
        </Card>

        {/* History */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 14 }}>
            📜 Decision History ({history.length})
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 12 }}>
              No decisions yet.
            </div>
          ) : history.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.status === 'APPROVED' ? '#f0fdf4' : '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {a.status === 'APPROVED' ? '✅' : '🚫'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                  {a.requestedBy ? `${a.requestedBy.firstName} ${a.requestedBy.lastName}` : a.title}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {TYPE_LABELS[a.type] ?? a.type} · {a.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                </div>
                {a.reviewNotes && (
                  <div style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 }}>
                    Note: {a.reviewNotes}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{relativeTime(a.updatedAt)}</div>
                {a.reviewedBy && (
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    by {a.reviewedBy.firstName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
