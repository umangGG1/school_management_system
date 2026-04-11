import { Navigate } from 'react-router-dom';
import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Teacher Portal',
  roleLabel   : 'Class Teacher',
  portalIcon  : '👩‍🏫',
  accentColor : '#2563eb',
  accentLight : '#bfdbfe',
  accentDark  : '#1d4ed8',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  topbarChips : [
    ['📅 Week 8 of 14', '#eff6ff', '#1d4ed8'],
    ['⚠️ 2 assignments to mark', '#fffbeb', '#b45309'],
  ],
  settingsPath : '/teacher/settings',
  navSections : [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard',   icon: '🏠', path: '/teacher/dashboard' },
        { label: 'My Classes',  icon: '📚', path: '/teacher/classes'   },
      ],
    },
    {
      label: 'Teaching',
      items: [
        { label: 'Attendance',          icon: '✅', path: '/teacher/attendance'  },
        { label: 'Marks & Grades',      icon: '📊', path: '/teacher/marks'       },
        { label: 'Lesson Notes',        icon: '📝', path: '/teacher/notes'       },
        { label: 'Assignments',         icon: '📋', path: '/teacher/assignments', badge: 2, badgeColor: 'amber' },
      ],
    },
    {
      label: 'Academic',
      items: [
        { label: 'Curriculum Coverage', icon: '📈', path: '/teacher/curriculum' },
      ],
    },
    {
      label: 'Admin',
      items: [
        { label: 'Communications',  icon: '💬', path: '/teacher/communications', badge: 3, badgeColor: 'red' },
        { label: 'Portals',         icon: '🔗', path: '/teacher/portals'         },
      ],
    },
  ],
};

export { config as teacherConfig };
export default function TeacherLayout() {
  return <PortalLayout config={config} />;
}
