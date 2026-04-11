import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'HOD Portal',
  roleLabel   : 'Head of Department',
  portalIcon  : '📚',
  accentColor : '#8b5cf6',
  accentLight : '#ddd6fe',
  accentDark  : '#5b21b6',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  settingsPath: '/hod/settings',
  navSections : [
    { label: 'Overview', items: [{ label: 'Dashboard', icon: '🏠', path: '/hod/dashboard' }] },
    {
      label: 'Academic',
      items: [
        { label: 'Subject Coverage', icon: '📈', path: '/hod/coverage'     },
        { label: 'Department Marks', icon: '📊', path: '/hod/marks'        },
        { label: 'Staff Records',    icon: '👥', path: '/hod/staff'         },
      ],
    },
    { label: 'Admin', items: [{ label: 'Portals', icon: '🔗', path: '/hod/portals' }] },
  ],
};

export default function HODLayout() {
  return <PortalLayout config={config} />;
}
