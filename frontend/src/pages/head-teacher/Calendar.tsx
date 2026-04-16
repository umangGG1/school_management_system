import { useState, useEffect, type ReactElement } from 'react';
import { Modal }       from '../../components/ui/Modal';
import { Chip }        from '../../components/ui/Chip';
import { useToast }    from '../../contexts/ToastContext';
import { calendarApi, type ApiCalendarEvent } from '../../lib/api';

/* ─── Helpers ────────────────────────────────────────────── */
const TYPE_OPTIONS = ['Meeting', 'Academic', 'Finance', 'Community', 'Event', 'Admin', 'Exam', 'Holiday'];

const chipFor = (e: ApiCalendarEvent): ReactElement => {
  const d    = new Date(e.date);
  const now  = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff <= 0)  return <Chip variant="blue">Today</Chip>;
  if (diff <= 3)  return <Chip variant="red">Critical</Chip>;
  if (diff <= 14) return <Chip variant="amber">Upcoming</Chip>;
  return <Chip variant="gray">Scheduled</Chip>;
};

const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); }
  catch { return iso; }
};

const SEED: ApiCalendarEvent[] = [
  { id: '1', schoolId: '', title: 'HOD Curriculum Review Meeting', description: null, date: '2026-03-07', endDate: null, type: 'MEETING',    isSchoolWide: true, classId: null, notes: 'All HODs',            isRecurring: false, createdById: '', createdAt: '' },
  { id: '2', schoolId: '', title: 'UNEB Subject Combination Deadline', description: null, date: '2026-03-10', endDate: null, type: 'ACADEMIC', isSchoolWide: true, classId: null, notes: 'S4 & S6',            isRecurring: false, createdById: '', createdAt: '' },
  { id: '3', schoolId: '', title: 'UNEB Inspection Visit',          description: null, date: '2026-03-13', endDate: null, type: 'EXAM',      isSchoolWide: true, classId: null, notes: 'S4 & S6',            isRecurring: false, createdById: '', createdAt: '' },
  { id: '4', schoolId: '', title: 'Fees Payment Deadline',          description: null, date: '2026-03-15', endDate: null, type: 'OTHER',     isSchoolWide: true, classId: null, notes: 'All Students',        isRecurring: false, createdById: '', createdAt: '' },
  { id: '5', schoolId: '', title: 'Parent-Teacher Conference',      description: null, date: '2026-03-21', endDate: null, type: 'COMMUNITY', isSchoolWide: true, classId: null, notes: 'Parents & Teachers',  isRecurring: false, createdById: '', createdAt: '' },
  { id: '6', schoolId: '', title: 'Sports Day',                     description: null, date: '2026-03-28', endDate: null, type: 'SPORTS',    isSchoolWide: true, classId: null, notes: 'Whole School',        isRecurring: false, createdById: '', createdAt: '' },
  { id: '7', schoolId: '', title: 'End of Term Exams Begin',        description: null, date: '2026-04-04', endDate: null, type: 'EXAM',      isSchoolWide: true, classId: null, notes: 'All Classes',         isRecurring: false, createdById: '', createdAt: '' },
  { id: '8', schoolId: '', title: 'Term 1 Closing Day',             description: null, date: '2026-04-18', endDate: null, type: 'ACADEMIC',  isSchoolWide: true, classId: null, notes: 'Whole School',        isRecurring: false, createdById: '', createdAt: '' },
];

/* ─── Add Event Modal ────────────────────────────────────── */
function AddEventModal({ open, onClose, onAdded }: {
  open: boolean; onClose: () => void; onAdded: (e: ApiCalendarEvent) => void;
}) {
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [title,    setTitle]    = useState('');
  const [date,     setDate]     = useState(today);
  const [type,     setType]     = useState('Meeting');
  const [audience, setAudience] = useState('');
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !date) { toast('Title and date are required', 'warning'); return; }
    setSaving(true);
    try {
      const created = await calendarApi.create({
        title, date, type: type.toUpperCase(),
        isSchoolWide: true,
        description: audience || undefined,
        notes: notes || undefined,
      });
      onAdded(created);
      toast('Event added to calendar ✓', 'success');
    } catch {
      const fake: ApiCalendarEvent = { id: `tmp-${Date.now()}`, schoolId: '', title, date, endDate: null, type: type.toUpperCase(), isSchoolWide: true, classId: null, description: audience || null, notes: notes || null, isRecurring: false, createdById: '', createdAt: new Date().toISOString() };
      onAdded(fake);
      toast('Event added (offline)', 'info');
    } finally { setSaving(false); setTitle(''); setAudience(''); setNotes(''); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} id="add-event" title="📅 Add Calendar Event">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Event Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="e.g. Staff briefing" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none">
              {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Audience</label>
          <input value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="Who this affects..." />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">
            {saving ? '⏳ Saving…' : 'Save Event'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function HTCalendar() {
  const [events,  setEvents]  = useState<ApiCalendarEvent[]>(SEED);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    calendarApi.list('Term 1', '2026')
      .then(data => { if (Array.isArray(data) && data.length) setEvents(data); setOffline(false); })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">School Calendar — Term 1, 2026</h2>
          <p className="text-[13px] text-gray-400 mt-1">Week 8 of 13 · 5 weeks remaining</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">+ Add Event</button>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">Upcoming Events</h3>
        </div>
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Date', 'Event', 'Type', 'Audience / Notes', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-600">{fmtDate(e.date)}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-gray-800">{e.title}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500 capitalize">{e.type.toLowerCase()}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">{e.description ?? e.notes ?? '—'}</td>
                    <td className="px-5 py-3.5">{chipFor(e)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddEventModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={e => setEvents(prev => [...prev, e])} />
    </div>
  );
}
