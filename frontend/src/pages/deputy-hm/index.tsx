import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Deputy Head Mistress',
  roleLabel   : 'Deputy HM',
  portalIcon  : '📋',
  accentColor : '#0ea5e9',
  accentLight : '#bae6fd',
  accentDark  : '#0369a1',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  settingsPath: '/deputy-hm/settings',
  navSections : [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', icon: '🏠', path: '/deputy-hm/dashboard' },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Discipline',    icon: '⚖️', path: '/deputy-hm/discipline'   },
        { label: 'Staff Duties',  icon: '📋', path: '/deputy-hm/duties'        },
        { label: 'Timetabling',   icon: '📅', path: '/deputy-hm/timetable'     },
        { label: 'SLC',           icon: '🎓', path: '/deputy-hm/slc'           },
      ],
    },
    {
      label: 'Admin',
      items: [
        { label: 'Communications', icon: '💬', path: '/deputy-hm/communications' },
        { label: 'Portals',        icon: '🔗', path: '/deputy-hm/portals'        },
      ],
    },
  ],
};

export default function DeputyHMLayout() {
  return <PortalLayout config={config} />;
}
