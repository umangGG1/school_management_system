import { useState, useEffect } from 'react';
import { Modal }            from '../../components/ui/Modal';
import { Chip }             from '../../components/ui/Chip';
import { useToast }         from '../../contexts/ToastContext';
import { announcementsApi, type ApiAnnouncement } from '../../lib/api';

/* ─── Helpers ────────────────────────────────────────────── */
const AUDIENCE_MAP: Record<string, string> = {
  'All Portals': 'ALL', 'Staff Only': 'ALL_STAFF',
  'Students Only': 'ALL_STUDENTS', 'Parents Only': 'ALL_PARENTS',
  'All Staff': 'ALL_STAFF', 'Teaching Staff Only': 'ALL_STAFF',
  'HODs': 'ALL_STAFF', 'Non-Teaching Staff': 'ALL_STAFF',
};
const CATEGORY_MAP: Record<string, string> = {
  'School-Wide': 'GENERAL', 'Academic': 'ACADEMIC',
  'Boarding': 'BOARDING', 'Finance': 'FINANCE',
};
const typeFor = (cat: string): 'school' | 'academic' | 'admin' =>
  cat === 'ACADEMIC' ? 'academic' : cat === 'GENERAL' ? 'school' : 'admin';

const borderClr = { school: 'border-l-indigo-500', academic: 'border-l-emerald-500', admin: 'border-l-amber-400' };

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso; }
};

