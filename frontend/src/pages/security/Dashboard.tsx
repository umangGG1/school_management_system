import { StatCard }   from '../../components/ui/StatCard';
import { Card }       from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export default function SecurityDashboard() {
  return (
    <div>
      <PageHeader title="Security Dashboard" subtitle="Gate monitoring · Visitors · Incidents" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="🚪" value="12" title="Visitors Today"   accent="red"   />
        <StatCard icon="🎒" value="3"  title="Student Sign-outs" accent="amber" />
        <StatCard icon="⚠️" value="1"  title="Open Incidents"   accent="red"   />
        <StatCard icon="✅" value="99%" title="Perimeter OK"     accent="green" />
      </div>
      <Card>
        <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}>
          <div style={{ fontSize:40 }}>🚧</div>
          <div style={{ fontSize:16, fontWeight:700, marginTop:10 }}>Security Portal — Full Version Coming Soon</div>
        </div>
      </Card>
    </div>
  );
}
