import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Chip } from '../components/ui/Chip';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const CHILD_RESULTS = [
  { subject: 'Mathematics', score: 87, grade: 'A', trend: 'up' as const },
  { subject: 'English', score: 74, grade: 'B', trend: 'up' as const },
  { subject: 'Physics', score: 68, grade: 'C', trend: 'down' as const },
  { subject: 'Chemistry', score: 59, grade: 'D', trend: 'up' as const },
  { subject: 'Biology', score: 72, grade: 'B', trend: 'flat' as const },
];

const NOTICES = [
  { title: 'UNEB Inspection — 13 Mar 2026', prio: 'HIGH', pClass: 'bg-red-50 text-red-600', date: '07 Mar' },
  { title: 'Fees Payment Deadline — 15 Mar', prio: 'HIGH', pClass: 'bg-red-50 text-red-600', date: '05 Mar' },
  { title: 'Parent-Teacher Conference — 21 Mar', prio: 'MED', pClass: 'bg-amber-50 text-amber-700', date: '04 Mar' },
  { title: 'Sports Day — 28 Mar 2026', prio: 'LOW', pClass: 'bg-emerald-50 text-emerald-700', date: '02 Mar' },
];

export default function ParentPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-orange-700">
      <div className="px-5 py-5 border-b border-white/10"><div className="text-white font-bold text-xl">SMISSI</div><div className="text-white/60 text-xs mt-0.5">Parent Portal</div></div>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">DO</div>
        <div><div className="text-white text-[13px] font-semibold">{user?.name??'Mr. Ochieng David'}</div><div className="text-white/45 text-[11px]">Parent — Nakato Sarah</div></div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[['🏠','My Dashboard'],['📊','Child Progress'],['💰','Fee Statement'],['📢','School Notices'],['💬','Message School'],['🏆','Report Cards']].map(([icon, label]) => (
          <button key={label} onClick={()=>toast(`Opening ${label}...`,'info')} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-white/70 hover:bg-white/10 hover:text-white transition-colors"><span>{icon}</span>{label}</button>
        ))}
      </nav>
      <div className="px-3 pb-3 border-t border-white/10 pt-3"><button onClick={()=>{logout();navigate('/login');}} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"><LogOut className="w-4 h-4"/>Logout</button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow" onClick={()=>setMobileOpen(v=>!v)}>{mobileOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
      {mobileOpen&&<div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={()=>setMobileOpen(false)}/>}
      <aside className={cn('md:hidden fixed left-0 top-0 h-full w-64 z-40 transition-transform duration-200',mobileOpen?'translate-x-0':'-translate-x-full')}>{sidebar}</aside>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-30">{sidebar}</aside>
      <div className="md:ml-64 flex-1 p-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-5 text-white mb-6">
          <h1 className="text-[18px] font-bold">Welcome, {user?.name ?? 'Mr. Ochieng David'} 👋</h1>
          <p className="text-white/80 text-[13px] mt-1">Viewing progress for: <span className="font-bold">Nakato Sarah</span> — Senior 4A · SMISSI Secondary School</p>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Overall Average" value="72%" icon="📊" iconBg="green" accent="green" trend="↑ from 68%" trendType="up"/>
          <StatCard title="Class Attendance" value="94%" icon="✅" iconBg="teal" accent="teal"/>
          <StatCard title="Current Fee Balance" value="UGX 0" icon="💰" iconBg="green" accent="green" trend="Fully paid" trendType="up"/>
          <StatCard title="Class Rank" value="4 / 42" icon="🏆" iconBg="amber" accent="amber"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Nakato Sarah — Latest Results</h3>
            <table className="w-full">
              <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Subject</th><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Score</th><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Grade</th><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Trend</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {CHILD_RESULTS.map(r=>(
                  <tr key={r.subject} className="hover:bg-gray-50/60">
                    <td className="px-3 py-2.5 text-[13px] font-semibold text-gray-800">{r.subject}</td>
                    <td className="px-3 py-2.5 text-[13px] text-gray-600">{r.score}%</td>
                    <td className="px-3 py-2.5"><Chip variant={r.grade==='A'?'green':r.grade==='B'?'blue':r.grade==='C'?'amber':'red'}>{r.grade}</Chip></td>
                    <td className={`px-3 py-2.5 font-bold ${r.trend==='up'?'text-emerald-600':r.trend==='down'?'text-red-500':'text-gray-400'}`}>{r.trend==='up'?'↑':r.trend==='down'?'↓':'→'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-[14px] font-bold text-gray-900 mb-3">Performance Overview</h3>
              {CHILD_RESULTS.map(r=><ProgressBar key={r.subject} label={r.subject} value={r.score} color={r.score>=80?'green':r.score>=60?'blue':'amber'}/>)}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3"><h3 className="text-[14px] font-bold text-gray-900">School Notices</h3></div>
              {NOTICES.map(n=>(
                <div key={n.title} className="flex gap-3 py-2 border-b border-gray-100 last:border-none">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${n.pClass}`}>{n.prio}</span>
                  <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold text-gray-800 truncate">{n.title}</div><div className="text-[10px] text-gray-400">{n.date}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Send a Message to School</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Send To</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"><option>Class Teacher</option><option>Head Teacher</option><option>Bursar</option><option>School Nurse</option></select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" placeholder="e.g. Regarding my child's progress..." />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
              <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[80px] resize-y focus:outline-none" placeholder="Type your message..." />
            </div>
            <div className="lg:col-span-2">
              <button onClick={()=>toast('Message sent to school ✓','success')} className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors">📤 Send Message</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