/* ─── New Announcement Modal ─────────────────────────────── */
function NewAnnouncementModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (a: ApiAnnouncement) => void;
}) {
  const { toast } = useToast();
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState('School-Wide');
  const [audience, setAudience] = useState('All Portals');
  const [body,     setBody]     = useState('');
  const [saving,   setSaving]   = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { toast('Fill in title and message', 'warning'); return; }
    setSaving(true);
    try {
      const created = await announcementsApi.create({
        title, body,
        category: CATEGORY_MAP[category] ?? 'GENERAL',
        targetAudience: AUDIENCE_MAP[audience] ?? 'ALL',
      });
      onCreated(created);
      toast('Announcement broadcast to all portals ✓', 'success');
    } catch {
      toast('Announcement saved (offline)', 'info');
      onCreated({ id: `tmp-${Date.now()}`, title, body, category: CATEGORY_MAP[category] ?? 'GENERAL', targetAudience: AUDIENCE_MAP[audience] ?? 'ALL', isPinned: false, publishAt: null, expiresAt: null, isArchived: false, schoolId: '', createdById: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    } finally { setSaving(false); setTitle(''); setBody(''); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} id="ann-new" title="📢 New School Announcement">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" placeholder="Announcement title..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>School-Wide</option><option>Academic</option><option>Boarding</option><option>Finance</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Send To</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>All Portals</option><option>Staff Only</option><option>Students Only</option><option>Parents Only</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[100px] resize-y focus:outline-none" placeholder="Write your announcement here..." />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSend} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">
            {saving ? '⏳ Sending…' : '📢 Broadcast'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Circular Modal ─────────────────────────────────────── */
function CircularModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (a: ApiAnnouncement) => void;
}) {
  const { toast } = useToast();
  const [circNo,    setCircNo]    = useState('');
  const [subject,   setSubject]   = useState('');
  const [addressee, setAddressee] = useState('All Staff');
  const [body,      setBody]      = useState('');
  const [saving,    setSaving]    = useState(false);

  const handleIssue = async () => {
    if (!subject.trim() || !body.trim()) { toast('Fill in subject and body', 'warning'); return; }
    setSaving(true);
    const fullTitle = circNo.trim() ? `[${circNo.trim()}] ${subject}` : subject;
    try {
      const created = await announcementsApi.create({ title: fullTitle, body, category: 'GENERAL', targetAudience: AUDIENCE_MAP[addressee] ?? 'ALL_STAFF' });
      onCreated(created);
      toast('Circular issued and distributed ✓', 'success');
    } catch {
      toast('Circular saved (offline)', 'info');
      onCreated({ id: `tmp-${Date.now()}`, title: fullTitle, body, category: 'GENERAL', targetAudience: AUDIENCE_MAP[addressee] ?? 'ALL_STAFF', isPinned: false, publishAt: null, expiresAt: null, isArchived: false, schoolId: '', createdById: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    } finally { setSaving(false); setCircNo(''); setSubject(''); setBody(''); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} id="circular" title="📄 Issue Official Circular">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Circular Number</label>
            <input value={circNo} onChange={e => setCircNo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="HT/2026/008" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Addressees</label>
            <select value={addressee} onChange={e => setAddressee(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              <option>All Staff</option><option>Teaching Staff Only</option><option>HODs</option><option>Non-Teaching Staff</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Circular subject" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[120px] resize-y focus:outline-none" placeholder="Dear Staff, ..." />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleIssue} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">
            {saving ? '⏳ Issuing…' : 'Issue Circular'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Edit Modal ─────────────────────────────────────────── */
function EditAnnouncementModal({ open, onClose, ann, onSaved }: {
  open: boolean; onClose: () => void;
  ann: ApiAnnouncement | null;
  onSaved: (id: string, title: string, body: string) => void;
}) {
  const { toast } = useToast();
  const [title,  setTitle]  = useState('');
  const [body,   setBody]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTitle(ann?.title ?? ''); setBody(ann?.body ?? ''); }, [ann]);

  const handleSave = async () => {
    if (!ann) return;
    setSaving(true);
    try {
      await announcementsApi.update(ann.id, { title, body });
      onSaved(ann.id, title, body);
      toast('Announcement updated ✓', 'success');
    } catch {
      onSaved(ann.id, title, body);
      toast('Updated (offline)', 'info');
    } finally { setSaving(false); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} id="ann-edit" title="✏️ Edit Announcement">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[110px] resize-y focus:outline-none focus:border-indigo-400" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Recall Modal ───────────────────────────────────────── */
function RecallModal({ open, onClose, ann, onConfirm }: {
  open: boolean; onClose: () => void;
  ann: ApiAnnouncement | null;
  onConfirm: () => void;
}) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleRecall = async () => {
    if (!ann) return;
    setDeleting(true);
    try {
      await announcementsApi.delete(ann.id);
    } catch { /* offline — still remove from UI */ }
    finally {
      setDeleting(false);
      onConfirm();
      toast(`"${ann.title}" recalled from all portals`, 'warning');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} id="ann-recall" title="🗑️ Recall Announcement" size="sm">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Are you sure you want to recall <strong>"{ann?.title}"</strong>? This will remove it from all portals.
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleRecall} disabled={deleting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">
            {deleting ? '⏳ Recalling…' : '🗑️ Yes, Recall'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function HTAnnouncements() {
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [offline,       setOffline]       = useState(false);

  const [annOpen,      setAnnOpen]      = useState(false);
  const [circOpen,     setCircOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState<ApiAnnouncement | null>(null);
  const [recallTarget, setRecallTarget] = useState<ApiAnnouncement | null>(null);

  useEffect(() => {
    announcementsApi.list()
      .then(data => { if (Array.isArray(data)) setAnnouncements(data); setOffline(false); })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (a: ApiAnnouncement) => setAnnouncements(prev => [a, ...prev]);

  const handleSaved = (id: string, title: string, body: string) =>
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, title, body } : a));

  const handleRecalled = () =>
    setAnnouncements(prev => prev.filter(a => a.id !== recallTarget?.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">School Announcements &amp; Circulars</h2>
          <p className="text-[13px] text-gray-400 mt-1">Broadcast to all portals · {announcements.length} active</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setCircOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">📄 Issue Circular</button>
          <button onClick={() => setAnnOpen(true)}  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">📢 New Announcement</button>
        </div>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — changes saved locally only.
        </div>
      )}

      <div className="space-y-4">
        {loading && <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>}
        {!loading && announcements.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-sm">No active announcements</div>
          </div>
        )}
        {announcements.map((a) => {
          const type = typeFor(a.category);
          return (
            <div key={a.id} className={`bg-white border border-gray-200 border-l-4 rounded-xl p-5 shadow-sm ${borderClr[type]}`}>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Chip variant={type === 'school' ? 'purple' : type === 'academic' ? 'green' : 'amber'}>
                  {a.category}
                </Chip>
                {a.audience && <Chip variant="blue">{a.audience}</Chip>}
                <span className="text-[14px] font-bold text-gray-900 ml-1">{a.title}</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed">{a.body}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[11px] text-gray-300">
                  Posted: {fmtDate(a.createdAt)} · By: {a.createdBy ? `${a.createdBy.firstName} ${a.createdBy.lastName}` : 'Head Teacher'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setEditTarget(a)} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">✏️ Edit</button>
                  <button onClick={() => setRecallTarget(a)} className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">🗑️ Recall</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <NewAnnouncementModal open={annOpen}     onClose={() => setAnnOpen(false)}     onCreated={handleCreated} />
      <CircularModal        open={circOpen}    onClose={() => setCircOpen(false)}    onCreated={handleCreated} />
      <EditAnnouncementModal
        open={!!editTarget}   onClose={() => setEditTarget(null)}
        ann={editTarget}      onSaved={handleSaved}
      />
      <RecallModal
        open={!!recallTarget} onClose={() => setRecallTarget(null)}
        ann={recallTarget}    onConfirm={handleRecalled}
      />
    </div>
  );
}
