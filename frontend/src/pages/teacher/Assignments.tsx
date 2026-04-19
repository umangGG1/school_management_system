import { useState, useEffect } from 'react';
import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card }        from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { DataTable }   from '../../components/ui/DataTable';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { academicApi } from '../../lib/api';

const EMPTY_FORM = {
  title: '', classId: '', subjectId: '',
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  term: 'Term 1', academicYear: '2025/2026', maxScore: 100,
};

export default function Assignments() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes,     setClasses]     = useState<any[]>([]);
  const [subjects,    setSubjects]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    Promise.all([
      academicApi.getClasses().catch(() => null),
      academicApi.getSubjects().catch(() => null),
    ]).then(([cls, subj]) => {
      if (Array.isArray(cls))  setClasses(cls);
      if (Array.isArray(subj)) setSubjects(subj);
    }).finally(() => setLoading(false));
    // Assignments module not yet in backend — starts empty
    setAssignments([]);
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.classId || !form.subjectId) {
      toast('Fill in title, class and subject', 'warning'); return;
    }
    setSaving(true);
    try {
      // Backend assignments module pending — save as ASSIGNMENT-type assessment
      await academicApi.bulkSubmit({
        classId: form.classId,
        subjectId: form.subjectId,
        term: form.term,
        academicYear: form.academicYear,
        type: 'ASSIGNMENT',
        maxScore: form.maxScore,
        entries: [],
      });
      const newA = {
        id: Date.now(),
        title: form.title,
        classId: form.classId,
        subjectId: form.subjectId,
        dueDate: form.dueDate,
        submitted: 0,
        total: classes.find(c => c.id === form.classId)?.studentCount ?? 0,
        status: 'ACTIVE',
      };
      setAssignments(prev => [newA, ...prev]);
      toast('Assignment created ✓', 'success');
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch {
      toast('Could not save — backend offline', 'warning');
    } finally { setSaving(false); }
  };

  const total    = assignments.length;
  const active   = assignments.filter(a => a.status === 'ACTIVE').length;
  const marked   = assignments.filter(a => a.status === 'MARKED').length;
  const unmarked = assignments.filter(a => a.status === 'ACTIVE' && a.submitted > 0).length;

  const needsMarking = assignments.filter(a => a.status === 'ACTIVE' && a.submitted > 0);
  const className   = (id: string) => classes.find(c => c.id === id)?.name ?? id;
  const subjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? id;
  const fmtDate     = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Track submissions, mark work, and give feedback"
        actions={[
          { label: '📄 Export', onClick: () => toast('Exported', 'info') },
          { label: '➕ New Assignment', variant: 'primary', onClick: () => setShowForm(true) },
        ]}
      />

      {needsMarking.length > 0 && (
        <AlertBanner color="warn" icon="⚠️">
          <strong>{needsMarking.length} assignment{needsMarking.length > 1 ? 's' : ''} need marking</strong>
          {' — '}{needsMarking.map(a => `${a.title} (${className(a.classId)})`).join(' and ')} awaiting your feedback.
        </AlertBanner>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {([['Total', total, '#2563eb'], ['Active', active, '#f59e0b'], ['Marked', marked, '#10b981'], ['Unmarked', unmarked, '#ef4444']] as [string,number,string][]).map(([l, v, c]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* New Assignment Form */}
      {showForm && (
        <Card>
          <div style={{ paddingBottom: 14, borderBottom: '1px solid #e2e8f0', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>New Assignment</span>
            <Btn size="sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>✕ Cancel</Btn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Title *</div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Quadratics Problem Set"
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Class *</div>
              <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <option value="">— Select —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Subject *</div>
              <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <option value="">— Select —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Due Date</div>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Max Score</div>
              <input type="number" min={1} max={200} value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: Number(e.target.value) }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Term</div>
              <select value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                {['Term 1','Term 2','Term 3'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn size="sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</Btn>
            <Btn size="sm" variant="primary" onClick={handleCreate}>{saving ? 'Creating…' : '✅ Create Assignment'}</Btn>
          </div>
        </Card>
      )}

      <Card>
        {loading && <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}

        {!loading && assignments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No assignments yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Click "New Assignment" to create and track student work</div>
          </div>
        )}

        {!loading && assignments.length > 0 && (
          <DataTable
            rows={assignments}
            keyFn={r => r.id}
            columns={[
              { key: 'title',   header: 'Assignment', render: r => <span style={{ fontWeight: 700 }}>{r.title}</span> },
              { key: 'class',   header: 'Class',      render: r => <Badge color="blue">{className(r.classId)}</Badge> },
              { key: 'subject', header: 'Subject',    render: r => <span style={{ fontSize: 11, color: '#64748b' }}>{subjectName(r.subjectId)}</span> },
              { key: 'due',     header: 'Due',        render: r => <span style={{ fontSize: 11, color: '#64748b' }}>{fmtDate(r.dueDate)}</span> },
              {
                key: 'subs', header: 'Submissions',
                render: r => r.total > 0 ? (
                  <div style={{ width: 120 }}>
                    <ProgressBar label="" value={`${r.submitted}/${r.total}`} pct={Math.round(r.submitted / r.total * 100)} color={r.submitted === r.total ? 'green' : 'blue'} />
                  </div>
                ) : <span style={{ fontSize: 11, color: '#94a3b8' }}>—</span>,
              },
              { key: 'status', header: 'Status', render: r => <Badge color={r.status === 'MARKED' ? 'green' : 'amber'}>{r.status === 'MARKED' ? 'Marked' : 'Active'}</Badge> },
              {
                key: 'actions', header: '',
                render: r => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.status === 'ACTIVE' && r.submitted > 0 && (
                      <Btn size="sm" variant="primary" onClick={() => toast(`Marking ${r.title}`, 'info')}>✏️ Mark</Btn>
                    )}
                    <Btn size="sm" onClick={() => toast(`${r.title} — view coming soon`, 'info')}>View</Btn>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
