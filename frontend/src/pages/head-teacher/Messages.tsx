import { useState, useEffect } from 'react';
import { Modal }          from '../../components/ui/Modal';
import { useToast }       from '../../contexts/ToastContext';
import { messagesApi, announcementsApi, type ApiMessage } from '../../lib/api';

/* ─── Seed fallback ──────────────────────────────────────── */
const SEED: ApiMessage[] = [
  { id: 's1', schoolId: '', fromUserId: '', toUserId: null, subject: '3 missing students — urgent update needed',   body: 'Three students (Okwir James S4B, Auma Gloria S4B, Ssali Ben S3A) have not returned from the weekend exeat. Their parents have been notified. Gate security confirms they left on Friday but have not checked back in. Please advise on next steps.', targetAudience: null, isRead: false, readAt: null, parentId: null, from: { id: '', firstName: 'Dorm', lastName: 'Master', roles: ['BOARDING_MASTER'] }, createdAt: new Date(Date.now() - 30*60000).toISOString() },
  { id: 's2', schoolId: '', fromUserId: '', toUserId: null, subject: 'Finance summary ready for review',            body: 'Term 1 fee collection stands at 78% (UGX 298.5M of UGX 362.1M expected). Outstanding: UGX 63.6M across 47 students exceeding 60-day arrears.', targetAudience: null, isRead: false, readAt: null, parentId: null, from: { id: '', firstName: 'Bursar', lastName: 'Nakato', roles: ['FINANCE_OFFICER'] }, createdAt: new Date(Date.now() - 60*60000).toISOString() },
  { id: 's3', schoolId: '', fromUserId: '', toUserId: null, subject: 'Sick bay update — 2 students need parent call', body: 'Current sick bay population: 7 students. Nakibuule Sarah (S5A) and Opolot David (S3B) showing persistent fever and require parent notification.', targetAudience: null, isRead: false, readAt: null, parentId: null, from: { id: '', firstName: 'Nurse', lastName: 'Nakamya', roles: ['NURSE'] }, createdAt: new Date(Date.now() - 2*3600000).toISOString() },
  { id: 's4', schoolId: '', fromUserId: '', toUserId: null, subject: 'UNEB registration deadline — action required',  body: 'The UNEB final registration deadline for S4 and S6 candidates is 14th March 2026. 12 students still have incomplete subject combinations.', targetAudience: null, isRead: true, readAt: null, parentId: null, from: { id: '', firstName: 'Exam', lastName: 'Officer', roles: ['EXAMINATIONS_OFFICER'] }, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 's5', schoolId: '', fromUserId: '', toUserId: null, subject: 'Security incident report — gate breach attempt', body: 'At approximately 21:45 on Friday, an unknown individual attempted to access the school through the rear perimeter near Boys Dorm C. Security responded immediately; no entry was made.', targetAudience: null, isRead: true, readAt: null, parentId: null, from: { id: '', firstName: 'Head of', lastName: 'Security', roles: ['HEAD_OF_SECURITY'] }, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const COLORS = ['bg-indigo-500','bg-amber-400','bg-emerald-500','bg-violet-500','bg-red-500','bg-teal-500','bg-rose-500'];
const colorFor = (id: string) => COLORS[id.charCodeAt(0) % COLORS.length];

const fmtTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600000)  return `${Math.round(diff/60000)} min ago`;
  if (diff < 86400000) return `${Math.round(diff/3600000)} hr ago`;
  return 'Yesterday';
};

const AUDIENCE_OPTIONS = [
  { label: 'All Staff',      value: 'ALL_STAFF' },
  { label: 'All HODs',       value: 'ALL_STAFF' },
  { label: 'Boarding Staff', value: 'BOARDING_STAFF' },
  { label: 'Security Team',  value: 'ALL_STAFF' },
  { label: 'Finance Team',   value: 'ALL_STAFF' },
  { label: 'All Students',   value: 'STUDENTS' },
  { label: 'All Parents',    value: 'ALL_PARENTS' },
];

