import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { PortalButton } from '../../components/ui/PortalButton';
import { useToast } from '../../contexts/ToastContext';

export default function HTAcademic() {
  const navigate = useNavigate();
  const { toast } = useToast();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Academic Overview</h2>
        <p className="text-[13px] text-gray-400 mt-1">Term 1, 2026 · Week 8 of 13</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Syllabus Coverage */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold text-gray-900">Syllabus Coverage by Department</h3>
            <span className="text-[12px] text-gray-400">Week 8 of 13</span>
          </div>
          <ProgressBar label="Mathematics" value={74} color="blue" />
          <ProgressBar label="Sciences" value={68} color="green" />
          <ProgressBar label="Languages" value={81} color="teal" />
          <ProgressBar label="Humanities" value={72} color="purple" />
          <ProgressBar label="Technical Subjects" value={55} color="amber" />
          <ProgressBar label="Arts & Music" value={62} color="red" />

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
            {[['61%', 'Overall Coverage', 'bg-indigo-50 text-indigo-700'], ['68%', 'Science Avg', 'bg-emerald-50 text-emerald-700'], ['78%', 'Languages Avg', 'bg-teal-50 text-teal-700']].map(([v, l, cls]) => (
              <div key={l} className={`${cls} rounded-xl p-3 text-center`}>
                <div className="text-[20px] font-black">{v}</div>
                <div className="text-[11px] text-gray-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Links */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2.5">
              <PortalButton icon="📐" name="Deputy HM" description="Timetable & cover lessons" color="indigo" onClick={() => toast('Opening Deputy HM Portal...', 'info')} />
              <PortalButton icon="📗" name="HOD Portal" description="Departmental oversight" color="green" onClick={() => toast('Opening HOD Portal...', 'info')} />
              <PortalButton icon="📝" name="Examination Office" description="Exams & results" color="rose" onClick={() => toast('Opening Exam Portal...', 'info')} />
              <PortalButton icon="👨‍🏫" name="Teacher Portal" description="Lessons, marks, attendance" color="purple" onClick={() => toast('Opening Teacher Portal...', 'info')} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Notice Board</h3>
            {[
              { prio: 'HIGH', pClass: 'bg-red-50 text-red-600', title: 'UNEB Inspection — 6 days away', meta: 'Exam Officer · Mar 07' },
              { prio: 'HIGH', pClass: 'bg-red-50 text-red-600', title: 'Mock Results due — S6 deadline', meta: 'All HODs · Mar 08' },
              { prio: 'MED',  pClass: 'bg-amber-50 text-amber-700', title: 'PTM preparations underway', meta: 'Deputy HM · Mar 10' },
              { prio: 'LOW',  pClass: 'bg-emerald-50 text-emerald-700', title: 'S1 orientation complete', meta: 'Class Teachers · Mar 05' },
            ].map((n) => (
              <div key={n.title} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-none">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${n.pClass}`}>{n.prio}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-800 truncate">{n.title}</div>
                  <div className="text-[11px] text-gray-400">{n.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
