import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, BookOpen, DollarSign, Heart, Home, Bus, UtensilsCrossed,
  Lock, Megaphone, BarChart3, Clock, GraduationCap, Star, Menu, X,
  ChevronDown, ArrowRight, Check, Zap, Globe, Smartphone, Brain,
  Building2, Phone, Mail, MapPin, ExternalLink, ChevronRight,
  Award, TrendingUp, UserCheck, Stethoscope, AlertTriangle, Car,
  Coffee, ShieldCheck, Radio, Shirt, Wrench, MessageSquare, BookMarked,
  Eye, Landmark, Package
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Modules', href: '#modules' },
  { label: 'Roles', href: '#roles' },
  { label: 'Pricing', href: '#pricing' },
];

const UGANDA_FEATURES = [
  { icon: BookMarked, color: '#10b981', label: 'NCDC Aligned', desc: 'Full alignment with National Curriculum Development Centre syllabi for all levels.' },
  { icon: Award, color: '#f59e0b', label: 'UNEB Ready', desc: 'PLE, UCE & UACE result processing, grading, and UNEB report generation built-in.' },
  { icon: Landmark, color: '#3b82f6', label: 'MoES Framework', desc: 'Compliant with Ministry of Education & Sports reporting and data requirements.' },
  { icon: Smartphone, color: '#8b5cf6', label: 'Local Payments', desc: 'MTN Mobile Money, Airtel Money, Stanbic, Centenary Bank integrations.' },
  { icon: BookOpen, color: '#f43f5e', label: 'Thematic Curriculum', desc: 'Full P1–P3 thematic curriculum support with integrated assessment tools.' },
  { icon: TrendingUp, color: '#14b8a6', label: 'New CBC', desc: 'Competence-Based Curriculum framework for modern Ugandan education.' },
];

const MODULES = [
  { icon: Users, label: 'Student Management', desc: 'Admissions, records, performance tracking & EMIS integration', color: '#10b981' },
  { icon: DollarSign, label: 'Finance & Fees', desc: 'Fee structures, invoicing, UGX collections & arrears management', color: '#f59e0b' },
  { icon: BookOpen, label: 'Academics & Grades', desc: 'Marks entry, grade books, transcripts & performance analytics', color: '#3b82f6' },
  { icon: UserCheck, label: 'HR & Payroll', desc: 'Staff records, NSSF/PAYE, payslips & leave management', color: '#8b5cf6' },
  { icon: Stethoscope, label: 'Medical / Sickbay', desc: 'Patient records, sick bay register, medical history & referrals', color: '#f43f5e' },
  { icon: Home, label: 'Boarding', desc: 'Dorm allocation, roll calls, exeat management & parent alerts', color: '#06b6d4' },
  { icon: Bus, label: 'Transport', desc: 'Route management, vehicle tracking & student transport records', color: '#10b981' },
  { icon: UtensilsCrossed, label: 'Catering', desc: 'Menu planning, nutritional tracking & daily meal management', color: '#f97316' },
  { icon: Shield, label: 'Security & Gate', desc: 'Visitor logs, gate access control & incident reporting', color: '#ef4444' },
  { icon: Megaphone, label: 'Communications', desc: 'SMS, email broadcasts, notice board & parent messaging', color: '#a855f7' },
  { icon: BarChart3, label: 'Reports & Analytics', desc: 'EMIS reports, custom dashboards & data export tools', color: '#0ea5e9' },
  { icon: Clock, label: 'Timetables', desc: 'Automated timetable generation, clash detection & substitutions', color: '#d97706' },
];

