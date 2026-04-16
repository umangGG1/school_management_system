import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';

const VISITOR_LOG = [
  { name: 'Mr. Okullo Patrick', purpose: 'Parent Visit — S4A', in: '9:14 AM', badge: 'V-001' },
  { name: 'Deliver Uganda Ltd',  purpose: 'Stationery Delivery',  in: '10:20 AM', badge: 'V-002' },
  { name: 'UNEB Official',       purpose: 'Pre-inspection Survey', in: '11:05 AM', badge: 'V-003' },
];

export default function HTSecurity() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Security & Safety</h2>
        <p className="text-[13px] text-gray-400 mt-1">Live security status · 4 checkpoints</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Overall Status" value="Secure" icon="🔒" accent="green" trend="All clear" trendType="up" />
        <StatCard title="Gates Operational" value="4/4" icon="🚪" accent="blue" />
        <StatCard title="Visitors On Campus" value="12" icon="🚗" accent="amber" />
        <StatCard title="Active Incidents" value="0" icon="🚨" accent="red" trend="All clear" trendType="up" />
      </div>

      {/* Personnel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {[
          { icon: '🛡️', title: 'Sgt. Byaruhanga Peter', desc: 'Head of Security — full overview', chip: <Chip variant="green">On duty</Chip>, action: () => navigate('/ht/security') },
          { icon: '🚪', title: 'Boarding Gate (Mr. Okello)', desc: 'Student entry/exit, exeat checks', chip: <Chip variant="green">All clear</Chip>, action: () => navigate('/ht/students') },
          { icon: '👮', title: 'Okello Moses', desc: 'Patrol guard — perimeter', chip: <Chip variant="green">On patrol</Chip>, action: () => navigate('/ht/security') },
        ].map(p => (
          <button key={p.title} onClick={p.action} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="text-2xl mb-3">{p.icon}</div>
            <div className="text-[14px] font-bold text-gray-900">{p.title}</div>
            <div className="text-[12px] text-gray-400 mt-1 mb-4">{p.desc}</div>
            {p.chip}
          </button>
        ))}
      </div>

      {/* Visitor Log */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-gray-900">Today's Visitor Log</h3>
          <span className="text-[12px] text-gray-400">12 visitors logged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Visitor','Purpose','Time In','Badge'].map(h=><th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {VISITOR_LOG.map(v => (
                <tr key={v.badge} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{v.name}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-500">{v.purpose}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-500">{v.in}</td>
                  <td className="px-5 py-3"><span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">{v.badge}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
