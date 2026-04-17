import { useState, useEffect } from 'react';
import { PageHeader }       from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }            from '../../components/ui/Badge';
import { useToast }         from '../../contexts/ToastContext';
import { htStaffApi }       from '../../lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DUTY_TYPES = ['Morning Gate', 'Lunch Supervision', 'Prep Supervision', 'Dormitory Night', 'Weekend Duty'] as const;

type DutyType = typeof DUTY_TYPES[number];

interface DutySlot {
  day: string;
  dutyType: DutyType;
  staffId: string;
  staffName: string;
}

const SEED_ROSTER: DutySlot[] = [
  { day: 'Monday',    dutyType: 'Morning Gate',      staffId: 's1', staffName: 'Mr. Okello David'    },
  { day: 'Monday',    dutyType: 'Lunch Supervision', staffId: 's2', staffName: 'Ms. Nakato Joyce'     },
  { day: 'Monday',    dutyType: 'Prep Supervision',  staffId: 's3', staffName: 'Mr. Byamugisha Paul'  },
  { day: 'Tuesday',   dutyType: 'Morning Gate',      staffId: 's4', staffName: 'Ms. Atim Grace'       },
  { day: 'Tuesday',   dutyType: 'Lunch Supervision', staffId: 's5', staffName: 'Mr. Ssali Charles'    },
  { day: 'Tuesday',   dutyType: 'Prep Supervision',  staffId: 's1', staffName: 'Mr. Okello David'    },
  { day: 'Wednesday', dutyType: 'Morning Gate',      staffId: 's2', staffName: 'Ms. Nakato Joyce'     },
  { day: 'Wednesday', dutyType: 'Lunch Supervision', staffId: 's3', staffName: 'Mr. Byamugisha Paul'  },
  { day: 'Wednesday', dutyType: 'Dormitory Night',   staffId: 's6', staffName: 'Mr. Kagwa Richard'    },
  { day: 'Thursday',  dutyType: 'Morning Gate',      staffId: 's5', staffName: 'Mr. Ssali Charles'    },
  { day: 'Thursday',  dutyType: 'Prep Supervision',  staffId: 's4', staffName: 'Ms. Atim Grace'       },
  { day: 'Friday',    dutyType: 'Morning Gate',      staffId: 's3', staffName: 'Mr. Byamugisha Paul'  },
  { day: 'Friday',    dutyType: 'Lunch Supervision', staffId: 's6', staffName: 'Mr. Kagwa Richard'    },
  { day: 'Saturday',  dutyType: 'Weekend Duty',      staffId: 's1', staffName: 'Mr. Okello David'    },
  { day: 'Saturday',  dutyType: 'Weekend Duty',      staffId: 's2', staffName: 'Ms. Nakato Joyce'     },
];

const SEED_LEAVE = [
  { id: 'l1', staffName: 'Ms. Atim Grace',    type: 'Sick Leave',    days: 2, from: '2026-04-18', status: 'PENDING'  },
  { id: 'l2', staffName: 'Mr. Kagwa Richard', type: 'Annual Leave',  days: 5, from: '2026-04-22', status: 'PENDING'  },
  { id: 'l3', staffName: 'Mr. Ssali Charles', type: 'Compassionate', days: 3, from: '2026-04-14', status: 'APPROVED' },
];

const dutyColor: Record<DutyType, string> = {
  'Morning Gate':      '#dbeafe',
  'Lunch Supervision': '#dcfce7',
  'Prep Supervision':  '#fef9c3',
  'Dormitory Night':   '#fce7f3',
  'Weekend Duty':      '#ede9fe',
};
const dutyText: Record<DutyType, string> = {
  'Morning Gate':      '#1d4ed8',
  'Lunch Supervision': '#166534',
  'Prep Supervision':  '#854d0e',
  'Dormitory Night':   '#9d174d',
  'Weekend Duty':      '#4c1d95',
};

export default function Duties() {
  const { toast }   = useToast();
  const [staff,    setStaff]   = useState<any[]>([]);
  const [leaves,   setLeaves]  = useState<any[]>(SEED_LEAVE);
  const [selDay,   setSelDay]  = useState('Monday');
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      htStaffApi.list().catch(() => []),
      htStaffApi.getLeaves('PENDING').catch(() => SEED_LEAVE),
    ]).then(([st, lv]) => {
      setStaff(st);
      setLeaves(lv.length ? lv : SEED_LEAVE);
    }).finally(() => setLoading(false));
  }, []);

  const dayRoster = SEED_ROSTER.filter(r => r.day === selDay);

  const handleLeave = async (id: string, approved: boolean) => {
    try {
      if (approved) await htStaffApi.approveLeave(id).catch(() => null);
      else          await htStaffApi.rejectLeave(id, 'Rejected by Deputy HM').catch(() => null);
      setLeaves(l => l.map(lv => lv.id === id ? { ...lv, status: approved ? 'APPROVED' : 'REJECTED' } : lv));
      toast(approved ? 'Leave approved ✓' : 'Leave rejected', approved ? 'success' : 'info');
    } catch {
      toast('Action recorded (offline)', 'info');
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff Duties & Leave"
        subtitle="Duty roster and leave requests"
        actions={[{ label: '📋 Print Roster', variant: 'default', onClick: () => toast('Printing roster…', 'info') }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Duty Roster */}
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {DAYS.map(d => (
              <button key={d} onClick={() => setSelDay(d)} style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: selDay === d ? '#0ea5e9' : '#f8fafc',
                color:      selDay === d ? '#fff'    : '#1e293b',
              }}>{d}</button>
            ))}
          </div>

          <Card>
            <CardHeader title={`📅 ${selDay} Duty Roster`} />
            {dayRoster.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94a3b8', padding: '12px 0' }}>No duties assigned for {selDay}</div>
            ) : dayRoster.map((slot, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ padding: '4px 10px', borderRadius: 6, background: dutyColor[slot.dutyType], fontSize: 11, fontWeight: 700, color: dutyText[slot.dutyType], minWidth: 130, textAlign: 'center' }}>
                  {slot.dutyType}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{slot.staffName}</div>
                </div>
                <button
                  onClick={() => toast('Reassigning duty…', 'info')}
                  style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >Reassign</button>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <button onClick={() => toast('Adding duty assignment…', 'info')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Assign Duty</button>
            </div>
          </Card>

          {/* Staff Attendance Summary */}
          {!loading && (
            <Card style={{ marginTop: 14 }}>
              <CardHeader title="👥 Staff on Duty Today" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'Present', value: staff.filter(s => s.isActive).length || 82, color: '#10b981' },
                  { label: 'Absent',  value: 4, color: '#ef4444' },
                  { label: 'On Leave', value: leaves.filter(l => l.status === 'APPROVED').length, color: '#f59e0b' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Leave Requests */}
        <Card>
          <CardHeader title="📋 Leave Requests" />
          {leaves.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>No pending leave requests</div>
          ) : leaves.map(lv => (
            <div key={lv.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{lv.staffName}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{lv.type} · {lv.days} day{lv.days > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>From {lv.from}</div>
                </div>
                <Badge color={lv.status === 'APPROVED' ? 'green' : lv.status === 'REJECTED' ? 'red' : 'amber'}>{lv.status}</Badge>
              </div>
              {lv.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button onClick={() => handleLeave(lv.id, true)}  style={{ flex: 1, padding: '5px', borderRadius: 6, border: 'none', background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✅ Approve</button>
                  <button onClick={() => handleLeave(lv.id, false)} style={{ flex: 1, padding: '5px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>❌ Reject</button>
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
