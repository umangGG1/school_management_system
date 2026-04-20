import { useState } from 'react';
import { PageHeader }       from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }            from '../../components/ui/Badge';
import { Modal }            from '../../components/ui/Modal';
import { Btn }              from '../../components/ui/Btn';
import { useToast }         from '../../contexts/ToastContext';

interface SLCMeeting {
  id: string;
  date: string;
  type: 'FULL' | 'EMERGENCY' | 'SUBJECT' | 'WELFARE';
  agenda: string[];
  minutes: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  attendees: string[];
  actionItems: { task: string; owner: string; due: string; done: boolean }[];
}

const MEETINGS: SLCMeeting[] = [
  {
    id: 'm1',
    date: '2026-04-22',
    type: 'FULL',
    agenda: ['Term 1 academic review', 'Fee collection update', 'Upcoming UNEB mock exams', 'Staff welfare concerns'],
    minutes: '',
    status: 'UPCOMING',
    attendees: ['Head Teacher', 'Deputy HM', 'Bursar', 'HOD Sciences', 'HOD Arts', 'HOD Languages', 'Exam Officer'],
    actionItems: [],
  },
  {
    id: 'm2',
    date: '2026-04-08',
    type: 'FULL',
    agenda: ['Attendance improvement plan', 'Infrastructure repair update', 'Term 2 calendar planning'],
    minutes: 'Meeting convened at 3:00PM. HT presided. Attendance plan reviewed — S4 attendance improved by 8% since Week 5. Infrastructure committee to report by Week 9.',
    status: 'COMPLETED',
    attendees: ['Head Teacher', 'Deputy HM', 'Bursar', 'HOD Sciences', 'HOD Arts', 'Counsellor'],
    actionItems: [
      { task: 'Circulate attendance report to all class teachers', owner: 'Deputy HM',    due: '2026-04-10', done: true  },
      { task: 'Get quotation for classroom window repairs',         owner: 'Bursar',       due: '2026-04-15', done: true  },
      { task: 'Draft Term 2 academic calendar for HT approval',     owner: 'Exam Officer', due: '2026-04-18', done: false },
    ],
  },
  {
    id: 'm3',
    date: '2026-04-02',
    type: 'EMERGENCY',
    agenda: ['Security incident on school grounds — response plan'],
    minutes: 'Emergency meeting called. Incident reviewed. Security patrol schedule enhanced. Parents notified by SMS.',
    status: 'COMPLETED',
    attendees: ['Head Teacher', 'Deputy HM', 'Head of Security', 'Counsellor'],
    actionItems: [
      { task: 'Write incident report for district education office', owner: 'Head Teacher', due: '2026-04-03', done: true },
      { task: 'Update gate log procedures',                          owner: 'Security HOD', due: '2026-04-04', done: true },
    ],
  },
];

const typeColor: Record<string, 'blue' | 'red' | 'purple' | 'green'> = {
  FULL: 'blue', EMERGENCY: 'red', SUBJECT: 'purple', WELFARE: 'green',
};
const statusColor: Record<string, 'amber' | 'green' | 'gray'> = {
  UPCOMING: 'amber', COMPLETED: 'green', CANCELLED: 'gray',
};

export default function SLC() {
  const { toast }    = useToast();
  const [sel, setSel] = useState<SLCMeeting | null>(null);
  const [newModal, setNewModal] = useState(false);
  const [newDate, setNewDate]   = useState('');
  const [newType, setNewType]   = useState<'FULL' | 'EMERGENCY' | 'SUBJECT' | 'WELFARE'>('FULL');
  const [newAgenda, setNewAgenda] = useState('');

  const upcomingCount  = MEETINGS.filter(m => m.status === 'UPCOMING').length;
  const pendingActions = MEETINGS.flatMap(m => m.actionItems).filter(a => !a.done).length;

  const scheduleNew = () => {
    if (!newDate || !newAgenda.trim()) { toast('Fill in date and agenda', 'warning'); return; }
    toast('Meeting scheduled ✓', 'success');
    setNewModal(false);
    setNewDate(''); setNewAgenda('');
  };

  return (
    <div>
      <PageHeader
        title="School Leadership Committee"
        subtitle={`${upcomingCount} upcoming · ${pendingActions} action items pending`}
        actions={[{ label: '+ Schedule Meeting', variant: 'primary', onClick: () => setNewModal(true) }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0ea5e9' }}>{upcomingCount}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Upcoming Meetings</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{pendingActions}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Pending Actions</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{MEETINGS.filter(m => m.status === 'COMPLETED').length}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Meetings This Term</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        {/* Meeting list */}
        <Card>
          <CardHeader title="📋 Meetings" />
          {MEETINGS.map(m => (
            <div
              key={m.id}
              onClick={() => setSel(m)}
              style={{ padding: '10px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderRadius: 8, background: sel?.id === m.id ? '#f0f9ff' : 'transparent' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{new Date(m.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.agenda[0]}{m.agenda.length > 1 ? ` +${m.agenda.length - 1}` : ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge color={typeColor[m.type]}>{m.type}</Badge>
                  <Badge color={statusColor[m.status]}>{m.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* Meeting detail */}
        <div>
          {sel ? (
            <Card>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                      {new Date(sel.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <Badge color={typeColor[sel.type]}>{sel.type}</Badge>
                      <Badge color={statusColor[sel.status]}>{sel.status}</Badge>
                    </div>
                  </div>
                  {sel.status === 'UPCOMING' && (
                    <Btn onClick={() => toast('Adding minutes…', 'info')}>Add Minutes</Btn>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Agenda</div>
                {sel.agenda.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 13 }}>
                    <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{i + 1}.</span>
                    <span style={{ color: '#1e293b' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Attendees</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sel.attendees.map(a => (
                    <span key={a} style={{ padding: '3px 8px', borderRadius: 5, background: '#f1f5f9', fontSize: 11, fontWeight: 600, color: '#475569' }}>{a}</span>
                  ))}
                </div>
              </div>

              {sel.actionItems.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Action Items</div>
                  {sel.actionItems.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 14, marginTop: 1 }}>{a.done ? '✅' : '⏳'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: a.done ? 400 : 600, color: a.done ? '#94a3b8' : '#1e293b', textDecoration: a.done ? 'line-through' : 'none' }}>{a.task}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{a.owner} · Due {a.due}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sel.minutes && (
                <div style={{ marginTop: 14, padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Minutes Summary</div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{sel.minutes}</div>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: 32 }}>🎓</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10 }}>Select a meeting to view details</div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal open={newModal} onClose={() => setNewModal(false)} id="new-meeting" title="+ Schedule SLC Meeting">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-sky-400" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Meeting Type</label>
            <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-sky-400">
              <option value="FULL">Full SLC Meeting</option>
              <option value="EMERGENCY">Emergency Meeting</option>
              <option value="SUBJECT">Subject HOD Meeting</option>
              <option value="WELFARE">Welfare Meeting</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Agenda (one item per line)</label>
            <textarea value={newAgenda} onChange={e => setNewAgenda(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[80px] resize-y focus:outline-none focus:border-sky-400" placeholder="1. Review term progress&#10;2. Upcoming exams" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setNewModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={scheduleNew} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg">Schedule Meeting</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
