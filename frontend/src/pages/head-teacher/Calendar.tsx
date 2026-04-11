import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Chip } from '../../components/ui/Chip';
import { useToast } from '../../contexts/ToastContext';

const EVENTS = [
  { date: '07 Mar', event: 'HOD Curriculum Review Meeting', type: 'Meeting', audience: 'All HODs', chip: <Chip variant="blue">Today</Chip> },
  { date: '10 Mar', event: 'UNEB Subject Combination Deadline', type: 'Academic', audience: 'S4 & S6', chip: <Chip variant="amber">Upcoming</Chip> },
  { date: '13 Mar', event: 'UNEB Inspection Visit', type: 'Inspection', audience: 'S4 & S6', chip: <Chip variant="red">Critical</Chip> },
  { date: '15 Mar', event: 'Fees Payment Deadline', type: 'Finance', audience: 'All Students', chip: <Chip variant="amber">Upcoming</Chip> },
  { date: '21 Mar', event: 'Parent-Teacher Conference', type: 'Community', audience: 'Parents & Teachers', chip: <Chip variant="gray">Scheduled</Chip> },
  { date: '28 Mar', event: 'Sports Day', type: 'Event', audience: 'Whole School', chip: <Chip variant="gray">Scheduled</Chip> },
  { date: '04 Apr', event: 'End of Term Exams Begin', type: 'Academic', audience: 'All Classes', chip: <Chip variant="gray">Scheduled</Chip> },
  { date: '18 Apr', event: 'Term 1 Closing Day', type: 'Admin', audience: 'Whole School', chip: <Chip variant="gray">Scheduled</Chip> },
];

function AddEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="add-event" title="📅 Schedule Meeting / Event">
      <div className="space-y-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Event Title</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="e.g. Staff briefing" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label><input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Type</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>Meeting</option><option>Academic</option><option>Finance</option><option>Community</option><option>Event</option><option>Admin</option></select></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Audience</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Who this affects..." /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none" /></div>
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button><button onClick={() => { onClose(); toast('Event added to calendar ✓', 'success'); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Event</button></div>
      </div>
    </Modal>
  );
}

export default function HTCalendar() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">School Calendar — Term 1, 2026</h2>
          <p className="text-[13px] text-gray-400 mt-1">Week 8 of 13 · 5 weeks remaining</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">+ Add Event</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">Upcoming Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Date', 'Event', 'Type', 'Audience', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {EVENTS.map((e) => (
                <tr key={e.event} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-600">{e.date}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-800">{e.event}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500">{e.type}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500">{e.audience}</td>
                  <td className="px-5 py-3.5">{e.chip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddEventModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
