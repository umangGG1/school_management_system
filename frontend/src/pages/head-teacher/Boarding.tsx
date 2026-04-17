import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Chip } from '../../components/ui/Chip';
import { htBoardingApi } from '../../lib/api';

/* ─── Seed fallback (only when API completely offline) ────── */
const DORM_SEED = [
  { name: 'Boys Dorm A (Nile)',       capacity: 120, occupied: 118 },
  { name: 'Boys Dorm B (Victoria)',   capacity: 100, occupied: 97  },
  { name: 'Boys Dorm C (Kyoga)',      capacity: 80,  occupied: 76  },
  { name: 'Girls Dorm A (Ruwenzori)', capacity: 110, occupied: 110 },
  { name: 'Girls Dorm B (Elgon)',     capacity: 90,  occupied: 87  },
];

const EXEAT_SEED = [
  { label: 'Exeat granted this weekend',    value: '26', note: 'Signed out Fri 4pm',    alert: false },
  { label: 'Returned as expected',          value: '23', note: 'Sun 6pm check-in',      alert: false },
  { label: 'Still missing (past deadline)', value: '3',  note: 'Parents notified',      alert: true  },
  { label: 'Medical leave (extended)',      value: '4',  note: "Doctor's note on file", alert: false },
  { label: 'Special permission (open)',     value: '8',  note: 'HT/HOB approved',       alert: false },
];

/* ─── helpers ────────────────────────────────────────────── */
function groupLeaves(leaves: any[]) {
  const counts = { APPROVED: 0, RETURNED: 0, OVERDUE: 0, PENDING: 0 };
  for (const l of leaves) {
    if (l.status in counts) counts[l.status as keyof typeof counts]++;
  }
  return [
    { label: 'Exeat granted / on leave',      value: String(counts.APPROVED), note: 'Currently approved',     alert: false },
    { label: 'Returned as expected',           value: String(counts.RETURNED), note: 'Checked back in',        alert: false },
    { label: 'Still missing (past deadline)',  value: String(counts.OVERDUE),  note: 'Parents to be notified', alert: counts.OVERDUE > 0 },
    { label: 'Pending approval',               value: String(counts.PENDING),  note: 'Awaiting HT sign-off',   alert: false },
  ];
}

export default function HTBoarding() {
  const navigate = useNavigate();

  const [dorms,   setDorms]   = useState<any[] | null>(null);
  const [exeat,   setExeat]   = useState<typeof EXEAT_SEED | null>(null);
  const [missing, setMissing] = useState<number | null>(null);
  const [sickBay, setSickBay] = useState<number | null>(null);
  const [onLeave, setOnLeave] = useState<number | null>(null);
  const [total,   setTotal]   = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      htBoardingApi.summary().catch(() => null),
      htBoardingApi.dorms().catch(() => null),
      htBoardingApi.leaves().catch(() => null),
    ]).then(([summary, dormData, leaveData]) => {
      const allFailed = summary === null && dormData === null;
      setOffline(allFailed);

      if (summary !== null) {
        if (summary.totalBoarders != null) setTotal(summary.totalBoarders);
        if (summary.missing       != null) setMissing(summary.missing);
        if (summary.onApprovedLeave != null) setOnLeave(summary.onApprovedLeave);
        // sickBay from summary is a medical stats object: { ADMITTED, OBSERVATION, ... }
        const sick = summary.sickBay;
        if (sick && typeof sick === 'object') {
          setSickBay((sick.ADMITTED ?? 0) + (sick.OBSERVATION ?? 0));
        } else if (typeof summary.inSickBay === 'number') {
          setSickBay(summary.inSickBay);
        }
        // dorms may come back inside summary too
        if (!dormData && Array.isArray(summary.dorms)) setDorms(summary.dorms);
      }

      if (Array.isArray(dormData)) setDorms(dormData);
      if (Array.isArray(leaveData)) setExeat(groupLeaves(leaveData));
    }).finally(() => setLoading(false));
  }, []);

  const displayDorms   = offline ? DORM_SEED : (dorms ?? []);
  const displayExeat   = offline ? EXEAT_SEED : (exeat ?? []);
  const displayTotal   = total   ?? (offline ? 684 : 0);
  const displayMissing = missing ?? (offline ? 3   : 0);
  const displaySick    = sickBay ?? (offline ? 7   : 0);
  const displayLeave   = onLeave ?? (offline ? 12  : 0);
  const accounted      = displayTotal - displayMissing;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Boarding &amp; Welfare</h2>
        <p className="text-[13px] text-gray-400 mt-1">
          {loading ? 'Loading…' : `${displayTotal} boarding students · Real-time overview`}
        </p>
      </div>

      {offline && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Accounted For"    value={loading ? '…' : accounted}      icon="🛏️" accent="green" />
        <StatCard title="Missing (Exeat)"  value={loading ? '…' : displayMissing} icon="❓" accent="red" />
        <StatCard title="In Sick Bay"      value={loading ? '…' : displaySick}    icon="🏥" accent="amber" />
        <StatCard title="On Approved Leave" value={loading ? '…' : displayLeave}  icon="🏠" accent="teal" />
      </div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {[
          { icon: '🛏️', title: 'Dorm Master Portal',  desc: 'Night roll-call, dormitory issues, discipline', chip: <Chip variant="red">{displayMissing} missing</Chip>,   onClick: () => navigate('/dorm-master/dashboard') },
          { icon: '🏠', title: 'Head of Boarding',     desc: 'Policy, welfare, exeat management',            chip: <Chip variant="green">Operational</Chip>,               onClick: () => navigate('/dorm-master/dashboard') },
          { icon: '🏥', title: 'Nurse — Sr. Nakamya',  desc: 'Health records, sick bay, referrals',          chip: <Chip variant="amber">{displaySick} patients</Chip>,    onClick: () => navigate('/nurse/dashboard') },
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
          {loading
            ? <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>
            : displayDorms.length === 0
              ? <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🛏️</div>
                  <div className="text-sm font-medium">No dormitories configured yet</div>
                </div>
              : displayDorms.map((d: any) => {
                  const cap  = d.capacity ?? d.totalCapacity ?? 100;
                  const occ  = d.occupied ?? d.currentOccupancy ?? 0;
                  const pct  = cap > 0 ? Math.round((occ / cap) * 100) : 0;
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
                })
          }
        </div>

        {/* Exeat & Leave */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Exeat &amp; Leave Status</h3>
          {loading
            ? <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>
            : displayExeat.length === 0
              ? <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm font-medium">No leave records</div>
                </div>
              : displayExeat.map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-none">
                    <div>
                      <div className={`text-[13px] font-medium ${item.alert ? 'text-red-700' : 'text-gray-800'}`}>{item.label}</div>
                      <div className="text-[11px] text-gray-400">{item.note}</div>
                    </div>
                    <span className={`text-[18px] font-black ${item.alert ? 'text-red-600' : 'text-gray-700'}`}>{item.value}</span>
                  </div>
                ))
          }
        </div>
      </div>
    </div>
  );
}
