import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName   : 'Super Admin',
  roleLabel    : 'System Administrator',
  portalIcon   : '⚙️',
  accentColor  : '#6366f1',
  accentLight  : '#c7d2fe',
  accentDark   : '#4338ca',
  topbarSub    : 'Term 1, Week 8 · Sat 07 Mar 2026',
  topbarChips  : [
    ['🏫 1 School',         '#eef2ff', '#4338ca'],
    ['👤 47 Active Users',  '#f0fdf4', '#15803d'],
    ['🟢 All Systems OK',   '#f0fdf4', '#15803d'],
  ],
  settingsPath : '/admin/settings',
  navSections  : [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard',        icon: '🏠', path: '/admin/dashboard' },
        { label: 'Activity Log',     icon: '📋', path: '/admin/activity'  },
      ],
    },
    {
      label: 'User Management',
      items: [
        { label: 'All Users',        icon: '👥', path: '/admin/users',       badge: 3, badgeColor: 'blue'  },
        { label: 'Roles & Perms',    icon: '🔐', path: '/admin/roles'                                      },
        { label: 'Pending Approvals',icon: '⏳', path: '/admin/approvals',   badge: 2, badgeColor: 'amber' },
      ],
    },
    {
      label: 'School Management',
      items: [
        { label: 'School Profile',   icon: '🏫', path: '/admin/school'       },
        { label: 'Academic Config',  icon: '📚', path: '/admin/academic'     },
        { label: 'Fee Structure',    icon: '💰', path: '/admin/fees'         },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Integrations',     icon: '🔗', path: '/admin/integrations' },
        { label: 'Reports',          icon: '📊', path: '/admin/reports'      },
        { label: 'Support',          icon: '🎫', path: '/admin/support',     badge: 1, badgeColor: 'red'   },
        { label: 'Communications',   icon: '💬', path: '/admin/communications'                             },
      ],
    },
  ],
};

export { config as adminConfig };
export default function AdminLayout() {
  return <PortalLayout config={config} />;
}
