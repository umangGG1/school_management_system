import { StatCard }  from '../../components/ui/StatCard';
import { Card }      from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge }     from '../../components/ui/Badge';

export default function DeputyDashboard() {
  return (
    <div>
      <PageHeader title="Deputy HM Dashboard" subtitle="SMISSI · Term 1, Week 8 · Sat 07 Mar 2026" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="⚖️" value="8"  title="Discipline Cases" accent="orange" />
        <StatCard icon="👥" value="87" title="Staff on Duty"    accent="blue"   />
        <StatCard icon="📋" value="12" title="SLC Meetings"     accent="green"  />
        <StatCard icon="📅" value="3"  title="Timetable Gaps"   accent="red"    />
      </div>
      <Card>
        <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Deputy HM Portal — Full Version Coming Soon</div>
          <div style={{ fontSize:13 }}>Discipline management, staff duty rosters, SLC tracking, and timetabling will be available here.</div>
        </div>
      </Card>
    </div>
  );
}
