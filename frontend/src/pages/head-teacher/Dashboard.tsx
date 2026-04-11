import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { AlertItem } from '../../components/ui/AlertItem';
import { Chip } from '../../components/ui/Chip';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';

function MeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="meeting" title="📅 Schedule Meeting / Event">
      <div className="space-y-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="e.g. Staff briefing" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label><input type="date" defaultValue="2026-03-07" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Time</label><input type="time" defaultValue="09:00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" /></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Venue</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="Boardroom, Hall, Classroom..." /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Attendees</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400"><option>All Staff</option><option>HODs Only</option><option>Boarding Staff</option><option>Finance Team</option><option>Parents</option></select>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Agenda / Notes</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none focus:border-indigo-400" placeholder="Meeting agenda..." /></div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={() => { onClose(); toast('Meeting scheduled and invites sent ✓', 'success'); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Schedule & Notify</button>
        </div>
      </div>
    </Modal>
  );
}

function StudentActionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="student-action" title="⚠️ Student Disciplinary Action">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Student Name</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Full name" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Class</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>S1A</option><option>S2A</option><option>S3A</option><option>S3B</option><option>S4A</option><option>S4B</option><option>S5A</option><option>S6A</option></select>
          </div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Action Type</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>Written Warning</option><option>Suspension (1-3 days)</option><option>Suspension (1 week)</option><option>Expulsion</option><option>Parent Summons</option></select>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Offence</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none" placeholder="Describe the offence..." /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notify</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>Parent + Class Teacher</option><option>Parent Only</option><option>Class Teacher Only</option><option>All + Dorm Master</option></select>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={() => { onClose(); toast('Disciplinary action recorded and notifications sent', 'warning'); }} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">⚠️ Issue Action</button>
        </div>
      </div>
    </Modal>
  );
}

const SCHEDULE = [
  { time: '7:30',  dot: 'green' as const,  title: 'Morning Assembly',             sub: 'Main Hall · All students',      type: 'Done',       typeCls: 'bg-emerald-50 text-emerald-700' },
  { time: '9:00',  dot: 'blue' as const,   title: 'HOD Curriculum Review',        sub: 'Boardroom · 8 HODs',            type: 'Meeting',    typeCls: 'bg-indigo-50 text-indigo-600' },
  { time: '11:00', dot: 'amber' as const,  title: 'S6 Class Visit — Physics',     sub: 'Block C, Room 12',              type: 'Inspection', typeCls: 'bg-amber-50 text-amber-700' },
  { time: '14:00', dot: 'blue' as const,   title: 'Parent Representative Meeting', sub: 'Conference Room · 12 parents', type: 'Meeting',    typeCls: 'bg-indigo-50 text-indigo-600' },
  { time: '16:30', dot: 'amber' as const,  title: 'Finance Review — Bursar',      sub: 'Office · Mr. Kato',             type: 'Review',     typeCls: 'bg-emerald-50 text-emerald-700' },
];

const STAFF_ROWS = [
  { initials: 'KM', color: 'bg-indigo-500', name: 'Ms. Nakakande Mary', role: 'Maths HOD',       dept: 'Mathematics', status: 'Present' as const, classes: '4 / 4', last: '8:45 AM' },
  { initials: 'BK', color: 'bg-red-500',    name: 'Mr. Byamugisha K.',  role: 'Chemistry Teacher',dept: 'Sciences',    status: 'Absent'  as const, classes: '0 / 3', last: 'Yesterday' },
  { initials: 'OS', color: 'bg-emerald-500',name: 'Mr. Opolot Samuel',  role: 'History Teacher',  dept: 'Humanities',  status: 'Present' as const, classes: '2 / 3', last: '9:20 AM' },
  { initials: 'AN', color: 'bg-amber-400',  name: 'Mrs. Atim Norah',    role: 'English HOD',      dept: 'Languages',   status: 'Late'    as const, classes: '1 / 4', last: '9:55 AM' },
];

const statusChip: Record<string, JSX.Element> = {
  Present: <Chip variant="green">Present</Chip>,
  Absent:  <Chip variant="red">Absent</Chip>,
  Late:    <Chip variant="amber">Late</Chip>,
};