const ROLE_GROUPS = [
  {
    id: 'leadership',
    label: '🏫 Leadership',
    color: '#10b981',
    roles: [
      { icon: GraduationCap, name: 'Head Teacher',       desc: '14-page portal with full school oversight, approvals & reporting', route: '/ht/dashboard'            },
      { icon: Star,          name: 'Deputy Head Master',  desc: 'Academic supervision, timetables & staff management',             route: '/deputy-hm/dashboard'     },
      { icon: BookOpen,      name: 'Head of Department',  desc: 'Syllabus tracking, lesson observations & scheme approval',         route: '/hod/dashboard'           },
      { icon: Award,         name: 'Examinations Officer',desc: 'Exam scheduling, moderation workflow & result publications',        route: '/exam-officer/dashboard'  },
      { icon: Heart,         name: 'SEN Teacher',         desc: 'Special needs student records, IEP tracking & support plans',      route: '/teacher/dashboard'       },
      { icon: Eye,           name: 'Government Inspector',desc: 'Read-only school inspection view & compliance dashboard',           route: '/login'                   },
    ],
  },
  {
    id: 'finance',
    label: '💰 Finance & Admin',
    color: '#f59e0b',
    roles: [
      { icon: DollarSign, name: 'Finance Officer',  desc: 'Fee collection, invoicing, arrears & UGX financial reports',       route: '/bursar/dashboard' },
      { icon: TrendingUp, name: 'Bursar',            desc: 'Full financial oversight, petty cash, budgets & audit trails',     route: '/bursar/dashboard' },
      { icon: UserCheck,  name: 'HR Officer',        desc: 'Staff records, contracts, leave management & recruitment',          route: '/login'           },
      { icon: BarChart3,  name: 'Payroll Officer',   desc: 'NSSF, PAYE, payslip generation & salary disbursement',             route: '/login'           },
      { icon: Shield,     name: 'Super Admin',       desc: 'Full system access, school settings, user management & branding',  route: '/login'           },
      { icon: Building2,  name: 'IT Administrator',  desc: 'System configuration, integrations & security settings',           route: '/login'           },
    ],
  },
  {
    id: 'welfare',
    label: '🏥 Welfare & Safety',
    color: '#f43f5e',
    roles: [
      { icon: Stethoscope,  name: 'Nurse / Matron',    desc: 'Sick bay register, patient records, medication & referrals',          route: '/nurse/dashboard'      },
      { icon: Home,          name: 'Boarding Master',   desc: 'Roll calls, exeat approvals, dorm incidents & student welfare',        route: '/dorm-master/dashboard'},
      { icon: UserCheck,     name: 'Head of Boarding',  desc: 'Dorm oversight, holiday allocations & boarding financials',            route: '/dorm-master/dashboard'},
      { icon: ShieldCheck,   name: 'Gate Guard',        desc: 'Visitor check-in/out, badge issuance & gate incident logs',            route: '/security/dashboard'   },
      { icon: AlertTriangle, name: 'Head of Security',  desc: 'Security incident management, CCTV logs & emergency protocols',        route: '/security/dashboard'   },
      { icon: MessageSquare, name: 'School Counselor',  desc: 'Counseling session records, student welfare & referral tracking',      route: '/counsellor/dashboard' },
    ],
  },
  {
    id: 'teaching',
    label: '📚 Teaching & Learning',
    color: '#3b82f6',
    roles: [
      { icon: BookOpen,  name: 'Teacher',                  desc: 'Marks entry, attendance, lesson notes & parent communication',         route: '/teacher/dashboard'  },
      { icon: Radio,     name: 'ECA Coordinator',           desc: 'Clubs, sports, tournaments & extra-curricular activity records',        route: '/eca/dashboard'      },
      { icon: Megaphone, name: 'Communications Officer',     desc: 'School announcements, SMS blasts & newsletter management',              route: '/login'              },
      { icon: Shirt,     name: 'Uniform Officer',            desc: 'Uniform compliance tracking, shop stock & fines management',            route: '/login'              },
      { icon: Wrench,    name: 'Facilities Manager',         desc: 'Maintenance requests, asset registry & infrastructure tracking',         route: '/login'              },
    ],
  },
  {
    id: 'community',
    label: '👨‍👩‍👦 Community',
    color: '#8b5cf6',
    roles: [
      { icon: GraduationCap,   name: 'Student',             desc: 'Grades, timetable, fee balance, notices & digital ID card',             route: '/student/dashboard' },
      { icon: Users,           name: 'Parent / Guardian',   desc: 'Child progress, fee payment, attendance & school communications',        route: '/parent/dashboard'  },
      { icon: Car,             name: 'Transport Officer',   desc: 'Route management, vehicle logs & student transport records',              route: '/login'             },
      { icon: UtensilsCrossed, name: 'Catering Manager',    desc: 'Menu planning, kitchen inventory & daily meal records',                   route: '/login'             },
      { icon: Coffee,          name: 'Canteen Officer',     desc: 'Canteen sales tracking, stock management & daily reports',                route: '/login'             },
      { icon: Package,         name: 'Supplier',            desc: 'Purchase orders, delivery confirmations & invoice management',            route: '/login'             },
      { icon: Globe,           name: 'Government / EMIS',   desc: 'National data submissions, school statistics & compliance reports',       route: '/login'             },
    ],
  },
];

