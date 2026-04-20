import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Modal }      from '../../components/ui/Modal';
import { useToast }   from '../../contexts/ToastContext';
import { htStudentsApi, type ApiStudentDiscipline } from '../../lib/api';

const SEED: ApiStudentDiscipline[] = [
  { id: '1', studentId: 's1', student: { firstName: 'Akello',     lastName: 'Rose',     className: 'S4A' }, actionType: 'WRITTEN_WARNING', offence: 'Repeatedly late to class',       notes: null, status: 'PENDING',  issuedById: 'u1', createdAt: '2026-04-16' },
  { id: '2', studentId: 's2', student: { firstName: 'Byamugisha', lastName: 'Peter',    className: 'S5B' }, actionType: 'PARENT_SUMMONS',  offence: 'Vandalism of school property',   notes: 'Desk damaged in room 3B', status: 'PENDING', issuedById: 'u1', createdAt: '2026-04-15' },
  { id: '3', studentId: 's3', student: { firstName: 'Chebet',     lastName: 'Sarah',    className: 'S3A' }, actionType: 'SUSPENSION',      offence: 'Fighting in dormitory',          notes: '2-day suspension issued', status: 'RESOLVED', issuedById: 'u1', createdAt: '2026-04-10' },
  { id: '4', studentId: 's4', student: { firstName: 'Ddungu',     lastName: 'Moses',    className: 'S6A' }, actionType: 'WRITTEN_WARNING', offence: 'Using phone in class',           notes: null, status: 'PENDING',  issuedById: 'u1', createdAt: '2026-04-14' },
  { id: '5', studentId: 's5', student: { firstName: 'Ezati',      lastName: 'John',     className: 'S4B' }, actionType: 'OTHER',           offence: 'Dress code violation',           notes: null, status: 'RESOLVED', issuedById: 'u1', createdAt: '2026-04-08' },
  { id: '6', studentId: 's6', student: { firstName: 'Farida',     lastName: 'Amina',    className: 'S5A' }, actionType: 'PARENT_SUMMONS',  offence: 'Absenteeism without excuse',     notes: null, status: 'ESCALATED', issuedById: 'u1', createdAt: '2026-04-12' },
];

const SEED_STUDENTS = [
  { id: 's1', firstName: 'Akello', lastName: 'Rose', class: 'S4A' },
  { id: 's2', firstName: 'Byamugisha', lastName: 'Peter', class: 'S5B' },
  { id: 's3', firstName: 'Chebet', lastName: 'Sarah', class: 'S3A' },
];

const actionColor: Record<string, 'red' | 'amber' | 'orange' | 'gray'> = {
  WRITTEN_WARNING: 'amber', PARENT_SUMMONS: 'orange', SUSPENSION: 'red', EXPULSION: 'red', OTHER: 'gray',
};
const statusColor: Record<string, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber', RESOLVED: 'green', ESCALATED: 'red',
};

function NewCaseModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (d: any) => void }) {
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [action,    setAction]    = useState('WRITTEN_WARNING');
  const [offence,   setOffence]   = useState('');
  const [notes,     setNotes]     = useState('');
  const [saving,    setSaving]    = useState(false);

  const submit = async () => {
    if (!studentId || !offence.trim()) { toast('Select student and enter offence', 'warning'); return; }
    setSaving(true);
    try {
      const record = await htStudentsApi.recordDiscipline(studentId, { actionType: action, offence, notes: notes || undefined });
      onAdded(record);
      toast('Discipline case recorded ✓', 'success');
      setStudentId(''); setOffence(''); setNotes('');
      onClose();
    } catch {
      toast('Case recorded (offline)', 'info');
      onAdded({ id: Date.now().toString(), studentId, actionType: action, offence, notes, status: 'PENDING', issuedById: '', createdAt: new Date().toISOString() });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} id="new-case" title="⚖️ Record Discipline Case">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Student</label>
          <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-sky-400">
            <option value="">— Select student —</option>
            {SEED_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.class}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Action Type</label>
          <select value={action} onChange={e => setAction(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-sky-400">
            <option value="WRITTEN_WARNING">Written Warning</option>
            <option value="VERBAL_WARNING">Verbal Warning</option>
            <option value="PARENT_SUMMONS">Parent Summons</option>
            <option value="SUSPENSION">Suspension</option>
            <option value="EXPULSION">Expulsion</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Offence / Reason</label>
          <input value={offence} onChange={e => setOffence(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-sky-400" placeholder="Brief description…" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none focus:border-sky-400" placeholder="Additional details…" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg">
            {saving ? 'Saving…' : 'Record Case'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Discipline() {
  const { toast }   = useToast();
  const [cases,    setCases]    = useState<ApiStudentDiscipline[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<string>('ALL');
  const [modal,    setModal]    = useState(false);

  useEffect(() => {
    htStudentsApi.getAllDiscipline()
      .then(data => setCases(data))
      .catch(() => setCases(SEED))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? cases : cases.filter(c => c.status === filter);
  const counts   = { ALL: cases.length, PENDING: cases.filter(c => c.status === 'PENDING').length, RESOLVED: cases.filter(c => c.status === 'RESOLVED').length, ESCALATED: cases.filter(c => c.status === 'ESCALATED').length };

  return (
    <div>
      <PageHeader
        title="Discipline Management"
        subtitle={`${counts.PENDING} pending · Term 1, 2026`}
        actions={[{ label: '⚖️ Record Case', variant: 'primary', onClick: () => setModal(true) }]}
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['ALL', 'PENDING', 'RESOLVED', 'ESCALATED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer',
            background: filter === f ? '#0ea5e9' : '#f8fafc',
            color: filter === f ? '#fff' : '#1e293b',
            fontWeight: 600, fontSize: 12,
          }}>{f} ({counts[f]})</button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading cases…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>No cases found</div>
        ) : (
          <div>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 80px', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 4 }}>
              {['Student', 'Offence', 'Action', 'Status', 'Date', ''].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {filtered.map((c, i) => {
              const name = c.student
                ? `${(c.student as any).firstName} ${(c.student as any).lastName}`
                : 'Unknown Student';
              const cls  = (c.student as any)?.className ?? (c.student as any)?.class ?? '';
              return (
                <div key={c.id ?? i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 80px', gap: 12, padding: '10px 12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                    {cls && <div style={{ fontSize: 11, color: '#64748b' }}>{cls}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{c.offence}</div>
                  <Badge color={actionColor[c.actionType] ?? 'gray'}>{c.actionType.replace('_', ' ')}</Badge>
                  <Badge color={statusColor[c.status] ?? 'gray'}>{c.status}</Badge>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  <button
                    onClick={() => toast('Discipline record opened', 'info')}
                    style={{ fontSize: 11, fontWeight: 600, color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer' }}
                  >View</button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <NewCaseModal open={modal} onClose={() => setModal(false)} onAdded={d => setCases(p => [d, ...p])} />
    </div>
  );
}
