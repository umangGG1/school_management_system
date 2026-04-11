import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Chip } from '../../components/ui/Chip';
import { useToast } from '../../contexts/ToastContext';

function NewAnnouncementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="ann-new" title="📢 New School Announcement">
      <div className="space-y-4">
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Announcement Title</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="Title..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>School-Wide</option><option>Academic</option><option>Boarding</option><option>Finance</option></select></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>Normal</option><option>High</option><option>Urgent</option></select></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Send To</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>All Portals</option><option>Staff Only</option><option>Students Only</option><option>Parents Only</option></select></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[100px] resize-y focus:outline-none" placeholder="Write your announcement here..." /></div>
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button><button onClick={() => { onClose(); toast('Announcement broadcast to all portals ✓', 'success'); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">📢 Broadcast</button></div>
      </div>
    </Modal>
  );
}

function CircularModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="circular" title="📄 Issue Official Circular">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Circular Number</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="HT/2026/008" /></div>
          <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label><input type="date" defaultValue="2026-03-07" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" /></div>
        </div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Circular subject" /></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Addressees</label><select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>All Staff</option><option>Teaching Staff Only</option><option>HODs</option><option>Non-Teaching Staff</option></select></div>
        <div><label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Body</label><textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[120px] resize-y focus:outline-none" placeholder="Dear Staff, ..." /></div>
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Save Draft</button><button onClick={() => { onClose(); toast('Circular issued and distributed ✓', 'success'); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Issue Circular</button></div>
      </div>
    </Modal>
  );
}

const ANNOUNCEMENTS = [
  { type: 'school' as const, chips: [{ v: 'purple' as const, l: 'School-Wide' }, { v: 'red' as const, l: 'Urgent' }],
    title: 'UNEB Examination Preparation Guidelines',
    body: 'All Senior 4 and Senior 6 students are required to submit their subject combinations to the Examination Officer by Friday 10th March. Teachers should ensure mock exams are completed and marked before Easter holiday.',
    date: '06 Mar 2026', by: 'Head Teacher' },
  { type: 'academic' as const, chips: [{ v: 'green' as const, l: 'Academic' }],
    title: 'Term 1 Parent-Teacher Meeting — Save the Date',
    body: 'The Term 1 Parent-Teacher Conference is scheduled for Saturday 21st March 2026, from 9:00 AM to 3:00 PM. Class teachers should prepare updated student progress reports.',
    date: '04 Mar 2026', by: 'Head Teacher' },
  { type: 'admin' as const, chips: [{ v: 'amber' as const, l: 'Administration' }],
    title: 'Fee Payment Deadline Reminder — Final Notice',
    body: 'All outstanding school fees must be cleared by 15th March 2026. Students with unpaid fees after this date will be required to call their parents/guardians.',
    date: '02 Mar 2026', by: 'Head Teacher' },
];

const borderClr = { school: 'border-l-indigo-500', academic: 'border-l-emerald-500', admin: 'border-l-amber-400' };

export default function HTAnnouncements() {
  const [annOpen, setAnnOpen] = useState(false);
  const [circOpen, setCircOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">School Announcements & Circulars</h2>
          <p className="text-[13px] text-gray-400 mt-1">Broadcast to all portals</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setCircOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">📄 Issue Circular</button>
          <button onClick={() => setAnnOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">📢 New Announcement</button>
        </div>
      </div>

      <div className="space-y-4">
        {ANNOUNCEMENTS.map((a) => (
          <div key={a.title} className={`bg-white border border-gray-200 border-l-4 rounded-xl p-5 shadow-sm ${borderClr[a.type]}`}>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {a.chips.map(c => <Chip key={c.l} variant={c.v}>{c.l}</Chip>)}
              <span className="text-[14px] font-bold text-gray-900 ml-1">{a.title}</span>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">{a.body}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-gray-300">Posted: {a.date} · By: {a.by}</span>
              <div className="flex gap-2">
                <button onClick={() => toast('Opening editor...', 'info')} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">✏️ Edit</button>
                <button onClick={() => toast('Announcement recalled', 'warning')} className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">🗑️ Recall</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NewAnnouncementModal open={annOpen} onClose={() => setAnnOpen(false)} />
      <CircularModal open={circOpen} onClose={() => setCircOpen(false)} />
    </div>
  );
}
