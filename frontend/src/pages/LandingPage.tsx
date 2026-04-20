import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, BookOpen, DollarSign, Heart, Home, Bus, UtensilsCrossed,
  Lock, Megaphone, BarChart3, Clock, GraduationCap, Star, Menu, X,
  ArrowRight, Check, Globe, Smartphone, Brain,
  Building2, Phone, Mail, MapPin, ExternalLink, ChevronRight,
  Award, TrendingUp, UserCheck, Stethoscope, AlertTriangle, Car,
  Coffee, ShieldCheck, Radio, Shirt, Wrench, MessageSquare, BookMarked,
  Eye, Landmark, Package
} from 'lucide-react';

// ─── Theme tokens ──────────────────────────────────────────────────────────────
const C = {
  primaryBlue:  '#2563eb',
  indigo:       '#4f46e5',
  teal:         '#14b8a6',
  cyan:         '#06b6d4',
  white:        '#ffffff',
  lightGray:    '#f9fafb',
  borderGray:   '#e5e7eb',
  textGray:     '#9ca3af',
  darkText:     '#111827',
  darkNav:      '#1e3a5f',
  limeGreen:    '#84cc16',
  limeLight:    '#ecfccb',
  lightBlue:    '#eff6ff',
  lightPurple:  '#faf5ff',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Modules',  href: '#modules'  },
  { label: 'Roles',    href: '#roles'    },
  { label: 'Pricing',  href: '#pricing'  },
];

const UGANDA_FEATURES = [
  { label: 'NCDC Aligned',       desc: 'Aligned with Uganda National Curriculum Development Centre' },
  { label: 'UNEB Ready',         desc: 'PLE, UCE, and UACE result entry and processing' },
  { label: 'MoES Framework',     desc: 'Ministry of Education and Sports compliant' },
  { label: 'Local Payment',      desc: 'MTN MoMo, Airtel Money, and bank integration' },
  { label: 'Thematic Curriculum',desc: 'Full support for P1-P3 thematic approach' },
  { label: 'New CBC',            desc: 'Competence-based curriculum for lower secondary' },
];

const MODULES = [
  { icon: Users,           label: 'Student Management', desc: 'Complete admissions, profiles, and class allocation',                color: '#2563eb', bg: '#eff6ff'   },
  { icon: DollarSign,      label: 'Finance & Fees',     desc: 'Invoicing, payments, and financial reporting',                      color: '#16a34a', bg: '#dcfce7'   },
  { icon: BookOpen,        label: 'Academics & Grades', desc: 'Grade books, report cards, and curriculum alignment',               color: '#7c3aed', bg: '#f3e8ff'   },
  { icon: UserCheck,       label: 'HR & Payroll',       desc: 'Staff management, leave, and payroll processing',                   color: '#9333ea', bg: '#faf5ff'   },
  { icon: Stethoscope,     label: 'Medical/Sickbay',    desc: 'Student health records and sickbay management',                     color: '#dc2626', bg: '#fef2f2'   },
  { icon: Home,            label: 'Boarding',           desc: 'Dormitory management and night roll call',                          color: '#374151', bg: '#f3f4f6'   },
  { icon: Bus,             label: 'Transport',          desc: 'Bus routes, driver management, and attendance',                     color: '#0d9488', bg: '#f0fdfa'   },
  { icon: UtensilsCrossed, label: 'Catering',           desc: 'Meal planning and kitchen inventory',                               color: '#ea580c', bg: '#fff7ed'   },
  { icon: Shield,          label: 'Security',           desc: 'Gate management and visitor tracking',                              color: '#374151', bg: '#f3f4f6'   },
  { icon: Megaphone,       label: 'Communications',     desc: 'Newsfeed, announcements, and messaging',                           color: '#0891b2', bg: '#ecfeff'   },
  { icon: BarChart3,       label: 'Reports & Analytics',desc: 'Comprehensive reporting and insights',                              color: '#d97706', bg: '#fffbeb'   },
  { icon: Clock,           label: 'Timetables',         desc: 'Class and exam scheduling',                                        color: '#db2777', bg: '#fdf2f8'   },
];

