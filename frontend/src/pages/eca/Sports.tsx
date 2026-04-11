import { useState }   from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { StatCard }   from '../../components/ui/StatCard';
import { TabBar, TabPanel } from '../../components/ui/TabBar';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { DataTable }  from '../../components/ui/DataTable';
import { ProgressBar } from '../../components/ui/ProgressBar';

type SportTab = 'fixtures' | 'teams' | 'results';

const RESULTS = [
  { date:'28 Feb', sport:'⚽ Football', opp:"St. Mary's Kitende", ha:'Home', res:'WIN',  score:'3 – 1', motm:'Ssemakula B.' },
  { date:'21 Feb', sport:'🏐 Netball',  opp:'Makerere College',   ha:'Home', res:'WIN',  score:'38 – 22',motm:'Akello Rose' },
  { date:'14 Feb', sport:'⚽ Football', opp:'Namilyango College',  ha:'Away', res:'LOSS', score:'1 – 2', motm:'Byarugaba T.'},
  { date:'07 Feb', sport:'🏸 Badminton',opp:'Gayaza High',         ha:'Home', res:'WIN',  score:'5 – 2', motm:'Nakato S.'   },
];

export default function Sports() {
  const [tab, setTab] = useState<SportTab>('fixtures');
  const { toast }     = useToast();

  return (
    <div>
      <PageHeader title="Sports & Fixtures" subtitle="8 teams · Term 1 fixtures and results"
        actions={[
          { label:'📄 Export', onClick:()=>toast('Fixtures exported','info') },
          { label:'➕ Add Fixture', variant:'primary', onClick:()=>toast('Fixture form opened','info') },
        ]}
      />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="⚽" value="8"  title="Teams"        accent="orange" />
        <StatCard icon="🏆" value="5"  title="Wins (Term)"  accent="green"  />
        <StatCard icon="❌" value="2"  title="Losses"       accent="red"    />
        <StatCard icon="📅" value="3"  title="Upcoming"     accent="blue"   />
      </div>

      <TabBar
        accent="#16a34a"
        tabs={[
          { key:'fixtures', label:'📅 Fixtures',         icon:'' },
          { key:'teams',    label:'👥 Teams & Squads',   icon:'' },
          { key:'results',  label:'📊 Results',           icon:'' },
        ]}
        active={tab}
        onChange={v => setTab(v as SportTab)}
      />

      <TabPanel active={tab} tabKey="fixtures">
        <AlertBanner color="warn" icon="⚠️">
          Football transport not arranged for Sat 14 Mar — Municipal Stadium. Deadline: Wednesday 11 Mar.
          <Btn size="sm" variant="warning" onClick={()=>toast('Bus request sent to Bursar','info')} style={{ marginLeft: 10 }}>Request Bus</Btn>
        </AlertBanner>
        {[
          { border:'#f97316', tag:'Sat 14 Mar · 10:00 AM', title:'⚽ Football — District Championship', info:'SMISSI vs Namilyango College · Municipal Stadium', chips:[['Transport pending','red'],['Permission slips: 24/26','amber']] as [string,string][] },
          { border:'#f97316', tag:'Thu 19 Mar · 2:00 PM',  title:'🏐 Netball — Inter-schools League',   info:'SMISSI vs Gayaza High School · Gayaza', chips:[['Transport arranged ✓','green'],['Permission slips: 14/14','green']] as [string,string][] },
        ].map(f => (
          <div key={f.title} style={{ background:'#fff', border:`1px solid #e2e8f0`, borderLeft:`4px solid ${f.border}`, borderRadius:10, padding:14, marginBottom:10, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
              <Badge color="amber">{f.tag}</Badge>
              <div style={{ fontSize:13, fontWeight:700 }}>{f.title}</div>
            </div>
            <div style={{ fontSize:12, marginBottom:8 }}>{f.info}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {f.chips.map(([label, col]) => <Badge key={label} color={col as 'red'|'amber'|'green'}>{label}</Badge>)}
            </div>
          </div>
        ))}
      </TabPanel>

      <TabPanel active={tab} tabKey="teams">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[['⚽','Football (Boys)','Mr. Kakooza',26,88],['🏐','Netball (Girls)','Ms. Nambi',14,92],['🏸','Badminton','Ms. Nakabugo',18,79],['🏃','Athletics','Mr. Kakooza',32,85],['🏊','Swimming','Mr. Lubwama',22,76],['🎾','Tennis','Mrs. Atim',16,81]].map(([icon,name,patron,squad,att]) => (
            <Card key={String(name)}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{icon} {name}</div>
              <div style={{ fontSize:11, color:'#64748b', marginBottom:10 }}>Patron: {patron}</div>
              <ProgressBar label="Squad size"        value={String(squad)} pct={Math.round(Number(squad)/50*100)} color="orange" />
              <ProgressBar label="Training attendance" value={`${att}%`}   pct={Number(att)}                     color="green"  />
              <Btn size="sm" onClick={()=>toast(`${name} squad viewed`,'info')}>View Squad</Btn>
            </Card>
          ))}
        </div>
      </TabPanel>

      <TabPanel active={tab} tabKey="results">
        <Card>
          <CardHeader title="📊 Term 1 Results — All Sports" />
          <DataTable rows={RESULTS} keyFn={(_,i)=>i} columns={[
            { key:'date',  header:'Date',    render:r=><span style={{color:'#64748b',fontSize:11}}>{r.date}</span> },
            { key:'sport', header:'Sport',   render:r=><span style={{fontWeight:600}}>{r.sport}</span> },
            { key:'opp',   header:'Opponent',render:r=><span style={{fontSize:12}}>{r.opp}</span> },
            { key:'ha',    header:'H/A',     render:r=><Badge color={r.ha==='Home'?'green':'orange'}>{r.ha}</Badge> },
            { key:'res',   header:'Result',  render:r=><Badge color={r.res==='WIN'?'green':'red'}>{r.res}</Badge> },
            { key:'score', header:'Score',   render:r=><span style={{fontWeight:700}}>{r.score}</span> },
            { key:'motm',  header:'MOTM',    render:r=><span style={{color:'#64748b',fontSize:11}}>{r.motm}</span> },
          ]} />
        </Card>
      </TabPanel>
    </div>
  );
}
