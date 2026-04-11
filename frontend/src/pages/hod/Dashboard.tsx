import { StatCard }  from '../../components/ui/StatCard';
import { Card }      from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export default function HODDashboard() {
  return (
    <div>
      <PageHeader title="HOD Dashboard" subtitle="Mathematics Department · Term 1, Week 8" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="👩‍🏫" value="8"   title="Dept. Teachers"  accent="purple" />
        <StatCard icon="📚"  value="12"  title="Subject Streams"  accent="blue"   />
        <StatCard icon="📊"  value="68%" title="Avg. Coverage"    accent="green"  />
        <StatCard icon="⚠️"  value="2"   title="Reports Pending"  accent="amber"  />
      </div>
      <Card>
        <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
          <div style={{ fontSize:16, fontWeight:700 }}>HOD Portal — Full Version Coming Soon</div>
        </div>
      </Card>
    </div>
  );
}
