import { useState, useEffect } from 'react';
import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card }        from '../../components/ui/Card';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Btn }         from '../../components/ui/Btn';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { academicApi, hodApi } from '../../lib/api';

function unitStatus(pct: number): 'Done' | 'In Progress' | 'Not Started' {
  if (pct >= 100) return 'Done';
  if (pct > 0)    return 'In Progress';
  return 'Not Started';
}
function unitColor(s: string): 'green' | 'blue' | 'gray' {
  return s === 'Done' ? 'green' : s === 'In Progress' ? 'blue' : 'gray';
}
function barColor(pct: number): 'green' | 'blue' | 'amber' | 'red' {
  if (pct === 100) return 'green';
  if (pct >= 50)   return 'blue';
  if (pct > 0)     return 'amber';
  return 'red';
}

export default function CurriculumCoverage() {
  const { toast } = useToast();
  const [records,  setRecords]  = useState<any[]>([]);
  const [classes,  setClasses]  = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [offline,  setOffline]  = useState(false);
  const [editing,  setEditing]  = useState<Record<string, { planned: number; covered: number }>>({});
  const [saving,   setSaving]   = useState<string | null>(null);

  // Filter state
  const [selClass,   setSelClass]   = useState('');
  const [selSubject, setSelSubject] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      hodApi.getSyllabus().catch(() => null),
      academicApi.getClasses().catch(() => null),
      academicApi.getSubjects().catch(() => null),
    ]).then(([recs, cls, subj]) => {
      if (recs === null) setOffline(true);
      else setRecords(Array.isArray(recs) ? recs : []);
      if (Array.isArray(cls))  { setClasses(cls);  if (cls.length) setSelClass(cls[0].id); }
      if (Array.isArray(subj)) { setSubjects(subj); if (subj.length) setSelSubject(subj[0].id); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (rec: any) => {
    const key = rec.id ?? `${rec.subjectId}-${rec.classId}`;
    const edit = editing[key];
    if (!edit) return;
    setSaving(key);
    try {
      await hodApi.updateSyllabus({
        subjectId: rec.subjectId,
        classId:   rec.classId,
        termId:    rec.termId ?? 'Term 1',
        topicsPlanned: edit.planned,
        topicsCovered: edit.covered,
      });
      toast('Coverage updated ✓', 'success');
      setEditing(e => { const n = { ...e }; delete n[key]; return n; });
      load();
    } catch { toast('Could not save', 'warning'); }
    finally { setSaving(null); }
  };

  const handleAddRecord = async () => {
    if (!selClass || !selSubject) { toast('Select class and subject', 'warning'); return; }
    setSaving('new');
    try {
      await hodApi.updateSyllabus({
        subjectId: selSubject, classId: selClass,
        termId: 'Term 1', topicsPlanned: 10, topicsCovered: 0,
      });
      toast('Coverage record added ✓', 'success');
      load();
    } catch { toast('Could not add record', 'warning'); }
    finally { setSaving(null); }
  };

  const className   = (id: string) => classes.find(c => c.id === id)?.name ?? id;
  const subjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? id;

  const overall = records.length
    ? Math.round(records.reduce((a, r) => a + Number(r.coveragePercent ?? 0), 0) / records.length)
    : 0;
  const done    = records.filter(r => Number(r.coveragePercent) >= 100).length;

  return (
    <div>
      <PageHeader
        title="Curriculum Coverage"
        subtitle={`${records.length} subject records · Term 1`}
        actions={[
          { label: '📤 Submit Report to HOD', variant: 'primary', onClick: () => toast('Coverage report submitted to HOD ✓', 'success') },
          { label: '📄 Export', onClick: () => toast('Report exported', 'info') },
        ]}
      />

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — no data available.
        </div>
      )}

      {!offline && !loading && overall < 75 && records.length > 0 && (
        <AlertBanner color="warn" icon="⚠️">
          Overall syllabus coverage is <strong>{overall}%</strong>. Target is 75% by end of Week 8.{' '}
          {records.filter(r => Number(r.coveragePercent) === 0).length} subject{records.filter(r => Number(r.coveragePercent) === 0).length !== 1 ? 's' : ''} not yet started.
        </AlertBanner>
      )}

      {/* Overall card */}
      {records.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 18, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📈 Overall Syllabus Coverage</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: overall >= 75 ? '#10b981' : '#f59e0b' }}>{overall}%</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Term 1 target: 75%</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{done} of {records.length} subjects completed</div>
            </div>
          </div>
          <div style={{ height: 12, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overall}%`, background: overall >= 75 ? '#10b981' : '#f59e0b', borderRadius: 10, transition: 'width .4s' }} />
          </div>
        </div>
      )}

      {/* Unit breakdown */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📚 Unit-by-Unit Progress</div>

        {loading && <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}

        {!loading && records.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No coverage records yet</div>
            <div style={{ fontSize: 11, marginTop: 4, marginBottom: 16 }}>Add your first subject coverage record below</div>
          </div>
        )}

        {!loading && records.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            {records.map(r => {
              const pct    = Number(r.coveragePercent ?? 0);
              const status = unitStatus(pct);
              const key    = r.id ?? `${r.subjectId}-${r.classId}`;
              const edit   = editing[key];
              return (
                <div key={key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      {subjectName(r.subjectId)}
                      <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 6 }}>· {className(r.classId)}</span>
                    </div>
                    {edit ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Covered:</span>
                        <input type="number" min={0} max={edit.planned} value={edit.covered}
                          onChange={e => setEditing(ed => ({ ...ed, [key]: { ...ed[key], covered: Number(e.target.value) } }))}
                          style={{ width: 52, padding: '3px 6px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, textAlign: 'center' }} />
                        <span style={{ fontSize: 11, color: '#64748b' }}>/ Planned:</span>
                        <input type="number" min={1} value={edit.planned}
                          onChange={e => setEditing(ed => ({ ...ed, [key]: { ...ed[key], planned: Number(e.target.value) } }))}
                          style={{ width: 52, padding: '3px 6px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, textAlign: 'center' }} />
                        <Btn size="sm" variant="primary" onClick={() => handleUpdate(r)}>{saving === key ? '…' : '✓ Save'}</Btn>
                        <Btn size="sm" onClick={() => setEditing(e => { const n = { ...e }; delete n[key]; return n; })}>✕</Btn>
                      </div>
                    ) : (
                      <ProgressBar label="" value={`${pct}%`} pct={pct} color={barColor(pct)} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {r.topicsCovered ?? 0}/{r.topicsPlanned ?? 0} topics
                  </div>
                  <Badge color={unitColor(status)}>{status}</Badge>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Btn size="sm" onClick={() => setEditing(e => ({ ...e, [key]: { planned: r.topicsPlanned ?? 10, covered: r.topicsCovered ?? 0 } }))}>
                      ✏️ Update
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new record */}
        {!loading && !offline && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Add subject:</span>
            <select value={selClass} onChange={e => setSelClass(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selSubject} onChange={e => setSelSubject(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Btn size="sm" variant="primary" onClick={handleAddRecord}>{saving === 'new' ? 'Adding…' : '➕ Add'}</Btn>
          </div>
        )}
      </Card>
    </div>
  );
}