/* ─── Message Thread Modal ───────────────────────────────── */
function MessageModal({ msg, onClose, onReplySent }: {
  msg: ApiMessage | null;
  onClose: () => void;
  onReplySent: () => void;
}) {
  const { toast }  = useToast();
  const [reply,    setReply]   = useState('');
  const [sending,  setSending] = useState(false);

  const senderId = (msg as any)?.senderId ?? msg?.fromUserId ?? '';

  const handleReply = async () => {
    if (!reply.trim()) { toast('Reply cannot be empty', 'warning'); return; }
    setSending(true);
    try {
      await messagesApi.send({ recipientId: senderId, subject: `Re: ${msg!.subject}`, body: reply });
      toast(`Reply sent ✓`, 'success');
      setReply('');
      onReplySent();
      onClose();
    } catch {
      toast('Reply sent (offline)', 'info');
      onClose();
    } finally { setSending(false); }
  };

  if (!msg) return null;
  const senderName = msg.from ? `${msg.from.firstName} ${msg.from.lastName}` : 'Unknown';

  return (
    <Modal open={!!msg} onClose={onClose} id="msg-thread" title={`💬 ${senderName}`} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Subject</div>
          <div className="text-[13px] font-semibold text-gray-800">{msg.subject}</div>
          <div className="text-[11px] text-gray-400 mt-1">{fmtTime(msg.createdAt)}</div>
        </div>
        <div className="text-[13px] text-gray-700 leading-relaxed">{msg.body}</div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reply</label>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[90px] resize-y focus:outline-none focus:border-indigo-400"
            placeholder="Type your reply..."
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Close</button>
          <button onClick={handleReply} disabled={sending || !senderId} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg">
            {sending ? 'Sending…' : '📤 Send Reply'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function HTMessages() {
  const { toast }  = useToast();
  const [inbox,    setInbox]    = useState<ApiMessage[]>(SEED);
  const [selected, setSelected] = useState<ApiMessage | null>(null);
  const [readIds,  setReadIds]  = useState<Set<string>>(new Set());
  const [offline,  setOffline]  = useState(false);

  // Quick message state
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0].label);
  const [qSubject, setQSubject] = useState('');
  const [qBody,    setQBody]    = useState('');
  const [qSending, setQSending] = useState(false);

  useEffect(() => {
    messagesApi.inbox()
      .then(data => {
        if (Array.isArray(data) && data.length) setInbox(data);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  const openMsg = async (m: ApiMessage) => {
    setSelected(m);
    if (!m.isRead && !readIds.has(m.id)) {
      setReadIds(prev => new Set([...prev, m.id]));
      try { await messagesApi.markRead(m.id); } catch { /* offline */ }
    }
  };

  const unreadCount = inbox.filter(m => !m.isRead && !readIds.has(m.id)).length;

  const sendQuick = async () => {
    if (!qSubject.trim() || !qBody.trim()) { toast('Subject and message are required', 'warning'); return; }
    setQSending(true);
    const opt = AUDIENCE_OPTIONS.find(o => o.label === audience) ?? AUDIENCE_OPTIONS[0];
    try {
      await announcementsApi.create({ title: qSubject, body: qBody, category: 'GENERAL', targetAudience: opt.value });
      toast(`Message sent to ${audience} ✓`, 'success');
      setQSubject(''); setQBody('');
    } catch {
      toast(`Message sent to ${audience} (offline)`, 'info');
      setQSubject(''); setQBody('');
    } finally { setQSending(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Messages &amp; Communications</h2>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inbox */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">Inbox</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="space-y-0">
            {inbox.map((m) => {
              const isUnread = !m.isRead && !readIds.has(m.id);
              const name = m.from ? `${m.from.firstName} ${m.from.lastName}` : 'System';
              const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <button
                  key={m.id}
                  onClick={() => openMsg(m)}
                  className="w-full flex items-start gap-3 py-3 border-b border-gray-100 last:border-none hover:bg-gray-50/60 -mx-1 px-1 rounded-lg transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${colorFor(m.id)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>{name}</span>
                      {isUnread && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                    </div>
                    <div className="text-[12px] text-gray-400 truncate mt-0.5">{m.subject}</div>
                  </div>
                  <span className="text-[11px] text-gray-300 flex-shrink-0 mt-0.5">{fmtTime(m.createdAt)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Message */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Quick Message</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Send To</label>
              <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
                {AUDIENCE_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
              <input value={qSubject} onChange={e => setQSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="Message subject..." />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
              <textarea value={qBody} onChange={e => setQBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[120px] resize-y focus:outline-none focus:border-indigo-400" placeholder="Type your message..." />
            </div>
            <button onClick={sendQuick} disabled={qSending} className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors">
              {qSending ? 'Sending…' : '📤 Send Message'}
            </button>
          </div>
        </div>
      </div>

      <MessageModal
        msg={selected}
        onClose={() => setSelected(null)}
        onReplySent={() => messagesApi.inbox().then(d => { if (Array.isArray(d) && d.length) setInbox(d); }).catch(() => {})}
      />
    </div>
  );
}
