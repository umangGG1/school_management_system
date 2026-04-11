import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'School Counsellor',
  roleLabel   : 'School Counsellor',
  portalIcon  : '💚',
  accentColor : '#0d9488',
  accentLight : '#99f6e4',
  accentDark  : '#0f766e',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  topbarChips : [
    ['💚 8 active cases', '#f0fdfa', '#0f766e'],
    ['⚠️ 2 referrals pending', '#fffbeb', '#b45309'],
  ],
  settingsPath: '/counsellor/settings',
  navSections : [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', icon: '🏠', path: '/counsellor/dashboard' },
      ],
    },
    {
      label: 'Students',
      items: [
        { label: 'Student Welfare',  icon: '🎓', path: '/counsellor/students', badge: 8 },
        { label: 'Sessions & Notes', icon: '📝', path: '/counsellor/sessions'  },
        { label: 'Welfare Issues',   icon: '⚠️', path: '/counsellor/welfare',  badge: 3, badgeColor: 'amber' },
        { label: 'Referrals',        icon: '🔗', path: '/counsellor/referrals', badge: 2, badgeColor: 'red' },
      ],
    },
    {
      label: 'Reports & Admin',
      items: [
        { label: 'Reports',        icon: '📊', path: '/counsellor/reports'        },
        { label: 'Communications', icon: '💬', path: '/counsellor/communications', badge: 4 },
        { label: 'Portals',        icon: '🔗', path: '/counsellor/portals'         },
      ],
    },
  ],
};

export default function CounsellorLayout() {
  return <PortalLayout config={config} />;
}
