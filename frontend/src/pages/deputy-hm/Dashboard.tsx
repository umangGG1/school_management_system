import { useState, useEffect } from 'react';
import { StatCard }   from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge }      from '../../components/ui/Badge';
import { htStudentsApi, htStaffApi } from '../../lib/api';

const SEED_DISCIPLINE = [
  { id: '1', student: 'Akello Rose',      actionType: 'WRITTEN_WARNING', offence: 'Late to class repeatedly',  status: 'PENDING',  createdAt: '2026-04-16' },
  { id: '2', student: 'Byamugisha Peter', actionType: 'PARENT_SUMMONS',  offence: 'Vandalism of school property', status: 'PENDING', createdAt: '2026-04-15' },
  { id: '3', student: 'Chebet Sarah',     actionType: 'SUSPENSION',      offence: 'Fighting in dormitory',     status: 'RESOLVED', createdAt: '2026-04-10' },
];

const SEED_COVER = [
  { subject: 'Mathematics', class: 'S4A', period: 'P3', assignedTo: 'Ms. Nakato', reason: 'Sick leave' },
  { subject: 'Physics',     class: 'S5B', period: 'P5', assignedTo: 'Mr. Okello', reason: 'Workshop' },
];

const actionColor: Record<string, 'red' | 'amber' | 'orange' | 'gray'> = {
  WRITTEN_WARNING: 'amber', PARENT_SUMMONS: 'orange', SUSPENSION: 'red', EXPULSION: 'red', OTHER: 'gray',
};
const statusColor: Record<string, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber', RESOLVED: 'green', ESCALATED: 'red',
};

export default function DeputyDashboard() {
  const [discipline, setDiscipline] = useState<any[]>([]);
  const [staff,      setStaff]      = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      htStudentsApi.getAllDiscipline('PENDING').catch(() => null),
      htStaffApi.list().catch(() => null),
    ]).then(([disc, st]) => {
      setDiscipline(disc ?? SEED_DISCIPLINE);
      setStaff(st ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const pending  = (discipline as any[]).filter(d => d.status === 'PENDING').length;
  const staffCnt = staff.length || 87;

  return (
    <div>
      <PageHeader title="Deputy HM Dashboard" subtitle="Term 1, Week 8 · SMISSI Secondary" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard icon="⚖️" value={loading ? '…' : String(pending)} title="Discipline Pending" accent="orange" />
        <StatCard icon="👥" value={loading ? '…' : String(staffCnt)} title="Staff on Duty"      accent="blue"   />
        <StatCard icon="📅" value="2"                                 title="Cover Lessons"      accent="amber"  />
        <StatCard icon="🎓" value="4"                                 title="SLC Items"          accent="green"  />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Discipline */}
        <Card>
          <CardHeader title="⚖️ Recent Discipline Cases" />
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: 13 }}>Loading…</div>
          ) : (discipline as any[]).slice(0, 4).map((d, i) => (
            <div key={d.id ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.student ?? (d.student?.firstName + ' ' + d.student?.lastName)}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{d.offence?.slice(0, 48)}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge color={actionColor[d.actionType] ?? 'gray'}>{d.actionType?.replace('_', ' ')}</Badge>
                <Badge color={statusColor[d.status] ?? 'gray'}>{d.status}</Badge>
              </div>
            </div>
          ))}
          {!loading && (discipline as any[]).length === 0 && (
            <div style={{ fontSize: 13, color: '#94a3b8', padding: '12px 0' }}>No pending discipline cases</div>
          )}
        </Card>

        {/* Cover Lessons Today */}
        <Card>
          <CardHeader title="📅 Cover Lessons Today" />
          {SEED_COVER.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📚</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.subject} — {c.class} · {c.period}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Covered by {c.assignedTo} · {c.reason}</div>
              </div>
              <Badge color="green">Assigned</Badge>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#166534' }}>
            ✅ All cover lessons assigned for today
          </div>
        </Card>
      </div>
    </div>
  );
}
