import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { htReportsApi } from '../../lib/api';

/* ─── Seed fallback (only when API is completely offline) ─── */
const SEED_RESULTS = [
  { className: 'S6A', stream: '',  avgScore: 87, passRate: 100, studentCount: 71, trend: 'up'     },
  { className: 'S6B', stream: '',  avgScore: 83, passRate: 98,  studentCount: 71, trend: 'up'     },
  { className: 'S4A', stream: '',  avgScore: 76, passRate: 94,  studentCount: 83, trend: 'stable' },
  { className: 'S4B', stream: '',  avgScore: 71, passRate: 87,  studentCount: 82, trend: 'down'   },
  { className: 'S3A', stream: '',  avgScore: 68, passRate: 82,  studentCount: 71, trend: 'stable' },
  { className: 'S1B', stream: '',  avgScore: 58, passRate: 74,  studentCount: 139, trend: 'up'    },
];

type ClassPerf = {
  classId?: string;
  className: string;
  stream?: string;
  avgScore: number;
  passRate: number;
  studentCount: number;
  trend: 'up' | 'stable' | 'down';
};

const trendIcon = (t: string) =>
  t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
const trendClass = (t: string) =>
  t === 'up' ? 'text-emerald-600' : t === 'down' ? 'text-red-500' : 'text-gray-400';
const passChip = (pct: number) =>
  pct >= 90 ? 'green' as const : pct >= 75 ? 'amber' as const : 'red' as const;

export default function HTResults() {
  const navigate = useNavigate();
  const [perf,       setPerf]       = useState<ClassPerf[] | null>(null); // null = loading/offline
  const [totalAss,   setTotalAss]   = useState<number | null>(null);
  const [offline,    setOffline]    = useState(false);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    htReportsApi.academic({ term: 'Term 1', academicYear: '2026' })
      .then((data: any) => {
        setOffline(false);
        if (Array.isArray(data?.performanceByClass)) setPerf(data.performanceByClass);
        else setPerf([]);
        if (data?.totalAssessments != null) setTotalAss(data.totalAssessments);
      })
      .catch(() => { setOffline(true); setPerf(null); })
      .finally(() => setLoading(false));
  }, []);

  const displayPerf: ClassPerf[] = offline ? SEED_RESULTS : (perf ?? []);

  const avgScore = displayPerf.length
    ? Math.round(displayPerf.reduce((s, c) => s + c.avgScore, 0) / displayPerf.length)
    : 0;

  const topClass = displayPerf.length
    ? displayPerf.reduce((best, c) => c.avgScore > best.avgScore ? c : best, displayPerf[0])
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Results &amp; Examinations</h2>
          <p className="text-[13px] text-gray-400 mt-1">Term 1, 2026</p>
        </div>
        <button onClick={() => navigate('/exam-officer/dashboard')} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Exam Office →</button>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Assessments Recorded" value={loading ? '…' : totalAss != null ? totalAss : '—'}        icon="📝" accent="green" />
        <StatCard title="School Average"        value={loading ? '…' : displayPerf.length ? `${avgScore}%` : '—'} icon="📊" accent="amber" />
        <StatCard title="Top Performing Class"  value={loading ? '…' : topClass?.className ?? '—'}               icon="🏆" accent="purple" />
        <StatCard title="Classes Tracked"       value={loading ? '…' : displayPerf.length || '—'}                icon="📚" accent="blue" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">Performance by Class</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Class', 'Stream', 'Students', 'Average', 'Pass Rate', 'Trend'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-gray-400">Loading…</td></tr>
              )}
              {!loading && !offline && displayPerf.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-[13px] font-medium text-gray-500">No assessment data yet</div>
                    <div className="text-[12px] text-gray-400 mt-1">Marks will appear here once teachers submit results</div>
                  </td>
                </tr>
              )}
              {!loading && displayPerf.map((r, i) => (
                <tr key={r.classId ?? r.className ?? i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-bold text-gray-800">{r.className}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-400">{r.stream || '—'}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{r.studentCount}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-700">{r.avgScore}%</td>
                  <td className="px-5 py-3"><Chip variant={passChip(r.passRate)}>{r.passRate}%</Chip></td>
                  <td className={`px-5 py-3 text-lg font-bold ${trendClass(r.trend)}`}>{trendIcon(r.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
