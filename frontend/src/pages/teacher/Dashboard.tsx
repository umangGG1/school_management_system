import { useNavigate } from 'react-router-dom';
import { StatCard }    from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AlertBanner } from '../../components/ui/AlertBanner';

const MY_CLASSES = [
  { code: 'S4A', subject: 'Mathematics',        room: 'Room 12', students: 42, period: 'P1 · 7:30–8:20',   status: 'Done',     attendance: 95 },
  { code: 'S5A', subject: 'Mathematics',        room: 'Room 08', students: 38, period: 'P2 · 8:20–9:10',   status: 'Done',     attendance: 89 },
  { code: 'S3B', subject: 'Mathematics',        room: 'Room 15', students: 44, period: 'P4 · 10:30–11:20', status: 'Now',      attendance: 93 },
  { code: 'S6A', subject: 'Further Mathematics',room: 'Room 12', students: 28, period: 'P6 · 13:00–13:50', status: 'Upcoming', attendance: 0  },
  { code: 'S4B', subject: 'Mathematics',        room: 'Room 09', students: 40, period: 'P7 · 14:00–14:50', status: 'Upcoming', attendance: 0  },
];

const PENDING = [
  { text: 'Mark S4A Quadratics assignment (38/42 submitted)', due: 'Due Tue 10 Mar',  color: 'red'   as const },
  { text: 'Enter S6A end-term practical marks',               due: 'Deadline: Fri 13 Mar', color: 'red' as const },
  { text: 'Submit S5A syllabus coverage report to HOD',       due: 'Due this week',   color: 'amber' as const },
  { text: 'Parent-teacher meeting — Kevin Ssali (S4A)',        due: 'Thu 12 Mar 2:00 PM', color: 'blue' as const },
];

const PERF = [
  { cls: 'S4A — Maths',          pct: 86 },
  { cls: 'S5A — Maths',          pct: 74 },
  { cls: 'S3B — Maths',          pct: 69 },
  { cls: 'S6A — Further Maths',  pct: 79 },
];

function statusBadgeColor(s: string): 'green' | 'blue' | 'gray' {
  return s === 'Done' ? 'green' : s === 'Now' ? 'blue' : 'gray';
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
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
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Good morning, Ms. Nakakande 👋</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 3, marginBottom: 10 }}>
            SMISSI Senior Secondary · HOD Mathematics · Sat 07 Mar 2026
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['📚 5 classes today', '✅ 2 classes done', '⚠️ 2 assignments to mark', '📊 S4A end-term marks due Friday'].map(chip => (
              <span key={chip} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{chip}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {[['152', 'Students Today'], ['68%', 'Syllabus Done'], ['87%', 'Avg. Attendance'], ['2', 'Pending Marks']].map(([v, l]) => (
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
        <StatCard icon="📚" value="5"   title="Classes Today"     accent="blue"   trend="Sat 07 Mar" onClick={() => navigate('/teacher/classes')} />
        <StatCard icon="✅" value="87%" title="Avg. Attendance"   accent="green"  trend="↑ 3%"  trendType="up" onClick={() => navigate('/teacher/attendance')} />
        <StatCard icon="📋" value="2"   title="Assignments to Mark" accent="amber" trend="Due this week" onClick={() => navigate('/teacher/assignments')} />
        <StatCard icon="📈" value="68%" title="Syllabus Coverage"  accent="purple" trend="Week 8" onClick={() => navigate('/teacher/curriculum')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Today's classes */}
        <Card>
          <CardHeader
            title="🗓️ Today's Classes — Sat 07 Mar"
            action={<Btn size="sm" onClick={() => navigate('/teacher/classes')}>All classes →</Btn>}
          />
          {MY_CLASSES.map(cls => (
            <div key={cls.code} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #f1f5f9',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{cls.code} — {cls.subject}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{cls.room} · {cls.students} students · {cls.period}</div>
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
            {PERF.map(p => (
              <ProgressBar key={p.cls} label={p.cls} value={`${p.pct}%`} pct={p.pct}
                color={p.pct >= 80 ? 'green' : p.pct >= 70 ? 'blue' : 'amber'} />
            ))}
          </Card>

          {/* Pending actions */}
          <Card>
            <CardHeader title="⚠️ Pending Actions" />
            {PENDING.map(p => (
              <div key={p.text} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: p.color === 'red' ? '#ef4444' : p.color === 'amber' ? '#f59e0b' : '#3b82f6', boxShadow: `0 0 0 3px ${p.color === 'red' ? '#fef2f2' : p.color === 'amber' ? '#fffbeb' : '#eff6ff'}` }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.text}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{p.due}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
