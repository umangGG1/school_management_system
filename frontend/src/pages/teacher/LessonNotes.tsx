import { useState, useEffect } from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { academicApi } from '../../lib/api';

type NoteStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED';

const statusColor = (s: NoteStatus) =>
  s === 'APPROVED' ? 'green' : s === 'SUBMITTED' ? 'blue' : s === 'RETURNED' ? 'red' : 'amber';
const statusLabel = (s: NoteStatus) =>
  s === 'APPROVED' ? 'Approved' : s === 'SUBMITTED' ? 'Submitted' : s === 'RETURNED' ? 'Returned' : 'Draft';
const typeColor = (t: string): 'blue' | 'purple' => t === 'SCHEME_OF_WORK' ? 'purple' : 'blue';
const typeLabel = (t: string) => t === 'SCHEME_OF_WORK' ? 'Scheme of Work' : 'Lesson Note';

const EMPTY_FORM = {
  classId: '', subjectId: '', topic: '', lessonDate: new Date().toISOString().slice(0, 10),
  term: 'Term 1', academicYear: '2025/2026', objectives: '', content: '', noteType: 'LESSON_NOTE',
};

export default function LessonNotes() {
  const { toast } = useToast();
  const [notes,    setNotes]    = useState<any[]>([]);
  const [classes,  setClasses]  = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [offline,  setOffline]  = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      academicApi.getLessonNotes().catch(() => null),
      academicApi.getClasses().catch(() => null),
      academicApi.getSubjects().catch(() => null),
    ]).then(([n, cls, subj]) => {
      if (n === null) { setOffline(true); }
      else setNotes(Array.isArray(n) ? n : []);
      if (Array.isArray(cls))  setClasses(cls);
      if (Array.isArray(subj)) setSubjects(subj);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmitForm = async () => {
    if (!form.classId || !form.subjectId || !form.topic.trim() || !form.objectives.trim() || !form.content.trim()) {
      toast('Fill in all required fields', 'warning'); return;
    }
    setSaving(true);
    try {
      await academicApi.createLessonNote(form);
      toast('Lesson note created ✓', 'success');
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      toast('Could not save — backend offline', 'warning');
    } finally { setSaving(false); }
  };

  const handleShare = async (id: string) => {
    try {
      await academicApi.submitLessonNote(id);
      toast('Note submitted for review ✓', 'success');
      load();
    } catch { toast('Could not submit', 'warning'); }
  };

  const total   = notes.length;
  const shared  = notes.filter(n => n.status === 'SUBMITTED' || n.status === 'APPROVED').length;
  const drafts  = notes.filter(n => n.status === 'DRAFT').length;
  const schemes = notes.filter(n => n.noteType === 'SCHEME_OF_WORK').length;

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';
  const className = (id: string) => classes.find(c => c.id === id)?.name ?? id;
  const subjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader
        title="Lesson Notes"
        subtitle="Manage and share lesson notes, schemes of work, and teaching resources"
        actions={[
          { label: '📄 Export All', onClick: () => toast('Notes exported', 'info') },
          { label: '➕ Add Note', variant: 'primary', onClick: () => setShowForm(true) },
        ]}
      />

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — no data available.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {([['Total Notes', total, '#2563eb'], ['Shared', shared, '#10b981'], ['Drafts', drafts, '#f59e0b'], ['Schemes', schemes, '#8b5cf6']] as [string, number, string][]).map(([l, v, c]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Add Note Form */}
      {showForm && (
        <Card>
          <div style={{ padding: '4px 0 16px', borderBottom: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>New Lesson Note</span>
            <Btn size="sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>✕ Cancel</Btn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Class *</div>
              <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <option value="">— Select class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Subject *</div>
              <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <option value="">— Select subject —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Type</div>
              <select value={form.noteType} onChange={e => setForm(f => ({ ...f, noteType: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <option value="LESSON_NOTE">Lesson Note</option>
                <option value="SCHEME_OF_WORK">Scheme of Work</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Topic *</div>
              <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                placeholder="e.g. Quadratics — Completing the Square"
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Lesson Date</div>
              <input type="date" value={form.lessonDate} onChange={e => setForm(f => ({ ...f, lessonDate: e.target.value }))}
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
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Learning Objectives *</div>
            <textarea value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
              rows={2} placeholder="By the end of this lesson, students will be able to…"
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Content / Notes *</div>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4} placeholder="Lesson content, teaching notes, examples…"
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn size="sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</Btn>
            <Btn size="sm" variant="primary" onClick={handleSubmitForm}>{saving ? 'Saving…' : '💾 Save Draft'}</Btn>
          </div>
        </Card>
      )}

      <Card>
        {loading && <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}

        {!loading && notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No lesson notes yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Click "Add Note" to create your first lesson note</div>
          </div>
        )}

        {!loading && notes.length > 0 && (
          <DataTable
            rows={notes}
            keyFn={r => r.id}
            columns={[
              { key: 'date',    header: 'Date',    render: r => <span style={{ color: '#64748b', fontSize: 11 }}>{fmt(r.lessonDate ?? r.createdAt)}</span> },
              { key: 'class',   header: 'Class',   render: r => <Badge color="blue">{className(r.classId)}</Badge> },
              { key: 'topic',   header: 'Topic',   render: r => <span style={{ fontWeight: 600 }}>{r.topic}</span> },
              { key: 'subject', header: 'Subject', render: r => <span style={{ fontSize: 11, color: '#64748b' }}>{subjectName(r.subjectId)}</span> },
              { key: 'type',    header: 'Type',    render: r => <Badge color={typeColor(r.noteType)}>{typeLabel(r.noteType)}</Badge> },
              { key: 'status',  header: 'Status',  render: r => <Badge color={statusColor(r.status)}>{statusLabel(r.status)}</Badge> },
              {
                key: 'actions', header: '',
                render: r => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" onClick={() => toast(`${r.topic}`, 'info')}>📖 View</Btn>
                    {r.status === 'DRAFT' && (
                      <Btn size="sm" variant="primary" onClick={() => handleShare(r.id)}>Share</Btn>
                    )}
                    <Btn size="sm" variant="secondary" onClick={() => toast('Edit coming soon', 'info')}>✏️ Edit</Btn>
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
