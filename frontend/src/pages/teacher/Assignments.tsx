import { useToast }     from '../../contexts/ToastContext';
import { PageHeader }   from '../../components/ui/PageHeader';
import { Card }         from '../../components/ui/Card';
import { Btn }          from '../../components/ui/Btn';
import { Badge }        from '../../components/ui/Badge';
import { ProgressBar }  from '../../components/ui/ProgressBar';
import { DataTable }    from '../../components/ui/DataTable';
import { AlertBanner }  from '../../components/ui/AlertBanner';

const ASSIGNMENTS = [
  { title: 'Quadratics Problem Set',          cls: 'S4A', due: '09 Mar 2026', submitted: 38, total: 42, status: 'Active',  marked: false },
  { title: 'Trigonometry Worksheet',           cls: 'S3B', due: '11 Mar 2026', submitted: 12, total: 44, status: 'Active',  marked: false },
  { title: 'Further Maths — Past Paper 2024', cls: 'S6A', due: '14 Mar 2026', submitted: 5,  total: 28, status: 'Active',  marked: false },
  { title: 'Sets & Functions End Test',        cls: 'S4A', due: '28 Feb 2026', submitted: 42, total: 42, status: 'Marked',  marked: true  },
  { title: 'Algebra Mid-term Test',            cls: 'S5A', due: '20 Feb 2026', submitted: 38, total: 38, status: 'Marked',  marked: true  },
];

export default function Assignments() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Track submissions, mark work, and give feedback"
        actions={[
          { label: '📄 Export', onClick: () => toast('Exported', 'info') },
          { label: '➕ New Assignment', variant: 'primary', onClick: () => toast('Assignment form opened', 'info') },
        ]}
      />

      <AlertBanner color="warn" icon="⚠️">
        <strong>2 assignments need marking</strong> — Quadratics Problem Set (S4A) and Trigonometry Worksheet (S3B) are awaiting your feedback.
      </AlertBanner>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[['Total', ASSIGNMENTS.length, '#2563eb'], ['Active', ASSIGNMENTS.filter(a => a.status === 'Active').length, '#f59e0b'], ['Marked', ASSIGNMENTS.filter(a => a.marked).length, '#10b981'], ['Unmarked', ASSIGNMENTS.filter(a => a.status === 'Active').length, '#ef4444']].map(([l, v, c]) => (
          <div key={String(l)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <Card>
        <DataTable
          rows={ASSIGNMENTS}
          keyFn={(_, i) => i}
          columns={[
            { key: 'title', header: 'Assignment', render: r => <span style={{ fontWeight: 700 }}>{r.title}</span> },
            { key: 'cls',   header: 'Class',     render: r => <Badge color="blue">{r.cls}</Badge> },
            { key: 'due',   header: 'Due',        render: r => <span style={{ fontSize: 11, color: '#64748b' }}>{r.due}</span> },
            {
              key: 'submitted', header: 'Submissions',
              render: r => (
                <div style={{ width: 120 }}>
                  <ProgressBar label="" value={`${r.submitted}/${r.total}`} pct={Math.round(r.submitted / r.total * 100)} color={r.submitted === r.total ? 'green' : 'blue'} />
                </div>
              ),
            },
            { key: 'status', header: 'Status', render: r => <Badge color={r.status === 'Marked' ? 'green' : 'amber'}>{r.status}</Badge> },
            {
              key: 'actions', header: '',
              render: r => (
                <div style={{ display: 'flex', gap: 6 }}>
                  {!r.marked && <Btn size="sm" variant="primary" onClick={() => toast(`Marking ${r.title}`, 'info')}>✏️ Mark</Btn>}
                  <Btn size="sm" onClick={() => toast(`${r.title} viewed`, 'info')}>View</Btn>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
