import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { StatCard }   from '../../components/ui/StatCard';
import { AlertBanner } from '../../components/ui/AlertBanner';

export default function Competitions() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Competitions & Inter-School Events" subtitle="6 competitions this term"
        actions={[{ label:'➕ Register Competition', variant:'primary', onClick:()=>toast('Competition form opened','info') }]}
      />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="📅" value="3"        title="Upcoming"     accent="blue"   />
        <StatCard icon="🏆" value="2"        title="Trophies Won" accent="gold"   />
        <StatCard icon="🥇" value="1st"      title="Best Result"  accent="green"  />
        <StatCard icon="💰" value="UGX 280k" title="Pending Fees" accent="amber"  />
      </div>

      <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:'#f97316' }}>🔥 Upcoming — Needs Action</div>

      {[
        { tag:'Sat 14 Mar', title:'⚽ District Football Championship — Zone B', info:'Municipal Stadium, Mukono · SMISSI vs Namilyango College · KO: 10:00 AM', chips:[['No transport ❌','red'],['24/26 permission slips','amber'],['26-player squad ready','green']] as [string,string][], actions:[['🚌 Arrange Transport','danger'],['👥 Squad List','secondary'],['📄 Permission Slips','secondary']] as [string,string][] },
        { tag:'Thu 19 Mar', title:'🎭 National Drama Festival', info:'National Theatre, Kampala · Play: "The Burden of Tomorrow" · Director: Mr. Kato', chips:[['UGX 180k budget needed','amber'],['8 rehearsals left','green']] as [string,string][], actions:[['💰 Request Budget','warning'],['📅 Rehearsals','secondary']] as [string,string][] },
        { tag:'Mon 09 Mar (deadline)', title:'🗣️ National Schools Debate Competition', info:'Registration closes Monday 09 Mar · 4-member team selected · Entry fee UGX 40k', chips:[['Registration closes Mon!','red'],['UGX 40k unpaid','amber']] as [string,string][], actions:[['🚨 Register Now','danger'],['👥 Team List','secondary']] as [string,string][] },
      ].map(c => (
        <div key={c.title} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:14, marginBottom:12, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Badge color="amber">📅 {c.tag}</Badge>
            <div style={{ fontSize:14, fontWeight:700 }}>{c.title}</div>
          </div>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>{c.info}</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
            {c.chips.map(([lbl,col])=><Badge key={lbl} color={col as 'red'|'amber'|'green'}>{lbl}</Badge>)}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {c.actions.map(([lbl,v])=><Btn key={lbl} size="sm" variant={v as 'danger'|'warning'|'secondary'} onClick={()=>toast(`${lbl} action triggered`,'success')}>{lbl}</Btn>)}
          </div>
        </div>
      ))}

      <div style={{ borderTop:'1px solid #e2e8f0', margin:'20px 0 12px', fontSize:13, fontWeight:700, color:'#14532d' }}>🏆 Completed — Term 1</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {[['🥇 1st Place','#f0fdf4','#16a34a','🗣️ District Debate Competition','SMISSI won the district trophy · Best speaker: Namukasa Joyce (S6A)'],
          ['🥈 2nd Place','#fef3c7','#d97706','🎵 Inter-schools Music Festival','Choir placed 2nd of 12 schools · Conductor: Ms. Grace'],
        ].map(([badge,bg,bc,title,sub]) => (
          <div key={String(title)} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, marginBottom:8, background:String(bg), color:String(bc), border:`1px solid ${String(bc)}30` }}>{badge}</div>
            <div style={{ fontSize:13, fontWeight:700 }}>{title}</div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>{sub}</div>
            <Btn size="sm" variant="success" onClick={()=>toast('Certificate printed','info')}>🏆 Print Certificate</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}
