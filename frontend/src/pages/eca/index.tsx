import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'ECA Office',
  roleLabel   : 'ECA Coordinator',
  portalIcon  : '⭐',
  accentColor : '#16a34a',
  accentLight : '#bbf7d0',
  accentDark  : '#14532d',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  topbarChips : [
    ['⭐ Term 1, Week 8', '#f0fdf4', '#14532d'],
    ['🏆 3 comps upcoming', '#fff7ed', '#c2410c'],
  ],
  settingsPath: '/eca/settings',
  navSections : [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard',     icon: '🏠', path: '/eca/dashboard'      },
        { label: 'Announcements', icon: '📣', path: '/eca/announcements', badge: 2 },
      ],
    },
    {
      label: 'Activities',
      items: [
        { label: 'Activities Registry', icon: '🎯', path: '/eca/registry'      },
        { label: 'Sports & Fixtures',   icon: '⚽', path: '/eca/sports',       badge: 2, badgeColor: 'amber' },
        { label: 'Competitions',        icon: '🏆', path: '/eca/competitions',  badge: 3, badgeColor: 'green' },
        { label: 'Cultural & Arts',     icon: '🎭', path: '/eca/cultural'       },
      ],
    },
    {
      label: 'People',
      items: [
        { label: 'Student Leadership', icon: '🏛️', path: '/eca/leadership' },
        { label: 'Teacher Patrons',    icon: '👩‍🏫',path: '/eca/patrons'    },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'ECA Attendance',    icon: '✅', path: '/eca/attendance' },
        { label: 'Timetable & Venues',icon: '📅', path: '/eca/timetable'  },
      ],
    },
    {
      label: 'Admin',
      items: [
        { label: 'Communications', icon: '💬', path: '/eca/communications', badge: 3 },
        { label: 'Portals',        icon: '🔗', path: '/eca/portals'         },
      ],
    },
  ],
};

export { config as ecaConfig };
export default function ECALayout() {
  return <PortalLayout config={config} />;
}
