import { PortalLayout, type PortalConfig } from '../../components/layout/PortalLayout';

const config: PortalConfig = {
  portalName  : 'Bursar / Finance',
  roleLabel   : 'Bursar',
  portalIcon  : '💰',
  accentColor : '#0f766e',
  accentLight : '#99f6e4',
  accentDark  : '#0d5c57',
  topbarSub   : 'Term 1, Week 8 · Sat 07 Mar 2026',
  topbarChips : [
    ['💰 UGX 77M collected', '#f0fdfa', '#0d5c57'],
    ['⚠️ 7 defaulters', '#fffbeb', '#b45309'],
  ],
  settingsPath : '/bursar/settings',
  navSections : [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard',    icon: '🏠', path: '/bursar/dashboard' },
      ],
    },
    {
      label: 'Fees & Revenue',
      items: [
        { label: 'Fee Collection',      icon: '💳', path: '/bursar/fees'     },
        { label: 'Arrears & Defaulters',icon: '⚠️', path: '/bursar/arrears', badge: 7, badgeColor: 'amber' },
      ],
    },
    {
      label: 'Expenditure',
      items: [
        { label: 'Expenses',          icon: '📤', path: '/bursar/expenses'  },
        { label: 'Supplier Invoices', icon: '🧾', path: '/bursar/invoices', badge: 2, badgeColor: 'red'   },
        { label: 'Payroll',           icon: '👥', path: '/bursar/payroll'   },
      ],
    },
    {
      label: 'Reports & Admin',
      items: [
        { label: 'Financial Reports', icon: '📊', path: '/bursar/reports'        },
        { label: 'Communications',    icon: '💬', path: '/bursar/communications', badge: 3 },
        { label: 'Portals',           icon: '🔗', path: '/bursar/portals'         },
      ],
    },
  ],
};

export { config as bursarConfig };
export default function BursarLayout() {
  return <PortalLayout config={config} />;
}
