import { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { ProgressBar }  from '../../components/ui/ProgressBar';
import { PortalButton } from '../../components/ui/PortalButton';
import { htDashboardApi, announcementsApi, schoolApi } from '../../lib/api';

const COLORS = ['blue', 'green', 'teal', 'purple', 'amber', 'red', 'indigo', 'orange'] as const;

const SEED_PERF = [
  { className: 'Senior 6 Sciences', avgScore: 87, studentCount: 142 },
  { className: 'Senior 6 Arts',     avgScore: 82, studentCount: 98  },
  { className: 'Senior 4',          avgScore: 74, studentCount: 248 },
  { className: 'Senior 3',          avgScore: 72, studentCount: 214 },
  { className: 'Senior 2',          avgScore: 68, studentCount: 196 },
  { className: 'Senior 1',          avgScore: 61, studentCount: 278 },
];

export default function HTAcademic() {
  const navigate = useNavigate();
  const [perf,    setPerf]    = useState<any[]>(SEED_PERF);
  const [notices, setNotices] = useState<any[]>([]);
  const [term,    setTerm]    = useState('Term 1, 2026');
  const [week,    setWeek]    = useState<string | number>('—');
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    Promise.all([
      htDashboardApi.getAcademic('Term 1', '2026').catch(() => null),
      announcementsApi.list().catch(() => null),
      schoolApi.get().catch(() => null),
    ]).then(([academic, anns, school]) => {
      if (academic === null) {
        setOffline(true);
      } else if (academic?.classPerformance?.length) {
        setPerf(academic.classPerformance);
      } else {
        setPerf([]); // API worked but no classes yet
      }

      if (anns?.length) {
        setNotices(anns.slice(0, 4).map((a: any) => ({
          prio:   a.category === 'URGENT' ? 'HIGH' : a.isPinned ? 'HIGH' : 'MED',
          pClass: a.category === 'URGENT' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700',
          title:  a.title,
          meta:   new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        })));
      }

      if (school) {
        if (school.currentTerm) setTerm(`${school.currentTerm}, ${school.academicYear ?? '2026'}`);
        if (school.currentWeek) setWeek(school.currentWeek);
      }
    }).finally(() => setLoading(false));
  }, []);

  const avgScore = perf.length
    ? Math.round(perf.reduce((s, c) => s + (c.avgScore ?? 0), 0) / perf.length)
    : 0;

  const totalStudents = perf.reduce((s, c) => s + (c.studentCount ?? 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Academic Overview</h2>
        <p className="text-[13px] text-gray-400 mt-1">
          {loading ? 'Loading…' : `${term} · Week ${week}`}
        </p>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Class Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold text-gray-900">Class Performance Overview</h3>
            <span className="text-[12px] text-gray-400">
              {loading ? '…' : `${perf.length} classes · ${totalStudents.toLocaleString()} students`}
            </span>
          </div>

          {loading
            ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
            : perf.length === 0
              ? <div className="text-center py-10 text-gray-400">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-sm font-medium">No assessment data yet</div>
                  <div className="text-[12px] mt-1">Marks will appear here once teachers submit results</div>
                </div>
              : perf.map((c, i) => (
                  <ProgressBar
                    key={c.className ?? i}
                    label={c.className}
                    value={`${c.avgScore ?? 0}%`}
                    pct={c.avgScore ?? 0}
                    color={COLORS[i % COLORS.length]}
                  />
                ))
          }

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
            {[
              [`${avgScore}%`,         'Overall Average',   'bg-indigo-50 text-indigo-700'],
              [`${totalStudents.toLocaleString()}`, 'Total Students', 'bg-emerald-50 text-emerald-700'],
              [`${perf.length}`,        'Active Classes',    'bg-teal-50 text-teal-700'],
            ].map(([v, l, cls]) => (
              <div key={l} className={`${cls} rounded-xl p-3 text-center`}>
                <div className="text-[20px] font-black">{loading ? '…' : v}</div>
                <div className="text-[11px] text-gray-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2.5">
              <PortalButton icon="📐" name="Deputy HM"         description="Timetable & cover lessons"  color="indigo" onClick={() => navigate('/ht/staff')} />
              <PortalButton icon="📗" name="HOD Portal"        description="Departmental oversight"     color="green"  onClick={() => navigate('/ht/results')} />
              <PortalButton icon="📝" name="Examination Office" description="Exams & results"           color="rose"   onClick={() => navigate('/exam-officer/dashboard')} />
              <PortalButton icon="👨‍🏫" name="Teacher Portal"   description="Lessons, marks, attendance" color="purple" onClick={() => navigate('/teacher/dashboard')} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Notice Board</h3>
            {loading
              ? <div className="text-center py-4 text-gray-400 text-sm">Loading…</div>
              : notices.length === 0
                ? <div className="text-center py-4 text-gray-400 text-[13px]">No active notices</div>
                : notices.map((n) => (
                    <div key={n.title} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-none">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${n.pClass}`}>{n.prio}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-gray-800 truncate">{n.title}</div>
                        <div className="text-[11px] text-gray-400">{n.meta}</div>
                      </div>
                    </div>
                  ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
