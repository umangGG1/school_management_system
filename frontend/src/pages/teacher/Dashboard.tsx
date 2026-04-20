import { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { StatCard }     from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }          from '../../components/ui/Btn';
import { Badge }        from '../../components/ui/Badge';
import { ProgressBar }  from '../../components/ui/ProgressBar';
import { useAuth }      from '../../contexts/AuthContext';
import { academicApi, htReportsApi } from '../../lib/api';

/* ─── Seed fallback (only when completely offline) ─────────── */
const SEED_CLASSES = [
  { id: 's1', code: 'S4A', subject: 'Mathematics',         room: 'Room 12', students: 42, startTime: '07:30', endTime: '08:20', dayOfWeek: 'MONDAY', status: 'Done',     attendance: 95 },
  { id: 's2', code: 'S5A', subject: 'Mathematics',         room: 'Room 08', students: 38, startTime: '08:20', endTime: '09:10', dayOfWeek: 'MONDAY', status: 'Done',     attendance: 89 },
  { id: 's3', code: 'S3B', subject: 'Mathematics',         room: 'Room 15', students: 44, startTime: '10:30', endTime: '11:20', dayOfWeek: 'MONDAY', status: 'Now',      attendance: 93 },
  { id: 's4', code: 'S6A', subject: 'Further Mathematics', room: 'Room 12', students: 28, startTime: '13:00', endTime: '13:50', dayOfWeek: 'MONDAY', status: 'Upcoming', attendance: 0  },
  { id: 's5', code: 'S4B', subject: 'Mathematics',         room: 'Room 09', students: 40, startTime: '14:00', endTime: '14:50', dayOfWeek: 'MONDAY', status: 'Upcoming', attendance: 0  },
];
const SEED_PERF = [
  { cls: 'S4A — Maths', pct: 86 },
  { cls: 'S5A — Maths', pct: 74 },
  { cls: 'S3B — Maths', pct: 69 },
  { cls: 'S6A — Further Maths', pct: 79 },
];

/* ─── Helpers ───────────────────────────────────────────────── */
const TODAY_DOW = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][new Date().getDay()];
const TODAY_LABEL = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function statusBadgeColor(s: string): 'green' | 'blue' | 'gray' {
  return s === 'Done' ? 'green' : s === 'Now' ? 'blue' : 'gray';
}

function classStatus(startTime: string, endTime: string): 'Done' | 'Now' | 'Upcoming' {
  const now   = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0);
  const end   = new Date(now); end.setHours(eh, em, 0);
  if (now > end)   return 'Done';
  if (now >= start) return 'Now';
  return 'Upcoming';
}

