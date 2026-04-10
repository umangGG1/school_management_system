import {
  LayoutDashboard, Users, BookOpen, DollarSign,
  Briefcase, BarChart2, MessageSquare, Settings,
  CreditCard, UserPlus, ClipboardCheck, FileText,
  CheckSquare, Banknote, TrendingUp, TrendingDown,
  Check, X, AlertCircle, GraduationCap,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/ui/StatCard';
import { cn } from '../lib/utils';
import type { NavItem } from '../components/layout/Sidebar';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Students', icon: <Users className="w-5 h-5" />, path: '/students', badge: 3 },
  { label: 'Academic', icon: <BookOpen className="w-5 h-5" />, path: '/academic' },
  { label: 'Finance Overview', icon: <DollarSign className="w-5 h-5" />, path: '/finance' },
  { label: 'Staff', icon: <Briefcase className="w-5 h-5" />, path: '/staff' },
  { label: 'Reports', icon: <BarChart2 className="w-5 h-5" />, path: '/reports' },
  { label: 'Communications', icon: <MessageSquare className="w-5 h-5" />, path: '/communications', badge: 2 },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
];

const RECENT_ACTIVITY = [
  { icon: <CreditCard className="w-4 h-4 text-green-600" />, bg: 'bg-green-50', text: 'Fee payment received — Nakato Sarah, S4A', sub: 'UGX 450,000 paid', time: '12 min ago' },
  { icon: <UserPlus className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50', text: 'New student enrolled — Okello James, S1B', sub: 'Registration complete', time: '45 min ago' },
  { icon: <ClipboardCheck className="w-4 h-4 text-teal-600" />, bg: 'bg-teal-50', text: 'Attendance marked — S3 Science', sub: '42/44 students present', time: '1 hr ago' },
  { icon: <FileText className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50', text: 'Term 2 report generated — S6 Arts', sub: 'PDF ready for download', time: '2 hrs ago' },
  { icon: <CheckSquare className="w-4 h-4 text-orange-600" />, bg: 'bg-orange-50', text: 'Leave approved — Mr. Byamugisha (Maths)', sub: '3-day medical leave', time: '3 hrs ago' },
  { icon: <Banknote className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50', text: 'Payslip generated — June 2026', sub: '156 staff members processed', time: '5 hrs ago' },
];

const PENDING_APPROVALS = [
  { id: 'pa-1', type: 'payroll', label: 'June 2026 Payroll', sub: 'UGX 42,800,000 total', urgency: 'high' },
  { id: 'pa-2', type: 'reports', label: 'S4 Report Cards', sub: '184 students — Term 2', urgency: 'high' },
  { id: 'pa-3', type: 'leave', label: 'Leave Request — Ms. Namukasa', sub: 'Biology teacher, 5 days', urgency: 'medium' },
  { id: 'pa-4', type: 'leave', label: 'Leave Request — Mr. Kagwa', sub: 'P.E. teacher, 2 days', urgency: 'low' },
  { id: 'pa-5', type: 'leave', label: 'Leave Request — Ms. Achieng', sub: 'Chemistry teacher, 3 days', urgency: 'medium' },
];

const CLASS_PERFORMANCE = [
  { cls: 'S1', students: 480, avgScore: 68.4, passRate: 82, trend: 3.2 },
  { cls: 'S2', students: 462, avgScore: 71.2, passRate: 85, trend: 1.8 },
  { cls: 'S3', students: 445, avgScore: 69.8, passRate: 80, trend: -0.5 },
  { cls: 'S4', students: 498, avgScore: 73.5, passRate: 88, trend: 4.1 },
  { cls: 'S5', students: 312, avgScore: 74.1, passRate: 89, trend: 2.6 },
  { cls: 'S6', students: 250, avgScore: 76.3, passRate: 91, trend: 1.4 },
];

const FEE_DEFAULTERS = [
  { cls: 'S1', target: 8400000, collected: 5880000 },
  { cls: 'S2', target: 7800000, collected: 5694000 },
  { cls: 'S3', target: 7200000, collected: 5760000 },
  { cls: 'S4', target: 8600000, collected: 7224000 },
];

const TERM_TARGET = 45000000;
const TERM_COLLECTED = 35100000;
const COLLECTION_PCT = Math.round((TERM_COLLECTED / TERM_TARGET) * 100);

function formatUGX(n: number): string {
  return 'UGX ' + n.toLocaleString('en-UG');
}

function urgencyBadge(urgency: string) {
  const map: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
  };
  return map[urgency] ?? 'bg-gray-100 text-gray-600';
}

export default function HeadTeacherDashboard() {
  const today = new Date().toLocaleDateString('en-UG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <DashboardLayout
      color="bg-blue-800"
      navItems={NAV_ITEMS}
      portalName="Head Teacher Portal"
      pageTitle="Head Teacher Dashboard"
    >
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good morning, Mr. Musoke</h2>
          <p className="text-gray-500 text-sm mt-0.5">{today}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-500">Term 2, 2026</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            Kampala Secondary School
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Students"
          value="2,847"
          change={3.2}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Fee Collection"
          value="78%"
          change={5.1}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Staff Present"
          value="142/156"
          change={-2.6}
          icon={<Briefcase className="w-6 h-6" />}
          color="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Avg Performance"
          value="71%"
          change={2.3}
          icon={<GraduationCap className="w-6 h-6" />}
          color="bg-violet-50"
          iconColor="text-violet-600"
        />
      </div>

      {/* Middle row: Recent Activity + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', item.bg)}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium leading-snug">{item.text}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {PENDING_APPROVALS.length} items
            </span>
          </div>
          <div className="space-y-3">
            {PENDING_APPROVALS.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium leading-snug">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize mr-2', urgencyBadge(item.urgency))}>
                  {item.urgency}
                </span>
                <div className="flex gap-1.5">
                  <button
                    className="w-7 h-7 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-colors"
                    aria-label="Approve"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                    aria-label="Reject"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Class Performance + Fee Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Academic Performance by Class */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Academic Performance by Class</h3>
            <span className="text-xs text-gray-500">Term 2, 2026</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Class', 'Students', 'Avg Score', 'Pass Rate', 'Trend'].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CLASS_PERFORMANCE.map((row) => (
                  <tr key={row.cls} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center justify-center w-10 h-7 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
                        {row.cls}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{row.students.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{row.avgScore}%</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{ width: `${row.avgScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        row.passRate >= 88 ? 'bg-green-100 text-green-700' :
                        row.passRate >= 80 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {row.passRate}%
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className={cn('flex items-center gap-1 text-xs font-semibold', row.trend >= 0 ? 'text-green-600' : 'text-red-500')}>
                        {row.trend >= 0
                          ? <TrendingUp className="w-3.5 h-3.5" />
                          : <TrendingDown className="w-3.5 h-3.5" />}
                        {row.trend >= 0 ? '+' : ''}{row.trend}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fee Collection Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Fee Collection</h3>
            <span className="text-xs text-gray-500">Term 2, 2026</span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Term Target</span>
              <span className="font-semibold text-gray-800">{formatUGX(TERM_TARGET)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-500">Collected</span>
              <span className="font-semibold text-green-700">{formatUGX(TERM_COLLECTED)}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full">
              <div
                className="h-2.5 bg-green-500 rounded-full transition-all"
                style={{ width: `${COLLECTION_PCT}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">0%</span>
              <span className="text-xs font-bold text-green-600">{COLLECTION_PCT}% collected</span>
              <span className="text-xs text-gray-400">100%</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Classes with highest arrears
            </p>
            <div className="space-y-2.5">
              {FEE_DEFAULTERS.map((d) => {
                const pct = Math.round((d.collected / d.target) * 100);
                const outstanding = d.target - d.collected;
                return (
                  <div key={d.cls}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{d.cls}</span>
                      <span className="text-red-600 font-medium">
                        -{formatUGX(outstanding)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={cn('h-1.5 rounded-full', pct >= 80 ? 'bg-amber-400' : 'bg-red-400')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
