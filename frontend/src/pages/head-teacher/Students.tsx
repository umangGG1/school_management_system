import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { AlertItem } from '../../components/ui/AlertItem';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';

function StudentActionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="stud-act" title="⚠️ Student Action">
      <div className="space-y-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Student Name</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Full name" /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Action</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>Parent Summons</option><option>Written Warning</option><option>Suspension</option><option>Mark as Found/Returned</option><option>Medical Leave</option></select></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none" placeholder="Additional notes..." /></div>
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button><button onClick={() => { onClose(); toast('Student action recorded ✓', 'success'); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Submit</button></div>
      </div>
    </Modal>
  );
}

const CLASSES = [
  { cls: 'Senior 1', students: 278, streams: 'S1A, S1B, S1C', pct: 94, chipVariant: 'green' as const },
  { cls: 'Senior 2', students: 234, streams: 'S2A, S2B, S2C', pct: 92, chipVariant: 'green' as const },
  { cls: 'Senior 3', students: 214, streams: 'S3A, S3B',       pct: 88, chipVariant: 'amber' as const },
  { cls: 'Senior 4', students: 248, streams: 'S4A, S4B, S4C', pct: 91, chipVariant: 'green' as const },
  { cls: 'Senior 5', students: 91,  streams: 'S5A, S5B',       pct: 96, chipVariant: 'green' as const },
  { cls: 'Senior 6', students: 142, streams: 'S6A, S6B',       pct: 97, chipVariant: 'green' as const },
];

export default function HTStudents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actionOpen, setActionOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Student Overview</h2>
          <p className="text-[13px] text-gray-400 mt-1">1,247 enrolled · Term 1, 2026</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => toast('Opening admissions portal...', 'info')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">📋 Admissions</button>
          <button onClick={() => setActionOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">⚠️ Student Action</button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students" value="1,247" icon="👦" iconBg="blue" accent="blue" trend="S1–S6" trendType="flat" />
        <StatCard title="Boarding Students" value="684" icon="🛏️" iconBg="green" accent="green" trend="Boarding" trendType="flat" />
        <StatCard title="Day Students" value="563" icon="🏠" iconBg="amber" accent="amber" trend="Day" trendType="flat" />
        <StatCard title="Absentees Today" value="18" icon="❌" iconBg="red" accent="red" trend="3 new" trendType="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Enrolment by class */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-900">Enrolment by Class</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Class','Students','Streams','Attendance','View'].map(h=><th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {CLASSES.map(c => (
                  <tr key={c.cls} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{c.cls}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-600">{c.students}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-400">{c.streams}</td>
                    <td className="px-5 py-3"><Chip variant={c.chipVariant}>{c.pct}%</Chip></td>
                    <td className="px-5 py-3"><button onClick={() => toast(`Viewing ${c.cls}...`, 'info')} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Issues */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">⚠️ Pending Student Issues</h3>
            <button onClick={() => toast('Opening dorm master portal...', 'info')} className="text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md">Dorm →</button>
          </div>
          <AlertItem dot="red" text="3 students missing — not returned from exeat" meta="Boarding · S4B" actionLabel="Action" onAction={() => setActionOpen(true)} />
          <AlertItem dot="amber" text="Okwir James — disciplinary case pending" meta="S3A · Fighting" actionLabel="Review" onAction={() => setActionOpen(true)} />
          <AlertItem dot="amber" text="Nakibuule Sarah — fee arrears 68 days" meta="S5A · Parent contacted" actionLabel="Finance" onAction={() => navigate('/ht/finance')} />
          <AlertItem dot="blue" text="Ssali Robert — medical leave request" meta="S6A · Nurse referred" actionLabel="Nurse" onAction={() => toast('Opening nurse portal...', 'info')} />
        </div>
      </div>

      <StudentActionModal open={actionOpen} onClose={() => setActionOpen(false)} />
    </div>
  );
}
