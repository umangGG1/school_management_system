import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, BookOpen, DollarSign, Heart, Home, Bus, UtensilsCrossed,
  Lock, Megaphone, BarChart3, Clock, GraduationCap, Star, Search, X,
  Award, TrendingUp, UserCheck, Stethoscope, AlertTriangle, Car,
  Coffee, ShieldCheck, Radio, Shirt, Wrench, MessageSquare,
  Eye, Landmark, Package
} from 'lucide-react';

const C = {
  primaryBlue: '#2563eb',
  white: '#ffffff',
  lightGray: '#f3f4f6',
  borderGray: '#e5e7eb',
  textGray: '#9ca3af',
  darkText: '#111827',
};

// All roles grouped by category
const PORTAL_GROUPS = [
  {
    id: 'admin',
    title: 'Administration & Management',
    subtitle: 'Full school oversight and control',
    roles: [
      { icon: Users, name: 'Super Admin', desc: 'Full school control, all modules access', color: '#2563eb', route: '/login', secure: true },
      { icon: GraduationCap, name: 'Academic Admin / Deputy HM', desc: 'Students, classes, timetables, reports', color: '#4f46e5', route: '/login', secure: true },
      { icon: DollarSign, name: 'Finance Officer (Bursar)', desc: 'Fees, invoicing, payments, payroll', color: '#16a34a', route: '/login', secure: true },
      { icon: UserCheck, name: 'HR Officer', desc: 'Staff management, leave, contracts', color: '#9333ea', route: '/login', secure: true },
    ],
  },
  {
    id: 'operations',
    title: 'Operations & Support',
    subtitle: 'Day-to-day school operations',
    roles: [
      { icon: Stethoscope, name: 'School Nurse', desc: 'Medical records, sickbay management', color: '#dc2626', route: '/login', secure: true },
      { icon: Home, name: 'Boarding Master', desc: 'Dormitories, night roll, leave', color: '#374151', route: '/login', secure: true },
      { icon: UtensilsCrossed, name: 'Catering Manager', desc: 'Meal planning, kitchen stock', color: '#ea580c', route: '/login', secure: true },
      { icon: Bus, name: 'Transport Officer', desc: 'Bus routes, drivers, allocation', color: '#0d9488', route: '/login', secure: true },
    ],
  },
  {
    id: 'specialized',
    title: 'Specialized Offices',
    subtitle: 'Specialized school functions',
    roles: [
      { icon: Megaphone, name: 'Communications Officer', desc: 'Newsfeed, announcements, events', color: '#0891b2', route: '/login', secure: true, isNew: true },
      { icon: Star, name: 'ECA Coordinator', desc: 'Clubs, sports, activities', color: '#84cc16', route: '/login', secure: true, isNew: true },
      { icon: Heart, name: 'SEN / Inclusion Officer', desc: 'Special needs, accommodations', color: '#ec4899', route: '/login', secure: true, isNew: true },
      { icon: Coffee, name: 'Canteen Manager', desc: 'Pre-orders, payments, menu', color: '#f97316', route: '/login', secure: true, isNew: true },
      { icon: Shirt, name: 'Uniform Manager', desc: 'Uniform store, inventory', color: '#d946ef', route: '/login', secure: true, isNew: true },
      { icon: MessageSquare, name: 'School Counsellor', desc: 'Counselling, career guidance', color: '#6366f1', route: '/login', secure: true, isNew: true },
    ],
  },
  {
    id: 'teaching',
    title: 'Teaching & Learning',
    subtitle: 'Academic staff and students',
    roles: [
      { icon: BookOpen, name: 'Teacher / Class Teacher', desc: 'Grade books, attendance, reports', color: C.primaryBlue, route: '/login', secure: true },
      { icon: GraduationCap, name: 'Student Portal', desc: 'Grades, timetable, announcements', color: '#06b6d4', route: '/login', secure: true },
      { icon: Users, name: 'Parent / Guardian', desc: 'Child tracking, fees, messaging', color: '#10b981', route: '/login', secure: true },
    ],
  },
  {
    id: 'external',
    title: 'External & Service',
    subtitle: 'External partners and services',
    roles: [
      { icon: Package, name: 'Local Supplier', desc: 'Orders, invoices, payments', color: '#b45309', route: '/login', secure: true, isNew: true },
      { icon: Bus, name: 'School Bus Driver', desc: 'Route, attendance, incidents', color: '#16a34a', route: '/login', secure: true, isNew: true },
    ],
  },
];

