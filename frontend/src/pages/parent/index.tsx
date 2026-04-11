import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Parent Portal',
  roleLabel   : 'Parent / Guardian',
  portalIcon  : '👨‍👩‍👧',
  accentColor : '#059669',
  accentLight : '#a7f3d0',
  accentDark  : '#065f46',
  topbarSub   : 'Term 1, Week 8',
  settingsPath: '/parent/settings',
  navSections : [
    { label: 'Overview', items: [{ label: 'Dashboard', icon: '🏠', path: '/parent/dashboard' }] },
    {
      label: "My Child",
      items: [
        { label: 'Results',     icon: '📊', path: '/parent/results'    },
        { label: 'Attendance',  icon: '✅', path: '/parent/attendance' },
        { label: 'Fee Balance', icon: '💳', path: '/parent/fees'       },
      ],
    },
    { label: 'Admin', items: [{ label: 'Portals', icon: '🔗', path: '/parent/portals' }] },
  ],
};

export default function ParentLayout() {
  return <PortalLayout config={config} />;
}
