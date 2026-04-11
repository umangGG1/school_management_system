import { useState }   from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const CLASSES = ['S4A', 'S5A', 'S3B', 'S6A', 'S4B'];
const EXAMS   = ['End-term Exam', 'Mid-term Test', 'Practical', 'Assignment'];

interface StudentMark { name: string; reg: string; score: number; }

const BASE: StudentMark[] = [
  { name: 'Akello Rose',      reg: 'S4A/001', score: 87 },
  { name: 'Byamugisha Peter', reg: 'S4A/002', score: 72 },
  { name: 'Chebet Sarah',     reg: 'S4A/003', score: 65 },
  { name: 'Ddungu Moses',     reg: 'S4A/004', score: 55 },
  { name: 'Ezati John',       reg: 'S4A/005', score: 45 },
  { name: 'Farida Amina',     reg: 'S4A/006', score: 91 },
  { name: 'Gatete Sam',       reg: 'S4A/007', score: 61 },
  { name: 'Harriet Nakato',   reg: 'S4A/008', score: 78 },
  { name: 'Ismail Karim',     reg: 'S4A/009', score: 83 },
  { name: 'Jjuuko Fred',      reg: 'S4A/010', score: 39 },
];

function ugandaGrade(s: number) {
  if (s >= 80) return { g: 'D1', col: 'green' as const };
  if (s >= 70) return { g: 'D2', col: 'green' as const };
  if (s >= 65) return { g: 'C3', col: 'blue'  as const };
  if (s >= 60) return { g: 'C4', col: 'blue'  as const };
  if (s >= 55) return { g: 'C5', col: 'blue'  as const };
  if (s >= 50) return { g: 'C6', col: 'blue'  as const };
  if (s >= 45) return { g: 'P7', col: 'amber' as const };
  if (s >= 40) return { g: 'P8', col: 'amber' as const };
  return { g: 'F9', col: 'red' as const };
}

export default function MarksGrades() {
  const { toast }        = useToast();
  const [cls, setCls]    = useState('S4A');
  const [exam, setExam]  = useState('End-term Exam');
  const [marks, setMarks]= useState<StudentMark[]>(BASE);

  const avg     = Math.round(marks.reduce((a, s) => a + s.score, 0) / marks.length);
  const passing = marks.filter(s => s.score >= 40).length;

  return (
    <div>
      <PageHeader
        title="Marks & Grades"
        subtitle="Enter and manage student scores — Uganda grading (D1–F9)"
        actions={[
          { label: '📄 Export', onClick: () => toast('Gradebook exported', 'info') },
          { label: '💾 Save Marks', variant: 'primary', onClick: () => toast('Marks saved ✓', 'success') },
        ]}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={cls} onChange={e => setCls(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
          {CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={exam} onChange={e => setExam(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
          {EXAMS.map(e => <option key={e}>{e}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#64748b' }}>Max marks: 100</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[['Class Average', `${avg}%`, '#2563eb'], ['Pass Rate', `${Math.round(passing/marks.length*100)}%`, '#10b981'], ['Highest', `${Math.max(...marks.map(s=>s.score))}`, '#8b5cf6'], ['Lowest', `${Math.min(...marks.map(s=>s.score))}`, '#ef4444']].map(([l, v, c]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title={`${cls} — ${exam} Gradebook`} />
        <DataTable
          rows={marks}
          keyFn={(_, i) => i}
          columns={[
            { key: 'name', header: 'Student',  render: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
            { key: 'reg',  header: 'Reg No',   render: r => <span style={{ color: '#64748b', fontSize: 11 }}>{r.reg}</span> },
            {
              key: 'score', header: 'Score / 100',
              render: (r, i) => (
                <input
                  type="number" min={0} max={100}
                  value={r.score}
                  onChange={e => setMarks(m => m.map((s, idx) => idx === i ? { ...s, score: Math.min(100, Math.max(0, Number(e.target.value))) } : s))}
                  style={{ width: 64, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700, textAlign: 'center' }}
                />
              ),
            },
            {
              key: 'grade', header: 'Grade',
              render: r => {
                const { g, col } = ugandaGrade(r.score);
                return <Badge color={col}>{g}</Badge>;
              },
            },
          ]}
        />
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, display: 'flex', gap: 20, fontSize: 12 }}>
          <span>Class avg: <b style={{ color: '#2563eb' }}>{avg}%</b></span>
          <span>Passing (≥40): <b style={{ color: '#10b981' }}>{passing}/{marks.length}</b></span>
          <span>Exam: <b>{exam}</b></span>
        </div>
      </Card>
    </div>
  );
}
