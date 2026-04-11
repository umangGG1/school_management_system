import { useState }   from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { TabBar, TabPanel } from '../../components/ui/TabBar';
import { AlertBanner } from '../../components/ui/AlertBanner';

type LeadTab = 'prefects' | 'guild' | 'clubleaders';

const HEAD_PREFECTS = [
  { name:'Ssemakula Brian', cls:'S6A', role:'Head Boy',       color:'#16a34a' },
  { name:'Namukasa Joyce',  cls:'S6A', role:'Head Girl',      color:'#f43f5e' },
  { name:'Mugisha Ronald',  cls:'S5A', role:'Dep. Head Boy',  color:'#3b82f6' },
  { name:'Akello Grace',    cls:'S5A', role:'Dep. Head Girl', color:'#8b5cf6' },
];

export default function Leadership() {
  const [tab, setTab] = useState<LeadTab>('prefects');
  const { toast }     = useToast();
  return (
    <div>
      <PageHeader title="Student Leadership" subtitle="Prefects · Guild Council · Club Presidents · Term 1, 2026"
        actions={[
          { label:'📋 Post Election Notices', variant:'warning', onClick:()=>toast('Notices sent to print ✓','success') },
          { label:'➕ Add Leader', variant:'primary', onClick:()=>toast('Leader form opened','info') },
        ]}
      />
      <AlertBanner color="warn" icon="📋">
        Prefect election day: Wednesday 11 March — election notices must be posted on noticeboards today.
        <Btn size="sm" variant="warning" onClick={()=>toast('Ballot papers sent to print','success')} style={{marginLeft:10}}>🖨️ Print Ballots</Btn>
      </AlertBanner>

      <TabBar accent="#16a34a" tabs={[{key:'prefects',label:'🏛️ Prefects'},{key:'guild',label:'🗳️ Guild Council'},{key:'clubleaders',label:'📚 Club Presidents'}]} active={tab} onChange={v=>setTab(v as LeadTab)} />

      <TabPanel active={tab} tabKey="prefects">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Head Prefects</div>
            {HEAD_PREFECTS.map(p => (
              <div key={p.name} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:14, display:'flex', alignItems:'center', gap:12, boxShadow:'0 1px 3px rgba(0,0,0,.06)', marginBottom:8 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>{p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:700 }}>{p.name}</div><div style={{ fontSize:11, color:'#64748b' }}>{p.cls}</div></div>
                <Badge color="green">{p.role}</Badge>
              </div>
            ))}
          </div>
          <Card>
            <CardHeader title="House & Day Prefects" />
            <DataTable rows={[
              { name:'Byarugaba Tim',  cls:'S6B', role:'Dormitory Prefect (Nile House)' },
              { name:'Nakiganda Joy',  cls:'S6A', role:"Girls' Dormitory Prefect"      },
              { name:'Opio Sam',       cls:'S5A', role:'Dining Hall Prefect'            },
              { name:'Nankya Deb',     cls:'S5B', role:'Library Prefect'               },
              { name:'Odongo Eric',    cls:'S4A', role:'Sports Prefect'                },
              { name:'Tukahirwa Paul', cls:'S4B', role:'Chapel Prefect'               },
            ]} keyFn={(_,i)=>i} columns={[
              { key:'name', header:'Name', render:r=><span style={{fontWeight:600}}>{r.name}</span> },
              { key:'cls',  header:'Class',render:r=><Badge color="blue">{r.cls}</Badge>            },
              { key:'role', header:'Role', render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.role}</span> },
            ]} />
          </Card>
        </div>
      </TabPanel>

      <TabPanel active={tab} tabKey="guild">
        <Card>
          <CardHeader title="🗳️ Guild Student Council 2025/26" />
          <DataTable rows={[
            { pos:'Guild President',         name:'Ssemakula Brian', cls:'S6A', resp:'Represents students to HT/DHM' },
            { pos:'Vice President (Girls)',   name:'Namukasa Joyce',  cls:'S6A', resp:'Girls welfare, girls sports'  },
            { pos:'Secretary General',        name:'Mugisha Ronald',  cls:'S5A', resp:'Minutes, notices, communication'},
            { pos:'Treasurer',                name:'Akello Grace',    cls:'S5A', resp:'Guild accounts, budgets'       },
            { pos:'Sports Minister',          name:'Odongo Eric',     cls:'S4A', resp:'Sports teams, competition logistics'},
            { pos:'Culture Minister',         name:'Apio Grace',      cls:'S4A', resp:'Drama, choir, cultural events' },
          ]} keyFn={(_,i)=>i} columns={[
            { key:'pos',  header:'Position',  render:r=><span style={{fontWeight:700}}>{r.pos}</span>               },
            { key:'name', header:'Name',      render:r=><span style={{fontSize:12}}>{r.name}</span>                },
            { key:'cls',  header:'Class',     render:r=><Badge color="green">{r.cls}</Badge>                       },
            { key:'resp', header:'Responsibilities', render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.resp}</span> },
          ]} />
        </Card>
      </TabPanel>

      <TabPanel active={tab} tabKey="clubleaders">
        <Card>
          <CardHeader title="📚 Club & Society Presidents" />
          <DataTable rows={[
            { club:'📖 Debate',    pres:'Namukasa Joyce',   cls:'S6A', patron:'Ms. Nakato',    st:'green' },
            { club:'🔬 Science',   pres:'Ssemakula Brian',  cls:'S6A', patron:'Mr. Ssemwanga', st:'amber' },
            { club:'💻 Computer',  pres:'Nakabugo Sandra',  cls:'S5A', patron:'Ms. Nakabugo',  st:'green' },
            { club:'✝️ SU',        pres:'Tukahirwa Paul',   cls:'S4B', patron:'Chaplain',      st:'green' },
            { club:'🌍 Geography', pres:'Opolot Sam',       cls:'S5A', patron:'Mr. Opolot',    st:'amber' },
          ]} keyFn={(_,i)=>i} columns={[
            { key:'club',   header:'Club',    render:r=><span style={{fontWeight:600}}>{r.club}</span>           },
            { key:'pres',   header:'President',render:r=><span>{r.pres}</span>                                  },
            { key:'cls',    header:'Class',   render:r=><Badge color="green">{r.cls}</Badge>                   },
            { key:'patron', header:'Patron',  render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.patron}</span> },
            { key:'st',     header:'Status',  render:r=><Badge color={r.st as 'green'|'amber'}>{r.st==='green'?'Active':'Report pending'}</Badge> },
          ]} />
        </Card>
      </TabPanel>
    </div>
  );
}
