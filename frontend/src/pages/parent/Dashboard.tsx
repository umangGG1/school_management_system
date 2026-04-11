import { StatCard }   from '../../components/ui/StatCard';
import { Card }       from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export default function ParentDashboard() {
  return (
    <div>
      <PageHeader title="Parent Dashboard" subtitle="Kevin Ssali · S4A · Term 1" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="📊" value="72%"    title="Overall Average" accent="green"  />
        <StatCard icon="✅" value="91%"    title="Attendance"      accent="teal"   />
        <StatCard icon="💳" value="UGX 0"  title="Fee Balance"     accent="green"  />
        <StatCard icon="📢" value="2"      title="New Notices"     accent="blue"   />
      </div>
      <Card>
        <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}>
          <div style={{ fontSize:40 }}>🚧</div>
          <div style={{ fontSize:16, fontWeight:700, marginTop:10 }}>Parent Portal — Full Version Coming Soon</div>
        </div>
      </Card>
    </div>
  );
}
