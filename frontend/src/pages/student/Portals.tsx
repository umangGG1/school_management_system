import { useNavigate } from 'react-router-dom';
import { useToast }    from '../../contexts/ToastContext';
import { PortalButton } from '../../components/ui/PortalButton';

const PORTAL_GROUPS = [
  {
    label: '👨‍👩‍👧 Family',
    portals: [
      { icon: '👨‍👩‍👧', name: 'Parent Portal', desc: 'View through parent\'s account', color: 'green' as const, route: '/parent' },
    ],
  },
  {
    label: '🔐 Account',
    portals: [
      { icon: '🔐', name: 'Login / Switch Account', desc: 'Return to login page', color: 'amber' as const, route: '/login' },
    ],
  },
];

export default function StudentPortals() {
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const open = (route: string, name: string) => {
    if (!route) { toast(`${name} — coming soon`, 'info'); return; }
    navigate(route);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Portals</h2>
        <p className="text-[13px] text-gray-400 mt-1">Linked portals you can access</p>
      </div>
      <div className="space-y-5">
        {PORTAL_GROUPS.map(group => (
          <div key={group.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{group.label}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {group.portals.map(p => (
                <PortalButton key={p.name} icon={p.icon} name={p.name} description={p.desc} color={p.color} onClick={() => open(p.route, p.name)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
