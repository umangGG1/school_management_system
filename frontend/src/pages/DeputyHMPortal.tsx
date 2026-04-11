import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Chip } from '../components/ui/Chip';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const TIMETABLE = [
  { time: '7:30-8:20', s1a:'Maths', s2a:'English', s3a:'History', s4a:'Chemistry', s5a:'Physics', s6a:'Maths' },
  { time: '8:20-9:10', s1a:'English',s2a:'Maths',s3a:'Physics',s4a:'Maths',s5a:'Biology',s6a:'Physics' },
  { time: '9:10-10:00',s1a:'Science',s2a:'History',s3a:'Maths',s4a:'English',s5a:'Chemistry',s6a:'Further Maths' },
];

const COVER_NEEDED = [
  { class: 'S4B', period: 'P3 — 10:30', subject: 'Chemistry', reason: 'Mr. Byamugisha absent', covered: false },
  { class: 'S2A', period: 'P5 — 12:00', subject: 'Biology', reason: 'Ms. Namukasa on leave', covered: true },
];

export default function DeputyHMPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-indigo-800">
      <div className="px-5 py-5 border-b border-white/10"><div className="text-white font-bold text-xl">SMISSI</div><div className="text-white/60 text-xs mt-0.5">Deputy HM Portal</div></div>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AP</div>
        <div><div className="text-white text-[13px] font-semibold">{user?.name ?? 'Ms. Achieng Prossy'}</div><div className="text-white/45 text-[11px]">Deputy Head Teacher</div></div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[['🏠','Dashboard'],['📐','Timetable'],['🔄','Cover Lessons'],['📚','Curriculum'],['👥','Staff Management'],['📊','Academic Reports']].map(([icon, label]) => (
          <button key={label} onClick={() => toast(`Opening ${label}...`,'info')} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-white/70 hover:bg-white/10 hover:text-white transition-colors"><span>{icon}</span>{label}</button>
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
        <div className="mb-6"><h1 className="text-[20px] font-bold text-gray-900">Academic Administration</h1><p className="text-[13px] text-gray-400 mt-1">Ms. Achieng Prossy · Deputy Head Teacher · Term 1, Week 8</p></div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Classes Today" value="48" icon="📚" iconBg="blue" accent="blue"/>
          <StatCard title="Cover Lessons Needed" value="2" icon="🔄" iconBg="amber" accent="amber" trend="Action needed" trendType="down"/>
          <StatCard title="Staff Present" value="92/98" icon="👥" iconBg="green" accent="green"/>
          <StatCard title="Syllabus Coverage" value="68%" icon="📖" iconBg="purple" accent="purple"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Syllabus Coverage by Department</h3>
            <ProgressBar label="Mathematics" value={74} color="blue"/>
            <ProgressBar label="Sciences" value={68} color="green"/>
            <ProgressBar label="Languages" value={81} color="teal"/>
            <ProgressBar label="Humanities" value={72} color="purple"/>
            <ProgressBar label="Technical" value={55} color="amber"/>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[15px] font-bold text-gray-900">Cover Lessons Needed</h3><Chip variant="red">2 open</Chip></div>
            {COVER_NEEDED.map(c=>(
              <div key={c.class+c.period} className="py-3 border-b border-gray-100 last:border-none">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-800">{c.class} — {c.subject}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{c.period} · {c.reason}</div>
                  </div>
                  <Chip variant={c.covered?'green':'red'}>{c.covered?'Covered':'Open'}</Chip>
                </div>
                {!c.covered&&<button onClick={()=>toast('Cover teacher assigned','success')} className="mt-2 px-3 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100">Assign Cover Teacher</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Today's Timetable (Partial)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Time','S1A','S2A','S3A','S4A','S5A','S6A'].map(h=><th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {TIMETABLE.map(t=>(
                  <tr key={t.time} className="hover:bg-gray-50/60">
                    <td className="px-3 py-2.5 font-semibold text-gray-500 whitespace-nowrap">{t.time}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.s1a}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.s2a}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.s3a}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.s4a}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.s5a}</td>
                    <td className="px-3 py-2.5 text-gray-700">{t.s6a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
