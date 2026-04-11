import { useToast } from '../../contexts/ToastContext';

const REPORT_SECTIONS = [
  {
    title: '📚 Academic Reports',
    reports: [
      { icon: '📊', title: 'Term Academic Report', sub: 'All classes · Performance analysis' },
      { icon: '✅', title: 'Attendance Summary', sub: 'Student & staff attendance' },
      { icon: '📝', title: 'Examination Results', sub: 'By class, subject, student' },
      { icon: '📖', title: 'Syllabus Coverage', sub: 'By department and teacher' },
    ],
  },
  {
    title: '💰 Finance Reports',
    reports: [
      { icon: '💰', title: 'Fees Collection Report', sub: 'By class, student, status' },
      { icon: '⚠️', title: 'Fee Arrears', sub: 'Defaulters list, days overdue' },
      { icon: '🧾', title: 'School Expenditure', sub: 'Budget vs actual spend' },
    ],
  },
  {
    title: '🏠 Boarding & Welfare Reports',
    reports: [
      { icon: '🛏️', title: 'Boarding Summary', sub: 'Occupancy, welfare, discipline' },
      { icon: '🏥', title: 'Health & Sick Bay', sub: 'Illnesses, referrals, trends' },
      { icon: '🔒', title: 'Security Incidents', sub: 'Access logs, incidents' },
    ],
  },
];

export default function HTReports() {
  const { toast } = useToast();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-[13px] text-gray-400 mt-1">Generate and download school reports</p>
      </div>

      {REPORT_SECTIONS.map((section) => (
        <div key={section.title} className="mb-8">
          <h3 className="text-[15px] font-bold text-gray-900 pb-2.5 mb-4 border-b-2 border-gray-200">{section.title}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {section.reports.map((r) => (
              <button
                key={r.title}
                onClick={() => toast(`Generating ${r.title}...`, 'info')}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="text-3xl mb-3">{r.icon}</div>
                <div className="text-[13px] font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{r.title}</div>
                <div className="text-[11px] text-gray-400 mt-1.5">{r.sub}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
