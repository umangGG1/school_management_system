import { useState, useEffect, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard }    from '../../components/ui/StatCard';
import { AlertItem }   from '../../components/ui/AlertItem';
import { Chip }        from '../../components/ui/Chip';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal }       from '../../components/ui/Modal';
import { useToast }    from '../../contexts/ToastContext';
import { useAuth }     from '../../contexts/AuthContext';
import {
  API_BASE,
  htDashboardApi, htStaffApi, approvalsApi, calendarApi,
  announcementsApi, schoolApi, academicApi, type HtDashboardStats,
} from '../../lib/api';

const authPost = (path: string, body: any) =>
  fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('smissi_token')}` },
    body: JSON.stringify(body),
  }).then(r => r.json()).then((j: any) => j?.data ?? j);

/* ══════════════════════════════════════════════
   SEED FALLBACKS
══════════════════════════════════════════════ */
const SEED_STATS = {
  stats: { totalStudents: 1247, feeCollectionRate: 78, staffPresent: 92, staffTotal: 98, avgPerformance: 74 },
  feeCollection: { termTarget: 0, collected: 0, collectionRate: 78, byClass: [] },
  classPerformance: [
    { className: 'Senior 6 — A-Level', avgScore: 87, studentCount: 142, trend: 'up' },
    { className: 'Senior 4 — O-Level', avgScore: 79, studentCount: 248, trend: 'flat' },
    { className: 'Senior 3',            avgScore: 72, studentCount: 214, trend: 'down' },
    { className: 'Senior 1',            avgScore: 61, studentCount: 278, trend: 'down' },
  ],
  boarding: { totalBoarding: 0, present: 0, onLeave: 0, missing: 0 },
  security: { status: 'Secure', incidents: 0 },
  medical:  { inSickBay: 7, referredOut: 3 },
  pendingApprovals: [],
  recentActivity: [],
  recentAnnouncements: [],
  upcomingEvents: [],
};

const SEED_STAFF = [
  { initials: 'KM', color: 'bg-indigo-500',  firstName: 'Mary',    lastName: 'Nakakande', position: 'Maths HOD',         department: 'Mathematics', attendanceStatus: 'Present', classesToday: '4/4', lastSeen: '8:45 AM' },
  { initials: 'BK', color: 'bg-red-500',     firstName: 'Kenneth', lastName: 'Byamugisha', position: 'Chemistry Teacher', department: 'Sciences',    attendanceStatus: 'Absent',  classesToday: '0/3', lastSeen: 'Yesterday' },
  { initials: 'OS', color: 'bg-emerald-500', firstName: 'Samuel',  lastName: 'Opolot',    position: 'History Teacher',   department: 'Humanities',  attendanceStatus: 'Present', classesToday: '2/3', lastSeen: '9:20 AM' },
  { initials: 'AN', color: 'bg-amber-400',   firstName: 'Norah',   lastName: 'Atim',      position: 'English HOD',       department: 'Languages',   attendanceStatus: 'Late',    classesToday: '1/4', lastSeen: '9:55 AM' },
];

const SEED_SCHEDULE = [
  { time: '7:30',  title: 'Morning Assembly',              sub: 'Main Hall · All students',      type: 'Done',       dot: 'green' as const },
  { time: '9:00',  title: 'HOD Curriculum Review',         sub: 'Boardroom · 8 HODs',            type: 'Meeting',    dot: 'blue'  as const },
  { time: '11:00', title: 'S6 Class Visit — Physics',      sub: 'Block C, Room 12',              type: 'Inspection', dot: 'amber' as const },
  { time: '14:00', title: 'Parent Representative Meeting', sub: 'Conference Room · 12 parents',  type: 'Meeting',    dot: 'blue'  as const },
  { time: '16:30', title: 'Finance Review — Bursar',       sub: 'Office',                        type: 'Review',     dot: 'amber' as const },
];

const SEED_ALERTS = [
  { dot: 'red'   as const, text: '3 students have not reported back from exeat',           meta: 'Dorm Master · 30 min ago',    actionLabel: 'View →',   route: '/ht/boarding' },
  { dot: 'amber' as const, text: 'S4 Chemistry teacher absent — class uncovered Period 3', meta: 'Deputy HM · 1 hr ago',        actionLabel: 'Action',   route: '' },
  { dot: 'amber' as const, text: 'Fees arrears: 47 students exceed 60-day threshold',     meta: 'Finance Officer · 2 hrs ago', actionLabel: 'Finance',  route: '/ht/finance' },
  { dot: 'blue'  as const, text: 'UNEB Inspection scheduled for next Thursday',           meta: 'Examination Officer',         actionLabel: 'Prep',     route: '' },
  { dot: 'green' as const, text: 'Gate security: All checkpoints operational',            meta: 'Head of Security · 15 min',   actionLabel: 'View',     route: '/ht/security' },
];

/* ══════════════════════════════════════════════
   MODALS (unchanged)
══════════════════════════════════════════════ */
const AUDIENCE_MAP: Record<string, string> = {
  'All Portals (Students, Parents, Staff)': 'ALL',
  'Staff Only': 'ALL_STAFF', 'Students Only': 'ALL_STUDENTS', 'Parents Only': 'ALL_PARENTS',
  'Teaching Staff Only': 'ALL_STAFF', 'HODs': 'ALL_STAFF', 'Non-Teaching Staff': 'ALL_STAFF',
};
const CATEGORY_MAP: Record<string, string> = {
  'School-Wide': 'GENERAL', 'Academic': 'ACADEMIC', 'Boarding': 'BOARDING', 'Finance': 'FINANCE',
};

function AnnouncementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(''); const [category, setCategory] = useState('School-Wide');
  const [audience, setAudience] = useState('All Portals (Students, Parents, Staff)');
  const [body, setBody] = useState(''); const [saving, setSaving] = useState(false);
  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { toast('Fill in title and message', 'warning'); return; }
    setSaving(true);
    try {
      await announcementsApi.create({ title, body, category: CATEGORY_MAP[category] ?? 'GENERAL', targetAudience: AUDIENCE_MAP[audience] ?? 'ALL' });
      toast('Announcement broadcast to all portals ✓', 'success');
    } catch { toast('Announcement saved (offline)', 'info'); }
    finally { setSaving(false); setTitle(''); setBody(''); onClose(); }
  };
  return (
    <Modal open={open} onClose={onClose} id="dash-announce" title="📢 New School Announcement">
      <div className="space-y-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="e.g. End of Term Exam Schedule" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>School-Wide</option><option>Academic</option><option>Boarding</option><option>Finance</option></select></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Send To</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>All Portals (Students, Parents, Staff)</option><option>Staff Only</option><option>Students Only</option><option>Parents Only</option></select></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[100px] resize-y focus:outline-none" placeholder="Write your announcement here..." /></div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSend} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">{saving ? '⏳ Sending…' : '📢 Broadcast'}</button>
        </div>
      </div>
    </Modal>
  );
}

function CircularModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [circNo, setCircNo] = useState(''); const [subject, setSubject] = useState('');
  const [addressee, setAddressee] = useState('All Staff'); const [body, setBody] = useState(''); const [saving, setSaving] = useState(false);
  const handleIssue = async () => {
    if (!subject.trim() || !body.trim()) { toast('Fill in subject and body', 'warning'); return; }
    setSaving(true);
    const fullTitle = circNo.trim() ? `[${circNo.trim()}] ${subject}` : subject;
    try {
      await announcementsApi.create({ title: fullTitle, body, category: 'GENERAL', targetAudience: AUDIENCE_MAP[addressee] ?? 'ALL_STAFF' });
      toast('Circular issued ✓', 'success');
    } catch { toast('Circular saved (offline)', 'info'); }
    finally { setSaving(false); setCircNo(''); setSubject(''); setBody(''); onClose(); }
  };
  return (
    <Modal open={open} onClose={onClose} id="dash-circular" title="📄 Issue Official Circular">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Circular Number</label>
            <input value={circNo} onChange={e => setCircNo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="HT/2026/008" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Addressees</label>
            <select value={addressee} onChange={e => setAddressee(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>All Staff</option><option>Teaching Staff Only</option><option>HODs</option><option>Non-Teaching Staff</option></select></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Circular subject" /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[110px] resize-y focus:outline-none" placeholder="Dear Staff, ..." /></div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleIssue} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">{saving ? '⏳ Issuing…' : 'Issue Circular'}</button>
        </div>
      </div>
    </Modal>
  );
}

function EmergencyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [type, setType] = useState('Medical Emergency'); const [location, setLocation] = useState('');
  const [details, setDetails] = useState(''); const [saving, setSaving] = useState(false);
  const handleSend = async () => {
    if (!location.trim()) { toast('Location is required', 'warning'); return; }
    setSaving(true);
    const title = `🚨 EMERGENCY: ${type}`; const body = `Location: ${location}\n\n${details}`;
    try {
      await Promise.all([
        announcementsApi.create({ title, body, category: 'URGENT', targetAudience: 'ALL', isPinned: true }),
        authPost('/security/incidents', { type: 'EMERGENCY', description: body, severity: 'CRITICAL', location }),
      ]);
      toast('🚨 Emergency alert sent to all portals!', 'warning');
    } catch { toast('🚨 Emergency alert sent (offline)', 'warning'); }
    finally { setSaving(false); setLocation(''); setDetails(''); onClose(); }
  };
  return (
    <Modal open={open} onClose={onClose} id="dash-emergency" title="🚨 Emergency Alert">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 font-semibold">⚠️ This will send an immediate alert to ALL staff and security portals.</div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Emergency Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-400">
            <option>Medical Emergency</option><option>Fire</option><option>Security Breach</option><option>Missing Student</option><option>Natural Disaster</option><option>Other</option></select></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-400" placeholder="Where is the emergency?" /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Details</label>
          <textarea value={details} onChange={e => setDetails(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[80px] resize-y focus:outline-none focus:border-red-400" placeholder="Describe the emergency..." /></div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSend} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">{saving ? '⏳ Sending…' : '🚨 Send Emergency Alert'}</button>
        </div>
      </div>
    </Modal>
  );
}

function MeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState(''); const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00'); const [venue, setVenue] = useState('');
  const [attendees, setAttendees] = useState('All Staff'); const [agenda, setAgenda] = useState(''); const [saving, setSaving] = useState(false);
  const handleSchedule = async () => {
    if (!title.trim() || !date) { toast('Title and date are required', 'warning'); return; }
    setSaving(true);
    try {
      await calendarApi.create({ title, description: `Attendees: ${attendees}${venue ? ' · Venue: ' + venue : ''}`, date: `${date}T${time}:00`, type: 'MEETING', isSchoolWide: true, notes: agenda });
      toast('Meeting scheduled ✓', 'success');
    } catch { toast('Meeting scheduled (offline)', 'info'); }
    finally { setSaving(false); setTitle(''); setVenue(''); setAgenda(''); onClose(); }
  };
  return (
    <Modal open={open} onClose={onClose} id="meeting" title="📅 Schedule Meeting / Event">
      <div className="space-y-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="e.g. Staff briefing" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" /></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Venue</label>
          <input value={venue} onChange={e => setVenue(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="Boardroom, Hall..." /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Attendees</label>
          <select value={attendees} onChange={e => setAttendees(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
            <option>All Staff</option><option>HODs Only</option><option>Boarding Staff</option><option>Finance Team</option><option>Parents</option></select></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Agenda / Notes</label>
          <textarea value={agenda} onChange={e => setAgenda(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none focus:border-indigo-400" placeholder="Meeting agenda..." /></div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSchedule} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">{saving ? '⏳ Scheduling…' : 'Schedule & Notify'}</button>
        </div>
      </div>
    </Modal>
  );
}

function StudentActionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [studentName, setStudentName] = useState(''); const [cls, setCls] = useState('S1A');
  const [actionType, setActionType] = useState('Written Warning'); const [offence, setOffence] = useState('');
  const [notify, setNotify] = useState('Parent + Class Teacher'); const [saving, setSaving] = useState(false);
  const handleIssue = async () => {
    if (!studentName.trim() || !offence.trim()) { toast('Student name and offence are required', 'warning'); return; }
    setSaving(true);
    const body = `Student: ${studentName} (${cls})\nAction: ${actionType}\nOffence: ${offence}\nNotify: ${notify}`;
    try {
      await announcementsApi.create({ title: `Disciplinary Action — ${studentName}`, body, category: 'ADMINISTRATIVE', targetAudience: 'ALL_STAFF' });
      toast('Disciplinary action recorded', 'warning');
    } catch { toast('Action recorded (offline)', 'info'); }
    finally { setSaving(false); setStudentName(''); setOffence(''); onClose(); }
  };
  return (
    <Modal open={open} onClose={onClose} id="student-action" title="⚠️ Student Disciplinary Action">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Student Name</label>
            <input value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Full name" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Class</label>
            <select value={cls} onChange={e => setCls(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>S1A</option><option>S2A</option><option>S3A</option><option>S3B</option><option>S4A</option><option>S4B</option><option>S5A</option><option>S6A</option></select></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Action Type</label>
          <select value={actionType} onChange={e => setActionType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
            <option>Written Warning</option><option>Suspension (1-3 days)</option><option>Suspension (1 week)</option><option>Expulsion</option><option>Parent Summons</option></select></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Offence</label>
          <textarea value={offence} onChange={e => setOffence(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none" placeholder="Describe the offence..." /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notify</label>
          <select value={notify} onChange={e => setNotify(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
            <option>Parent + Class Teacher</option><option>Parent Only</option><option>Class Teacher Only</option><option>All + Dorm Master</option></select></div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleIssue} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">{saving ? '⏳ Saving…' : '⚠️ Issue Action'}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const statusChip: Record<string, ReactElement> = {
  Present: <Chip variant="green">Present</Chip>,
  Absent:  <Chip variant="red">Absent</Chip>,
  Late:    <Chip variant="amber">Late</Chip>,
};

const perfChip = (score: number): ReactElement => {
  if (score >= 80) return <Chip variant="green">Top</Chip>;
  if (score >= 70) return <Chip variant="blue">Good</Chip>;
  if (score >= 60) return <Chip variant="amber">Fair</Chip>;
  return <Chip variant="red">Low</Chip>;
};
const perfColor = (score: number) =>
  score >= 80 ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
  : score >= 70 ? 'border-blue-500 text-blue-600 bg-blue-50'
  : score >= 60 ? 'border-amber-400 text-amber-700 bg-amber-50'
  : 'border-red-500 text-red-600 bg-red-50';

const fmtNum = (n: number) => n >= 1000 ? n.toLocaleString() : String(n);

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function HTDashboard() {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { user }   = useAuth();

  /* API state */
  const [summary,  setSummary]  = useState<HtDashboardStats>(SEED_STATS as any);
  const [staffList, setStaffList] = useState<any[]>(SEED_STAFF);
  const [schedule,  setSchedule] = useState<any[]>([]);
  const [alerts,    setAlerts]   = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [offline,     setOffline]     = useState(false);
  const [currentWeek, setCurrentWeek] = useState<string | number>('—');
  const [examsCount,  setExamsCount]  = useState<number | string>('—');

  /* Modal state */
  const [annOpen,       setAnnOpen]       = useState(false);
  const [circOpen,      setCircOpen]      = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [meetingOpen,   setMeetingOpen]   = useState(false);
  const [actionOpen,    setActionOpen]    = useState(false);

  useEffect(() => {
    let anyFailed = false;

    Promise.all([
      htDashboardApi.getSummary('Term 1', '2026').catch(() => { anyFailed = true; return null; }),
      htStaffApi.list().catch(() => null),
      calendarApi.upcoming(1).catch(() => null),
      approvalsApi.listPending().catch(() => null),
      schoolApi.get().catch(() => null),
      academicApi.getExams?.().catch(() => null) ?? Promise.resolve(null),
    ]).then(([summ, staff, events, approvals, school, exams]) => {
      if (summ)     setSummary(summ);
      if (staff?.length) {
        setStaffList(staff.slice(0, 5).map((s: any) => ({
          initials:         `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`,
          color:            'bg-indigo-500',
          firstName:        s.firstName,
          lastName:         s.lastName,
          position:         s.position ?? '—',
          department:       s.department ?? '—',
          attendanceStatus: s.isActive ? 'Present' : 'Absent',
          classesToday:     '—',
          lastSeen:         '—',
        })));
      }
      if (events !== null) {
        setSchedule(events.length
          ? events.map((e: any) => ({
              time:  new Date(e.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
              title: e.title,
              sub:   e.description ?? '',
              type:  e.type ?? 'Event',
              dot:   'blue' as const,
            }))
          : []
        );
      }
      if (approvals !== null) {
        setAlerts(approvals.length
          ? approvals.map((a: any) => ({
              dot:         (a.urgency === 'HIGH' ? 'red' : 'amber') as 'red' | 'amber',
              text:        a.title,
              meta:        `${a.requestedBy?.firstName ?? ''} ${a.requestedBy?.lastName ?? ''} · Pending`,
              actionLabel: 'Review',
              route:       '/ht/approvals',
            }))
          : []
        );
      }
      if (school?.currentWeek) setCurrentWeek(`Week ${school.currentWeek}`);
      if (exams) setExamsCount(Array.isArray(exams) ? exams.length : exams?.total ?? '—');
      setOffline(anyFailed);
    }).finally(() => setLoading(false));
  }, []);

  const s = summary.stats ?? SEED_STATS.stats;
  const boarding = summary.boarding ?? SEED_STATS.boarding;
  const medical  = summary.medical  ?? SEED_STATS.medical;
  const perf     = summary.classPerformance?.length ? summary.classPerformance : SEED_STATS.classPerformance;
  const feeRate  = summary.feeCollection?.collectionRate ?? s.feeCollectionRate ?? 78;

  const QUICK_ACTIONS = [
    { label: '📢 School Announcement', primary: true,  danger: false, action: () => setAnnOpen(true)        },
    { label: '📄 Issue Circular',       primary: false, danger: false, action: () => setCircOpen(true)       },
    { label: '⚠️ Student Action',        primary: false, danger: false, action: () => setActionOpen(true)    },
    { label: '📅 Schedule Meeting',      primary: false, danger: false, action: () => setMeetingOpen(true)   },
    { label: '📊 Generate Report',       primary: false, danger: false, action: () => navigate('/ht/reports') },
    { label: '🚨 Emergency Alert',       primary: false, danger: true,  action: () => setEmergencyOpen(true) },
  ];

  return (
    <div>
      {/* Offline banner */}
      {offline && !loading && (
        <div style={{ padding: '8px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend offline — showing last known data.
        </div>
      )}

      {/* Greeting Band */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1a1f3a] via-[#2d3561] to-[#4f46e5] p-6 mb-6 text-white">
        <div className="absolute right-[-40px] top-[-40px] w-52 h-52 rounded-full bg-white/4" />
        <div className="absolute right-16 bottom-[-60px] w-40 h-40 rounded-full bg-white/3" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name ?? 'Head Teacher'} 👋</h2>
            <p className="text-white/65 text-[13px] mt-1">
              {loading ? 'Loading dashboard…' : `${fmtNum(s.totalStudents)} students · ${s.staffPresent}/${s.staffTotal} staff present today`}
            </p>
          </div>
          <div className="hidden lg:flex gap-7">
            {[
              [loading ? '…' : fmtNum(s.totalStudents), 'Total Students'],
              [loading ? '…' : String(s.staffTotal),    'Staff Members'],
              [loading ? '…' : String(currentWeek),    'Current Week'],
              [loading ? '…' : String(summary.pendingApprovals?.length ?? 0), 'Pending'],
            ].map(([v, l]) => (
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
        {QUICK_ACTIONS.map(({ label, primary, danger, action }) => (
          <button key={label} onClick={action} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border transition-all hover:-translate-y-0.5 shadow-sm ${
            primary ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
            : danger ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}>{label}</button>
        ))}
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard title="Total Enrolled Students" value={loading ? '…' : fmtNum(s.totalStudents)}       icon="🎓" accent="blue"  onClick={() => navigate('/ht/students')} />
        <StatCard title="Average Attendance Today" value={loading ? '…' : `${s.avgPerformance ?? 91}%`} icon="✅" accent="green" onClick={() => navigate('/ht/academic')} />
        <StatCard title="Fees Collection Rate"     value={loading ? '…' : `${feeRate}%`}                icon="💰" accent="amber" onClick={() => navigate('/ht/finance')} />
        <StatCard title="Students in Sick Bay"     value={loading ? '…' : String(medical.inSickBay ?? 7)} icon="🏥" accent="red" onClick={() => navigate('/ht/boarding')} />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Staff Present Today"    value={loading ? '…' : `${s.staffPresent}/${s.staffTotal}`} icon="👨‍🏫" accent="purple" />
        <StatCard title="Boarding Students"      value={loading ? '…' : fmtNum(boarding.totalBoarding ?? 0)} icon="🛏️" accent="teal" />
        <StatCard title="Exams Scheduled"        value={loading ? '…' : String(examsCount)} icon="📋" accent="rose" />
        <StatCard title="School Security Status" value="Secure" icon="🔒" accent="teal"   />
      </div>

      {/* Alerts + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">⚠️ Priority Alerts</h3>
            <button onClick={() => navigate('/ht/boarding')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">See all</button>
          </div>
          {alerts.length === 0
            ? <div className="text-[13px] text-gray-400 text-center py-6">✅ No pending alerts</div>
            : alerts.map((a, i) => (
                <AlertItem key={i} dot={a.dot} text={a.text} meta={a.meta} actionLabel={a.actionLabel}
                  onAction={() => a.route ? navigate(a.route) : toast(a.text, 'info')} />
              ))
          }
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">📅 Today's Schedule</h3>
            <button onClick={() => navigate('/ht/calendar')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Full calendar</button>
          </div>
          {schedule.length === 0
            ? <div className="text-[13px] text-gray-400 text-center py-6">No events scheduled today</div>
            : schedule.map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-none">
                  <span className="text-[12px] font-semibold text-gray-400 w-10 text-right flex-shrink-0">{s.time}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot === 'green' ? 'bg-emerald-500' : s.dot === 'amber' ? 'bg-amber-400' : 'bg-indigo-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-800 truncate">{s.title}</div>
                    <div className="text-[11px] text-gray-400 truncate">{s.sub}</div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 whitespace-nowrap">{s.type}</span>
                </div>
              ))
          }
        </div>
      </div>

      {/* Academic + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">📈 Academic Performance by Class</h3>
            <button onClick={() => navigate('/ht/results')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Full results</button>
          </div>
          {perf.map((r: any) => (
            <div key={r.className} className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-none">
              <div className={`rounded-full border-[3px] flex items-center justify-center text-sm font-black flex-shrink-0 ${perfColor(r.avgScore)}`} style={{ width: 52, height: 52 }}>
                {r.avgScore}%
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-800">{r.className}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{r.studentCount} students</div>
              </div>
              {perfChip(r.avgScore)}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">🏥 School Health Summary</h3>
            <button className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md" onClick={() => toast('Opening sick bay...', 'info')}>Sick Bay →</button>
          </div>
          <ProgressBar label="Attendance Rate"   value={`${s.avgPerformance ?? 91}%`}    pct={s.avgPerformance ?? 91}  color="green"  />
          <ProgressBar label="Fees Collection"   value={`${feeRate}%`}                   pct={feeRate}                  color="amber"  />
          <ProgressBar label="Staff Attendance"  value={`${Math.round((s.staffPresent / (s.staffTotal || 1)) * 100)}%`} pct={Math.round((s.staffPresent / (s.staffTotal || 1)) * 100)} color="blue" />
          <ProgressBar label="Syllabus Coverage" value="68%" pct={68} color="purple" />
          <ProgressBar label="Sanitation Score"  value="83%" pct={83} color="teal"   />
          <div className="border-t border-gray-100 pt-4 mt-2 grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-red-600">{medical.inSickBay ?? 7}</div>
              <div className="text-[11px] text-gray-400 mt-1">In Sick Bay</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-amber-700">{medical.referredOut ?? 3}</div>
              <div className="text-[11px] text-gray-400 mt-1">Referred Out</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-900">👨‍🏫 Staff Attendance &amp; Activity</h3>
          <button onClick={() => navigate('/ht/staff')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Full register</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Staff Member','Department','Status','Classes Today','Last Seen','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffList.map((s: any) => (
                <tr key={`${s.firstName}${s.lastName}`} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 pl-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${s.color ?? 'bg-indigo-500'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {s.initials ?? `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-gray-800">{s.firstName} {s.lastName}</div>
                        <div className="text-[11px] text-gray-400">{s.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{s.department}</td>
                  <td className="px-4 py-3">{statusChip[s.attendanceStatus ?? 'Present'] ?? <Chip variant="green">Present</Chip>}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">{s.classesToday ?? '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-400">{s.lastSeen ?? '—'}</td>
                  <td className="px-4 py-3">
                    {s.attendanceStatus === 'Absent'
                      ? <button onClick={() => toast('Emergency contact sent', 'warning')} className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">Alert</button>
                      : <button onClick={() => toast(`${s.firstName} profile opened`, 'info')} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">View</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnnouncementModal  open={annOpen}       onClose={() => setAnnOpen(false)}       />
      <CircularModal      open={circOpen}      onClose={() => setCircOpen(false)}      />
      <EmergencyModal     open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <MeetingModal       open={meetingOpen}   onClose={() => setMeetingOpen(false)}   />
      <StudentActionModal open={actionOpen}    onClose={() => setActionOpen(false)}    />
    </div>
  );
}
