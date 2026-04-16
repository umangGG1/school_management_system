import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { htReportsApi } from '../../lib/api';

const RESULTS = [
  { cls: 'S6A', top: '96%', avg: '87%', pass: 100, passV: 'green' as const, below: 0, trend: '↑' },
  { cls: 'S6B', top: '91%', avg: '83%', pass: 98,  passV: 'green' as const, below: 2, trend: '↑' },
  { cls: 'S4A', top: '88%', avg: '76%', pass: 94,  passV: 'green' as const, below: 4, trend: '→' },
  { cls: 'S4B', top: '82%', avg: '71%', pass: 87,  passV: 'amber' as const, below: 9, trend: '↓' },
  { cls: 'S3A', top: '79%', avg: '68%', pass: 82,  passV: 'amber' as const, below: 14, trend: '→' },
  { cls: 'S1B', top: '72%', avg: '58%', pass: 74,  passV: 'amber' as const, below: 22, trend: '↑' },
];

export default function HTResults() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totalSlots: 24, completedSlots: 0, avgMarks: 79 });

  useEffect(() => {
    htReportsApi.academic({ term: 'Term 1', academicYear: '2026' })
      .then((data: any) => {
        if (data?.examSummary) {
          const s = data.examSummary;
          setSummary(prev => ({
            totalSlots: s.totalSlots ?? prev.totalSlots,
            completedSlots: s.completedSlots ?? prev.completedSlots,
            avgMarks: s.avgMarks ?? prev.avgMarks,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">Results &amp; Examinations</h2>
          <p className="text-[13px] text-gray-400 mt-1">Term 1, 2026 · UNEB Inspection in 6 days</p>
        </div>
        <button onClick={() => navigate('/exam-officer/dashboard')} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Exam Office →</button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Until UNEB Inspection" value="6 days" icon="📅" accent="red" />
        <StatCard title="Exams Scheduled" value={summary.totalSlots} icon="📝" accent="green" />
        <StatCard title="School Average" value={`${summary.avgMarks}%`} icon="📊" accent="amber" />
        <StatCard title="Top Performing Class" value="S6A" icon="🏆" accent="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">Performance by Class</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Class','Top Score','Average','Pass Rate','Below 50%','Trend'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RESULTS.map(r => (
                <tr key={r.cls} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-bold text-gray-800">{r.cls}</td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{r.top}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-gray-700">{r.avg}</td>
                  <td className="px-5 py-3"><Chip variant={r.passV}>{r.pass}%</Chip></td>
                  <td className="px-5 py-3 text-[13px] text-gray-500">{r.below}</td>
                  <td className={`px-5 py-3 text-lg font-bold ${r.trend==='↑'?'text-emerald-600':r.trend==='↓'?'text-red-500':'text-gray-400'}`}>{r.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