export default function HTDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);

  return (
    <div>
      {/* Greeting Band */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1a1f3a] via-[#2d3561] to-[#4f46e5] p-6 mb-6 text-white">
        <div className="absolute right-[-40px] top-[-40px] w-52 h-52 rounded-full bg-white/4" />
        <div className="absolute right-16 bottom-[-60px] w-40 h-40 rounded-full bg-white/3" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-xl font-bold">Good Morning, Mr. Ssemanda 👋</h2>
            <p className="text-white/65 text-[13px] mt-1">Term 1 is 62% complete. 3 critical items need your attention today.</p>
          </div>
          <div className="hidden lg:flex gap-7">
            {[['1,247','Total Students'],['98','Staff Members'],['Week 8','Current Week'],['3','Alerts']].map(([v,l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-white/55 text-[11px] mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {[
          { label: '📢 School Announcement', primary: true, action: () => toast('Opening announcement form...', 'info') },
          { label: '📄 Issue Circular', primary: false, action: () => toast('Opening circular form...', 'info') },
          { label: '⚠️ Student Action', primary: false, action: () => setActionOpen(true) },
          { label: '📅 Schedule Meeting', primary: false, action: () => setMeetingOpen(true) },
          { label: '📊 Generate Report', primary: false, action: () => navigate('/ht/reports') },
          { label: '🚨 Emergency Alert', primary: false, danger: true, action: () => toast('Opening emergency form...', 'warning') },
        ].map(({ label, primary, danger, action }) => (
          <button
            key={label}
            onClick={action}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border transition-all hover:-translate-y-0.5 shadow-sm ${
              primary ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              : danger ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard title="Total Enrolled Students" value="1,247" icon="🎓" iconBg="blue" accent="blue" trend="↑ 4.2%" trendType="up" onClick={() => navigate('/ht/students')} />
        <StatCard title="Average Attendance Today" value="91.4%" icon="✅" iconBg="green" accent="green" trend="↑ 1.8%" trendType="up" onClick={() => navigate('/ht/academic')} />
        <StatCard title="Fees Collection Rate" value="78%" icon="💰" iconBg="amber" accent="amber" trend="→ On track" trendType="flat" onClick={() => navigate('/ht/finance')} />
        <StatCard title="Students in Sick Bay" value="7" icon="🏥" iconBg="red" accent="red" trend="↑ 3 new" trendType="down" onClick={() => navigate('/ht/boarding')} />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Staff Present Today" value="92/98" icon="👨‍🏫" iconBg="purple" accent="purple" trend="94% present" trendType="up" />
        <StatCard title="Boarding Students" value="684" icon="🛏️" iconBg="teal" accent="teal" trend="All accounted" trendType="up" />
        <StatCard title="Exams Scheduled" value="24" icon="📋" iconBg="rose" accent="rose" trend="Term 1" trendType="flat" />
        <StatCard title="School Security Status" value="Secure" icon="🔒" iconBg="teal" accent="cyan" trend="All clear" trendType="up" />
      </div>

      {/* Alerts + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Priority Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">⚠️ Priority Alerts</h3>
            <button onClick={() => navigate('/ht/boarding')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">See all</button>
          </div>
          <AlertItem dot="red" text="3 students have not reported back from exeat" meta="Reported by Dorm Master · 30 min ago" actionLabel="View →" onAction={() => toast('Opening dorm report...', 'info')} />
          <AlertItem dot="amber" text="S4 Chemistry teacher absent — class uncovered Period 3" meta="Deputy HM flagged · 1 hr ago" actionLabel="Action" onAction={() => toast('Notifying Deputy HM', 'info')} />
          <AlertItem dot="amber" text="Fees arrears: 47 students exceed 60-day threshold" meta="Finance Officer · 2 hrs ago" actionLabel="Finance" onAction={() => navigate('/ht/finance')} />
          <AlertItem dot="blue" text="UNEB Inspection scheduled for next Thursday" meta="Examination Officer · Yesterday" actionLabel="Prep" onAction={() => toast('Opening exam portal', 'info')} />
          <AlertItem dot="green" text="Gate security system: All checkpoints operational" meta="Head of Security · 15 min ago" actionLabel="View" onAction={() => navigate('/ht/security')} />
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">📅 Today's Schedule</h3>
            <button onClick={() => navigate('/ht/calendar')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Full calendar</button>
          </div>
          {SCHEDULE.map((s) => (
            <div key={s.time} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-none">
              <span className="text-[12px] font-semibold text-gray-400 w-10 text-right flex-shrink-0">{s.time}</span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot === 'green' ? 'bg-emerald-500' : s.dot === 'amber' ? 'bg-amber-400' : 'bg-indigo-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-800 truncate">{s.title}</div>
                <div className="text-[11px] text-gray-400 truncate">{s.sub}</div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${s.typeCls}`}>{s.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Academic + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Academic Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">📈 Academic Performance by Class</h3>
            <button onClick={() => navigate('/ht/results')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Full results</button>
          </div>
          {[
            { pct: '87%', cls: 'Senior 6 — A-Level', sub: '142 students · Last exam avg: B+', color: 'border-emerald-500 text-emerald-600 bg-emerald-50', chip: <Chip variant="green">Top</Chip> },
            { pct: '79%', cls: 'Senior 4 — O-Level', sub: '248 students · Mock results pending', color: 'border-blue-500 text-blue-600 bg-blue-50', chip: <Chip variant="blue">Good</Chip> },
            { pct: '72%', cls: 'Senior 3',            sub: '214 students · Needs attention',    color: 'border-amber-400 text-amber-700 bg-amber-50', chip: <Chip variant="amber">Fair</Chip> },
            { pct: '61%', cls: 'Senior 1',            sub: '278 students · Adjustment period',  color: 'border-red-500 text-red-600 bg-red-50', chip: <Chip variant="red">Low</Chip> },
          ].map((r) => (
            <div key={r.cls} className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-none">
              <div className={`w-13 h-13 rounded-full border-[3px] flex items-center justify-center text-sm font-black flex-shrink-0 ${r.color}`} style={{width:'52px',height:'52px'}}>
                {r.pct}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-800">{r.cls}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{r.sub}</div>
              </div>
              {r.chip}
            </div>
          ))}
        </div>

        {/* School Health */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">🏥 School Health Summary</h3>
            <button className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md" onClick={() => toast('Opening sick bay...', 'info')}>Sick Bay →</button>
          </div>
          <ProgressBar label="Attendance Rate" value={91.4} color="green" />
          <ProgressBar label="Fees Collection" value={78} color="amber" />
          <ProgressBar label="Staff Attendance" value={94} color="blue" />
          <ProgressBar label="Syllabus Coverage" value={68} color="purple" />
          <ProgressBar label="Sanitation Score" value={83} color="teal" />
          <div className="border-t border-gray-100 pt-4 mt-2 grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-red-600">7</div>
              <div className="text-[11px] text-gray-400 mt-1">In Sick Bay</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-amber-700">3</div>
              <div className="text-[11px] text-gray-400 mt-1">Referred Out</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-900">👨‍🏫 Staff Attendance & Activity</h3>
          <button onClick={() => navigate('/ht/staff')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Full register</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Staff Member', 'Department', 'Status', 'Classes Today', 'Last Seen', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {STAFF_ROWS.map((s) => (
                <tr key={s.name} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 pl-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{s.initials}</div>
                      <div>
                        <div className="text-[13px] font-semibold text-gray-800">{s.name}</div>
                        <div className="text-[11px] text-gray-400">{s.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{s.dept}</td>
                  <td className="px-4 py-3">{statusChip[s.status]}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{s.classes}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-400">{s.last}</td>
                  <td className="px-4 py-3">
                    {s.status === 'Absent'
                      ? <button onClick={() => toast('Emergency contact sent', 'warning')} className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">Alert</button>
                      : <button onClick={() => toast(`${s.name} profile opened`, 'info')} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">View</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MeetingModal open={meetingOpen} onClose={() => setMeetingOpen(false)} />
      <StudentActionModal open={actionOpen} onClose={() => setActionOpen(false)} />
    </div>
  );
}
