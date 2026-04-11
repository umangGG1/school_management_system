import { useNavigate }   from 'react-router-dom';
import { useToast }      from '../../contexts/ToastContext';
import { PortalButton }  from '../../components/ui/PortalButton';

const PORTAL_GROUPS = [
  {
    label: '🎓 Academic',
    portals: [
      { icon: '📐', name: 'Deputy HM / Academic Admin', desc: 'Timetabling, curriculum, cover', color: 'indigo' as const, route: '/deputy-hm' },
      { icon: '📗', name: 'Head of Department (HOD)',   desc: 'Departmental oversight',        color: 'green'  as const, route: '/hod' },
      { icon: '👨‍🏫', name: 'Teacher / Class Teacher',  desc: 'Lessons, marks, attendance',    color: 'purple' as const, route: '/teacher' },
      { icon: '📝', name: 'Examination Officer',         desc: 'Exams, results, UNEB',          color: 'rose'   as const, route: '/exam-officer' },
      { icon: '📚', name: 'Library Officer',             desc: 'Resources, borrowing',          color: 'cyan'   as const, route: '/ht/portals' },
      { icon: '🎭', name: 'ECA Coordinator',             desc: 'Clubs, sports, activities',     color: 'orange' as const, route: '/eca' },
    ],
  },
  {
    label: '🛏️ Boarding & Welfare',
    portals: [
      { icon: '🛏️', name: 'Dorm Master',       desc: 'Dormitory management',      color: 'teal'   as const, route: '/dorm-master' },
      { icon: '🏠', name: 'Head of Boarding',   desc: 'Boarding oversight',        color: 'green'  as const, route: '/ht/portals' },
      { icon: '🏥', name: 'Nurse (Sr. Nakamya)',desc: 'Health, sick bay',           color: 'teal'   as const, route: '/nurse' },
      { icon: '💙', name: 'School Counsellor',  desc: 'Student wellbeing',         color: 'pink'   as const, route: '/counsellor' },
      { icon: '🍽️', name: 'Catering Manager',   desc: 'Meals, nutrition',          color: 'orange' as const, route: '/ht/portals' },
      { icon: '🌿', name: 'Facilities Officer',  desc: 'Buildings, maintenance',    color: 'lime'   as const, route: '/ht/portals' },
    ],
  },
  {
    label: '🔒 Security & Access',
    portals: [
      { icon: '🛡️', name: 'Head of Security (Sgt. Byaruhanga)', desc: 'Security overview',      color: 'slate'  as const, route: '/security' },
      { icon: '🚪', name: 'Boarding Gate (Mr. Okello)',           desc: 'Entry/exit control',    color: 'amber'  as const, route: '/ht/portals' },
      { icon: '👮', name: 'Security Guard (Okello Moses)',         desc: 'Guard patrols',         color: 'blue'   as const, route: '/ht/portals' },
      { icon: '💻', name: 'ICT Officer',                           desc: 'Systems, network',      color: 'cyan'   as const, route: '/ht/portals' },
      { icon: '🚌', name: 'Transport Officer',                     desc: 'Buses, logistics',      color: 'indigo' as const, route: '/ht/portals' },
      { icon: '📡', name: 'Communications Officer',                desc: 'PR, social media',      color: 'purple' as const, route: '/ht/portals' },
    ],
  },
  {
    label: '💰 Finance & Administration',
    portals: [
      { icon: '💰', name: 'Bursar / Finance Officer', desc: 'Fees, expenses, accounts', color: 'green'  as const, route: '/bursar' },
      { icon: '👥', name: 'HR Officer',               desc: 'Staff records, payroll',   color: 'blue'   as const, route: '/ht/portals' },
      { icon: '📋', name: 'Admissions Officer',       desc: 'Enrolment, applications',  color: 'rose'   as const, route: '/ht/portals' },
      { icon: '📦', name: 'Storekeeper',              desc: 'Inventory, supplies',      color: 'amber'  as const, route: '/ht/portals' },
      { icon: '🏪', name: 'Local Supplier',           desc: 'Orders, invoices',         color: 'orange' as const, route: '/ht/portals' },
      { icon: '🚐', name: 'Bus Driver',               desc: 'Routes, student transport',color: 'cyan'   as const, route: '/ht/portals' },
    ],
  },
  {
    label: '👨‍👩‍👧 Students & Parents',
    portals: [
      { icon: '🎓', name: 'Student Portal',      desc: 'Results, timetable, fees',       color: 'indigo' as const, route: '/student' },
      { icon: '👨‍👩‍👧', name: 'Parent Portal',   desc: 'Child progress, fees, messaging', color: 'green'  as const, route: '/parent' },
      { icon: '🔐', name: 'Central Login Hub',   desc: 'Role selector & login',           color: 'amber'  as const, route: '/login' },
    ],
  },
];

export default function HTPortals() {
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const handleOpen = (route: string, name: string) => {
    if (route === '/ht/portals') {
      toast(`${name} portal coming soon`, 'info');
      return;
    }
    navigate(route);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Connected Portals</h2>
        <p className="text-[13px] text-gray-400 mt-1">Quick access to all staff and operational portals</p>
      </div>

      <div className="space-y-5">
        {PORTAL_GROUPS.map((group) => (
          <div key={group.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{group.label}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {group.portals.map((p) => (
                <PortalButton
                  key={p.name}
                  icon={p.icon}
                  name={p.name}
                  description={p.desc}
                  color={p.color}
                  onClick={() => handleOpen(p.route, p.name)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
