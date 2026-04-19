import { useNavigate } from 'react-router-dom';
import { useToast }    from '../../contexts/ToastContext';
import { PortalButton } from '../../components/ui/PortalButton';

const PORTAL_GROUPS = [
  {
    label: '🎓 Academic',
    portals: [
      { icon: '👤', name: 'Head Teacher',         desc: 'School overview & approvals',    color: 'indigo' as const, route: '/head-teacher' },
      { icon: '📗', name: 'Head of Department',   desc: 'Departmental oversight',         color: 'green'  as const, route: '/hod'          },
      { icon: '👨‍🏫', name: 'Teacher Portal',      desc: 'Lessons, marks, attendance',    color: 'purple' as const, route: '/teacher'      },
      { icon: '📝', name: 'Examination Officer',  desc: 'Exams, results, scheduling',     color: 'rose'   as const, route: '/exam-officer'  },
      { icon: '🎭', name: 'ECA Coordinator',      desc: 'Clubs, sports, activities',      color: 'orange' as const, route: '/eca'           },
    ],
  },
  {
    label: '👨‍👩‍👧 Students & Parents',
    portals: [
      { icon: '🎒', name: 'Student Portal',    desc: 'Results, timetable, fees',        color: 'purple' as const, route: '/student' },
      { icon: '👨‍👩‍👧', name: 'Parent Portal', desc: 'Child progress, fees, messaging', color: 'green'  as const, route: '/parent'  },
    ],
  },
  {
    label: '💰 Finance & Admin',
    portals: [
      { icon: '💰', name: 'Bursar',            desc: 'Fees, expenses, payroll',         color: 'green'  as const, route: '/bursar'        },
      { icon: '💙', name: 'School Counsellor', desc: 'Student wellbeing & welfare',     color: 'pink' as const, route: '/counsellor'    },
    ],
  },
];

export default function DeputyPortals() {
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const open = (route: string, name: string) => {
    if (route === '') { toast(`${name} — coming soon`, 'info'); return; }
    navigate(route);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Connected Portals</h2>
        <p className="text-[13px] text-gray-400 mt-1">Quick access to related school portals</p>
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
