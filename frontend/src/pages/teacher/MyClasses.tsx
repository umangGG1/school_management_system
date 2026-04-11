import { useState } from 'react';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }       from '../../components/ui/Badge';
import { Btn }         from '../../components/ui/Btn';
import { ProgressBar } from '../../components/ui/ProgressBar';

const CLASSES = [
  { code: 'S4A', subject: 'Mathematics',        room: 'Room 12', students: 42, period: 'P1 · 7:30–8:20',   status: 'Done',     att: 95, passRate: 78 },
  { code: 'S5A', subject: 'Mathematics',        room: 'Room 08', students: 38, period: 'P2 · 8:20–9:10',   status: 'Done',     att: 89, passRate: 74 },
  { code: 'S3B', subject: 'Mathematics',        room: 'Room 15', students: 44, period: 'P4 · 10:30–11:20', status: 'Now',      att: 93, passRate: 69 },
  { code: 'S6A', subject: 'Further Mathematics',room: 'Room 12', students: 28, period: 'P6 · 13:00–13:50', status: 'Upcoming', att: 0,  passRate: 79 },
  { code: 'S4B', subject: 'Mathematics',        room: 'Room 09', students: 40, period: 'P7 · 14:00–14:50', status: 'Upcoming', att: 0,  passRate: 71 },
];

function statusColor(s: string): 'green' | 'blue' | 'gray' {
  return s === 'Done' ? 'green' : s === 'Now' ? 'blue' : 'gray';
}

export default function MyClasses() {
  const [selected, setSelected] = useState<string | null>(null);
  const cls = selected ? CLASSES.find(c => c.code === selected) : null;

  return (
    <div>
      <PageHeader
        title="My Classes"
        subtitle={`5 classes this term · ${CLASSES.reduce((a, c) => a + c.students, 0)} total students`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {CLASSES.map(c => (
          <div
            key={c.code}
            onClick={() => setSelected(c.code === selected ? null : c.code)}
            style={{
              background: '#fff', borderRadius: 12,
              border: `2px solid ${c.code === selected ? '#2563eb' : '#e2e8f0'}`,
              padding: 18, cursor: 'pointer', transition: 'all .2s',
              boxShadow: c.code === selected ? '0 0 0 3px #bfdbfe' : '0 1px 3px rgba(0,0,0,.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb' }}>{c.code}</div>
              <Badge color={statusColor(c.status)}>{c.status}</Badge>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{c.subject}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>{c.room} · {c.period} · {c.students} students</div>
            {c.att > 0 && (
              <ProgressBar label="Attendance" value={`${c.att}%`} pct={c.att} color={c.att >= 85 ? 'green' : 'amber'} />
            )}
            <ProgressBar label="Class pass rate" value={`${c.passRate}%`} pct={c.passRate} color={c.passRate >= 75 ? 'green' : c.passRate >= 60 ? 'blue' : 'amber'} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <Btn size="sm" variant="primary">📊 Marks</Btn>
              <Btn size="sm">✅ Attendance</Btn>
              <Btn size="sm">📝 Notes</Btn>
            </div>
          </div>
        ))}
      </div>

      {cls && (
        <Card>
          <CardHeader title={`${cls.code} — ${cls.subject} · Detailed View`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[['Students', String(cls.students)], ['Period', cls.period], ['Room', cls.room], ['Pass Rate', `${cls.passRate}%`]].map(([l, v]) => (
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