export default function TeacherDashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [todayClasses, setTodayClasses] = useState<any[] | null>(null);
  const [perf,         setPerf]         = useState<any[] | null>(null);
  const [pendingMarks, setPendingMarks] = useState<number | null>(null);
  const [offline,      setOffline]      = useState(false);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      academicApi.getTimetable().catch(() => null),
      htReportsApi.academic({ term: 'Term 1', academicYear: '2026' }).catch(() => null),
      academicApi.getMarks().catch(() => null),
    ]).then(([timetable, report, marks]) => {
      const allFailed = timetable === null && report === null;
      setOffline(allFailed);

      if (Array.isArray(timetable)) {
        const todayEntries = timetable
          .filter((e: any) => e.dayOfWeek === TODAY_DOW)
          .map((e: any) => ({
            id:        e.id,
            code:      e.class?.name ?? e.classId ?? '—',
            subject:   e.subject?.name ?? '—',
            room:      e.room ?? '—',
            students:  e.class?.studentCount ?? 0,
            startTime: e.startTime,
            endTime:   e.endTime,
            dayOfWeek: e.dayOfWeek,
            status:    classStatus(e.startTime, e.endTime),
            attendance: 0,
          }));
        setTodayClasses(todayEntries);
      }

      if (report?.performanceByClass) {
        setPerf(report.performanceByClass.map((c: any) => ({
          cls: c.className,
          pct: c.avgScore ?? 0,
        })));
      } else if (report !== null) {
        setPerf([]);
      }

      if (Array.isArray(marks)) {
        // count entries where score is null (ungraded)
        const ungraded = marks.filter((m: any) => m.score == null).length;
        setPendingMarks(ungraded);
      }
    }).finally(() => setLoading(false));
  }, []);

  const displayClasses = offline ? SEED_CLASSES : (todayClasses ?? []);
  const displayPerf    = offline ? SEED_PERF    : (perf ?? []);
  const displayPending = pendingMarks ?? (offline ? 2 : 0);

  const nameParts = (user?.name ?? '').split(' ');
  const firstName = nameParts[0] ?? 'Teacher';
  const displayName = user?.name ?? 'Teacher';

  return (
    <div>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 55%,#7c3aed 100%)',
        borderRadius: 12, padding: '20px 24px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{greeting()}, {displayName} 👋</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 3, marginBottom: 10 }}>
            {TODAY_LABEL}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {loading
              ? <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>Loading…</span>
              : <>
                  <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>📚 {displayClasses.length} classes today</span>
                  {displayPending > 0 && <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>⚠️ {displayPending} assignments to mark</span>}
                </>
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {[
            [loading ? '…' : String(displayClasses.length),  'Classes Today'],
            [loading ? '…' : String(displayPending),          'Pending Marks'],
          ].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <Btn variant="primary" onClick={() => navigate('/teacher/attendance')}>✅ Take Attendance</Btn>
        <Btn onClick={() => navigate('/teacher/marks')}>📊 Enter Marks</Btn>
        <Btn onClick={() => navigate('/teacher/notes')}>📝 Add Lesson Note</Btn>
        <Btn onClick={() => navigate('/teacher/assignments')}>📋 New Assignment</Btn>
        <Btn variant="dark" onClick={() => navigate('/teacher/communications')}>💬 Message Student</Btn>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard icon="📚" value={loading ? '…' : displayClasses.length}   title="Classes Today"      accent="blue"   onClick={() => navigate('/teacher/classes')} />
        <StatCard icon="📋" value={loading ? '…' : displayPending}           title="Assignments to Mark" accent="amber"  onClick={() => navigate('/teacher/assignments')} />
        <StatCard icon="📊" value={loading ? '…' : displayPerf.length > 0 ? `${Math.round(displayPerf.reduce((s,c)=>s+c.pct,0)/displayPerf.length)}%` : '—'} title="Avg. Performance" accent="green" onClick={() => navigate('/teacher/marks')} />
        <StatCard icon="📈" value={loading ? '…' : `${displayClasses.filter(c=>c.status==='Done').length}/${displayClasses.length}`} title="Classes Done Today" accent="purple" onClick={() => navigate('/teacher/classes')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Today's classes */}
        <Card>
          <CardHeader
            title={`🗓️ Today's Classes — ${TODAY_LABEL}`}
            action={<Btn size="sm" onClick={() => navigate('/teacher/classes')}>All classes →</Btn>}
          />
          {loading && <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}
          {!loading && displayClasses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>No classes scheduled today</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Add timetable entries to see your schedule here</div>
            </div>
          )}
          {!loading && displayClasses.map(cls => (
            <div key={cls.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{cls.code} — {cls.subject}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{cls.room} · {cls.students} students · {cls.startTime}–{cls.endTime}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {cls.attendance > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: cls.attendance >= 85 ? '#10b981' : '#f59e0b' }}>{cls.attendance}%</span>
                )}
                <Badge color={statusBadgeColor(cls.status)}>{cls.status}</Badge>
                {cls.status === 'Upcoming' && (
                  <Btn size="sm" variant="primary" onClick={() => navigate('/teacher/attendance')}>Take Att.</Btn>
                )}
              </div>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Class performance */}
          <Card>
            <CardHeader title="📊 Class Performance" />
            {loading && <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}
            {!loading && displayPerf.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 12 }}>No marks submitted yet</div>
            )}
            {!loading && displayPerf.map(p => (
              <ProgressBar key={p.cls} label={p.cls} value={`${p.pct}%`} pct={p.pct}
                color={p.pct >= 80 ? 'green' : p.pct >= 70 ? 'blue' : 'amber'} />
            ))}
          </Card>

          {/* Pending actions */}
          <Card>
            <CardHeader title="⚠️ Pending Actions" />
            {loading
              ? <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>
              : displayPending === 0
                ? <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 12 }}>✅ No pending actions</div>
                : <div style={{ padding: '8px 0', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: '#ef4444', boxShadow: '0 0 0 3px #fef2f2' }} />
                      <div>
                        <div>{displayPending} assignment{displayPending !== 1 ? 's' : ''} awaiting marks</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>Go to Marks & Grades to grade</div>
                      </div>
                    </div>
                  </div>
            }
          </Card>
        </div>
      </div>
    </div>
  );
}
