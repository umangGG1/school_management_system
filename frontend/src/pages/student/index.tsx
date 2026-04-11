import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Student Portal',
  roleLabel   : 'Student',
  portalIcon  : '🎒',
  accentColor : '#7c3aed',
  accentLight : '#ddd6fe',
  accentDark  : '#4c1d95',
  topbarSub   : 'Term 1, Week 8',
  settingsPath: '/student/settings',
  navSections : [
    { label: 'Overview', items: [{ label: 'Dashboard', icon: '🏠', path: '/student/dashboard' }] },
    {
      label: 'Academics',
      items: [
        { label: 'My Results',   icon: '📊', path: '/student/results'    },
        { label: 'Timetable',    icon: '📅', path: '/student/timetable'  },
        { label: 'Assignments',  icon: '📋', path: '/student/assignments' },
      ],
    },
    { label: 'Admin', items: [{ label: 'Portals', icon: '🔗', path: '/student/portals' }] },
  ],
};

export default function StudentLayout() {
  return <PortalLayout config={config} />;
}
