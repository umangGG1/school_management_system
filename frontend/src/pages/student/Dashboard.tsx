import { StatCard }   from '../../components/ui/StatCard';
import { Card }       from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export default function StudentDashboard() {
  return (
    <div>
      <PageHeader title="Student Dashboard" subtitle="S4A · Term 1, Week 8" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="📊" value="72%" title="Overall Avg."   accent="purple" />
        <StatCard icon="✅" value="91%" title="Attendance"     accent="green"  />
        <StatCard icon="📋" value="3"   title="Assignments Due" accent="amber"  />
        <StatCard icon="🏆" value="D2"  title="Current Grade"  accent="blue"   />
      </div>
      <Card>
        <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}>
          <div style={{ fontSize:40 }}>🚧</div>
          <div style={{ fontSize:16, fontWeight:700, marginTop:10 }}>Student Portal — Full Version Coming Soon</div>
        </div>
      </Card>
    </div>
  );
}
