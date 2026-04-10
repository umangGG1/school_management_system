import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, DollarSign, BookOpen, Home, Shield,
  Heart, Users, Clipboard, Scale, Scissors, UserCheck,
  User, CheckCircle, ChevronRight,
} from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface PortalCard {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}

const PORTALS: PortalCard[] = [
  {
    role: 'HEAD_TEACHER',
    label: 'Head Teacher',
    description: 'Full school oversight & management',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'bg-blue-800',
    iconBg: 'bg-blue-100 text-blue-800',
  },
  {
    role: 'FINANCE_OFFICER',
    label: 'Finance Officer',
    description: 'Fee management & financial reports',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'bg-teal-700',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    role: 'TEACHER',
    label: 'Teacher',
    description: 'Attendance, marks & lesson notes',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'bg-blue-600',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    role: 'BOARDING_MASTER',
    label: 'Boarding Master',
    description: 'Dormitory & boarding life management',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-cyan-600',
    iconBg: 'bg-cyan-100 text-cyan-600',
  },
  {
    role: 'GATE_GUARD',
    label: 'Gate Guard',
    description: 'Student entry/exit tracking',
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-slate-800',
    iconBg: 'bg-slate-100 text-slate-800',
  },
  {
    role: 'NURSE',
    label: 'Nurse / Medical',
    description: 'Student health & clinic records',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-red-700',
    iconBg: 'bg-red-100 text-red-700',
  },
  {
    role: 'PAYROLL_OFFICER',
    label: 'Payroll / HR',
    description: 'Staff salaries & HR management',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-violet-700',
    iconBg: 'bg-violet-100 text-violet-700',
  },
  {
    role: 'ECA_OFFICER',
    label: 'ECA Officer',
    description: 'Extra-curricular activities',
    icon: <Clipboard className="w-5 h-5" />,
    color: 'bg-lime-600',
    iconBg: 'bg-lime-100 text-lime-700',
  },
  {
    role: 'SCHOOL_COUNSELOR',
    label: 'Counselor',
    description: 'Student welfare & guidance',
    icon: <Scale className="w-5 h-5" />,
    color: 'bg-purple-600',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    role: 'UNIFORM_OFFICER',
    label: 'Uniform Officer',
    description: 'Uniform issuance & compliance',
    icon: <Scissors className="w-5 h-5" />,
    color: 'bg-amber-600',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    role: 'PARENT',
    label: 'Parent',
    description: 'View child progress & pay fees',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'bg-orange-600',
    iconBg: 'bg-orange-100 text-orange-600',
  },
  {
    role: 'STUDENT',
    label: 'Student',
    description: 'View results, timetable & notices',
    icon: <User className="w-5 h-5" />,
    color: 'bg-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedPortal, setSelectedPortal] = useState<PortalCard | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPortal) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password, selectedPortal.role);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-3/5 flex-col justify-between bg-gradient-to-br from-blue-800 to-indigo-900 p-12 text-white">
        <div>
          <div className="text-2xl font-bold tracking-tight mb-2">SMISSI</div>
          <div className="text-blue-200 text-sm">School Management Information System</div>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            School Management Information System<br />
            <span className="text-blue-300">for Uganda</span>
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            A unified platform empowering every stakeholder in Uganda's education ecosystem.
          </p>
          <ul className="space-y-4">
            {[
              'Streamlined fee collection, payroll, and financial reporting in UGX',
              'Real-time student attendance, academic performance, and boarding management',
              'Role-based access for Head Teachers, Finance Officers, Teachers, Parents & more',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <span className="text-blue-100">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-blue-300 text-sm">
          Aligned with NCDC, UNEB, and MoES frameworks
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:w-2/5 flex flex-col bg-white overflow-y-auto">
        <div className="flex-1 px-8 py-10 max-w-xl mx-auto w-full">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <div className="text-xl font-bold text-blue-800">SMISSI</div>
            <div className="text-gray-500 text-sm">School Management Information System</div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">Select Your Portal</h3>
          <p className="text-gray-500 text-sm mb-6">Choose your role to access your dashboard</p>

          {/* Portal grid */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {PORTALS.map((portal) => (
              <button
                key={portal.role}
                onClick={() => setSelectedPortal(portal)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all hover:shadow-sm',
                  selectedPortal?.role === portal.role
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', portal.iconBg)}>
                  {portal.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-800 leading-tight">{portal.label}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected portal description */}
          {selectedPortal && (
            <div className={cn('flex items-center gap-3 p-3 rounded-lg mb-6 text-white text-sm', selectedPortal.color)}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                {selectedPortal.icon}
              </div>
              <div>
                <div className="font-semibold">{selectedPortal.label} Portal</div>
                <div className="text-white/80 text-xs">{selectedPortal.description}</div>
              </div>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.ug"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedPortal || loading}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors',
                selectedPortal
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-6 text-center">
            Contact your school administrator if you cannot access your account.
          </p>
        </div>
      </div>
    </div>
  );
}
