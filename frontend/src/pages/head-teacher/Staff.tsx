import { useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';

const STAFF = [
  { initials: 'NK', color: 'bg-indigo-500', name: 'Ms. Nakakande K.', role: 'HOD Maths', subject: 'Mathematics', classes: 'S4A, S5A, S6', status: 'Present' as const, phone: '+256 700 001' },
  { initials: 'BK', color: 'bg-red-500', name: 'Mr. Byamugisha K.', role: 'Chemistry', subject: 'Chemistry', classes: 'S3B, S4B', status: 'Absent' as const, phone: '+256 700 002' },
  { initials: 'OS', color: 'bg-emerald-500', name: 'Mr. Opolot S.', role: 'History', subject: 'History / CRE', classes: 'S3A, S4A, S5', status: 'Present' as const, phone: '+256 700 003' },
  { initials: 'AN', color: 'bg-amber-400', name: 'Mrs. Atim Norah', role: 'HOD English', subject: 'English Language', classes: 'S2A, S3A, S4', status: 'Late' as const, phone: '+256 700 004' },
  { initials: 'KP', color: 'bg-violet-500', name: 'Mr. Kato Peter', role: 'Biology', subject: 'Biology', classes: 'S3B, S5, S6', status: 'Present' as const, phone: '+256 700 005' },
];

function StaffActionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="staff-action" title="👥 Staff Action">
      <div className="space-y-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Staff Member</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Staff name" /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Action</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>Issue Warning</option><option>Grant Leave</option><option>Approve Cover</option><option>Performance Review</option><option>Commendation</option></select></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none" placeholder="Details..." /></div>
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button><button onClick={() => { onClose(); toast('Staff action recorded ✓', 'success'); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Submit</button></div>
      </div>
    </Modal>
  );
}

const statusChip: Record<string, JSX.Element> = {
  Present: <Chip variant="green">Present</Chip>,
  Absent:  <Chip variant="red">Absent</Chip>,
  Late:    <Chip variant="amber">Late</Chip>,
};

export default function HTStaff() {
  const [actionOpen, setActionOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Staff Management</h2>
          <p className="text-[13px] text-gray-400 mt-1">98 staff members · 6 departments</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => navigate('/teacher/dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">👥 HR Portal</button>
          <button onClick={() => setActionOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">➕ Staff Action</button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Present Today" value="92" icon="✅" iconBg="green" accent="green" />
        <StatCard title="Absent" value="4" icon="❌" iconBg="red" accent="red" />
        <StatCard title="Late" value="2" icon="⏰" iconBg="amber" accent="amber" />
        <StatCard title="On Leave" value="3" icon="📝" iconBg="purple" accent="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-900">Teaching Staff Register</h3>
          <button onClick={() => navigate('/ht/staff')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Full HR View →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Subject', 'Classes', 'Status', 'Contact', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {STAFF.map((s) => (
                <tr key={s.name} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{s.initials}</div>
                      <div>
                        <div className="text-[13px] font-semibold text-gray-800">{s.name}</div>
                        <div className="text-[11px] text-gray-400">{s.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{s.subject}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500">{s.classes}</td>
                  <td className="px-5 py-3.5">{statusChip[s.status]}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-400">{s.phone}</td>
                  <td className="px-5 py-3.5">
                    {s.status === 'Absent'
                      ? <button onClick={() => toast('Emergency contact sent', 'warning')} className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">Urgent Call</button>
                      : <button onClick={() => toast('Message sent', 'info')} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Message</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StaffActionModal open={actionOpen} onClose={() => setActionOpen(false)} />
    </div>
  );
}
