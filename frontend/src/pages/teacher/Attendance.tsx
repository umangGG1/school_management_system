import { useState, useEffect, useCallback } from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { academicApi, htStudentsApi } from '../../lib/api';

type AttStatus = 'PRESENT' | 'ABSENT' | 'LATE';
interface AttRow { studentId: string; name: string; reg: string; status: AttStatus; }

const statusColor = { PRESENT: 'green', ABSENT: 'red', LATE: 'amber' } as const;
const statusLabel = { PRESENT: 'present', ABSENT: 'absent', LATE: 'late' } as const;

const TODAY = new Date().toISOString().slice(0, 10);
const TODAY_LABEL = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

export default function Attendance() {
  const { toast } = useToast();

  const [classes,   setClasses]   = useState<any[]>([]);
  const [classId,   setClassId]   = useState('');
  const [rows,      setRows]      = useState<AttRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [offline,   setOffline]   = useState(false);
  const [date]                    = useState(TODAY);

  /* load classes once */
  useEffect(() => {
    academicApi.getClasses().then(cls => {
      if (cls === null) { setOffline(true); setLoading(false); return; }
      if (Array.isArray(cls)) {
        setClasses(cls);
        if (cls.length) setClassId(cls[0].id);
        else setLoading(false);
      }
    }).catch(() => { setOffline(true); setLoading(false); });
  }, []);

  /* load students + existing attendance when class changes */
  const loadRegister = useCallback(async (cId: string) => {
    if (!cId) return;
    setLoading(true);
    try {
      const [studentsRes, attRes] = await Promise.all([
        htStudentsApi.list(1, 200).catch(() => null),
        academicApi.getClassAttendance(cId).catch(() => null),
      ]);

      // existing attendance map: studentId → status
      const attMap: Record<string, AttStatus> = {};
      if (Array.isArray(attRes)) {
        for (const a of attRes) {
          if (a.date === date || !a.date) attMap[a.studentId] = a.status;
        }
      }

      const classStudents = Array.isArray(studentsRes?.data)
        ? studentsRes.data.filter((s: any) => s.classId === cId)
        : [];

      setRows(classStudents.map((s: any) => ({
        studentId: s.id,
        name:      `${s.firstName} ${s.lastName}`,
        reg:       s.admissionNumber ?? s.regNumber ?? '—',
        status:    attMap[s.id] ?? 'PRESENT',
      })));
    } finally { setLoading(false); }
  }, [date]);

  useEffect(() => { if (classId) loadRegister(classId); }, [classId]);

  const toggle = (idx: number) => {
    setRows(r => r.map((row, i) => i !== idx ? row : {
      ...row,
      status: row.status === 'PRESENT' ? 'ABSENT' : row.status === 'ABSENT' ? 'LATE' : 'PRESENT',
    }));
  };

  const handleSave = async () => {
    if (!classId || rows.length === 0) { toast('No data to save', 'warning'); return; }
    setSaving(true);
    try {
      await academicApi.markAttendance({
        classId,
        date,
        entries: rows.map(r => ({ studentId: r.studentId, status: r.status })),
      });
      toast(`Attendance saved for ${rows.length} students ✓`, 'success');
    } catch {
      toast('Could not save — backend offline', 'warning');
    } finally { setSaving(false); }
  };

  const present = rows.filter(r => r.status === 'PRESENT').length;
  const absent  = rows.filter(r => r.status === 'ABSENT').length;
  const late    = rows.filter(r => r.status === 'LATE').length;
  const pct     = rows.length ? Math.round((present / rows.length) * 100) : 0;
  const selectedClass = classes.find(c => c.id === classId);

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle={`${selectedClass?.name ?? '—'} · ${TODAY_LABEL}`}
        actions={[{ label: saving ? 'Saving…' : '💾 Save Attendance', variant: 'primary', onClick: handleSave }]}
      />

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — no data available.
        </div>
      )}

      {/* Class tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {classes.map(c => (
          <button key={c.id} onClick={() => setClassId(c.id)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: c.id === classId ? '#2563eb' : '#f8fafc',
            color: c.id === classId ? '#fff' : '#1e293b',
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}>{c.name}</button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {([
          ['✅ Present', present, '#10b981'],
          ['❌ Absent',  absent,  '#ef4444'],
          ['⏰ Late',    late,    '#f59e0b'],
          [`${pct}%`,   'Rate',  '#2563eb'],
        ] as [string, number|string, string][]).map(([l, v, c]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title={`${selectedClass?.name ?? '—'} — Register · ${TODAY_LABEL}`}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn size="sm" onClick={() => setRows(r => r.map(row => ({ ...row, status: 'PRESENT' })))}>
                Mark All Present
              </Btn>
              <Btn size="sm" variant="danger" onClick={() => toast('Attendance exported', 'info')}>
                📄 Export
              </Btn>
            </div>
          }
        />

        {loading && <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}

        {!loading && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {classes.length === 0 ? 'No classes set up yet' : 'No students in this class'}
            </div>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <DataTable
            rows={rows}
            keyFn={(_, i) => i}
            columns={[
              { key: 'idx',  header: '#',       render: (_, i) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{i + 1}</span>, width: '40px' },
              { key: 'name', header: 'Student', render: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
              { key: 'reg',  header: 'Reg No',  render: r => <span style={{ color: '#64748b', fontSize: 11 }}>{r.reg}</span> },
              {
                key: 'status', header: 'Status',
                render: (r, i) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge color={statusColor[r.status]}>{statusLabel[r.status]}</Badge>
                    <Btn size="sm" onClick={() => toggle(i)}>Toggle</Btn>
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
