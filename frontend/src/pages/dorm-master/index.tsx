import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Dorm Master',
  roleLabel   : 'Dorm Master (Boarding)',
  portalIcon  : '🛏️',
  accentColor : '#f97316',
  accentLight : '#fed7aa',
  accentDark  : '#c2410c',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  settingsPath: '/dorm-master/settings',
  navSections : [
    { label: 'Overview', items: [{ label: 'Dashboard', icon: '🏠', path: '/dorm-master/dashboard' }] },
    {
      label: 'Boarding',
      items: [
        { label: 'Dormitory Roster',  icon: '📋', path: '/dorm-master/roster'   },
        { label: 'Night Check',       icon: '🌙', path: '/dorm-master/night-check' },
        { label: 'Welfare',           icon: '💚', path: '/dorm-master/welfare'   },
      ],
    },
    { label: 'Admin', items: [{ label: 'Portals', icon: '🔗', path: '/dorm-master/portals' }] },
  ],
};

export default function DormMasterLayout() {
  return <PortalLayout config={config} />;
}
