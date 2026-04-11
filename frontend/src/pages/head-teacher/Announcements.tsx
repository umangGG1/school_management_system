import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Chip } from '../../components/ui/Chip';
import { useToast } from '../../contexts/ToastContext';

/* ─── Types ──────────────────────────────────────────────── */
interface Announcement {
  id: string;
  type: 'school' | 'academic' | 'admin';
  chips: { v: 'purple' | 'red' | 'green' | 'amber' | 'blue'; l: string }[];
  title: string;
  body: string;
  date: string;
  by: string;
}

/* ─── New Announcement Modal ─────────────────────────────── */
function NewAnnouncementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="ann-new" title="📢 New School Announcement">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Announcement Title</label>
          <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" placeholder="Title..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>School-Wide</option><option>Academic</option><option>Boarding</option><option>Finance</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>Normal</option><option>High</option><option>Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Send To</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
            <option>All Portals</option><option>Staff Only</option><option>Students Only</option><option>Parents Only</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
          <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[100px] resize-y focus:outline-none" placeholder="Write your announcement here..." />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { onClose(); toast('Announcement broadcast to all portals ✓', 'success'); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >📢 Broadcast</button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Circular Modal ─────────────────────────────────────── */
function CircularModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Modal open={open} onClose={onClose} id="circular" title="📄 Issue Official Circular">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Circular Number</label>
            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="HT/2026/008" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" defaultValue="2026-03-07" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
          <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Circular subject" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Addressees</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
            <option>All Staff</option><option>Teaching Staff Only</option><option>HODs</option><option>Non-Teaching Staff</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Body</label>
          <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[120px] resize-y focus:outline-none" placeholder="Dear Staff, ..." />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Save Draft</button>
          <button
            onClick={() => { onClose(); toast('Circular issued and distributed ✓', 'success'); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >Issue Circular</button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Edit Announcement Modal ────────────────────────────── */
function EditAnnouncementModal({
  open, onClose, ann, onSave,
}: {
  open: boolean;
  onClose: () => void;
  ann: Announcement | null;
  onSave: (title: string, body: string) => void;
}) {
  const [title, setTitle] = useState(ann?.title ?? '');
  const [body,  setBody]  = useState(ann?.body  ?? '');

  // Sync when a different announcement is opened for editing
  const handleOpen = () => {
    setTitle(ann?.title ?? '');
    setBody(ann?.body   ?? '');
  };

  return (
    <Modal open={open} onClose={onClose} id="ann-edit" title="✏️ Edit Announcement">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
          <input
            key={ann?.id}
            defaultValue={ann?.title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
          <textarea
            key={ann?.id}
            defaultValue={ann?.body}
            onChange={e => setBody(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[110px] resize-y focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { onSave(title || ann?.title || '', body || ann?.body || ''); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >💾 Save Changes</button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Recall Confirm Modal ───────────────────────────────── */
function RecallModal({
  open, onClose, ann, onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  ann: Announcement | null;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} id="ann-recall" title="🗑️ Recall Announcement" size="sm">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Are you sure you want to recall <strong>"{ann?.title}"</strong>? This will remove it from all portals.
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >🗑️ Yes, Recall</button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Seed data ──────────────────────────────────────────── */
const SEED: Announcement[] = [
  {
    id: '1',
    type: 'school',
    chips: [{ v: 'purple', l: 'School-Wide' }, { v: 'red', l: 'Urgent' }],
    title: 'UNEB Examination Preparation Guidelines',
    body: 'All Senior 4 and Senior 6 students are required to submit their subject combinations to the Examination Officer by Friday 10th March. Teachers should ensure mock exams are completed and marked before Easter holiday.',
    date: '06 Mar 2026', by: 'Head Teacher',
  },
  {
    id: '2',
    type: 'academic',
    chips: [{ v: 'green', l: 'Academic' }],
    title: 'Term 1 Parent-Teacher Meeting — Save the Date',
    body: 'The Term 1 Parent-Teacher Conference is scheduled for Saturday 21st March 2026, from 9:00 AM to 3:00 PM. Class teachers should prepare updated student progress reports.',
    date: '04 Mar 2026', by: 'Head Teacher',
  },
  {
    id: '3',
    type: 'admin',
    chips: [{ v: 'amber', l: 'Administration' }],
    title: 'Fee Payment Deadline Reminder — Final Notice',
    body: 'All outstanding school fees must be cleared by 15th March 2026. Students with unpaid fees after this date will be required to call their parents/guardians.',
    date: '02 Mar 2026', by: 'Head Teacher',
  },
];

const borderClr = {
  school:   'border-l-indigo-500',
  academic: 'border-l-emerald-500',
  admin:    'border-l-amber-400',
};

/* ─── Main Component ─────────────────────────────────────── */
export default function HTAnnouncements() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED);

  // Modal state
  const [annOpen,    setAnnOpen]    = useState(false);
  const [circOpen,   setCircOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [recallTarget, setRecallTarget] = useState<Announcement | null>(null);

  const handleSaveEdit = (title: string, body: string) => {
    setAnnouncements(prev =>
      prev.map(a => a.id === editTarget?.id ? { ...a, title, body } : a)
    );
    toast('Announcement updated ✓', 'success');
  };

  const handleRecall = () => {
    setAnnouncements(prev => prev.filter(a => a.id !== recallTarget?.id));
    toast(`"${recallTarget?.title}" recalled from all portals`, 'warning');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">School Announcements &amp; Circulars</h2>
          <p className="text-[13px] text-gray-400 mt-1">Broadcast to all portals · {announcements.length} active</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setCircOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >📄 Issue Circular</button>
          <button
            onClick={() => setAnnOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >📢 New Announcement</button>
        </div>
      </div>

      {/* Announcement cards */}
      <div className="space-y-4">
        {announcements.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-sm">No active announcements</div>
          </div>
        )}
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`bg-white border border-gray-200 border-l-4 rounded-xl p-5 shadow-sm ${borderClr[a.type]}`}
          >
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {a.chips.map(c => <Chip key={c.l} variant={c.v}>{c.l}</Chip>)}
              <span className="text-[14px] font-bold text-gray-900 ml-1">{a.title}</span>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">{a.body}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-gray-300">Posted: {a.date} · By: {a.by}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditTarget(a)}
                  className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >✏️ Edit</button>
                <button
                  onClick={() => setRecallTarget(a)}
                  className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >🗑️ Recall</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <NewAnnouncementModal open={annOpen}    onClose={() => setAnnOpen(false)} />
      <CircularModal        open={circOpen}   onClose={() => setCircOpen(false)} />
      <EditAnnouncementModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        ann={editTarget}
        onSave={handleSaveEdit}
      />
      <RecallModal
        open={!!recallTarget}
        onClose={() => setRecallTarget(null)}
        ann={recallTarget}
        onConfirm={handleRecall}
      />
    </div>
  );
}
