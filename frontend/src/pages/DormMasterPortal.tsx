import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Chip } from '../components/ui/Chip';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const ROLL_CALL = [
  { dorm: 'Boys Dorm A (Nile)', capacity: 120, present: 117, missing: 3, status: 'red' as const },
  { dorm: 'Boys Dorm B (Victoria)', capacity: 100, present: 100, missing: 0, status: 'green' as const },
  { dorm: 'Boys Dorm C (Kyoga)', capacity: 80, present: 80, missing: 0, status: 'green' as const },
  { dorm: 'Girls Dorm A (Ruwenzori)', capacity: 110, present: 108, missing: 2, status: 'amber' as const },
  { dorm: 'Girls Dorm B (Elgon)', capacity: 90, present: 90, missing: 0, status: 'green' as const },
];

const MISSING = [
  { name: 'Opio Samuel', cls: 'S4B', dorm: 'Boys Dorm A', exeat: 'Fri 4 PM', expected: 'Sun 6 PM', contacted: true },
  { name: 'Nakato Ruth',  cls: 'S4B', dorm: 'Girls Dorm A', exeat: 'Fri 4 PM', expected: 'Sun 6 PM', contacted: true },
  { name: 'Byarugaba K.', cls: 'S4B', dorm: 'Boys Dorm A', exeat: 'Fri 4 PM', expected: 'Sun 6 PM', contacted: false },
];

export default function DormMasterPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-cyan-800">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-white font-bold text-xl">SMISSI</div>
        <div className="text-white/60 text-xs mt-0.5">Dorm Master Portal</div>
      </div>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">OF</div>
        <div>
          <div className="text-white text-[13px] font-semibold">{user?.name ?? 'Mr. Opolot Fred'}</div>
          <div className="text-white/45 text-[11px]">Dorm Master — Boys</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[['🏠','Dashboard'],['🛏️','Roll Call'],['🚪','Exeat Management'],['⚠️','Incidents'],['📋','Night Reports'],['📊','Welfare Reports']].map(([icon, label]) => (
          <button key={label} onClick={() => toast(`Opening ${label}...`, 'info')} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <span>{icon}</span> {label}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-3 border-t border-white/10 pt-3">
        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow" onClick={() => setMobileOpen(v => !v)}>
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {mobileOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />}
      <aside className={cn('md:hidden fixed left-0 top-0 h-full w-64 z-40 transition-transform duration-200', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>{sidebar}</aside>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-30">{sidebar}</aside>

      <div className="md:ml-64 flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-gray-900">Dormitory Management</h1>
          <p className="text-[13px] text-gray-400 mt-1">Mr. Opolot Fred · 684 boarding students · Term 1, 2026</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Accounted For" value="681" icon="✅" iconBg="green" accent="green" />
          <StatCard title="Missing (Exeat)" value="3" icon="❓" iconBg="red" accent="red" trend="⚠️ Critical" trendType="down" />
          <StatCard title="On Approved Leave" value="12" icon="🏠" iconBg="amber" accent="amber" />
          <StatCard title="In Sick Bay" value="7" icon="🏥" iconBg="teal" accent="teal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Roll call */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-900">Evening Roll Call</h3>
              <Chip variant="amber">3 missing</Chip>
            </div>
            {ROLL_CALL.map(d => (
              <div key={d.dorm} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-none">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-800 truncate">{d.dorm}</div>
                  <div className="text-[11px] text-gray-400">{d.present}/{d.capacity} present</div>
                </div>
                <Chip variant={d.status}>{d.missing > 0 ? `${d.missing} missing` : 'All present'}</Chip>
              </div>
            ))}
          </div>

          {/* Missing Students */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-900">🚨 Missing Students</h3>
              <button onClick={() => toast('Head Teacher notified!', 'warning')} className="px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">Alert HT</button>
            </div>
            {MISSING.map(s => (
              <div key={s.name} className="py-3 border-b border-gray-100 last:border-none">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-red-700">{s.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{s.cls} · {s.dorm} · Exeat: {s.exeat} → Due: {s.expected}</div>
                  </div>
                  <Chip variant={s.contacted ? 'amber' : 'red'}>{s.contacted ? 'Parent called' : 'Not contacted'}</Chip>
                </div>
                {!s.contacted && (
                  <button onClick={() => toast(`Calling ${s.name}'s parent...`, 'warning')} className="mt-2 px-3 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100">📞 Call Parent</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