const ROLE_GROUPS = [
  {
    id: 'leadership', label: '🏫 Leadership', color: '#10b981',
    roles: [
      { icon: GraduationCap, name: 'Head Teacher',        desc: '14-page portal with full school oversight, approvals & reporting', route: '/ht/dashboard'           },
      { icon: Star,          name: 'Deputy Head Master',   desc: 'Academic supervision, timetables & staff management',              route: '/deputy-hm/dashboard'    },
      { icon: BookOpen,      name: 'Head of Department',   desc: 'Syllabus tracking, lesson observations & scheme approval',          route: '/hod/dashboard'          },
      { icon: Award,         name: 'Examinations Officer', desc: 'Exam scheduling, moderation workflow & result publications',         route: '/exam-officer/dashboard' },
      { icon: Heart,         name: 'SEN Teacher',          desc: 'Special needs student records, IEP tracking & support plans',       route: '/teacher/dashboard'      },
      { icon: Eye,           name: 'Government Inspector', desc: 'Read-only school inspection view & compliance dashboard',            route: '/login'                  },
    ],
  },
  {
    id: 'finance', label: '💰 Finance & Admin', color: '#f59e0b',
    roles: [
      { icon: DollarSign, name: 'Finance Officer', desc: 'Fee collection, invoicing, arrears & UGX financial reports',      route: '/bursar/dashboard' },
      { icon: TrendingUp, name: 'Bursar',           desc: 'Full financial oversight, petty cash, budgets & audit trails',     route: '/bursar/dashboard' },
      { icon: UserCheck,  name: 'HR Officer',       desc: 'Staff records, contracts, leave management & recruitment',          route: '/login'           },
      { icon: BarChart3,  name: 'Payroll Officer',  desc: 'NSSF, PAYE, payslip generation & salary disbursement',             route: '/login'           },
      { icon: Shield,     name: 'Super Admin',      desc: 'Full system access, school settings, user management & branding',  route: '/login'           },
      { icon: Building2,  name: 'IT Administrator', desc: 'System configuration, integrations & security settings',           route: '/login'           },
    ],
  },
  {
    id: 'welfare', label: '🏥 Welfare & Safety', color: '#f43f5e',
    roles: [
      { icon: Stethoscope,  name: 'Nurse / Matron',   desc: 'Sick bay register, patient records, medication & referrals',           route: '/nurse/dashboard'       },
      { icon: Home,          name: 'Boarding Master',  desc: 'Roll calls, exeat approvals, dorm incidents & student welfare',        route: '/dorm-master/dashboard' },
      { icon: UserCheck,     name: 'Head of Boarding', desc: 'Dorm oversight, holiday allocations & boarding financials',            route: '/dorm-master/dashboard' },
      { icon: ShieldCheck,   name: 'Gate Guard',       desc: 'Visitor check-in/out, badge issuance & gate incident logs',            route: '/security/dashboard'    },
      { icon: AlertTriangle, name: 'Head of Security', desc: 'Security incident management, CCTV logs & emergency protocols',        route: '/security/dashboard'    },
      { icon: MessageSquare, name: 'School Counselor', desc: 'Counseling session records, student welfare & referral tracking',      route: '/counsellor/dashboard'  },
    ],
  },
  {
    id: 'teaching', label: '📚 Teaching & Learning', color: C.primaryBlue,
    roles: [
      { icon: BookOpen,  name: 'Teacher',               desc: 'Marks entry, attendance, lesson notes & parent communication', route: '/teacher/dashboard' },
      { icon: Radio,     name: 'ECA Coordinator',        desc: 'Clubs, sports, tournaments & extra-curricular activity records', route: '/eca/dashboard'    },
      { icon: Megaphone, name: 'Communications Officer', desc: 'School announcements, SMS blasts & newsletter management',        route: '/login'            },
      { icon: Shirt,     name: 'Uniform Officer',        desc: 'Uniform compliance tracking, shop stock & fines management',      route: '/login'            },
      { icon: Wrench,    name: 'Facilities Manager',     desc: 'Maintenance requests, asset registry & infrastructure tracking',  route: '/login'            },
    ],
  },
  {
    id: 'community', label: '👨‍👩‍👦 Community', color: C.indigo,
    roles: [
      { icon: GraduationCap,   name: 'Student',           desc: 'Grades, timetable, fee balance, notices & digital ID card',    route: '/student/dashboard' },
      { icon: Users,           name: 'Parent / Guardian', desc: 'Child progress, fee payment, attendance & school communications', route: '/parent/dashboard'  },
      { icon: Car,             name: 'Transport Officer', desc: 'Route management, vehicle logs & student transport records',      route: '/login'             },
      { icon: UtensilsCrossed, name: 'Catering Manager',  desc: 'Menu planning, kitchen inventory & daily meal records',           route: '/login'             },
      { icon: Coffee,          name: 'Canteen Officer',   desc: 'Canteen sales tracking, stock management & daily reports',        route: '/login'             },
      { icon: Package,         name: 'Supplier',          desc: 'Purchase orders, delivery confirmations & invoice management',    route: '/login'             },
      { icon: Globe,           name: 'Government / EMIS', desc: 'National data submissions, school statistics & compliance reports', route: '/login'           },
    ],
  },
];

