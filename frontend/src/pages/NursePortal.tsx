import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { Chip } from '../components/ui/Chip';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

const PATIENTS = [
  { name: 'Opio Dennis',    cls: 'S3A', complaint: 'Malaria — fever 39.2°C',  admitted: '07:30 AM', status: 'Admitted', severity: 'red' as const },
  { name: 'Nakamya Julie',  cls: 'S1B', complaint: 'Stomach ache / nausea',   admitted: '09:15 AM', status: 'Observation', severity: 'amber' as const },
  { name: 'Byamukama T.',   cls: 'S4A', complaint: 'Sprained ankle (sports)', admitted: '10:00 AM', status: 'Discharged', severity: 'green' as const },
  { name: 'Achieng Grace',  cls: 'S2B', complaint: 'Headache / eye strain',   admitted: '10:45 AM', status: 'Observation', severity: 'amber' as const },
  { name: 'Odongo Moses',   cls: 'S5A', complaint: 'Typhoid — mild',          admitted: '11:30 AM', status: 'Admitted', severity: 'red' as const },
  { name: 'Nakiboneka R.',  cls: 'S3B', complaint: 'Dental pain',             admitted: '12:00 PM', status: 'Referred', severity: 'purple' as const },
  { name: 'Ssali Robert',   cls: 'S6A', complaint: 'Medical leave request',   admitted: '14:00 PM', status: 'Pending', severity: 'blue' as const },
];

export default function NursePortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-red-800">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-white font-bold text-xl">SMISSI</div>
        <div className="text-white/60 text-xs mt-0.5">Nurse / Medical Portal</div>
      </div>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">NR</div>
        <div>
          <div className="text-white text-[13px] font-semibold">{user?.name ?? 'Sr. Nakamya Rose'}</div>
          <div className="text-white/45 text-[11px]">School Nurse</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {[['🏠','Dashboard'],['🏥','Sick Bay'],['📋','Health Records'],['💊','Medication Log'],['🚑','Referrals'],['📊','Health Reports']].map(([icon, label]) => (
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
          <h1 className="text-[20px] font-bold text-gray-900">Sick Bay — Medical Dashboard</h1>
          <p className="text-[13px] text-gray-400 mt-1">Sr. Nakamya Rose · Saturday, 07 Mar 2026</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Currently in Sick Bay" value="7" icon="🏥" iconBg="red" accent="red" />
          <StatCard title="Admitted (Serious)" value="2" icon="🚨" iconBg="red" accent="red" trend="Needs attention" trendType="down" />
          <StatCard title="Under Observation" value="2" icon="👀" iconBg="amber" accent="amber" />
          <StatCard title="Referred to Hospital" value="3" icon="🚑" iconBg="purple" accent="purple" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-gray-900">Current Patients</h3>
            <button onClick={() => toast('Adding new patient record...', 'info')} className="px-3 py-1.5 text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">+ Add Patient</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Patient','Class','Complaint','Admitted','Status','Action'].map(h=><th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {PATIENTS.map(p => (
                  <tr key={p.name} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{p.name}</td>
                    <td className="px-5 py-3"><span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded">{p.cls}</span></td>
                    <td className="px-5 py-3 text-[13px] text-gray-500">{p.complaint}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-400">{p.admitted}</td>
                    <td className="px-5 py-3"><Chip variant={p.severity}>{p.status}</Chip></td>
                    <td className="px-5 py-3">
                      <button onClick={() => toast(`${p.name} record opened`, 'info')} className="px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">View</button>
                    </td>
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
