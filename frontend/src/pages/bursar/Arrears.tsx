import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { AlertBanner } from '../../components/ui/AlertBanner';

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
const DEFAULTERS = [
  { name: 'Nakibuule Sarah', cls: 'S5A', balance: 1_275_000, days: 68, parent: 'Mrs. Nakibuule (+256 772 111 222)', lastPaid: '12 Jan' },
  { name: 'Okwir James',     cls: 'S3A', balance: 950_000,   days: 72, parent: 'Mr. Okwir (+256 782 333 444)',     lastPaid: '08 Jan' },
  { name: 'Auma Gloria',     cls: 'S4B', balance: 1_850_000, days: 81, parent: 'Ms. Auma (+256 701 555 666)',      lastPaid: '05 Jan' },
  { name: 'Ssemwogerere T.', cls: 'S2A', balance: 750_000,   days: 61, parent: 'Mr. Ssemwog (+256 774 777 888)',  lastPaid: '18 Jan' },
  { name: 'Namanya Patrick', cls: 'S6A', balance: 425_000,   days: 64, parent: 'Mrs. Namanya (+256 752 999 000)', lastPaid: '14 Jan' },
  { name: 'Kyaligonza David',cls: 'S1B', balance: 1_100_000, days: 55, parent: 'Mr. Kyaligonza (+256 712 001)',   lastPaid: '20 Jan' },
  { name: 'Birungi Agnes',   cls: 'S3B', balance: 625_000,   days: 77, parent: 'Mrs. Birungi (+256 791 003)',     lastPaid: '03 Jan' },
];
const total = DEFAULTERS.reduce((a, d) => a + d.balance, 0);

export default function Arrears() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Arrears & Defaulters" subtitle={`${DEFAULTERS.length} students with outstanding balances · Term 1, 2026`}
        actions={[
          { label: '📤 Send All Reminders', variant: 'warning', onClick: () => toast('Reminders sent to all defaulters', 'success') },
          { label: '📄 Export List', onClick: () => toast('Defaulter list exported', 'info') },
        ]}
      />

      <AlertBanner color="danger" icon="⚠️">
        Total outstanding: <strong>UGX {(total / 1_000_000).toFixed(2)}M</strong> across {DEFAULTERS.length} students. 3 students have balances older than 75 days.
      </AlertBanner>

      <Card>
        <DataTable
          rows={DEFAULTERS}
          keyFn={(_, i) => i}
          columns={[
            { key: 'name',    header: 'Student',     render: r => <span style={{ fontWeight: 700 }}>{r.name}</span> },
            { key: 'cls',     header: 'Class',       render: r => <Badge color="blue">{r.cls}</Badge> },
            { key: 'balance', header: 'Balance',     render: r => <span style={{ fontWeight: 700, color: '#ef4444' }}>{fmt(r.balance)}</span> },
            { key: 'days',    header: 'Days Overdue',render: r => <Badge color={r.days >= 75 ? 'red' : r.days >= 60 ? 'amber' : 'orange'}>{r.days} days</Badge> },
            { key: 'lastPaid',header: 'Last Payment',render: r => <span style={{ color: '#64748b', fontSize: 11 }}>{r.lastPaid}</span> },
            { key: 'parent',  header: 'Parent/Guardian', render: r => <span style={{ fontSize: 11, color: '#64748b' }}>{r.parent}</span> },
            {
              key: 'actions', header: '',
              render: r => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="primary" onClick={() => toast(`Payment recorded for ${r.name}`, 'success')}>💳 Pay</Btn>
                  <Btn size="sm" variant="warning"  onClick={() => toast(`Reminder sent to ${r.name}'s parent`, 'success')}>📤 Remind</Btn>
                </div>
              ),
            },
          ]}
        />
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef2f2', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Total Outstanding:</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{fmt(total)}</span>
        </div>
      </Card>
    </div>
  );
}
