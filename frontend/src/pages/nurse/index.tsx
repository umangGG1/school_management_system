import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'School Nurse',
  roleLabel   : 'School Nurse',
  portalIcon  : '🏥',
  accentColor : '#ec4899',
  accentLight : '#fbcfe8',
  accentDark  : '#be185d',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  settingsPath: '/nurse/settings',
  navSections : [
    { label: 'Overview', items: [{ label: 'Dashboard', icon: '🏠', path: '/nurse/dashboard' }] },
    {
      label: 'Health',
      items: [
        { label: 'Medical Records', icon: '📋', path: '/nurse/records'   },
        { label: 'Sick Bay',        icon: '🛏️', path: '/nurse/sick-bay'  },
        { label: 'Referrals',       icon: '🔗', path: '/nurse/referrals' },
      ],
    },
    { label: 'Admin', items: [{ label: 'Portals', icon: '🔗', path: '/nurse/portals' }] },
  ],
};

export default function NurseLayout() {
  return <PortalLayout config={config} />;
}
