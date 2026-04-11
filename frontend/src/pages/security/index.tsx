import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Security Office',
  roleLabel   : 'Security Officer',
  portalIcon  : '🔒',
  accentColor : '#dc2626',
  accentLight : '#fca5a5',
  accentDark  : '#991b1b',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  settingsPath: '/security/settings',
  navSections : [
    { label: 'Overview', items: [{ label: 'Dashboard', icon: '🏠', path: '/security/dashboard' }] },
    {
      label: 'Security',
      items: [
        { label: 'Gate Log',       icon: '🚪', path: '/security/gate-log'  },
        { label: 'Incidents',      icon: '⚠️', path: '/security/incidents'  },
        { label: 'Visitor Log',    icon: '👤', path: '/security/visitors'   },
      ],
    },
    { label: 'Admin', items: [{ label: 'Portals', icon: '🔗', path: '/security/portals' }] },
  ],
};

export default function SecurityLayout() {
  return <PortalLayout config={config} />;
}
