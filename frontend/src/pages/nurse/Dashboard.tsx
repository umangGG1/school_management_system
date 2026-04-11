import { StatCard }   from '../../components/ui/StatCard';
import { Card }       from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export default function NurseDashboard() {
  return (
    <div>
      <PageHeader title="Medical / Sick Bay" subtitle="Term 1, Week 8" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="🛏️" value="3"  title="In Sick Bay"    accent="red"    />
        <StatCard icon="👥" value="12" title="Seen Today"      accent="teal"   />
        <StatCard icon="🔗" value="2"  title="Referrals Pending" accent="orange" />
        <StatCard icon="💊" value="94" title="Meds Dispensed"  accent="green"  />
      </div>
      <Card>
        <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}>
          <div style={{ fontSize:40 }}>🚧</div>
          <div style={{ fontSize:16, fontWeight:700, marginTop:10 }}>Nurse Portal — Full Version Coming Soon</div>
        </div>
      </Card>
    </div>
  );
}
