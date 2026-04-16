import { useState } from 'react';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }       from '../../components/ui/Badge';
import { Btn }         from '../../components/ui/Btn';
import { useToast }    from '../../contexts/ToastContext';

const ROLES = [
  { name: 'Super Admin',       desc: 'Full system access, user, school & billing management',                 users: 1,  color: '#6366f1', perms: ['all'] },
  { name: 'Head Teacher',      desc: 'Full school-level oversight, approvals and cross-portal visibility',    users: 1,  color: '#3b82f6', perms: ['view_all','approve','manage_staff'] },
  { name: 'Deputy HM',         desc: 'Academic admin, timetabling, cover lessons and pastoral oversight',     users: 1,  color: '#0ea5e9', perms: ['view_academic','manage_timetable'] },
  { name: 'HOD',               desc: 'Departmental syllabus, scheme approval, lesson observation',            users: 4,  color: '#8b5cf6', perms: ['view_dept','manage_syllabus'] },
  { name: 'Exam Officer',      desc: 'Exam scheduling, moderation, paper security and result publication',    users: 1,  color: '#7c3aed', perms: ['manage_exams','manage_results'] },
  { name: 'Teacher',           desc: 'Lesson delivery, marks entry, attendance and parent communication',     users: 24, color: '#2563eb', perms: ['enter_marks','take_attendance','view_class'] },
  { name: 'Bursar',            desc: 'Fee collection, invoicing, supplier management and financial reports',  users: 2,  color: '#0f766e', perms: ['manage_fees','manage_expenses','view_reports'] },
  { name: 'ECA Officer',       desc: 'Sports, clubs, competitions, leadership and ECA attendance',            users: 2,  color: '#16a34a', perms: ['manage_eca','manage_sports'] },
  { name: 'School Counsellor', desc: 'Student welfare, counseling sessions, referrals and wellbeing reports', users: 1,  color: '#0d9488', perms: ['view_welfare','manage_sessions'] },
  { name: 'Nurse',             desc: 'Sick bay register, medical records, medication and referrals',          users: 2,  color: '#ec4899', perms: ['manage_health','view_students'] },
  { name: 'Dorm Master',       desc: 'Dormitory roll calls, exeat approvals, incident logging',               users: 3,  color: '#f97316', perms: ['manage_boarding','view_students'] },
  { name: 'Gate Guard',        desc: 'Student entry/exit, visitor logging, badge issuance',                   users: 4,  color: '#dc2626', perms: ['log_visitors','manage_gate'] },
  { name: 'Parent',            desc: 'View child progress, fee payments, notices and messaging',               users: 892,color: '#059669', perms: ['view_child','pay_fees','receive_notices'] },
  { name: 'Student',           desc: 'Grades, timetable, fee balance, notices and digital ID',                users: 1204,color:'#7c3aed', perms: ['view_grades','view_timetable','view_notices'] },
];

const ALL_PERMS = [
  'all','view_all','approve','manage_staff','view_academic','manage_timetable',
  'view_dept','manage_syllabus','manage_exams','manage_results',
  'enter_marks','take_attendance','view_class',
  'manage_fees','manage_expenses','view_reports',
  'manage_eca','manage_sports','view_welfare','manage_sessions',
  'manage_health','manage_boarding','log_visitors','manage_gate',
  'view_child','pay_fees','receive_notices','view_grades','view_timetable','view_notices',
];

export default function AdminRoles() {
  const { toast } = useToast();
  const [selected,  setSelected]  = useState<string | null>(null);
  // editedPerms tracks per-role permission overrides in local state
  const [editedPerms, setEditedPerms] = useState<Record<string, string[]>>(
    () => Object.fromEntries(ROLES.map(r => [r.name, [...r.perms]]))
  );

  const role = ROLES.find(r => r.name === selected);
  const currentPerms = selected ? (editedPerms[selected] ?? []) : [];

  const togglePerm = (perm: string) => {
    if (!selected) return;
    setEditedPerms(prev => {
      const perms = prev[selected] ?? [];
      return {
        ...prev,
        [selected]: perms.includes(perm) ? perms.filter(p => p !== perm) : [...perms, perm],
      };
    });
  };

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage what each portal role can see and do"
        actions={[{ label: '+ New Role', onClick: () => toast('Custom roles are managed at the system level. Contact support to add a new role.', 'info'), variant: 'primary' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18 }}>
        {/* Roles list */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROLES.map(r => (
              <div key={r.name} onClick={() => setSelected(r.name)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${selected === r.name ? r.color : '#e2e8f0'}`,
                background: selected === r.name ? `${r.color}08` : '#fff',
                transition: 'all .15s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: `${r.color}18`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14, fontWeight: 800, color: r.color,
                }}>
                  {r.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{r.desc}</div>
                </div>
                <Badge color="gray">{r.users} user{r.users !== 1 ? 's' : ''}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Permission detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {role ? (
            <Card>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{role.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{role.desc}</div>
              </div>
              <CardHeader title="Permissions" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ALL_PERMS.map(p => {
                  const hasIt = currentPerms.includes(p) || currentPerms.includes('all');
                  return (
                    <div key={p} onClick={() => togglePerm(p)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
                      background: hasIt ? '#f0fdf4' : '#fafafa',
                      border: `1px solid ${hasIt ? '#bbf7d0' : '#f1f5f9'}`,
                      transition: 'background .15s, border .15s',
                    }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: hasIt ? '#15803d' : '#94a3b8' }}>
                        {p}
                      </span>
                      <span style={{ fontSize: 13 }}>{hasIt ? '✅' : '⬜'}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12 }}>
                <Btn variant="primary" size="sm" onClick={() => toast(`Permissions for "${role?.name}" saved.`, 'success')}>Save Changes</Btn>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Select a role to view permissions</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
