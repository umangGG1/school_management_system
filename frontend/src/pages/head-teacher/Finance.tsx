import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { dashboardApi } from '../../lib/api';

const FEES_SEED = [
  { cls: 'Senior 1', expected: 'UGX 69.5M', collected: 'UGX 60.2M', rate: 87, v: 'green' as const, defaulters: 12 },
  { cls: 'Senior 2', expected: 'UGX 58.5M', collected: 'UGX 47.8M', rate: 82, v: 'amber' as const, defaulters: 8  },
  { cls: 'Senior 3', expected: 'UGX 53.5M', collected: 'UGX 38.5M', rate: 72, v: 'amber' as const, defaulters: 14 },
  { cls: 'Senior 4', expected: 'UGX 62M',   collected: 'UGX 40.3M', rate: 65, v: 'red'   as const, defaulters: 9  },
  { cls: 'Senior 5', expected: 'UGX 22.75M',collected: 'UGX 20.5M', rate: 90, v: 'green' as const, defaulters: 2  },
  { cls: 'Senior 6', expected: 'UGX 35.5M', collected: 'UGX 33.2M', rate: 93, v: 'green' as const, defaulters: 2  },
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `UGX ${(n / 1_000_000).toFixed(1)}M` : `UGX ${n.toLocaleString()}`;

export default function HTFinance() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState({ collectionRate: 78, arrears: 47_000_000, arrearsCount: 47, pendingInvoices: 8_300_000 });
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    dashboardApi.getFinance('Term 1', '2026')
      .then((data: any) => {
        if (data) {
          setStats({
            collectionRate:  data.feeCollectionRate  ?? data.collectionRate  ?? stats.collectionRate,
            arrears:         data.totalArrears        ?? data.arrears         ?? stats.arrears,
            arrearsCount:    data.studentsWithArrears ?? data.arrearsCount    ?? stats.arrearsCount,
            pendingInvoices: data.pendingInvoices     ?? stats.pendingInvoices,
          });
          setOffline(false);
        }
      })
      .catch(() => setOffline(true));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Finance Overview</h2>
          <p className="text-[13px] text-gray-400 mt-1">Read-only summary · Full control in Bursar Portal</p>
        </div>
        <button onClick={() => navigate('/bursar/dashboard')} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Open Bursar Portal →</button>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Fees Collected" value={`${stats.collectionRate}%`} icon="💰" accent="green" trend="↑ 12%" trendType="up" />
        <StatCard title="Outstanding Arrears" value={fmt(stats.arrears)} icon="⚠️" accent="red" />
        <StatCard title="Students — 60+ Day Arrears" value={stats.arrearsCount} icon="🧾" accent="amber" />
        <StatCard title="Pending Supplier Invoices" value={fmt(stats.pendingInvoices)} icon="📦" accent="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">Fees Collection by Class</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Class','Expected','Collected','Rate','Defaulters'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {FEES_SEED.map(f => (
                <tr key={f.cls} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{f.cls}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{f.expected}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-700">{f.collected}</td>
                  <td className="px-5 py-3"><Chip variant={f.v}>{f.rate}%</Chip></td>
                  <td className={`px-5 py-3 text-[13px] font-semibold ${f.defaulters > 10 ? 'text-red-600' : 'text-gray-600'}`}>{f.defaulters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
