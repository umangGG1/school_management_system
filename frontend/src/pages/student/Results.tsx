import { useState, useEffect } from 'react';
import { PageHeader }       from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge }            from '../../components/ui/Badge';
import { studentSelfApi }   from '../../lib/api';

const SEED_MARKS = [
  { subject: 'Mathematics',  paper: 'P1', score: 78, maxScore: 100, grade: 'D1', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  { subject: 'English',      paper: 'P1', score: 65, maxScore: 100, grade: 'D2', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  { subject: 'Physics',      paper: 'P1', score: 72, maxScore: 100, grade: 'D1', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  { subject: 'Chemistry',    paper: 'P1', score: 68, maxScore: 100, grade: 'D2', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  { subject: 'Biology',      paper: 'P1', score: 81, maxScore: 100, grade: 'D1', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  { subject: 'History',      paper: 'P1', score: 59, maxScore: 100, grade: 'C5', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  { subject: 'Geography',    paper: 'P1', score: 74, maxScore: 100, grade: 'D1', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  { subject: 'Computer',     paper: 'P1', score: 88, maxScore: 100, grade: 'D1', term: 'Term 1 2026', examType: 'END_OF_TERM' },
  /* Mid-term */
  { subject: 'Mathematics',  paper: 'P1', score: 72, maxScore: 100, grade: 'D1', term: 'Term 1 2026', examType: 'MID_TERM' },
  { subject: 'English',      paper: 'P1', score: 60, maxScore: 100, grade: 'D2', term: 'Term 1 2026', examType: 'MID_TERM' },
  { subject: 'Physics',      paper: 'P1', score: 68, maxScore: 100, grade: 'D2', term: 'Term 1 2026', examType: 'MID_TERM' },
];

const TERMS = ['Term 1 2026', 'Term 3 2025', 'Term 2 2025'];
const EXAM_TYPES = ['ALL', 'END_OF_TERM', 'MID_TERM', 'MOCK'];

const gradeColor: Record<string, 'green' | 'blue' | 'amber' | 'orange' | 'red'> = {
  D1: 'green', D2: 'blue', C3: 'blue', C4: 'amber', C5: 'amber', C6: 'orange', P7: 'orange', P8: 'red', F9: 'red',
};

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32 }}>{score}</span>
    </div>
  );
}

export default function Results() {
  const [marks,    setMarks]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selTerm,  setSelTerm]  = useState('Term 1 2026');
  const [selType,  setSelType]  = useState('ALL');

  useEffect(() => {
    studentSelfApi.getMyMarks()
      .then(data => setMarks(data.length ? data : SEED_MARKS))
      .catch(() => setMarks(SEED_MARKS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = marks.filter(m =>
    (m.term === selTerm || !m.term) &&
    (selType === 'ALL' || m.examType === selType)
  );

  const avg  = filtered.length ? Math.round(filtered.reduce((s, m) => s + (m.score ?? m.percentage ?? 0), 0) / filtered.length) : 0;
  const best = filtered.length ? Math.max(...filtered.map(m => m.score ?? 0)) : 0;

  return (
    <div>
      <PageHeader title="My Results" subtitle="Academic performance by term and exam type" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TERMS.map(t => (
            <button key={t} onClick={() => setSelTerm(t)} style={{
              padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: selTerm === t ? '#7c3aed' : '#f8fafc', color: selTerm === t ? '#fff' : '#1e293b',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {EXAM_TYPES.map(t => (
            <button key={t} onClick={() => setSelType(t)} style={{
              padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: selType === t ? '#0ea5e9' : '#f8fafc', color: selType === t ? '#fff' : '#1e293b',
            }}>{t.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Subjects', value: filtered.length, color: '#7c3aed' },
          { label: 'Average',  value: `${avg}%`,        color: avg >= 70 ? '#10b981' : avg >= 50 ? '#f59e0b' : '#ef4444' },
          { label: 'Best',     value: `${best}%`,        color: '#3b82f6' },
          { label: 'Class',    value: 'S4A',             color: '#64748b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading results…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>No results found for selected filters</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 3fr 80px', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 4 }}>
              {['Subject', 'Paper', 'Score', 'Grade'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {filtered.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 3fr 80px', gap: 12, padding: '10px 12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.subject ?? m.subjectName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{m.paper ?? 'P1'}</div>
                <ScoreBar score={m.score ?? m.percentage ?? 0} max={m.maxScore ?? 100} />
                <Badge color={gradeColor[m.grade] ?? 'gray'}>{m.grade}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
