import { useState, useEffect } from 'react';
import { useNavigate }   from 'react-router-dom';
import { PageHeader }    from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }         from '../../components/ui/Badge';
import { Btn }           from '../../components/ui/Btn';
import { ProgressBar }   from '../../components/ui/ProgressBar';
import { academicApi, htReportsApi } from '../../lib/api';

const TODAY_DOW = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][new Date().getDay()];

function classStatus(startTime: string, endTime: string, dayOfWeek: string): 'Done' | 'Now' | 'Upcoming' | 'Other Day' {
  if (dayOfWeek !== TODAY_DOW) return 'Other Day';
  const now   = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0);
  const end   = new Date(now); end.setHours(eh, em, 0);
  if (now > end)    return 'Done';
  if (now >= start) return 'Now';
  return 'Upcoming';
}

function statusColor(s: string): 'green' | 'blue' | 'gray' {
  return s === 'Done' ? 'green' : s === 'Now' ? 'blue' : 'gray';
}

export default function MyClasses() {
  const navigate = useNavigate();
  const [classes,  setClasses]  = useState<any[]>([]);
  const [perfMap,  setPerfMap]  = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [offline,  setOffline]  = useState(false);

  useEffect(() => {
    Promise.all([
      academicApi.getTimetable().catch(() => null),
      htReportsApi.academic({ term: 'Term 1', academicYear: '2026' }).catch(() => null),
    ]).then(([timetable, report]) => {
      if (timetable === null && report === null) { setOffline(true); setLoading(false); return; }

      // Build performance lookup by classId
      if (report?.performanceByClass) {
        const map: Record<string, any> = {};
        for (const p of report.performanceByClass) map[p.classId] = p;
        setPerfMap(map);
      }

      // Deduplicate classes from timetable
      if (Array.isArray(timetable)) {
        const seen = new Set<string>();
        const unique: any[] = [];
        for (const e of timetable) {
          const cId = e.classId ?? e.class?.id;
          if (!cId || seen.has(cId)) continue;
          seen.add(cId);
          unique.push({
            id:        cId,
            code:      e.class?.name ?? cId,
            subject:   e.subject?.name ?? '—',
            room:      e.room ?? '—',
            students:  e.class?.studentCount ?? 0,
            startTime: e.startTime,
            endTime:   e.endTime,
            dayOfWeek: e.dayOfWeek,
            period:    `${e.startTime}–${e.endTime}`,
          });
        }
        setClasses(unique);
      }
    }).finally(() => setLoading(false));
  }, []);

  const totalStudents = classes.reduce((a, c) => a + (c.students ?? 0), 0);
  const selectedClass = classes.find(c => c.id === selected);

  return (
    <div>
      <PageHeader
        title="My Classes"
        subtitle={loading ? 'Loading…' : `${classes.length} classes this term · ${totalStudents} total students`}
      />

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — no timetable data.
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>Loading…</div>
      )}

      {!loading && classes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No classes assigned yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Timetable entries will appear here once added by the Deputy HM</div>
        </div>
      )}

      {!loading && classes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
          {classes.map(c => {
            const perf   = perfMap[c.id];
            const att    = perf?.attendanceRate ?? 0;
            const pass   = perf?.passRate ?? 0;
            const status = classStatus(c.startTime, c.endTime, c.dayOfWeek);
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c.id === selected ? null : c.id)}
                style={{
                  background: '#fff', borderRadius: 12,
                  border: `2px solid ${c.id === selected ? '#2563eb' : '#e2e8f0'}`,
                  padding: 18, cursor: 'pointer', transition: 'all .2s',
                  boxShadow: c.id === selected ? '0 0 0 3px #bfdbfe' : '0 1px 3px rgba(0,0,0,.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb' }}>{c.code}</div>
                  {status !== 'Other Day' && <Badge color={statusColor(status)}>{status}</Badge>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{c.subject}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                  {c.room} · {c.dayOfWeek.charAt(0) + c.dayOfWeek.slice(1).toLowerCase()} {c.period}
                  {c.students > 0 ? ` · ${c.students} students` : ''}
                </div>
                {att > 0 && (
                  <ProgressBar label="Attendance" value={`${att}%`} pct={att} color={att >= 85 ? 'green' : 'amber'} />
                )}
                {pass > 0
                  ? <ProgressBar label="Class pass rate" value={`${pass}%`} pct={pass} color={pass >= 75 ? 'green' : pass >= 60 ? 'blue' : 'amber'} />
                  : <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>No marks submitted yet</div>
                }
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  <Btn size="sm" variant="primary" onClick={e => { e.stopPropagation(); navigate('/teacher/marks'); }}>📊 Marks</Btn>
                  <Btn size="sm" onClick={e => { e.stopPropagation(); navigate('/teacher/attendance'); }}>✅ Attendance</Btn>
                  <Btn size="sm" onClick={e => { e.stopPropagation(); navigate('/teacher/notes'); }}>📝 Notes</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedClass && (
        <Card>
          <CardHeader title={`${selectedClass.code} — ${selectedClass.subject} · Detailed View`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              ['Students',  String(selectedClass.students || '—')],
              ['Period',    selectedClass.period],
              ['Room',      selectedClass.room],
              ['Pass Rate', perfMap[selectedClass.id]?.passRate ? `${perfMap[selectedClass.id].passRate}%` : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>{v}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