const PLANS = [
  {
    name: 'Starter', price: '250,000', usd: '$65', students: 'Up to 300 students',
    color: '#64748b', recommended: false,
    features: ['Core student & fee management', 'Basic academic reports', 'Parent SMS portal', 'Mobile responsive', '5 user accounts', 'Email support'],
  },
  {
    name: 'Primary', price: '300,000', usd: '$80', students: 'Up to 500 students',
    color: '#3b82f6', recommended: false,
    features: ['All Starter features', 'HR & payroll module', 'Timetable generator', 'UNEB result processing', '15 user accounts', 'Priority support'],
  },
  {
    name: 'Professional', price: '550,000', usd: '$148', students: 'Up to 800 students',
    color: '#10b981', recommended: true,
    features: ['All Primary features', 'Boarding & medical modules', 'Transport & catering', 'AI-powered comment generator', 'Unlimited users', '24/7 phone support'],
  },
  {
    name: 'Enterprise', price: '850,000', usd: '$230', students: 'Unlimited students',
    color: '#f59e0b', recommended: false,
    features: ['All Professional features', 'Multi-campus management', 'Custom branding & domain', 'EMIS bulk reporting', 'Dedicated server', 'On-site training'],
  },
];

const BENEFITS = [
  { icon: Lock, label: 'Bank-Grade Security', desc: 'AES-256 encryption, 2FA login, role-based access control and full audit trails on every action.', color: '#10b981' },
  { icon: Smartphone, label: 'Mobile First', desc: 'Works perfectly on Android, iOS, and desktop. No app installation required — runs in any browser.', color: '#3b82f6' },
  { icon: Globe, label: 'Always Available', desc: 'Cloud-hosted with 99.9% uptime SLA. Access your school data from anywhere in Uganda.', color: '#f59e0b' },
  { icon: Brain, label: 'AI-Powered Tools', desc: 'Smart teacher comment generator, automated grading assistance and predictive analytics.', color: '#8b5cf6' },
];

