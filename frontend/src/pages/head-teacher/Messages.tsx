import { useToast } from '../../contexts/ToastContext';

const INBOX = [
  { initials: 'DM', color: 'bg-indigo-500', from: 'Dorm Master', subject: '3 missing students — urgent update needed', time: '30 min ago', unread: true },
  { initials: 'BU', color: 'bg-amber-400', from: 'Bursar', subject: 'Finance summary ready for review', time: '1 hr ago', unread: true },
  { initials: 'NS', color: 'bg-emerald-500', from: 'Nurse Nakamya', subject: 'Sick bay update — 2 students need parent call', time: '2 hrs ago', unread: true },
  { initials: 'EO', color: 'bg-violet-500', from: 'Exam Officer', subject: 'UNEB registration deadline — action required', time: 'Yesterday', unread: false },
  { initials: 'HS', color: 'bg-red-500', from: 'Head of Security', subject: 'Security incident report — gate breach attempt', time: 'Yesterday', unread: false },
];

export default function HTMessages() {
  const { toast } = useToast();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Messages & Communications</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inbox */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">Inbox</h3>
            <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">5 unread</span>
          </div>
          <div className="space-y-0">
            {INBOX.map((m, i) => (
              <button
                key={i}
                onClick={() => toast('Opening message...', 'info')}
                className="w-full flex items-start gap-3 py-3 border-b border-gray-100 last:border-none hover:bg-gray-50/60 -mx-1 px-1 rounded-lg transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-full ${m.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>{m.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[13px] font-semibold ${m.unread ? 'text-gray-900' : 'text-gray-600'}`}>{m.from}</span>
                    {m.unread && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                  </div>
                  <div className="text-[12px] text-gray-400 truncate mt-0.5">{m.subject}</div>
                </div>
                <span className="text-[11px] text-gray-300 flex-shrink-0 mt-0.5">{m.time}</span>
              </button>
            ))}
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
            <button onClick={() => toast('Message sent to all staff', 'success')} className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">📤 Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}
