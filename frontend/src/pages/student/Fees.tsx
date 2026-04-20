import { useState, useEffect } from 'react';
import { PageHeader }       from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }            from '../../components/ui/Badge';
import { useToast }         from '../../contexts/ToastContext';
import { studentSelfApi }   from '../../lib/api';

const SEED_INVOICES = [
  { id: 'i1', term: 'Term 1 2026', description: 'Tuition Fees',         amount: 450000, paidAmount: 450000, status: 'PAID',        dueDate: '2026-02-01', paidDate: '2026-01-28' },
  { id: 'i2', term: 'Term 1 2026', description: 'Boarding Fees',        amount: 280000, paidAmount: 280000, status: 'PAID',        dueDate: '2026-02-01', paidDate: '2026-01-28' },
  { id: 'i3', term: 'Term 1 2026', description: 'Development Levy',     amount: 50000,  paidAmount: 50000,  status: 'PAID',        dueDate: '2026-02-01', paidDate: '2026-02-03' },
  { id: 'i4', term: 'Term 1 2026', description: 'Meals',                amount: 120000, paidAmount: 80000,  status: 'PARTIAL',     dueDate: '2026-04-25', paidDate: null },
  { id: 'i5', term: 'Term 1 2026', description: 'Examination Fees',     amount: 40000,  paidAmount: 0,      status: 'UNPAID',      dueDate: '2026-04-25', paidDate: null },
  { id: 'i6', term: 'Term 3 2025', description: 'Tuition Fees',         amount: 450000, paidAmount: 450000, status: 'PAID',        dueDate: '2025-09-01', paidDate: '2025-08-30' },
  { id: 'i7', term: 'Term 3 2025', description: 'Boarding Fees',        amount: 280000, paidAmount: 280000, status: 'PAID',        dueDate: '2025-09-01', paidDate: '2025-09-05' },
];

const SEED_BALANCE = {
  balance: 80000,       // outstanding
  totalPaid: 1310000,
  totalCharged: 1390000,
  term: 'Term 1 2026',
};

const statusColor: Record<string, 'green' | 'amber' | 'red'> = {
  PAID: 'green', PARTIAL: 'amber', UNPAID: 'red',
};

function fmt(n: number) { return `UGX ${n.toLocaleString()}`; }

export default function Fees() {
  const { toast }   = useToast();
  const [balance,  setBalance]  = useState<any>(SEED_BALANCE);
  const [invoices, setInvoices] = useState<any[]>(SEED_INVOICES);
  const [loading,  setLoading]  = useState(true);
  const [selTerm,  setSelTerm]  = useState('Term 1 2026');

  useEffect(() => {
    Promise.all([
      studentSelfApi.getMyBalance().catch(() => null),
      studentSelfApi.getMyInvoices().catch(() => null),
    ]).then(([bal, inv]) => {
      if (bal) setBalance(bal);
      if (inv?.length) setInvoices(inv);
    }).finally(() => setLoading(false));
  }, []);

  const TERMS = [...new Set(invoices.map(i => i.term))];
  const termInvoices = invoices.filter(i => i.term === selTerm);
  const termPaid     = termInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const termTotal    = termInvoices.reduce((s, i) => s + i.amount, 0);
  const outstanding  = balance?.balance ?? (termTotal - termPaid);

  return (
    <div>
      <PageHeader title="School Fees" subtitle="My fee statement and payment history" />

      {/* Outstanding banner */}
      {outstanding > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Balance</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#ea580c', marginTop: 4 }}>{fmt(outstanding)}</div>
            <div style={{ fontSize: 11, color: '#9a3412', marginTop: 2 }}>Due by 25th April 2026</div>
          </div>
          <button
            onClick={() => toast('Payment via MTN MoMo — contact the bursar office', 'info')}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#ea580c', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            💳 Pay Now
          </button>
        </div>
      )}

      {outstanding === 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>Fees fully paid for {selTerm}</div>
            <div style={{ fontSize: 12, color: '#16a34a' }}>No outstanding balance</div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Charged', value: fmt(termTotal),    color: '#1e293b' },
          { label: 'Total Paid',    value: fmt(termPaid),     color: '#10b981' },
          { label: 'Outstanding',   value: fmt(outstanding),  color: outstanding > 0 ? '#ea580c' : '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Term selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TERMS.map(t => (
          <button key={t} onClick={() => setSelTerm(t)} style={{
            padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: selTerm === t ? '#7c3aed' : '#f8fafc', color: selTerm === t ? '#fff' : '#1e293b',
          }}>{t}</button>
        ))}
      </div>

      <Card>
        <CardHeader title={`📋 Fee Statement — ${selTerm}`} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 4 }}>
          {['Description', 'Amount', 'Paid', 'Due Date', 'Status'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Loading…</div>
        ) : termInvoices.map((inv, i) => (
          <div key={inv.id ?? i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 12, padding: '10px 12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.description}</div>
            <div style={{ fontSize: 12, color: '#1e293b', fontWeight: 600 }}>{fmt(inv.amount)}</div>
            <div style={{ fontSize: 12, color: inv.paidAmount === inv.amount ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{fmt(inv.paidAmount)}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
            <Badge color={statusColor[inv.status] ?? 'gray'}>{inv.status}</Badge>
          </div>
        ))}
        {/* Total row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 12, padding: '12px 12px', borderTop: '2px solid #e2e8f0', alignItems: 'center', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>TOTAL</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{fmt(termTotal)}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{fmt(termPaid)}</div>
          <div />
          <Badge color={outstanding === 0 ? 'green' : 'amber'}>{outstanding === 0 ? 'CLEAR' : 'OWING'}</Badge>
        </div>
      </Card>

      <div style={{ marginTop: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, fontSize: 12, color: '#64748b' }}>
        💡 To make a payment, visit the bursar's office or pay via <strong>MTN MoMo</strong> / <strong>Airtel Money</strong>. Always collect a receipt.
      </div>
    </div>
  );
}