const STATS = [
  { value: 500, label: 'Schools', suffix: '+' },
  { value: 1000000, label: 'Students', suffix: '+', short: '1M' },
  { value: 50000, label: 'Teachers', suffix: '+', short: '50K' },
  { value: 99.9, label: 'Uptime', suffix: '%' },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return scrolled;
}

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return inView;
}

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return value;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountUp({ target, suffix, short }: { target: number; suffix: string; short?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  const val = useCountUp(target, inView);
  const display = short ? (inView ? short : '0') : val.toLocaleString();
  return <span ref={ref}>{display}{suffix}</span>;
}

function ScrollReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRoleGroup, setActiveRoleGroup] = useState('leadership');

  useEffect(() => {
    document.title = 'SMISSI — School Management Information System | Uganda Edition';
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0f172a', color: '#f8fafc', overflowX: 'hidden' }}>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(15,23,42,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>SMISSI</span>
            <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, display: 'none', '@media (min-width: 640px)': { display: 'inline' } as any }}>
              Uganda Edition 2025
            </span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="landing-nav-links">
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 500,
                fontSize: 14, padding: '8px 14px', borderRadius: 8, transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f8fafc'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; (e.target as HTMLElement).style.background = 'none'; }}
              >{l.label}</button>
            ))}
          </div>

          <button onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: 'white',
            fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-1px)'; (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.4)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
          >Access Portal</button>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(p => !p)} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'none',
          }} className="landing-hamburger">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px 20px' }}>
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} style={{
                display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
                color: '#94a3b8', fontWeight: 500, fontSize: 15, padding: '12px 0', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'inherit',
              }}>{l.label}</button>
            ))}
            <button onClick={() => navigate('/login')} style={{
              marginTop: 12, width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)',
              border: 'none', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px',
              borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            }}>Access Portal →</button>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        {/* Animated bg orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw', maxWidth: 800, maxHeight: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', maxWidth: 700, maxHeight: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animation: 'pulse 10s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', top: '40%', right: '20%', width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', animation: 'pulse 12s ease-in-out infinite 4s' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 30, padding: '8px 18px', marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>Uganda Edition 2025 • NCDC / UNEB / MoES Aligned</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 24, background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            School Management<br />Information System<br />
            <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>for Uganda Schools</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#94a3b8', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Complete portal ecosystem for <strong style={{ color: '#f8fafc' }}>28 specialized roles</strong> across Nursery, Primary & Secondary schools — built for Uganda's education system.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 56 }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white',
              fontWeight: 700, fontSize: 16, padding: '14px 32px', borderRadius: 12, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s',
              boxShadow: '0 0 40px rgba(16,185,129,0.25)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(16,185,129,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(16,185,129,0.25)'; }}
            >Access Portal <ArrowRight size={18} /></button>

            <button onClick={() => scrollTo('#features')} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#f8fafc', fontWeight: 600, fontSize: 16, padding: '14px 32px', borderRadius: 12,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            >Learn More <ChevronDown size={18} /></button>
          </div>

          {/* Stat badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {['28 User Roles', 'Uganda Curriculum', 'Mobile Responsive', 'Bank-Grade Security'].map((b, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 30, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={13} color="#10b981" />{b}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll arrow */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s infinite' }}>
          <ChevronDown size={24} color="#475569" />
        </div>
      </section>

      {/* ── Built for Uganda ────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #0f172a 0%, #0d1b14 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>Built for Uganda</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginTop: 12, marginBottom: 16, letterSpacing: '-1px' }}>Designed Around Uganda's Education System</h2>
              <p style={{ color: '#64748b', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>Every feature built with Ugandan educational policies, curricula, and payment systems in mind.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {UGANDA_FEATURES.map((f, i) => (
              <ScrollReveal key={f.label} delay={i * 80}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderTop: `3px solid ${f.color}`, borderRadius: 16, padding: '28px 24px',
                  transition: 'all 0.3s', cursor: 'default',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <f.icon size={22} color={f.color} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#f1f5f9' }}>{f.label}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ─────────────────────────────────────────────────────────── */}
      <section id="modules" style={{ padding: '100px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>12 Core Modules</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginTop: 12, marginBottom: 16, letterSpacing: '-1px' }}>Everything Your School Needs</h2>
              <p style={{ color: '#64748b', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>A complete suite of integrated modules — no need for separate software.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {MODULES.map((m, i) => (
              <ScrollReveal key={m.label} delay={i * 50}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '22px 20px', display: 'flex', gap: 16, alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.background = 'rgba(255,255,255,0.06)'; el.style.boxShadow = `0 12px 30px rgba(0,0,0,0.3), 0 0 0 1px ${m.color}40`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.background = 'rgba(255,255,255,0.03)'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <m.icon size={20} color={m.color} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#f1f5f9' }}>{m.label}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{m.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 28 Roles ────────────────────────────────────────────────────────── */}
      <section id="roles" style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #0f172a 0%, #0d1121 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>28 Specialized User Roles</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginTop: 12, marginBottom: 16, letterSpacing: '-1px' }}>Every Role Has Their Own Portal</h2>
              <p style={{ color: '#64748b', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>Each staff member, student, and parent gets a tailored dashboard with exactly the tools they need.</p>
            </div>
          </ScrollReveal>

          {/* Role group tabs */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {ROLE_GROUPS.map(g => {
              const active = activeRoleGroup === g.id;
              return (
                <button key={g.id} onClick={() => setActiveRoleGroup(g.id)} style={{
                  background: active ? g.color : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? g.color : 'rgba(255,255,255,0.1)'}`,
                  color: active ? 'white' : '#94a3b8', fontWeight: 600, fontSize: 13,
                  padding: '8px 18px', borderRadius: 30, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}>{g.label}</button>
              );
            })}
          </div>

          {/* Role cards */}
          {ROLE_GROUPS.filter(g => g.id === activeRoleGroup).map(group => (
            <div key={group.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {group.roles.map((role, i) => (
                <ScrollReveal key={role.name} delay={i * 60}>
                  <div
                    onClick={() => navigate(role.route)}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14, padding: '22px', cursor: 'pointer', transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.background = 'rgba(255,255,255,0.06)'; el.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${group.color}40`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.background = 'rgba(255,255,255,0.03)'; el.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 11, background: `${group.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <role.icon size={20} color={group.color} />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 2 }}>{role.name}</h3>
                        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{role.desc}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: group.color, fontSize: 13, fontWeight: 600 }}>
                      <ExternalLink size={13} />
                      Open Portal
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Choose ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>Why SMISSI</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginTop: 12, marginBottom: 16, letterSpacing: '-1px' }}>Built for the Future of Uganda Education</h2>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 72 }}>
            {BENEFITS.map((b, i) => (
              <ScrollReveal key={b.label} delay={i * 80}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: '28px 24px', textAlign: 'center', transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <b.icon size={26} color={b.color} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: '#f1f5f9' }}>{b.label}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{b.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            {STATS.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 100}>
                <div style={{ textAlign: 'center', padding: '32px 16px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#10b981', marginBottom: 8, letterSpacing: '-2px' }}>
                    <CountUp target={s.value} suffix={s.suffix} short={s.short} />
                  </div>
                  <div style={{ color: '#64748b', fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #0f172a 0%, #0d1b14 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>Pricing</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginTop: 12, marginBottom: 16, letterSpacing: '-1px' }}>Transparent Pricing in UGX</h2>
              <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>All prices in Ugandan Shillings. VAT exclusive. Government & multi-school custom pricing available.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 80}>
                <div style={{
                  background: plan.recommended ? `linear-gradient(180deg, rgba(16,185,129,0.08) 0%, rgba(6,78,59,0.12) 100%)` : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${plan.recommended ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 20, padding: '32px', position: 'relative', transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = `0 24px 50px rgba(0,0,0,0.4)`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
                >
                  {plan.recommended && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      ★ RECOMMENDED
                    </div>
                  )}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 20, color: plan.color, marginBottom: 4 }}>{plan.name}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>{plan.students}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>UGX</span>
                      <span style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-1px' }}>{plan.price}</span>
                      <span style={{ color: '#64748b', fontSize: 13 }}>/month</span>
                    </div>
                    <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>≈ {plan.usd} USD</div>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                        <Check size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => navigate('/login')} style={{
                    width: '100%', background: plan.recommended ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)',
                    border: plan.recommended ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: plan.recommended ? 'white' : '#94a3b8', fontWeight: 700, fontSize: 14,
                    padding: '12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >Get Started →</button>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <p style={{ textAlign: 'center', color: '#475569', fontSize: 14, marginTop: 40 }}>
              Government institutions & multi-campus networks — <a href="mailto:sales@smissi.ac.ug" style={{ color: '#10b981', textDecoration: 'none' }}>contact us for custom pricing</a>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #064e3b 0%, #1e1b4b 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 48px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1px' }}>
            Ready to Transform Your<br />School Management?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 17, marginBottom: 40, lineHeight: 1.6 }}>
            Join 500+ schools across Uganda already using SMISSI to streamline administration, improve learning outcomes, and keep parents connected.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white',
              fontWeight: 700, fontSize: 16, padding: '14px 32px', borderRadius: 12, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 40px rgba(16,185,129,0.3)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            ><Zap size={18} />Access Portal</button>

            <a href="mailto:demo@smissi.ac.ug" style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', fontWeight: 600, fontSize: 16, padding: '14px 32px', borderRadius: 12,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            ><Mail size={18} />Request Demo</a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#020617', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 18 }}>SMISSI</span>
              </div>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                School Management Information System for Uganda — powering the future of education administration.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: Globe, text: 'smissi.ac.ug' },
                  { icon: Mail, text: 'support@smissi.ac.ug' },
                  { icon: Phone, text: '+256 700 000 000' },
                  { icon: MapPin, text: 'Kampala, Uganda' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13 }}>
                    <Icon size={14} color="#10b981" />{text}
                  </div>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Product</h4>
              {['Features', 'Modules', 'Pricing', 'Security', 'API Docs', 'Status Page'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: '#475569', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f8fafc'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = '#475569'; }}
                  >{l}</a>
                </div>
              ))}
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Resources</h4>
              {['Documentation', 'Video Tutorials', 'Training', 'Community Forum', 'Blog', 'Changelog'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: '#475569', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f8fafc'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = '#475569'; }}
                  >{l}</a>
                </div>
              ))}
            </div>

            {/* Support */}
            <div>
              <h4 style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Support</h4>
              {['Help Centre', 'Contact Support', 'Request Demo', 'System Status', 'Privacy Policy', 'Terms of Service'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: '#475569', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f8fafc'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = '#475569'; }}
                  >{l}</a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#334155', fontSize: 13 }}>© 2025 SMISSI · Uganda Edition · CONFIDENTIAL</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['NCDC', 'UNEB', 'MoES'].map(b => (
                <span key={b} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 768px) {
          .landing-nav-links { display: none !important; }
          .landing-hamburger { display: flex !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
