import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';

const FEES = [
  { cls: 'Senior 1', expected: 'UGX 69.5M', collected: 'UGX 60.2M', rate: 87, v: 'green' as const, defaulters: 12 },
  { cls: 'Senior 2', expected: 'UGX 58.5M', collected: 'UGX 47.8M', rate: 82, v: 'amber' as const, defaulters: 8 },
  { cls: 'Senior 3', expected: 'UGX 53.5M', collected: 'UGX 38.5M', rate: 72, v: 'amber' as const, defaulters: 14 },
  { cls: 'Senior 4', expected: 'UGX 62M',   collected: 'UGX 40.3M', rate: 65, v: 'red'   as const, defaulters: 9 },
  { cls: 'Senior 5', expected: 'UGX 22.75M',collected: 'UGX 20.5M', rate: 90, v: 'green' as const, defaulters: 2 },
  { cls: 'Senior 6', expected: 'UGX 35.5M', collected: 'UGX 33.2M', rate: 93, v: 'green' as const, defaulters: 2 },
];

export default function HTFinance() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Finance Overview</h2>
          <p className="text-[13px] text-gray-400 mt-1">Read-only summary · Full control in Bursar Portal</p>
        </div>
        <button onClick={() => navigate('/bursar/dashboard')} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Open Bursar Portal →</button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Fees Collected" value="78%" icon="💰" iconBg="green" accent="green" trend="↑ 12%" trendType="up" />
        <StatCard title="Outstanding Arrears" value="UGX 47M" icon="⚠️" iconBg="red" accent="red" />
        <StatCard title="Students — 60+ Day Arrears" value="47" icon="🧾" iconBg="amber" accent="amber" />
        <StatCard title="Pending Supplier Invoices" value="UGX 8.3M" icon="📦" iconBg="purple" accent="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">Fees Collection by Class</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Class','Expected','Collected','Rate','Defaulters'].map(h=><th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {FEES.map(f => (
                <tr key={f.cls} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{f.cls}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{f.expected}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-700">{f.collected}</td>
                  <td className="px-5 py-3"><Chip variant={f.v}>{f.rate}%</Chip></td>
                  <td className={`px-5 py-3 text-[13px] font-semibold ${f.defaulters>10?'text-red-600':'text-gray-600'}`}>{f.defaulters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
