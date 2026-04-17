import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { htDashboardApi, htReportsApi, academicApi } from '../../lib/api';

/* ─── Seed fallback (only when API completely offline) ────── */
const FEES_SEED = [
  { cls: 'Senior 1', expected: 'UGX 69.5M', collected: 'UGX 60.2M', rate: 87, v: 'green' as const, defaulters: 12 },
  { cls: 'Senior 2', expected: 'UGX 58.5M', collected: 'UGX 47.8M', rate: 82, v: 'amber' as const, defaulters: 8  },
  { cls: 'Senior 3', expected: 'UGX 53.5M', collected: 'UGX 38.5M', rate: 72, v: 'amber' as const, defaulters: 14 },
  { cls: 'Senior 4', expected: 'UGX 62M',   collected: 'UGX 40.3M', rate: 65, v: 'red'   as const, defaulters: 9  },
  { cls: 'Senior 5', expected: 'UGX 22.75M',collected: 'UGX 20.5M', rate: 90, v: 'green' as const, defaulters: 2  },
  { cls: 'Senior 6', expected: 'UGX 35.5M', collected: 'UGX 33.2M', rate: 93, v: 'green' as const, defaulters: 2  },
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `UGX ${(n / 1_000_000).toFixed(1)}M`
  : n > 0 ? `UGX ${n.toLocaleString()}`
  : 'UGX 0';

const rateChip = (r: number) =>
  r >= 85 ? 'green' as const : r >= 70 ? 'amber' as const : 'red' as const;

export default function HTFinance() {
  const navigate = useNavigate();

  const [collectionRate,  setCollectionRate]  = useState<number | null>(null);
  const [termTarget,      setTermTarget]      = useState<number | null>(null);
  const [collected,       setCollected]       = useState<number | null>(null);
  const [arrears,         setArrears]         = useState<number | null>(null);
  const [arrearsCount,    setArrearsCount]    = useState<number | null>(null);
  const [byClass,         setByClass]         = useState<any[] | null>(null);
  const [classMap,        setClassMap]        = useState<Record<string, string>>({});
  const [offline,         setOffline]         = useState(false);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      htDashboardApi.getFinance('Term 1', '2026').catch(() => null),
      htReportsApi.finance({ term: 'Term 1', academicYear: '2026' }).catch(() => null),
      academicApi.getClasses().catch(() => null),
    ]).then(([finData, reportData, classes]) => {
      const allFailed = finData === null && reportData === null;
      setOffline(allFailed);

      // Build classId → name map
      if (Array.isArray(classes)) {
        const map: Record<string, string> = {};
        for (const c of classes) if (c.id) map[c.id] = c.name;
        setClassMap(map);
      }

      // Stats from finance dashboard
      if (finData !== null) {
        setCollectionRate(finData.collectionRate ?? 0);
        setTermTarget(finData.termTarget ?? 0);
        setCollected(finData.collected ?? 0);
        if (Array.isArray(finData.byClass)) setByClass(finData.byClass);
      }

      // Arrears from finance report
      if (reportData !== null) {
        setArrears(reportData.arrears?.totalBalance ?? 0);
        setArrearsCount(reportData.arrears?.count ?? 0);
        // Prefer report byClass (may have defaulter counts)
        if (Array.isArray(reportData.feesCollection?.byClass)) {
          setByClass(reportData.feesCollection.byClass);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const showSeed = offline;

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
        <StatCard
          title="Fees Collected"
          value={loading ? '…' : showSeed ? '78%' : `${collectionRate ?? 0}%`}
          icon="💰" accent="green"
        />
        <StatCard
          title="Term Target"
          value={loading ? '…' : showSeed ? 'UGX 301.25M' : fmt(termTarget ?? 0)}
          icon="🎯" accent="blue"
        />
        <StatCard
          title="Outstanding Arrears"
          value={loading ? '…' : showSeed ? 'UGX 47.0M' : fmt(arrears ?? 0)}
          icon="⚠️" accent="red"
        />
        <StatCard
          title="Students in Arrears"
          value={loading ? '…' : showSeed ? '47' : (arrearsCount ?? 0)}
          icon="🧾" accent="amber"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">Fees Collection by Class</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Class', 'Expected', 'Collected', 'Rate', 'Defaulters'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] text-gray-400">Loading…</td></tr>
              )}
              {!loading && showSeed && FEES_SEED.map(f => (
                <tr key={f.cls} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{f.cls}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{f.expected}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-700">{f.collected}</td>
                  <td className="px-5 py-3"><Chip variant={f.v}>{f.rate}%</Chip></td>
                  <td className={`px-5 py-3 text-[13px] font-semibold ${f.defaulters > 10 ? 'text-red-600' : 'text-gray-600'}`}>{f.defaulters}</td>
                </tr>
              ))}
              {!loading && !showSeed && (byClass === null || byClass.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-[13px] font-medium text-gray-500">No fee records for this term</div>
                    <div className="text-[12px] text-gray-400 mt-1">Records will appear once invoices are raised in the Bursar portal</div>
                  </td>
                </tr>
              )}
              {!loading && !showSeed && byClass && byClass.length > 0 && byClass.map((f: any) => {
                const target    = f.target ?? f.termTarget ?? 0;
                const coll      = f.collected ?? 0;
                const rate      = target > 0 ? Math.round((coll / target) * 100) : 0;
                const defs      = f.defaulters ?? f.defaulterCount ?? 0;
                const className = classMap[f.classId] ?? f.className ?? f.classId ?? '—';
                return (
                  <tr key={f.classId ?? className} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{className}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-600">{fmt(target)}</td>
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-700">{fmt(coll)}</td>
                    <td className="px-5 py-3"><Chip variant={rateChip(rate)}>{rate}%</Chip></td>
                    <td className={`px-5 py-3 text-[13px] font-semibold ${defs > 10 ? 'text-red-600' : 'text-gray-600'}`}>{defs}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
