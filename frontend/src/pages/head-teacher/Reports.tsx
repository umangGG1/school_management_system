import { useState } from 'react';
import { Modal }    from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';

/* ─── Types ──────────────────────────────────────────────── */
interface ReportItem {
  icon: string;
  title: string;
  sub: string;
  category: string;
}

/* ─── Seed data ──────────────────────────────────────────── */
const REPORT_SECTIONS: { title: string; reports: ReportItem[] }[] = [
  {
    title: '📚 Academic Reports',
    reports: [
      { icon: '📊', title: 'Term Academic Report',   sub: 'All classes · Performance analysis', category: 'academic' },
      { icon: '✅', title: 'Attendance Summary',      sub: 'Student & staff attendance',          category: 'academic' },
      { icon: '📝', title: 'Examination Results',     sub: 'By class, subject, student',          category: 'academic' },
      { icon: '📖', title: 'Syllabus Coverage',       sub: 'By department and teacher',           category: 'academic' },
    ],
  },
  {
    title: '💰 Finance Reports',
    reports: [
      { icon: '💰', title: 'Fees Collection Report',  sub: 'By class, student, status',           category: 'finance' },
      { icon: '⚠️', title: 'Fee Arrears',             sub: 'Defaulters list, days overdue',       category: 'finance' },
      { icon: '🧾', title: 'School Expenditure',       sub: 'Budget vs actual spend',              category: 'finance' },
    ],
  },
  {
    title: '🏠 Boarding & Welfare Reports',
    reports: [
      { icon: '🛏️', title: 'Boarding Summary',        sub: 'Occupancy, welfare, discipline',      category: 'boarding' },
      { icon: '🏥', title: 'Health & Sick Bay',        sub: 'Illnesses, referrals, trends',        category: 'boarding' },
      { icon: '🔒', title: 'Security Incidents',       sub: 'Access logs, incidents',              category: 'boarding' },
    ],
  },
  {
    title: '📋 Administration Reports',
    reports: [
      { icon: '👥', title: 'Staff Register',           sub: 'Attendance, performance snapshot',    category: 'admin' },
      { icon: '📤', title: 'MoES Statistical Abstract',sub: 'Ministry of Education submission',    category: 'admin' },
      { icon: '🏆', title: 'End-of-Term Summary',      sub: 'Comprehensive school overview',       category: 'admin' },
    ],
  },
];

const TERMS   = ['Term 1, 2026', 'Term 2, 2025', 'Term 3, 2025', 'Term 1, 2025'];
const FORMATS = ['PDF', 'Excel (.xlsx)', 'CSV'];
const CLASSES = ['All Classes', 'Senior 1', 'Senior 2', 'Senior 3', 'Senior 4', 'Senior 5', 'Senior 6'];

/* ─── Generate Report Modal ──────────────────────────────── */
function GenerateReportModal({
  report,
  onClose,
}: {
  report: ReportItem | null;
  onClose: () => void;
}) {
  const { toast }     = useToast();
  const [term,   setTerm]   = useState(TERMS[0]);
  const [format, setFormat] = useState('PDF');
  const [cls,    setCls]    = useState('All Classes');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate a brief generation delay then toast success
    setTimeout(() => {
      setGenerating(false);
      onClose();
      toast(`✅ ${report?.title} (${format}) ready for download`, 'success');
    }, 1200);
  };

  return (
    <Modal open={!!report} onClose={onClose} id="gen-report" title={`${report?.icon ?? '📋'} Generate: ${report?.title ?? ''}`}>
      <div className="space-y-4">
        {/* Info strip */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5 text-[12px] text-indigo-700">
          {report?.sub}
        </div>

        {/* Term */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Academic Term</label>
          <select
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400"
          >
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Class filter — only for academic category */}
        {report?.category === 'academic' && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Class / Year Group</label>
            <select
              value={cls}
              onChange={e => setCls(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400"
            >
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Format */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Output Format</label>
          <div className="flex gap-2">
            {FORMATS.map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
                  format === f
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Include</label>
          <div className="space-y-2">
            {['Cover page with school logo', 'Summary statistics & charts', 'Detailed breakdown tables'].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4 rounded" />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>📥 Generate &amp; Download</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function HTReports() {
  const [selected, setSelected] = useState<ReportItem | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Reports &amp; Analytics</h2>
        <p className="text-[13px] text-gray-400 mt-1">
          Generate and download school reports · Click any report to configure and export
        </p>
      </div>

      {REPORT_SECTIONS.map((section) => (
        <div key={section.title} className="mb-8">
          <h3 className="text-[15px] font-bold text-gray-900 pb-2.5 mb-4 border-b-2 border-gray-200">
            {section.title}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {section.reports.map((r) => (
              <button
                key={r.title}
                onClick={() => setSelected(r)}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="text-3xl mb-3">{r.icon}</div>
                <div className="text-[13px] font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {r.title}
                </div>
                <div className="text-[11px] text-gray-400 mt-1.5">{r.sub}</div>
                <div className="mt-3 text-[11px] font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to generate →
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <GenerateReportModal report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
