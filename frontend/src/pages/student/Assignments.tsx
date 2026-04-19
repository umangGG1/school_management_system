import { useState } from 'react';
import { PageHeader }       from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge }            from '../../components/ui/Badge';
import { useToast }         from '../../contexts/ToastContext';

interface Assignment {
  id: string;
  subject: string;
  title: string;
  teacher: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'OVERDUE' | 'MARKED';
  grade?: string;
  score?: number;
  instructions: string;
}

const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', subject: 'Mathematics',  title: 'Quadratic Equations Exercise',     teacher: 'Mr. Byamugisha', dueDate: '2026-04-20', status: 'PENDING',   instructions: 'Complete Exercise 4.3 questions 1–15 in your exercise book. Show all working.' },
  { id: 'a2', subject: 'Biology',      title: 'Cell Structure Diagram',           teacher: 'Mr. Ssali',      dueDate: '2026-04-19', status: 'PENDING',   instructions: 'Draw and label a plant cell and an animal cell. Include at least 8 organelles each.' },
  { id: 'a3', subject: 'English',      title: 'Essay: Effects of Social Media',   teacher: 'Ms. Nakato',     dueDate: '2026-04-18', status: 'SUBMITTED',  instructions: 'Write a 500–800 word argumentative essay on the effects of social media on Uganda\'s youth.' },
  { id: 'a4', subject: 'Chemistry',    title: 'Balancing Chemical Equations',     teacher: 'Ms. Atim',       dueDate: '2026-04-15', status: 'MARKED', grade: 'D1', score: 82, instructions: 'Complete the chemical equation worksheet provided in class.' },
  { id: 'a5', subject: 'Physics',      title: 'Newton\'s Laws of Motion Problems', teacher: 'Mr. Okello',  dueDate: '2026-04-14', status: 'OVERDUE',   instructions: 'Solve the 10 problems from the physics textbook Chapter 5.' },
  { id: 'a6', subject: 'Geography',    title: 'Map Reading — Uganda Districts',   teacher: 'Mr. Onen',       dueDate: '2026-04-12', status: 'MARKED', grade: 'D2', score: 68, instructions: 'Identify and shade 20 districts on a blank Uganda map.' },
  { id: 'a7', subject: 'Computer',     title: 'Database Design Assignment',        teacher: 'Mr. Mugisha',   dueDate: '2026-04-25', status: 'PENDING',   instructions: 'Design an ER diagram for a school management system. Submit printed or digital copy.' },
];

const statusColor: Record<Assignment['status'], 'amber' | 'green' | 'red' | 'blue'> = {
  PENDING: 'amber', SUBMITTED: 'blue', OVERDUE: 'red', MARKED: 'green',
};
const statusIcon: Record<Assignment['status'], string> = {
  PENDING: '⏳', SUBMITTED: '✅', OVERDUE: '❌', MARKED: '🏆',
};

export default function Assignments() {
  const { toast }   = useToast();
  const [filter,   setFilter]  = useState<string>('ALL');
  const [selected, setSelected] = useState<Assignment | null>(null);

  const filtered = filter === 'ALL' ? ASSIGNMENTS : ASSIGNMENTS.filter(a => a.status === filter);
  const counts   = {
    ALL: ASSIGNMENTS.length,
    PENDING: ASSIGNMENTS.filter(a => a.status === 'PENDING').length,
    SUBMITTED: ASSIGNMENTS.filter(a => a.status === 'SUBMITTED').length,
    OVERDUE: ASSIGNMENTS.filter(a => a.status === 'OVERDUE').length,
    MARKED: ASSIGNMENTS.filter(a => a.status === 'MARKED').length,
  };

  const getDaysLeft = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    return `${diff}d left`;
  };

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle={`${counts.PENDING} pending · ${counts.OVERDUE} overdue`}
      />

      {/* Overdue alert */}
      {counts.OVERDUE > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>
            You have {counts.OVERDUE} overdue assignment{counts.OVERDUE > 1 ? 's' : ''}. Submit as soon as possible.
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['ALL', 'PENDING', 'SUBMITTED', 'OVERDUE', 'MARKED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: filter === f ? '#7c3aed' : '#f8fafc', color: filter === f ? '#fff' : '#1e293b',
          }}>{f} ({counts[f] ?? filtered.length})</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>
        {/* Assignment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(sel => sel?.id === a.id ? null : a)}
              style={{
                background: '#fff', border: `1px solid ${selected?.id === a.id ? '#7c3aed' : '#e2e8f0'}`,
                borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
                boxShadow: selected?.id === a.id ? '0 0 0 2px #ddd6fe' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{statusIcon[a.status]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{a.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {a.subject} · {a.teacher} · Due {new Date(a.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Badge color={statusColor[a.status]}>{a.status}</Badge>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: a.status === 'OVERDUE' ? '#ef4444' : a.status === 'PENDING' ? '#f59e0b' : '#94a3b8',
                  }}>
                    {getDaysLeft(a.dueDate)}
                  </span>
                </div>
              </div>
              {a.score !== undefined && (
                <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: a.score >= 70 ? '#10b981' : '#f59e0b' }}>{a.score}%</div>
                  <Badge color={a.score >= 70 ? 'green' : 'amber'}>{a.grade}</Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <Card>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{selected.title}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <Badge color={statusColor[selected.status]}>{selected.status}</Badge>
              <Badge color="blue">{selected.subject}</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#94a3b8', minWidth: 60 }}>Teacher</span>
                <span style={{ fontWeight: 600 }}>{selected.teacher}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#94a3b8', minWidth: 60 }}>Due</span>
                <span style={{ fontWeight: 600 }}>{new Date(selected.dueDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              {selected.score !== undefined && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: '#94a3b8', minWidth: 60 }}>Score</span>
                  <span style={{ fontWeight: 800, color: '#10b981', fontSize: 14 }}>{selected.score}% ({selected.grade})</span>
                </div>
              )}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Instructions</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{selected.instructions}</div>
            </div>
            {selected.status === 'PENDING' && (
              <button
                onClick={() => toast('Submission feature available in mobile app', 'info')}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                📤 Submit Assignment
              </button>
            )}
            {selected.status === 'OVERDUE' && (
              <button
                onClick={() => toast('Contact your teacher to arrange late submission', 'warning')}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                ⚠️ Late Submission — Contact Teacher
              </button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
