import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { FormField, TextInput, SelectInput, FormRow } from '../../components/ui/FormField';

const fmt = (n: number) => `UGX ${(n / 1_000_000).toFixed(2)}M`;
const FEE_ROWS = [
  { cls:'S1', students:278, expected:83_400_000, collected:72_318_000 },
  { cls:'S2', students:234, expected:70_200_000, collected:57_564_000 },
  { cls:'S3', students:214, expected:64_200_000, collected:46_224_000 },
  { cls:'S4', students:248, expected:74_400_000, collected:59_520_000 },
  { cls:'S5', students:91,  expected:27_300_000, collected:24_570_000 },
  { cls:'S6', students:142, expected:42_600_000, collected:38_340_000 },
];
const totalExp = FEE_ROWS.reduce((a, r) => a + r.expected,  0);
const totalCol = FEE_ROWS.reduce((a, r) => a + r.collected, 0);

export default function FeeCollection() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Fee Collection" subtitle="Term 1, 2026 · Fee receipting and payment tracking"
        actions={[
          { label: '📄 Print Receipt', onClick: () => toast('Receipt printed', 'info') },
          { label: '💳 Receive Payment', variant: 'primary', onClick: () => toast('Payment modal opened', 'info') },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader title="📊 Collection by Class" />
          {FEE_ROWS.map(r => {
            const pct = Math.round((r.collected / r.expected) * 100);
            return (
              <div key={r.cls} style={{ marginBottom: 16, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Class {r.cls}</span>
                    <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>{r.students} students</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e' }}>{fmt(r.collected)}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>of {fmt(r.expected)}</div>
                  </div>
                </div>
                <ProgressBar label="" value={`${pct}%`} pct={pct} color={pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red'} />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <Badge color={pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red'}>{pct}% collected</Badge>
                  <Badge color="orange">{fmt(r.expected - r.collected)} outstanding</Badge>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Grand Total</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f766e' }}>{fmt(totalCol)} / {fmt(totalExp)}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{Math.round(totalCol/totalExp*100)}% collected</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="💳 Receive Payment" />
          <FormField label="Student Name"><TextInput placeholder="Search student name…" /></FormField>
          <FormField label="Class"><SelectInput><option>S1</option><option>S2</option><option>S3</option><option>S4</option><option>S5</option><option>S6</option></SelectInput></FormField>
          <FormField label="Fee Type"><SelectInput><option>Tuition Fees</option><option>Boarding Fees</option><option>Activity Fees</option><option>Exam Fees</option><option>Other</option></SelectInput></FormField>
          <FormField label="Amount (UGX)"><TextInput type="number" placeholder="e.g. 300000" /></FormField>
          <FormRow>
            <FormField label="Payment Method"><SelectInput><option>Cash</option><option>Mobile Money</option><option>Bank Transfer</option><option>Cheque</option></SelectInput></FormField>
            <FormField label="Date"><TextInput type="date" /></FormField>
          </FormRow>
          <FormField label="Reference No."><TextInput placeholder="Receipt / transaction ref." /></FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn onClick={() => toast('Draft saved', 'info')}>Draft</Btn>
            <Btn variant="primary" onClick={() => toast('Payment recorded ✓ — Receipt printed', 'success')}>💳 Record Payment</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
