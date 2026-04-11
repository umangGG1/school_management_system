import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Chip } from '../components/ui/Chip';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const RESULTS = [
  { subject: 'Mathematics', score: 87, grade: 'A', teacher: 'Ms. Nakakande' },
  { subject: 'English Language', score: 74, grade: 'B', teacher: 'Mrs. Atim' },
  { subject: 'Physics', score: 68, grade: 'C', teacher: 'Mr. Kato' },
  { subject: 'Chemistry', score: 59, grade: 'D', teacher: 'Mr. Byamugisha' },
  { subject: 'Biology', score: 72, grade: 'B', teacher: 'Mr. Opolot' },
];

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-emerald-700">
      <div className="px-5 py-5 border-b border-white/10"><div className="text-white font-bold text-xl">SMISSI</div><div className="text-white/60 text-xs mt-0.5">Student Portal</div></div>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">NS</div>
        <div><div className="text-white text-[13px] font-semibold">{user?.name??'Nakato Sarah'}</div><div className="text-white/45 text-[11px]">S4A — Reg: S4A/001</div></div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[['🏠','My Dashboard'],['📊','My Results'],['📅','Timetable'],['💰','Fee Statement'],['📢','Notices'],['💬','Messages']].map(([icon, label]) => (
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
        <div className="mb-6">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-xl p-5 text-white mb-6">
            <h1 className="text-[18px] font-bold">Welcome back, {user?.name ?? 'Nakato Sarah'} 👋</h1>
            <p className="text-white/70 text-[13px] mt-1">Senior 4A · Term 1, Week 8 · SMISSI Secondary School</p>
          </div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Term Average" value="72%" icon="📊" iconBg="green" accent="green" trend="↑ 4%" trendType="up"/>
          <StatCard title="Attendance Rate" value="94%" icon="✅" iconBg="teal" accent="teal"/>
          <StatCard title="Fee Balance" value="UGX 0" icon="💰" iconBg="green" accent="green" trend="Fully paid" trendType="up"/>
          <StatCard title="Rank in Class" value="4th" icon="🏆" iconBg="amber" accent="amber"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">My Last Exam Results — Mock T1</h3>
            <table className="w-full">
              <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Subject</th><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Score</th><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Grade</th><th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">Teacher</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {RESULTS.map(r=>(
                  <tr key={r.subject} className="hover:bg-gray-50/60">
                    <td className="px-3 py-2.5 text-[13px] font-semibold text-gray-800">{r.subject}</td>
                    <td className="px-3 py-2.5 text-[13px] text-gray-600">{r.score}%</td>
                    <td className="px-3 py-2.5"><Chip variant={r.grade==='A'?'green':r.grade==='B'?'blue':r.grade==='C'?'amber':'red'}>{r.grade}</Chip></td>
                    <td className="px-3 py-2.5 text-[12px] text-gray-400">{r.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Performance by Subject</h3>
            {RESULTS.map(r=><ProgressBar key={r.subject} label={r.subject} value={r.score} color={r.score>=80?'green':r.score>=60?'blue':'amber'}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}
