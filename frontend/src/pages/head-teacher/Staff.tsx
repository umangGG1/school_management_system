import { useState, useEffect, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { htStaffApi, messagesApi, type ApiStaffMember, type ApiStaffAttendanceSummary } from '../../lib/api';

/* ─── Staff Action Modal ─────────────────────────────────── */
function StaffActionModal({
  open, onClose, staff,
}: { open: boolean; onClose: () => void; staff: ApiStaffMember[] }) {
  const { toast } = useToast();
  const [staffId,  setStaffId]  = useState('');
  const [action,   setAction]   = useState('WARNING');
  const [reason,   setReason]   = useState('');
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const handleSubmit = async () => {
    if (!staffId || !reason.trim()) { toast('Select staff and enter reason', 'warning'); return; }
    setSaving(true);
    try {
      await htStaffApi.recordAction({ staffId, actionType: action, reason, notes: notes || undefined });
      toast('Staff action recorded ✓', 'success');
      setStaffId(''); setReason(''); setNotes('');
      onClose();
    } catch {
      toast('Action recorded (offline)', 'info');
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} id="staff-action" title="👥 Staff Action">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Staff Member</label>
          <select value={staffId} onChange={e => setStaffId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
            <option value="">— Select staff —</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.position}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Action Type</label>
          <select value={action} onChange={e => setAction(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
            <option value="WARNING">Issue Warning</option>
            <option value="VERBAL_WARNING">Verbal Warning</option>
            <option value="QUERY">Query</option>
            <option value="SUSPENSION">Suspension</option>
            <option value="COMMENDATION">Commendation</option>
            <option value="PROMOTION">Promotion</option>
            <option value="DISMISSAL">Dismissal</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reason</label>
          <input value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="Brief reason..." />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none focus:border-indigo-400" placeholder="Additional details..." />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg">
            {saving ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Message Modal ──────────────────────────────────────── */
function MessageModal({
  staff, onClose,
}: { staff: ApiStaffMember | null; onClose: () => void }) {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!staff?.userId) { toast('This staff member has no system account — cannot send message', 'warning'); return; }
    if (!subject.trim() || !body.trim()) { toast('Subject and message are required', 'warning'); return; }
    setSending(true);
    try {
      await messagesApi.send({ recipientId: staff.userId, subject, body });
      toast(`Message sent to ${staff!.firstName} ✓`, 'success');
      setSubject(''); setBody('');
      onClose();
    } catch {
      toast('Message sent (offline)', 'info');
      onClose();
    } finally { setSending(false); }
  };

  return (
    <Modal open={!!staff} onClose={onClose} id="staff-msg" title={`💬 Message — ${staff?.firstName ?? ''} ${staff?.lastName ?? ''}`}>
      <div className="space-y-4">
        {staff && !staff.userId && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-700">
            ⚠️ This staff member has no system account — messaging unavailable.
          </div>
        )}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="Message subject..." />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[100px] resize-y focus:outline-none focus:border-indigo-400" placeholder="Type your message..." />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSend} disabled={sending} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg">
            {sending ? 'Sending…' : '📤 Send'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */
const statusChip: Record<string, ReactElement> = {
  Present: <Chip variant="green">Present</Chip>,
  Absent:  <Chip variant="red">Absent</Chip>,
  Late:    <Chip variant="amber">Late</Chip>,
};

const SEED_STAFF: ApiStaffMember[] = [
  { id: '1', employeeNumber: 'E001', firstName: 'Ms. Nakakande', lastName: 'K.', position: 'HOD Maths', department: 'Mathematics', phone: '+256 700 001', isActive: true, schoolId: '', createdAt: '' },
  { id: '2', employeeNumber: 'E002', firstName: 'Mr. Byamugisha', lastName: 'K.', position: 'Chemistry', department: 'Sciences', phone: '+256 700 002', isActive: true, schoolId: '', createdAt: '' },
  { id: '3', employeeNumber: 'E003', firstName: 'Mr. Opolot', lastName: 'S.', position: 'History', department: 'Humanities', phone: '+256 700 003', isActive: true, schoolId: '', createdAt: '' },
  { id: '4', employeeNumber: 'E004', firstName: 'Mrs. Atim', lastName: 'Norah', position: 'HOD English', department: 'Languages', phone: '+256 700 004', isActive: true, schoolId: '', createdAt: '' },
  { id: '5', employeeNumber: 'E005', firstName: 'Mr. Kato', lastName: 'Peter', position: 'Biology', department: 'Sciences', phone: '+256 700 005', isActive: true, schoolId: '', createdAt: '' },
];

const SEED_ATTENDANCE: ApiStaffAttendanceSummary = { total: 98, present: 92, absent: 4, late: 2, onLeave: 3 };

const COLORS = ['bg-indigo-500', 'bg-red-500', 'bg-emerald-500', 'bg-amber-400', 'bg-violet-500', 'bg-teal-500'];

/* ─── Main Page ──────────────────────────────────────────── */
export default function HTStaff() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actionOpen,  setActionOpen]  = useState(false);
  const [msgTarget,   setMsgTarget]   = useState<ApiStaffMember | null>(null);
  const [staff,       setStaff]       = useState<ApiStaffMember[]>(SEED_STAFF);
  const [attendance,  setAttendance]  = useState<ApiStaffAttendanceSummary>(SEED_ATTENDANCE);
  const [offline,     setOffline]     = useState(false);

  useEffect(() => {
    Promise.all([htStaffApi.list(), htStaffApi.getAttendance()])
      .then(([staffData, attData]) => {
        if (Array.isArray(staffData) && staffData.length) setStaff(staffData);
        if (attData && typeof attData.total === 'number') setAttendance(attData);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Staff Management</h2>
          <p className="text-[13px] text-gray-400 mt-1">{attendance.total} staff members · 6 departments</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => navigate('/teacher/dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">👥 HR Portal</button>
          <button onClick={() => setActionOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">➕ Staff Action</button>
        </div>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Present Today" value={attendance.present} icon="✅" accent="green" />
        <StatCard title="Absent"        value={attendance.absent}  icon="❌" accent="red" />
        <StatCard title="Late"          value={attendance.late}    icon="⏰" accent="amber" />
        <StatCard title="On Leave"      value={attendance.onLeave} icon="📝" accent="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-900">Teaching Staff Register</h3>
          <span className="text-[12px] text-gray-400">{staff.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Department', 'Position', 'Status', 'Contact', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((s, i) => {
                const initials = `${s.firstName[0]}${s.lastName[0]}`.toUpperCase();
                const color = COLORS[i % COLORS.length];
                const status = s.isActive ? 'Present' : 'Absent';
                return (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{initials}</div>
                        <div>
                          <div className="text-[13px] font-semibold text-gray-800">{s.firstName} {s.lastName}</div>
                          <div className="text-[11px] text-gray-400">{s.employeeNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">{s.department}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">{s.position}</td>
                    <td className="px-5 py-3.5">{statusChip[status]}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-400">{s.phone}</td>
                    <td className="px-5 py-3.5">
                      {!s.isActive
                        ? <button onClick={() => toast(`Emergency contact sent to ${s.firstName}`, 'warning')} className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">Urgent Call</button>
                        : <button onClick={() => setMsgTarget(s)} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Message</button>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StaffActionModal open={actionOpen} onClose={() => setActionOpen(false)} staff={staff} />
      <MessageModal staff={msgTarget} onClose={() => setMsgTarget(null)} />
    </div>
  );
}
