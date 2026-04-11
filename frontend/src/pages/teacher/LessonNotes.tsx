import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const NOTES = [
  { date: '06 Mar', cls: 'S4B', topic: 'Trigonometric Identities — sinA cosB formulas',       type: 'Lesson Note',   status: 'Shared' },
  { date: '05 Mar', cls: 'S3B', topic: 'Geometry — Proof by congruence triangles',             type: 'Lesson Note',   status: 'Draft'  },
  { date: '04 Mar', cls: 'S6A', topic: 'Further Maths — Matrices & Determinants',              type: 'Scheme of Work',status: 'Shared' },
  { date: '03 Mar', cls: 'S5A', topic: 'Statistics — Mean, Median, Mode & Std Deviation',     type: 'Lesson Note',   status: 'Shared' },
  { date: '28 Feb', cls: 'S4A', topic: 'Quadratics — Completing the Square',                  type: 'Lesson Note',   status: 'Shared' },
  { date: '25 Feb', cls: 'S3B', topic: 'Geometry — Pythagoras Theorem applications',          type: 'Lesson Note',   status: 'Shared' },
];

function noteTypeColor(t: string): 'blue' | 'purple' { return t === 'Scheme of Work' ? 'purple' : 'blue'; }
function statusColor(s: string): 'green' | 'amber'   { return s === 'Shared' ? 'green' : 'amber'; }

export default function LessonNotes() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader
        title="Lesson Notes"
        subtitle="Manage and share lesson notes, schemes of work, and teaching resources"
        actions={[
          { label: '📄 Export All', onClick: () => toast('Notes exported', 'info') },
          { label: '➕ Add Note', variant: 'primary', icon: '', onClick: () => toast('Note form opened', 'info') },
        ]}
      />

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[['Total Notes', NOTES.length, '#2563eb'], ['Shared', NOTES.filter(n => n.status === 'Shared').length, '#10b981'], ['Drafts', NOTES.filter(n => n.status === 'Draft').length, '#f59e0b'], ['Schemes', NOTES.filter(n => n.type === 'Scheme of Work').length, '#8b5cf6']].map(([l, v, c]) => (
          <div key={String(l)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <Card>
        <DataTable
          rows={NOTES}
          keyFn={(_, i) => i}
          columns={[
            { key: 'date',   header: 'Date',   render: r => <span style={{ color: '#64748b', fontSize: 11 }}>{r.date}</span> },
            { key: 'cls',    header: 'Class',  render: r => <Badge color="blue">{r.cls}</Badge> },
            { key: 'topic',  header: 'Topic',  render: r => <span style={{ fontWeight: 600 }}>{r.topic}</span> },
            { key: 'type',   header: 'Type',   render: r => <Badge color={noteTypeColor(r.type)}>{r.type}</Badge> },
            { key: 'status', header: 'Status', render: r => <Badge color={statusColor(r.status)}>{r.status}</Badge> },
            {
              key: 'actions', header: '',
              render: r => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" onClick={() => toast(`${r.topic} opened`, 'info')}>📖 View</Btn>
                  {r.status === 'Draft' && <Btn size="sm" variant="primary" onClick={() => toast('Note shared ✓', 'success')}>Share</Btn>}
                  <Btn size="sm" variant="secondary" onClick={() => toast('Note edited', 'info')}>✏️ Edit</Btn>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