const PLANS = [
  { name: 'Starter',      price: '250,000', usd: '$65',  students: 'Up to 300 students',   recommended: false, features: ['Finance + Academics + HR','Basic Reporting','Email Support','No AI Features'] },
  { name: 'Primary',      price: '300,000', usd: '$80',  students: 'Up to 500 students',   recommended: false, features: ['Full Primary Set','Parent Portal','SMS Notifications','Attendance Tracking'] },
  { name: 'Professional', price: '550,000', usd: '$148', students: 'Up to 800 students',   recommended: true,  features: ['All Modules','Boarding + Transport','Canteen + ECA','Parent + Student Portals'] },
  { name: 'Enterprise',   price: '850,000', usd: '$230', students: 'Unlimited students',   recommended: false, features: ['All Modules + AI','Special Needs + Uniform','Priority Support','Custom Integrations'] },
];

const BENEFITS = [
  { icon: Lock,       label: 'Bank-Grade Security', desc: 'AES-256 encryption, 2FA, role-based access control, and immutable audit trails.' },
  { icon: Smartphone, label: 'Mobile First',         desc: 'Fully responsive design works flawlessly on Android, iOS, and desktop.' },
  { icon: Globe,      label: 'Cloud-Based',          desc: 'No installation needed. Access from anywhere with internet connectivity.' },
  { icon: Brain,      label: 'AI-Powered',           desc: 'AI comment generator and grading assistant for teachers (Enterprise plan).' },
];

const STATS = [
  { value: 500,   label: 'Schools',   suffix: '+',  short: '500'  },
  { value: 1,     label: 'Students',  suffix: 'M+', short: '1'    },
  { value: 500,   label: 'Teachers',  suffix: 'K+', short: '500'  },
  { value: 99.9,  label: 'Uptime',    suffix: '%',  short: '99.9' },
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
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
      setValue(Math.round(target * eased * 10) / 10);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return value;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountUpStat({ stat }: { stat: typeof STATS[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900, color: '#fbbf24', marginBottom: 8, letterSpacing: '-1px' }}>
        {inView ? stat.short : '0'}{stat.suffix}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 500, letterSpacing: '0.5px' }}>{stat.label}</div>
    </div>
  );
}

function ScrollReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const scrolled  = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { document.title = 'SMISSI — School Management Information System | Uganda Edition'; }, []);

  const scrollTo = (id: string) => { setMenuOpen(false); document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"', background: C.white, color: C.darkText, overflowX: 'hidden' }}>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 64,
        background: C.white,
        borderBottom: `1px solid ${scrolled ? C.borderGray : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 16, height: 64, width: '100%', boxSizing: 'border-box' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 19, color: C.darkText, letterSpacing: '-0.3px' }}>SMISSI</span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="landing-nav-links">
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontWeight: 500,
                fontSize: 15, padding: '8px 16px', borderRadius: 8, transition: 'all 0.2s', fontFamily: 'inherit',
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = C.primaryBlue; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#6b7280'; }}
              >{l.label}</button>
            ))}
          </div>

          <button onClick={() => navigate('/login')} style={{
            background: C.primaryBlue, border: 'none', color: C.white,
            fontWeight: 700, fontSize: 15, padding: '10px 22px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.primaryBlue; }}
          >Access Portal</button>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(p => !p)} style={{
            background: C.lightGray, border: `1px solid ${C.borderGray}`,
            color: C.darkText, borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'none',
          }} className="landing-hamburger">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: C.white, borderTop: `1px solid ${C.borderGray}`, padding: '12px 32px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}>
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)} style={{
                display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
                color: '#6b7280', fontWeight: 500, fontSize: 15, padding: '12px 0', cursor: 'pointer',
                borderBottom: `1px solid ${C.borderGray}`, fontFamily: 'inherit',
              }}>{l.label}</button>
            ))}
            <button onClick={() => navigate('/login')} style={{
              marginTop: 14, width: '100%', background: C.primaryBlue,
              border: 'none', color: C.white, fontWeight: 700, fontSize: 15, padding: '12px',
              borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
            }}>Access Portal →</button>
          </div>
        )}
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', paddingTop: 64,
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #ddd6fe 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', left: '-5%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 32px', textAlign: 'center', position: 'relative', width: '100%', zIndex: 1, boxSizing: 'border-box' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.95)', border: `1px solid #dbeafe`,
            borderRadius: 25, padding: '6px 14px', marginBottom: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: C.primaryBlue, fontSize: 12, fontWeight: 500 }}>Uganda Edition 2025 • Aligned with NCDC / UNEB / MoES</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.8px',
            marginBottom: 16, color: C.darkText,
          }}>
            School Management<br />Information System for{' '}
            <span style={{ color: C.primaryBlue, position: 'relative' }}>Uganda<br />Schools</span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)', color: '#6b7280', maxWidth: 560, margin: '0 auto 32px',
            lineHeight: 1.6, fontWeight: 400,
          }}>
            Complete portal solution for all school levels — Nursery, Primary, and Secondary. Manage students, staff, finances, academics, and operations in one unified platform.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <button onClick={() => navigate('/login')} style={{
              background: C.primaryBlue, border: 'none', color: C.white,
              fontWeight: 700, fontSize: 15, padding: '11px 26px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.25s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#1d4ed8'; el.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.primaryBlue; el.style.transform = 'none'; }}
            >Access Portal <ArrowRight size={16} /></button>

            <button onClick={() => scrollTo('#features')} style={{
              background: C.white, border: `1.5px solid ${C.borderGray}`,
              color: C.darkText, fontWeight: 600, fontSize: 15, padding: '10px 26px', borderRadius: 8,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#9ca3af'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.borderGray; }}
            >Learn More</button>
          </div>

          {/* Feature chips */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {['28 User Roles', 'Uganda Curriculum', 'Mobile Responsive', 'Bank-Grade Security'].map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151',
                fontWeight: 500, background: 'rgba(255,255,255,0.6)', padding: '5px 12px',
                borderRadius: 20, border: `1px solid rgba(255,255,255,0.8)`,
              }}>
                <Check size={15} color="#16a34a" strokeWidth={3} />{b}
              </div>
            ))}
          </div>
        </div>

        {/* Professional scroll indicator — fades out once user scrolls */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          opacity: scrolled ? 0 : 1,
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          transform: scrolled ? 'translateX(-50%) translateY(12px)' : 'translateX(-50%) translateY(0)',
          pointerEvents: scrolled ? 'none' : 'auto',
        }}>
          {/* Mouse icon */}
          <div style={{
            width: 26, height: 42, borderRadius: 13,
            border: `2px solid rgba(0,0,0,0.18)`,
            display: 'flex', justifyContent: 'center', paddingTop: 7,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{
              width: 3, height: 8, borderRadius: 2,
              background: 'rgba(0,0,0,0.3)',
              animation: 'scrollDot 1.6s ease-in-out infinite',
            }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* ── Built for Uganda Education ────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 32px', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{
                fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, marginBottom: 16, color: C.darkText,
                backgroundImage: `linear-gradient(135deg, ${C.primaryBlue}, #4f46e5)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Built for Uganda Education</h2>
              <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>SMISSI is specifically designed to meet the needs of Ugandan schools, with full alignment to national education frameworks.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {UGANDA_FEATURES.map((f, i) => (
              <ScrollReveal key={f.label} delay={i * 60}>
                <div style={{
                  background: C.white, border: `1.5px solid ${C.borderGray}`, borderRadius: 12,
                  padding: '24px', display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 12px 32px rgba(37, 99, 235, 0.12)';
                    el.style.borderColor = '#93c5fd';
                    el.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    el.style.borderColor = C.borderGray;
                    el.style.transform = 'none';
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: '#dbeafe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <GraduationCap size={22} color={C.primaryBlue} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: C.darkText }}>{f.label}</h3>
                    <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comprehensive Modules ─────────────────────────────────────────── */}
      <section id="modules" style={{ padding: '80px 32px', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{
                fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, marginBottom: 16, color: C.darkText,
              }}>Comprehensive Modules</h2>
              <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>Every aspect of school management covered with dedicated portals and features.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {MODULES.map((m, i) => (
              <ScrollReveal key={m.label} delay={i * 45}>
                <div style={{
                  background: C.white, border: `1.5px solid ${C.borderGray}`, borderRadius: 14, padding: 28,
                  transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative', overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                    el.style.borderColor = m.color + '40';
                    el.style.transform = 'translateY(-6px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    el.style.borderColor = C.borderGray;
                    el.style.transform = 'none';
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, background: m.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                  }}>
                    <m.icon size={26} color={m.color} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: C.darkText }}>{m.label}</h3>
                  <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 28 Specialized User Roles ────────────────────────────────────── */}
      <section id="roles" style={{ padding: '80px 32px', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{
                fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, marginBottom: 16, color: C.darkText,
              }}>28 Specialized User Roles</h2>
              <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>Every member of your school community gets a tailored portal with exactly the features and data they need.</p>
            </div>
          </ScrollReveal>

          {/* Featured roles grid - 8 roles per row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 30, marginBottom: 40 }}>
            {[
              { icon: UserCheck, name: 'Super Admin', desc: 'Full Control', color: '#2563eb' },
              { icon: DollarSign, name: 'Finance Officer', desc: 'Fee Management', color: '#16a34a' },
              { icon: BookOpen, name: 'Teacher', desc: 'Grade Books', color: '#4f46e5' },
              { icon: Users, name: 'Parent', desc: 'Child Tracking', color: '#0d9488' },
              { icon: GraduationCap, name: 'Student', desc: 'Grades & Timetable', color: '#2563eb' },
              { icon: Award, name: 'HR Officer', desc: 'Staff Management', color: '#9333ea' },
              { icon: Stethoscope, name: 'Nurse', desc: 'Medical Records', color: '#dc2626' },
              { icon: Home, name: 'Boarding Master', desc: 'Dormitory', color: '#374151' },
              { icon: Bus, name: 'Transport Officer', desc: 'Bus Routes', color: '#0d9488' },
              { icon: UtensilsCrossed, name: 'Catering Manager', desc: 'Meals', color: '#ea580c' },
              { icon: Shield, name: 'Security Officer', desc: 'Gate Control', color: '#374151' },
              { icon: Megaphone, name: 'Communications', desc: 'Newsfeed', color: '#0891b2' },
              { icon: Star, name: 'ECA Coordinator', desc: 'Activities', color: '#84cc16' },
              { icon: Heart, name: 'SEN Officer', desc: 'Inclusion', color: '#ec4899' },
              { icon: Coffee, name: 'Canteen Manager', desc: 'Pre-orders', color: '#f97316' },
              { icon: Shirt, name: 'Uniform Manager', desc: 'Inventory', color: '#d946ef' },
            ].map((role, i) => (
              <ScrollReveal key={role.name} delay={i * 25}>
                <div
                  onClick={() => navigate('/login')}
                  style={{
                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    const circle = el.querySelector('[role="img"]') as HTMLElement;
                    if (circle) {
                      circle.style.transform = 'scale(1.1)';
                      circle.style.boxShadow = `0 8px 24px ${role.color}40`;
                    }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    const circle = el.querySelector('[role="img"]') as HTMLElement;
                    if (circle) {
                      circle.style.transform = 'scale(1)';
                      circle.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  <div
                    role="img"
                    style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: role.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                  >
                    <role.icon size={32} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 14, color: C.darkText, marginBottom: 3 }}>{role.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.4 }}>{role.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => navigate('/select-portal')} style={{
                background: C.white, border: `1.5px solid ${C.borderGray}`, color: C.darkText,
                fontWeight: 600, fontSize: 14, padding: '10px 24px', borderRadius: 8,
                cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.primaryBlue; el.style.color = C.primaryBlue; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.borderGray; el.style.color = C.darkText; }}
              >View All 28 Roles <ChevronRight size={15} /></button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Why Choose SMISSI ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 8vw, 80px) 32px', background: '#1e3a8a' }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          width: '100%', 
          boxSizing: 'border-box', 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 1fr)',
          gap: 'clamp(40px, 6vw, 80px)', 
          alignItems: 'start'
        }}>
          {/* Left: benefits list */}
          <div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: C.white, marginBottom: 40 }}>Why Choose SMISSI?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {BENEFITS.map((b, i) => (
                <ScrollReveal key={b.label} delay={i * 70}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: 'rgba(79, 70, 229, 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <b.icon size={24} color={C.white} strokeWidth={1.5} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 8 }}>{b.label}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right: stats box */}
          <ScrollReveal delay={100}>
            <div style={{
              background: 'rgba(30, 58, 138, 0.6)', 
              border: '1.5px solid rgba(191, 219, 254, 0.3)',
              borderRadius: 24, 
              padding: 'clamp(40px, 5vw, 56px)', 
              backdropFilter: 'blur(16px)',
              width: '100%',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 48px)', width: '100%' }}>
                {STATS.map(stat => (
                  <CountUpStat key={stat.label} stat={stat} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 32px', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{
                fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, marginBottom: 16, color: C.darkText,
              }}>Simple, Transparent Pricing</h2>
              <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 460, margin: '0 auto' }}>Choose the plan that fits your school size and needs. All prices in UGX per month.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 70}>
                <div style={{
                  background: C.white,
                  border: `${plan.recommended ? 2 : 1.5}px solid ${plan.recommended ? C.primaryBlue : C.borderGray}`,
                  borderRadius: 16, padding: 32, position: 'relative', transition: 'all 0.3s ease',
                  boxShadow: plan.recommended ? `0 16px 48px ${C.primaryBlue}20` : '0 4px 12px rgba(0,0,0,0.06)',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-8px)';
                    el.style.boxShadow = plan.recommended
                      ? `0 24px 64px ${C.primaryBlue}30`
                      : '0 16px 48px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'none';
                    el.style.boxShadow = plan.recommended
                      ? `0 16px 48px ${C.primaryBlue}20`
                      : '0 4px 12px rgba(0,0,0,0.06)';
                  }}
                >
                  {plan.recommended && (
                    <div style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      background: C.primaryBlue, color: C.white, fontSize: 12, fontWeight: 800,
                      padding: '6px 18px', borderRadius: 20, whiteSpace: 'nowrap',
                      boxShadow: `0 4px 16px ${C.primaryBlue}40`,
                    }}>
                      Recommended
                    </div>
                  )}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 22, color: C.darkText, marginBottom: 6 }}>{plan.name}</h3>
                    <p style={{ color: C.textGray, fontSize: 14, marginBottom: 18 }}>{plan.students}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: C.textGray }}>UGX</span>
                      <span style={{ fontSize: 36, fontWeight: 900, color: C.darkText, letterSpacing: '-1px' }}>{plan.price}</span>
                      <span style={{ color: C.textGray, fontSize: 14 }}>/month</span>
                    </div>
                    <div style={{ color: C.textGray, fontSize: 13 }}>≈ {plan.usd} USD</div>
                  </div>

                  <div style={{ marginBottom: 28, borderTop: `1px solid ${C.borderGray}`, paddingTop: 24 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                        <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ color: '#1f2937', fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => navigate('/login')} style={{
                    width: '100%', background: plan.recommended ? C.primaryBlue : C.white,
                    border: `1.5px solid ${plan.recommended ? C.primaryBlue : C.borderGray}`,
                    color: plan.recommended ? C.white : C.primaryBlue,
                    fontWeight: 700, fontSize: 15, padding: '12px', borderRadius: 10,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      if (plan.recommended) {
                        el.style.background = '#1d4ed8';
                      } else {
                        el.style.background = '#dbeafe';
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      if (plan.recommended) {
                        el.style.background = C.primaryBlue;
                      } else {
                        el.style.background = C.white;
                      }
                    }}
                  >Get Started {plan.recommended && '→'}</button>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={300}>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 15, marginTop: 32 }}>
              Government and multi-school districts: <a href="mailto:sales@smissi.ac.ug" style={{ color: C.primaryBlue, fontWeight: 700, textDecoration: 'none' }}>Contact us for custom pricing</a>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 32px',
        background: `linear-gradient(135deg, ${C.primaryBlue} 0%, #4f46e5 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20, width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, width: '100%', boxSizing: 'border-box', padding: '0 32px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, marginBottom: 20, color: C.white,
            letterSpacing: '-0.5px',
          }}>
            Ready to Transform Your School Management?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 40, lineHeight: 1.6,
            fontWeight: 500,
          }}>
            Join hundreds of Ugandan schools already using SMISSI to streamline operations and improve educational outcomes.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              background: C.white, border: 'none', color: C.primaryBlue,
              fontWeight: 700, fontSize: 16, padding: '14px 32px', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'none';
                el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
            >Access Portal</button>

            <button style={{
              background: 'transparent', border: `2px solid rgba(255,255,255,0.7)`,
              color: C.white, fontWeight: 600, fontSize: 16, padding: '12px 32px', borderRadius: 10,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.3s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,255,255,0.12)';
                el.style.borderColor = 'rgba(255,255,255,0.9)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'transparent';
                el.style.borderColor = 'rgba(255,255,255,0.7)';
              }}
            >Schedule Demo</button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', padding: '60px 32px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }} className="footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: C.primaryBlue,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={20} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 20, color: C.white }}>SMISSI</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.8, marginBottom: 0, maxWidth: 280 }}>
                School Management Information System for Uganda. Aligned with NCDC, UNEB, and MoES frameworks. Trusted by 500+ schools.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ color: C.white, fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Product</h4>
              {['Features', 'Pricing', 'Security', 'API'].map(l => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <a href="#" style={{
                    color: '#94a3b8', fontSize: 15, textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = C.white; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; }}
                  >{l}</a>
                </div>
              ))}
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ color: C.white, fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Resources</h4>
              {['Documentation', 'Training', 'Support', 'Blog'].map(l => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <a href="#" style={{
                    color: '#94a3b8', fontSize: 15, textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = C.white; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = '#94a3b8'; }}
                  >{l}</a>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: C.white, fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Contact</h4>
              {[
                { text: 'smissyugi.com' },
                { text: 'dev.smissyugi.com' },
                { text: 'support@smissyugi.com' },
                { text: '+256 700 000 000' },
              ].map(({ text }) => (
                <div key={text} style={{ marginBottom: 12, color: '#94a3b8', fontSize: 15 }}>{text}</div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: 28, textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: 14 }}>© 2025 SMISSI. All rights reserved. | Uganda Edition | CONFIDENTIAL</p>
          </div>
        </div>
      </footer>

      {/* Global styles */}
      <style>{`
        @keyframes scrollDot {
          0%   { opacity: 0; transform: translateY(0); }
          40%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(10px); }
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        @media(max-width:768px){
          .landing-nav-links { display:none!important; }
          .landing-hamburger { display:flex!important; }
          .why-grid { grid-template-columns:1fr!important; gap:40px!important; }
          .footer-grid { grid-template-columns:1fr 1fr!important; gap:32px!important; }
        }
        @media(max-width:480px){
          .footer-grid { grid-template-columns:1fr!important; }
        }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#f9fafb; }
        ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:3px; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
