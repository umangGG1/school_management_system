import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { htBoardingApi } from '../../lib/api';

const DORM_SEED = [
  { name: 'Boys Dorm A (Nile)',       capacity: 120, occupied: 118 },
  { name: 'Boys Dorm B (Victoria)',   capacity: 100, occupied: 97  },
  { name: 'Boys Dorm C (Kyoga)',      capacity: 80,  occupied: 76  },
  { name: 'Girls Dorm A (Ruwenzori)', capacity: 110, occupied: 110 },
  { name: 'Girls Dorm B (Elgon)',     capacity: 90,  occupied: 87  },
];

const EXEAT_SEED = [
  { label: 'Exeat granted this weekend',    value: '26', note: 'Signed out Fri 4pm',   alert: false },
  { label: 'Returned as expected',          value: '23', note: 'Sun 6pm check-in',     alert: false },
  { label: 'Still missing (past deadline)', value: '3',  note: 'Parents notified',     alert: true  },
  { label: 'Medical leave (extended)',      value: '4',  note: "Doctor's note on file", alert: false },
  { label: 'Special permission (open)',     value: '8',  note: 'HT/HOB approved',      alert: false },
];

export default function HTBoarding() {
  const navigate = useNavigate();
  const [dorms,   setDorms]   = useState(DORM_SEED);
  const [missing, setMissing] = useState(3);
  const [sickBay, setSickBay] = useState(7);
  const [onLeave, setOnLeave] = useState(12);
  const [total,   setTotal]   = useState(684);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    Promise.all([htBoardingApi.summary(), htBoardingApi.dorms()])
      .then(([summary, dormData]) => {
        if (summary) {
          if (summary.totalBoarding)   setTotal(summary.totalBoarding);
          if (summary.missingSudents !== undefined) setMissing(summary.missingStudents ?? missing);
          if (summary.sickBay !== undefined)        setSickBay(summary.sickBay);
          if (summary.onLeave !== undefined)        setOnLeave(summary.onLeave);
        }
        if (Array.isArray(dormData) && dormData.length) setDorms(dormData);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  const accounted = total - missing;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Boarding &amp; Welfare</h2>
        <p className="text-[13px] text-gray-400 mt-1">{total} boarding students · Real-time overview</p>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Accounted For" value={accounted} icon="🛏️" accent="green" />
        <StatCard title="Missing (Exeat)" value={missing} icon="❓" accent="red" />
        <StatCard title="In Sick Bay" value={sickBay} icon="🏥" accent="amber" />
        <StatCard title="On Approved Leave" value={onLeave} icon="🏠" accent="teal" />
      </div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {[
          { icon: '🛏️', title: 'Dorm Master Portal',   desc: 'Night roll-call, dormitory issues, discipline', chip: <Chip variant="red">{missing} missing</Chip>,    onClick: () => navigate('/ht/students') },
          { icon: '🏠', title: 'Head of Boarding',      desc: 'Policy, welfare, exeat management',            chip: <Chip variant="green">Operational</Chip>,         onClick: () => navigate('/ht/boarding') },
          { icon: '🏥', title: 'Nurse — Sr. Nakamya',   desc: 'Health records, sick bay, referrals',          chip: <Chip variant="amber">{sickBay} patients</Chip>,  onClick: () => navigate('/ht/academic') },
        ].map(p => (
          <button key={p.title} onClick={p.onClick} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="text-2xl mb-3">{p.icon}</div>
            <div className="text-[14px] font-bold text-gray-900">{p.title}</div>
            <div className="text-[12px] text-gray-400 mt-1 mb-4">{p.desc}</div>
            {p.chip}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dormitory Occupancy */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Dormitory Occupancy</h3>
          {dorms.map((d: any) => {
            const cap = d.capacity ?? d.totalCapacity ?? 100;
            const occ = d.occupied ?? d.currentOccupancy ?? 0;
            const pct = Math.round((occ / cap) * 100);
            const name = d.name ?? d.dormName ?? 'Dorm';
            return (
              <div key={name} className="flex items-center gap-4 py-2.5 border-b border-gray-100 last:border-none">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-800 truncate">{name}</div>
                  <div className="text-[11px] text-gray-400">{occ}/{cap} students</div>
                </div>
                <span className={`text-[12px] font-bold ${pct >= 95 ? 'text-red-600' : 'text-emerald-600'}`}>{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Exeat & Leave */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Exeat &amp; Leave Status</h3>
          {EXEAT_SEED.map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-none">
              <div>
                <div className={`text-[13px] font-medium ${item.alert ? 'text-red-700' : 'text-gray-800'}`}>{item.label}</div>
                <div className="text-[11px] text-gray-400">{item.note}</div>
              </div>
              <span className={`text-[18px] font-black ${item.alert ? 'text-red-600' : 'text-gray-700'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
