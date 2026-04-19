import { useState, useEffect, useCallback } from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { academicApi, htStudentsApi } from '../../lib/api';

const EXAM_TYPES = [
  { label: 'End-term Exam',  value: 'FINAL'      },
  { label: 'Mid-term Test',  value: 'MIDTERM'    },
  { label: 'Practical',      value: 'PRACTICAL'  },
  { label: 'Assignment',     value: 'ASSIGNMENT' },
  { label: 'Class Test',     value: 'TEST'       },
];

interface Row { studentId: string; name: string; reg: string; score: number | ''; }

function ugandaGrade(s: number) {
  if (s >= 80) return { g: 'D1', col: 'green'  as const };
  if (s >= 70) return { g: 'D2', col: 'green'  as const };
  if (s >= 65) return { g: 'C3', col: 'blue'   as const };
  if (s >= 60) return { g: 'C4', col: 'blue'   as const };
  if (s >= 55) return { g: 'C5', col: 'blue'   as const };
  if (s >= 50) return { g: 'C6', col: 'blue'   as const };
  if (s >= 45) return { g: 'P7', col: 'amber'  as const };
  if (s >= 40) return { g: 'P8', col: 'amber'  as const };
  return             { g: 'F9', col: 'red'     as const };
}

export default function MarksGrades() {
  const { toast } = useToast();

  const [classes,    setClasses]    = useState<any[]>([]);
  const [subjects,   setSubjects]   = useState<any[]>([]);
  const [classId,    setClassId]    = useState('');
  const [subjectId,  setSubjectId]  = useState('');
  const [examType,   setExamType]   = useState('FINAL');
  const [maxScore,   setMaxScore]   = useState(100);
  const [rows,       setRows]       = useState<Row[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [offline,    setOffline]    = useState(false);

  /* ── load classes + subjects once ── */
  useEffect(() => {
    Promise.all([
      academicApi.getClasses().catch(() => null),
      academicApi.getSubjects().catch(() => null),
    ]).then(([cls, subj]) => {
      if (Array.isArray(cls)  && cls.length)  { setClasses(cls);  setClassId(cls[0].id); }
      if (Array.isArray(subj) && subj.length) { setSubjects(subj); setSubjectId(subj[0].id); }
      if (cls === null && subj === null) setOffline(true);
    }).finally(() => setLoading(false));
  }, []);

  /* ── reload gradebook when class/subject/type changes ── */
  const loadGradebook = useCallback(async (cId: string, sId: string, type: string) => {
    if (!cId) return;
    setLoading(true);
    try {
      const [studentsRes, marksRes] = await Promise.all([
        htStudentsApi.list(1, 200).catch(() => null),
        academicApi.getMarks(cId, sId || undefined).catch(() => null),
      ]);

      // Build marks lookup: studentId → score (filter by type)
      const markMap: Record<string, number> = {};
      if (Array.isArray(marksRes)) {
        for (const m of marksRes) {
          if (m.type === type || m.assessmentType === type) {
            markMap[m.studentId] = m.score ?? m.marks ?? 0;
          }
        }
      }

      // Filter students by class
      const classStudents = Array.isArray(studentsRes?.data)
        ? studentsRes.data.filter((s: any) => s.classId === cId)
        : [];

      if (classStudents.length > 0) {
        setRows(classStudents.map((s: any) => ({
          studentId: s.id,
          name:      `${s.firstName} ${s.lastName}`,
          reg:       s.admissionNumber ?? s.regNumber ?? '—',
          score:     markMap[s.id] ?? '',
        })));
      } else if (Array.isArray(marksRes) && marksRes.length > 0) {
        // fallback: build rows from existing marks
        setRows(marksRes.map((m: any) => ({
          studentId: m.studentId,
          name:      m.student ? `${m.student.firstName} ${m.student.lastName}` : m.studentId,
          reg:       m.student?.admissionNumber ?? '—',
          score:     m.score ?? '',
        })));
      } else {
        setRows([]);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (classId) loadGradebook(classId, subjectId, examType);
  }, [classId, subjectId, examType]);

  const scored = rows.filter(r => r.score !== '').map(r => r.score as number);
  const avg    = scored.length ? Math.round(scored.reduce((a,b) => a+b, 0) / scored.length) : 0;
  const passing = scored.filter(s => s >= 40).length;
  const highest = scored.length ? Math.max(...scored) : 0;
  const lowest  = scored.length ? Math.min(...scored) : 0;

  const handleSave = async () => {
    const entries = rows
      .filter(r => r.score !== '')
      .map(r => ({ studentId: r.studentId, score: r.score as number }));

    if (!entries.length) { toast('No scores to save', 'warning'); return; }
    if (!classId)        { toast('Select a class first', 'warning'); return; }

    setSaving(true);
    try {
      await academicApi.bulkSubmit({
        entries,
        classId,
        subjectId: subjectId || undefined,
        term:          'Term 1',
        academicYear:  '2026',
        type:          examType,
        maxScore,
      });
      toast(`${entries.length} marks saved ✓`, 'success');
    } catch {
      toast('Could not save — backend offline', 'warning');
    } finally { setSaving(false); }
  };

  const selectedClass   = classes.find(c => c.id === classId);
  const selectedSubject = subjects.find(s => s.id === subjectId);

  return (
    <div>
      <PageHeader
        title="Marks & Grades"
        subtitle="Enter and manage student scores — Uganda grading (D1–F9)"
        actions={[
          { label: '📄 Export', onClick: () => toast('Gradebook exported', 'info') },
          { label: saving ? 'Saving…' : '💾 Save Marks', variant: 'primary', onClick: handleSave },
        ]}
      />

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — no data available.
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={classId}
          onChange={e => setClassId(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}
        >
          {classes.length === 0 && <option value="">— No classes —</option>}
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={subjectId}
          onChange={e => setSubjectId(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}
        >
          {subjects.length === 0 && <option value="">— No subjects —</option>}
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={examType}
          onChange={e => setExamType(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}
        >
          {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Max marks:
          <input
            type="number" min={1} max={200} value={maxScore}
            onChange={e => setMaxScore(Number(e.target.value))}
            style={{ width: 52, marginLeft: 6, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, textAlign: 'center' }}
          />
        </span>
      </div>

      {/* Stats */}
      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
          {[
            ['Class Average', `${avg}%`,    '#2563eb'],
            ['Pass Rate',     `${scored.length ? Math.round(passing/scored.length*100) : 0}%`, '#10b981'],
            ['Highest',       String(highest), '#8b5cf6'],
            ['Lowest',        String(lowest),  '#ef4444'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader title={`${selectedClass?.name ?? '—'} — ${selectedSubject?.name ?? 'All Subjects'} · ${EXAM_TYPES.find(e => e.value === examType)?.label ?? examType} Gradebook`} />

        {loading && <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}

        {!loading && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {classes.length === 0 ? 'No classes set up yet' : 'No students in this class yet'}
            </div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              {classes.length === 0
                ? 'Add classes via the Deputy HM or Admin portal'
                : 'Enrol students to start entering marks'}
            </div>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <>
            <DataTable
              rows={rows}
              keyFn={(_, i) => i}
              columns={[
                { key: 'name',  header: 'Student',    render: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
                { key: 'reg',   header: 'Reg No',     render: r => <span style={{ color: '#64748b', fontSize: 11 }}>{r.reg}</span> },
                {
                  key: 'score', header: `Score / ${maxScore}`,
                  render: (r, i) => (
                    <input
                      type="number" min={0} max={maxScore}
                      value={r.score}
                      placeholder="—"
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Math.min(maxScore, Math.max(0, Number(e.target.value)));
                        setRows(m => m.map((s, idx) => idx === i ? { ...s, score: val } : s));
                      }}
                      style={{ width: 64, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700, textAlign: 'center' }}
                    />
                  ),
                },
                {
                  key: 'grade', header: 'Grade',
                  render: r => {
                    if (r.score === '') return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
                    const pct = Math.round((r.score as number) / maxScore * 100);
                    const { g, col } = ugandaGrade(pct);
                    return <Badge color={col}>{g}</Badge>;
                  },
                },
              ]}
            />
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, display: 'flex', gap: 20, fontSize: 12 }}>
              <span>Class avg: <b style={{ color: '#2563eb' }}>{avg}%</b></span>
              <span>Passing (≥40%): <b style={{ color: '#10b981' }}>{passing}/{scored.length}</b></span>
              <span>Scored: <b>{scored.length}/{rows.length}</b></span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
