import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card }        from '../../components/ui/Card';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Btn }         from '../../components/ui/Btn';
import { AlertBanner } from '../../components/ui/AlertBanner';

const UNITS = [
  { unit: '1. Sets & Functions',              coverage: 100, weeks: 2, status: 'Done'        },
  { unit: '2. Algebra & Quadratics',          coverage: 100, weeks: 3, status: 'Done'        },
  { unit: '3. Geometry & Trigonometry',       coverage: 82,  weeks: 3, status: 'In Progress' },
  { unit: '4. Statistics & Probability',      coverage: 40,  weeks: 2, status: 'In Progress' },
  { unit: '5. Calculus — Differentiation',    coverage: 0,   weeks: 3, status: 'Not Started' },
  { unit: '6. Calculus — Integration',        coverage: 0,   weeks: 2, status: 'Not Started' },
];

const overall = Math.round(UNITS.reduce((a, u) => a + u.coverage, 0) / UNITS.length);

function unitColor(s: string): 'green' | 'blue' | 'gray' {
  return s === 'Done' ? 'green' : s === 'In Progress' ? 'blue' : 'gray';
}

export default function CurriculumCoverage() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader
        title="Curriculum Coverage"
        subtitle="S4A Mathematics — Term 1, 2026 · NCDC Aligned"
        actions={[
          { label: '📤 Submit Report to HOD', variant: 'primary', onClick: () => toast('Coverage report submitted to HOD ✓', 'success') },
          { label: '📄 Export', onClick: () => toast('Report exported', 'info') },
        ]}
      />

      {overall < 75 && (
        <AlertBanner color="warn" icon="⚠️">
          Overall syllabus coverage is {overall}%. Target is 75% by end of Week 8. Two units not yet started.
        </AlertBanner>
      )}

      {/* Overall progress */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 18, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📈 Overall Syllabus Coverage — S4A Mathematics</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: overall >= 75 ? '#10b981' : '#f59e0b' }}>{overall}%</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Term 1 target: 75%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Week 8 of 13 · {UNITS.filter(u => u.status === 'Done').length} units completed</div>
          </div>
        </div>
        <div style={{ height: 12, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${overall}%`, background: overall >= 75 ? '#10b981' : '#f59e0b', borderRadius: 10, transition: 'width .4s' }} />
        </div>
      </div>

      {/* Unit breakdown */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📚 Unit-by-Unit Progress</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {UNITS.map(u => (
            <div key={u.unit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{u.unit}</div>
                <ProgressBar label="" value={`${u.coverage}%`} pct={u.coverage} color={u.coverage === 100 ? 'green' : u.coverage >= 50 ? 'blue' : u.coverage > 0 ? 'amber' : 'red'} />
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{u.weeks} week{u.weeks > 1 ? 's' : ''} allocated</div>
              <Badge color={unitColor(u.status)}>{u.status}</Badge>
              <Btn size="sm" onClick={() => toast(`${u.unit} notes opened`, 'info')}>Notes</Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
