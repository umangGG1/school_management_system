import { useState }    from 'react';
import { Modal }        from '../../components/ui/Modal';
import { useToast }     from '../../contexts/ToastContext';
import { PageHeader }   from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }          from '../../components/ui/Btn';
import { ProgressBar }  from '../../components/ui/ProgressBar';

const REPORTS = [
  { title: '💰 Fee Collection Report',   sub: 'Term 1 fee collection summary by class and stream' },
  { title: '📤 Expenditure Report',       sub: 'All approved expenses and budget utilisation' },
  { title: '👥 Payroll Summary',          sub: 'Monthly payroll register with tax deductions' },
  { title: '🧾 Supplier Payments',        sub: 'All supplier invoices and payment status' },
  { title: '📈 Income vs Expenditure',    sub: 'Monthly budget vs actual comparison' },
  { title: '⚠️ Arrears Report',          sub: 'Full defaulter list with contact details' },
];

function GenerateModal({ report, onClose }: { report: string | null; onClose: () => void }) {
  const { toast }  = useToast();
  const [fmt, setFmt]   = useState('PDF');
  const [busy, setBusy] = useState(false);

  const handleGenerate = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onClose();
      toast(`✅ ${report} (${fmt}) ready for download`, 'success');
    }, 1200);
  };

  return (
    <Modal open={!!report} onClose={onClose} id="bursar-report" title={`📊 Generate: ${report ?? ''}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Period</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
            <option>Term 1, 2026</option><option>Term 3, 2025</option><option>Term 2, 2025</option><option>Full Year 2025</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Format</label>
          <div className="flex gap-2">
            {['PDF', 'Excel (.xlsx)', 'CSV'].map(f => (
              <button key={f} onClick={() => setFmt(f)} className={`flex-1 py-2 rounded-lg border text-[12px] font-semibold transition-all ${fmt === f ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={handleGenerate} disabled={busy} className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg flex items-center gap-2">
            {busy ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />Generating…</> : '📥 Generate & Download'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Reports() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="Term 1, 2026 · Summary reports and exports"
        actions={[
          { label: '📄 Export PDF',   onClick: () => setSelected('Full Financial Summary') },
          { label: '📊 Export Excel', onClick: () => setSelected('Excel Export') },
        ]}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {REPORTS.map(({ title, sub }) => (
          <Card key={title}>
            <CardHeader title={title} subtitle={sub}
              action={<Btn size="sm" variant="primary" onClick={() => setSelected(title)}>📊 View Report</Btn>}
            />
            <ProgressBar label="Data completeness" value="100%" pct={100} color="teal" />
          </Card>
        ))}
      </div>
      <GenerateModal report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
