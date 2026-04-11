import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Chip } from '../components/ui/Chip';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const GATE_LOG = [
  { name: 'Nakato Sarah', cls: 'S4A', type: 'Exeat Return', time: '5:47 PM', guard: 'Okello', status: 'green' as const },
  { name: 'Mr. Okullo P.', cls: 'Visitor', type: 'Parent Visit', time: '9:14 AM', guard: 'Okello', status: 'blue' as const },
  { name: 'UNEB Official', cls: 'Visitor', type: 'Official Visit', time: '11:05 AM', guard: 'Byaruhanga', status: 'amber' as const },
  { name: 'Deliver Uganda', cls: 'Supplier', type: 'Delivery', time: '10:20 AM', guard: 'Mwesige', status: 'gray' as const },
];

export default function SecurityPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-slate-800">
      <div className="px-5 py-5 border-b border-white/10"><div className="text-white font-bold text-xl">SMISSI</div><div className="text-white/60 text-xs mt-0.5">Security Portal</div></div>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">PB</div>
        <div><div className="text-white text-[13px] font-semibold">{user?.name ?? 'Sgt. Byaruhanga P.'}</div><div className="text-white/45 text-[11px]">Head of Security</div></div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[['🏠','Dashboard'],['🚪','Gate Log'],['👮','Guard Roster'],['🚗','Visitor Register'],['🚨','Incidents'],['📊','Security Report']].map(([icon, label]) => (
          <button key={label} onClick={() => toast(`Opening ${label}...`,'info')} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-white/70 hover:bg-white/10 hover:text-white transition-colors"><span>{icon}</span> {label}</button>
        ))}
      </nav>
      <div className="px-3 pb-3 border-t border-white/10 pt-3"><button onClick={()=>{logout();navigate('/login');}} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"><LogOut className="w-4 h-4"/>Logout</button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow" onClick={() => setMobileOpen(v=>!v)}>{mobileOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
      {mobileOpen&&<div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={()=>setMobileOpen(false)}/>}
      <aside className={cn('md:hidden fixed left-0 top-0 h-full w-64 z-40 transition-transform duration-200',mobileOpen?'translate-x-0':'-translate-x-full')}>{sidebar}</aside>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-30">{sidebar}</aside>
      <div className="md:ml-64 flex-1 p-6">
        <div className="mb-6"><h1 className="text-[20px] font-bold text-gray-900">Security & Access Control</h1><p className="text-[13px] text-gray-400 mt-1">Sgt. Byaruhanga · 4 checkpoints · Term 1, 2026</p></div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Overall Status" value="Secure" icon="🔒" iconBg="green" accent="green" trend="All clear" trendType="up"/>
          <StatCard title="Gates Operational" value="4/4" icon="🚪" iconBg="blue" accent="blue"/>
          <StatCard title="Visitors on Campus" value="12" icon="🚗" iconBg="amber" accent="amber"/>
          <StatCard title="Active Incidents" value="0" icon="🚨" iconBg="red" accent="red" trend="All clear" trendType="up"/>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-gray-900">Gate Access Log — Today</h3>
            <button onClick={()=>toast('Logging new entry...','info')} className="px-3 py-1.5 text-[12px] font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-lg">+ Log Entry</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Name','Class/Type','Visit Type','Time','Guard','Status'].map(h=><th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {GATE_LOG.map(g=>(
                  <tr key={g.name+g.time} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{g.name}</td>
                    <td className="px-5 py-3"><span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded">{g.cls}</span></td>
                    <td className="px-5 py-3 text-[13px] text-gray-500">{g.type}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-400">{g.time}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-500">{g.guard}</td>
                    <td className="px-5 py-3"><Chip variant={g.status}>{g.status==='green'?'Authorized':g.status==='blue'?'Visitor':g.status==='amber'?'Official':'Supplier'}</Chip></td>
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