export default function SelectPortalPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter roles based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return PORTAL_GROUPS;

    const query = searchQuery.toLowerCase();
    return PORTAL_GROUPS.map(group => ({
      ...group,
      roles: group.roles.filter(
        role =>
          role.name.toLowerCase().includes(query) ||
          role.desc.toLowerCase().includes(query)
      ),
    })).filter(group => group.roles.length > 0);
  }, [searchQuery]);

  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", background: C.lightGray, color: C.darkText, minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        background: C.white,
        borderBottom: `1px solid ${C.borderGray}`,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          maxWidth: 1200, width: '100%', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.primaryBlue,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: C.darkText }}>SMISSI</span>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, color: C.darkText,
              fontWeight: 500, fontSize: 14, fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.primaryBlue; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.darkText; }}
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: C.primaryBlue,
            marginBottom: 12, letterSpacing: '0.5px',
          }}>
            {PORTAL_GROUPS.flatMap(g => g.roles).length} User Roles Available
          </div>
          <h1 style={{
            fontSize: 40, fontWeight: 900, marginBottom: 16, color: C.darkText,
            letterSpacing: '-0.5px',
          }}>Select Your Portal</h1>
          <p style={{
            fontSize: 16, color: '#6b7280', maxWidth: 600, margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Choose your role to access the appropriate dashboard. Each portal is tailored to specific responsibilities and access levels.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative', maxWidth: 480, margin: '0 auto 48px',
        }}>
          <Search size={18} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: C.textGray,
          }} />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px 12px 40px', border: `1px solid ${C.borderGray}`,
              borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
              background: C.white,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: C.textGray,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Role Groups */}
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <div key={group.id} style={{ marginBottom: 56 }}>
              {/* Group Header */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontSize: 22, fontWeight: 700, color: C.darkText,
                  marginBottom: 4,
                }}>
                  {group.title}
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280' }}>{group.subtitle}</p>
              </div>

              {/* Role Cards Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
              }}>
                {group.roles.map(role => (
                  <div
                    key={role.name}
                    onClick={() => navigate(role.route)}
                    style={{
                      background: C.white, border: `1.5px solid ${C.borderGray}`,
                      borderRadius: 12, padding: 24, cursor: 'pointer',
                      transition: 'all 0.3s ease', position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
                      el.style.borderColor = role.color + '60';
                      el.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      el.style.borderColor = C.borderGray;
                      el.style.transform = 'none';
                    }}
                  >
                    {/* New Badge */}
                    {role.isNew && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        fontSize: 12, fontWeight: 700, color: '#10b981',
                      }}>
                        New
                      </div>
                    )}

                    {/* Icon */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 12,
                      background: role.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      <role.icon size={28} color="white" />
                    </div>

                    {/* Content */}
                    <h3 style={{
                      fontSize: 16, fontWeight: 700, color: C.darkText,
                      marginBottom: 6,
                    }}>
                      {role.name}
                    </h3>
                    <p style={{
                      fontSize: 14, color: '#6b7280', lineHeight: 1.5,
                      marginBottom: 16,
                    }}>
                      {role.desc}
                    </p>

                    {/* Secure Login Badge */}
                    {role.secure && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: C.primaryBlue, fontSize: 13, fontWeight: 600,
                      }}>
                        <Lock size={14} />
                        Secure Login Required
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 32px' }}>
            <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 16 }}>
              No roles found matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: C.primaryBlue, border: 'none', color: C.white,
                fontWeight: 600, fontSize: 14, padding: '10px 20px',
                borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.primaryBlue; }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Support Section */}
        <div style={{
          background: C.white, borderRadius: 12, padding: 32,
          marginTop: 80, border: `1px solid ${C.borderGray}`,
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: C.darkText, marginBottom: 12 }}>
            Need Help Accessing Your Portal?
          </h3>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
            Contact your school administrator to get your login credentials. Each user must be invited by the school admin before accessing the system.
          </p>
          <button
            style={{
              background: C.white, border: `1.5px solid ${C.borderGray}`,
              color: C.darkText, fontWeight: 600, fontSize: 14,
              padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = C.primaryBlue;
              el.style.color = C.primaryBlue;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = C.borderGray;
              el.style.color = C.darkText;
            }}
          >
            💬 Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
