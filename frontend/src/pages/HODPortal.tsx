import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Chip } from '../components/ui/Chip';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const DEPT_RESULTS = [
  { subject: 'Mathematics', teacher: 'Ms. Nakakande', classes: 'S1-S6', avg: 73, pass: 88, trend: 'up' as const },
  { subject: 'Additional Maths', teacher: 'Mr. Kato B.', classes: 'S3-S6', avg: 67, pass: 79, trend: 'down' as const },
  { subject: 'Further Maths', teacher: 'Ms. Nakakande', classes: 'S5-S6', avg: 71, pass: 82, trend: 'up' as const },
];

export default function HODPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-emerald-800">
      <div className="px-5 py-5 border-b border-white/10"><div className="text-white font-bold text-xl">SMISSI</div><div className="text-white/60 text-xs mt-0.5">HOD Portal</div></div>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AN</div>
        <div><div className="text-white text-[13px] font-semibold">{user?.name ?? 'Mrs. Atim Norah'}</div><div className="text-white/45 text-[11px]">HOD — Mathematics</div></div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[['🏠','Dashboard'],['📗','Department Overview'],['👨‍🏫','My Teachers'],['📊','Results Analysis'],['📖','Syllabus Tracker'],['📋','Lesson Plans']].map(([icon, label]) => (
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
        <div className="mb-6"><h1 className="text-[20px] font-bold text-gray-900">Mathematics Department</h1><p className="text-[13px] text-gray-400 mt-1">Mrs. Atim Norah · HOD Mathematics · Term 1, 2026</p></div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Teachers in Dept." value="3" icon="👨‍🏫" iconBg="green" accent="green"/>
          <StatCard title="Classes Covered" value="18" icon="📚" iconBg="blue" accent="blue"/>
          <StatCard title="Dept. Average Score" value="73%" icon="📊" iconBg="amber" accent="amber"/>
          <StatCard title="Syllabus Coverage" value="74%" icon="📖" iconBg="purple" accent="purple"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Department Results by Subject</h3>
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Subject','Teacher','Avg','Pass Rate','Trend'].map(h=><th key={h} className="px-4 py-2 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {DEPT_RESULTS.map(r=>(
                  <tr key={r.subject} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-[13px] font-semibold text-gray-800">{r.subject}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{r.teacher}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-gray-700">{r.avg}%</td>
                    <td className="px-4 py-3"><Chip variant={r.pass>=85?'green':'amber'}>{r.pass}%</Chip></td>
                    <td className={`px-4 py-3 text-base font-bold ${r.trend==='up'?'text-emerald-600':'text-red-500'}`}>{r.trend==='up'?'↑':'↓'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Syllabus Coverage by Class</h3>
            <ProgressBar label="S1 — Foundation Maths" value={80} color="blue"/>
            <ProgressBar label="S2 — Algebra & Geometry" value={75} color="blue"/>
            <ProgressBar label="S3 — Vectors & Calculus" value={68} color="amber"/>
            <ProgressBar label="S4 — O-Level Maths" value={74} color="blue"/>
            <ProgressBar label="S5 — A-Level Maths" value={70} color="green"/>
            <ProgressBar label="S6 — Further Maths" value={65} color="amber"/>
          </div>
        </div>
      </div>
    </div>
  );
}
