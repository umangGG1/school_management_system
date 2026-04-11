import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function Reports() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="Term 1, 2026 · Summary reports and exports"
        actions={[
          { label: '📄 Export PDF', onClick: () => toast('PDF generated','info') },
          { label: '📊 Export Excel', onClick: () => toast('Excel exported','info') },
        ]}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[['💰 Fee Collection Report', 'Term 1 fee collection summary by class and stream', '📊 View Report'],
          ['📤 Expenditure Report', 'All approved expenses and budget utilisation', '📊 View Report'],
          ['👥 Payroll Summary', 'Monthly payroll register with tax deductions', '📊 View Report'],
          ['🧾 Supplier Payments', 'All supplier invoices and payment status', '📊 View Report'],
          ['📈 Income vs Expenditure', 'Monthly budget vs actual comparison', '📊 View Report'],
          ['⚠️ Arrears Report', 'Full defaulter list with contact details', '📊 View Report'],
        ].map(([title, sub, btn]) => (
          <Card key={String(title)}>
            <CardHeader title={title} subtitle={sub} action={<Btn size="sm" variant="primary" onClick={()=>toast(`${title} opened`,'info')}>{btn}</Btn>} />
            <ProgressBar label="Data completeness" value="100%" pct={100} color="teal" />
          </Card>
        ))}
      </div>
    </div>
  );
}
