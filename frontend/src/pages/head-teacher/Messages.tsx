import { useState } from 'react';
import { Modal }    from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';

interface Message {
  initials: string;
  color: string;
  from: string;
  subject: string;
  time: string;
  unread: boolean;
  body: string;
}

const INBOX: Message[] = [
  { initials: 'DM', color: 'bg-indigo-500',  from: 'Dorm Master',     subject: '3 missing students — urgent update needed',            time: '30 min ago', unread: true,  body: 'Three students (Okwir James S4B, Auma Gloria S4B, Ssali Ben S3A) have not returned from the weekend exeat. Their parents have been notified. Gate security confirms they left on Friday but have not checked back in. Please advise on next steps.' },
  { initials: 'BU', color: 'bg-amber-400',    from: 'Bursar',          subject: 'Finance summary ready for review',                      time: '1 hr ago',   unread: true,  body: 'Term 1 fee collection stands at 78% (UGX 298.5M of UGX 362.1M expected). Outstanding: UGX 63.6M across 47 students exceeding 60-day arrears. Two supplier invoices (Ngoma Construction UGX 8.5M and Mbale Books UGX 6.8M) are overdue and await your approval for payment.' },
  { initials: 'NS', color: 'bg-emerald-500',  from: 'Nurse Nakamya',   subject: 'Sick bay update — 2 students need parent call',         time: '2 hrs ago',  unread: true,  body: 'Current sick bay population: 7 students. Of these, Nakibuule Sarah (S5A) and Opolot David (S3B) are showing persistent fever and require parent notification before further medical action. Both have been referred to Ngara Health Centre for further assessment.' },
  { initials: 'EO', color: 'bg-violet-500',   from: 'Exam Officer',    subject: 'UNEB registration deadline — action required',          time: 'Yesterday',  unread: false, body: 'The UNEB final registration deadline for S4 and S6 candidates is 14th March 2026. We still have 12 students with incomplete subject combinations. Please authorise the ICT Officer to print and submit the final candidate list by Wednesday 12th March.' },
  { initials: 'HS', color: 'bg-red-500',      from: 'Head of Security',subject: 'Security incident report — gate breach attempt',        time: 'Yesterday',  unread: false, body: 'At approximately 21:45 on Friday, an unknown individual attempted to access the school through the rear perimeter near Boys Dorm C. Security responded immediately; no entry was made. The individual fled on foot. A full incident report has been logged in the security register. CCTV footage is available for review.' },
];

function MessageModal({ msg, onClose }: { msg: Message | null; onClose: () => void }) {
  const { toast } = useToast();
  if (!msg) return null;
  return (
    <Modal open={!!msg} onClose={onClose} id="msg-thread" title={`💬 ${msg.from}`} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Subject</div>
          <div className="text-[13px] font-semibold text-gray-800">{msg.subject}</div>
          <div className="text-[11px] text-gray-400 mt-1">{msg.time}</div>
        </div>
        <div className="text-[13px] text-gray-700 leading-relaxed">{msg.body}</div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reply</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[90px] resize-y focus:outline-none focus:border-indigo-400"
            placeholder="Type your reply..."
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Close</button>
          <button
            onClick={() => { onClose(); toast(`Reply sent to ${msg.from} ✓`, 'success'); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >📤 Send Reply</button>
        </div>
      </div>
    </Modal>
  );
}

export default function HTMessages() {
  const { toast }  = useToast();
  const [selected, setSelected] = useState<Message | null>(null);
  const [read, setRead]         = useState<Set<string>>(new Set());

  const openMsg = (m: Message) => {
    setSelected(m);
    setRead(prev => new Set([...prev, m.subject]));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Messages &amp; Communications</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inbox */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">Inbox</h3>
            <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {INBOX.filter(m => m.unread && !read.has(m.subject)).length} unread
            </span>
          </div>
          <div className="space-y-0">
            {INBOX.map((m, i) => {
              const isUnread = m.unread && !read.has(m.subject);
              return (
                <button
                  key={i}
                  onClick={() => openMsg(m)}
                  className="w-full flex items-start gap-3 py-3 border-b border-gray-100 last:border-none hover:bg-gray-50/60 -mx-1 px-1 rounded-lg transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-full ${m.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>{m.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>{m.from}</span>
                      {isUnread && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                    </div>
                    <div className="text-[12px] text-gray-400 truncate mt-0.5">{m.subject}</div>
                  </div>
                  <span className="text-[11px] text-gray-300 flex-shrink-0 mt-0.5">{m.time}</span>
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
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
                <option>All Staff</option><option>All HODs</option><option>Boarding Staff</option><option>Security Team</option><option>Finance Team</option><option>All Students</option><option>All Parents</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" placeholder="Message subject..." />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
              <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[120px] resize-y focus:outline-none focus:border-indigo-400" placeholder="Type your message..." />
            </div>
            <button
              onClick={() => toast('Message sent to all staff', 'success')}
              className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >📤 Send Message</button>
          </div>
        </div>
      </div>

      <MessageModal msg={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
