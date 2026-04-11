import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Exam Officer',
  roleLabel   : 'Examination Officer',
  portalIcon  : '📝',
  accentColor : '#7c3aed',
  accentLight : '#ddd6fe',
  accentDark  : '#4c1d95',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  topbarChips : [
    ['📝 End-term: Week 12', '#f5f3ff', '#4c1d95'],
    ['⚠️ 3 papers pending', '#fffbeb', '#b45309'],
  ],
  settingsPath: '/exam-officer/settings',
  navSections : [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', icon: '🏠', path: '/exam-officer/dashboard' },
      ],
    },
    {
      label: 'Examinations',
      items: [
        { label: 'Exam Schedule',    icon: '📅', path: '/exam-officer/schedule'       },
        { label: 'Results Entry',    icon: '📊', path: '/exam-officer/results'         },
        { label: 'Paper Security',   icon: '🔒', path: '/exam-officer/paper-security', badge: 3, badgeColor: 'red' },
        { label: 'Marking Schemes',  icon: '✅', path: '/exam-officer/marking'         },
      ],
    },
    {
      label: 'Reports & Admin',
      items: [
        { label: 'Reports',        icon: '📋', path: '/exam-officer/reports'        },
        { label: 'Communications', icon: '💬', path: '/exam-officer/communications', badge: 2 },
        { label: 'Portals',        icon: '🔗', path: '/exam-officer/portals'         },
      ],
    },
  ],
};

export default function ExamOfficerLayout() {
  return <PortalLayout config={config} />;
}
