import { useState, useEffect } from 'react';
import { StatCard }   from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge }      from '../../components/ui/Badge';
import { studentSelfApi } from '../../lib/api';

const SEED_MARKS = [
  { subject: 'Mathematics',    score: 78, grade: 'D1', term: 'Term 1 2026' },
  { subject: 'English',        score: 65, grade: 'D2', term: 'Term 1 2026' },
  { subject: 'Physics',        score: 72, grade: 'D1', term: 'Term 1 2026' },
  { subject: 'Chemistry',      score: 68, grade: 'D2', term: 'Term 1 2026' },
  { subject: 'Biology',        score: 81, grade: 'D1', term: 'Term 1 2026' },
];

const SEED_ANNOUNCEMENTS = [
  { id: 'a1', title: 'Mock Exam Timetable Released', category: 'ACADEMIC', createdAt: '2026-04-15', isPinned: true  },
  { id: 'a2', title: 'School Fees Due — 25th April',  category: 'FINANCE',  createdAt: '2026-04-14', isPinned: false },
  { id: 'a3', title: 'Sports Day — Saturday 26 Apr',  category: 'GENERAL',  createdAt: '2026-04-13', isPinned: false },
];

const gradeColor: Record<string, 'green' | 'blue' | 'amber' | 'orange' | 'red'> = {
  D1: 'green', D2: 'blue', C3: 'blue', C4: 'amber', C5: 'amber', C6: 'orange', P7: 'orange', P8: 'red', F9: 'red',
};
const catColor: Record<string, 'blue' | 'green' | 'amber' | 'gray'> = {
  ACADEMIC: 'blue', FINANCE: 'green', GENERAL: 'gray', URGENT: 'amber',
};

export default function StudentDashboard() {
  const [marks,  setMarks]  = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentSelfApi.getMyMarks().catch(() => null),
      studentSelfApi.getMyBalance().catch(() => null),
    ]).then(([m, b]) => {
      setMarks(m ?? SEED_MARKS);
      setBalance(b);
    }).finally(() => setLoading(false));
  }, []);

  const avg     = marks.length ? Math.round(marks.reduce((s, m) => s + (m.score ?? m.percentage ?? 0), 0) / marks.length) : 72;
  const topGrade = marks.length ? marks.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]?.grade ?? 'D1' : 'D1';
  const owedAmt  = balance?.balance ?? 320000;

  return (
    <div>
      <PageHeader title="My Dashboard" subtitle="S4A · Term 1, Week 8 · SMISSI Secondary" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard icon="📊" value={loading ? '…' : `${avg}%`} title="Current Avg."   accent="purple" />
        <StatCard icon="✅" value="91%"                        title="Attendance"     accent="green"  />
        <StatCard icon="🏆" value={loading ? '…' : topGrade}  title="Best Grade"     accent="blue"   />
        <StatCard icon="💳" value={loading ? '…' : owedAmt > 0 ? `UGX ${(owedAmt/1000).toFixed(0)}k` : '✅ Paid'} title="Fees Balance" accent={owedAmt > 0 ? 'amber' : 'green'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Marks */}
        <Card>
          <CardHeader title="📊 Latest Results" />
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>Loading…</div>
          ) : (marks as any[]).slice(0, 5).map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.subject ?? m.subjectName}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{m.term ?? 'Term 1 2026'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{m.score ?? m.percentage ?? 0}%</div>
                <Badge color={gradeColor[m.grade] ?? 'gray'}>{m.grade}</Badge>
              </div>
            </div>
          ))}
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader title="📢 Announcements" />
          {SEED_ANNOUNCEMENTS.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{a.createdAt}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
                <Badge color={catColor[a.category] ?? 'gray'}>{a.category}</Badge>
                {a.isPinned && <Badge color="amber">Pinned</Badge>}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
