import { useNavigate } from 'react-router-dom';
import { StatCard }    from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AlertBanner } from '../../components/ui/AlertBanner';

export default function CounsellorDashboard() {
  const nav = useNavigate();
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#0f766e 0%,#0d9488 55%,#7c3aed 100%)', borderRadius:12, padding:'20px 24px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.05)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>School Counsellor Office 💚</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.65)', marginTop:3, marginBottom:10 }}>SMISSI · Sat 07 Mar 2026 · Week 8</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['📅 3 sessions scheduled today','⚠️ 2 referrals pending','🏥 1 medical follow-up','🏠 2 boarding welfare alerts'].map(c=>(
              <span key={c} style={{ background:'rgba(255,255,255,.15)', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600 }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:20, position:'relative', zIndex:1, flexShrink:0 }}>
          {[['8','Active Cases'],['3','Sessions Today'],['12','Resolved'],['2','Referrals']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center' }}><div style={{ fontSize:22, fontWeight:800 }}>{v}</div><div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginTop:1 }}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
        <Btn variant="primary" onClick={()=>nav('/counsellor/sessions')}>📅 Log Session</Btn>
        <Btn onClick={()=>nav('/counsellor/students')}>🎓 View Students</Btn>
        <Btn variant="warning" onClick={()=>nav('/counsellor/referrals')}>🔗 Referrals</Btn>
        <Btn onClick={()=>nav('/counsellor/welfare')}>⚠️ Welfare Issues</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="👥" value="8"  title="Active Cases"    accent="teal"   onClick={()=>nav('/counsellor/students')}  />
        <StatCard icon="📝" value="3"  title="Today's Sessions" accent="blue"  onClick={()=>nav('/counsellor/sessions')}  />
        <StatCard icon="⚠️" value="3"  title="Welfare Issues"  accent="amber"  onClick={()=>nav('/counsellor/welfare')}   />
        <StatCard icon="🔗" value="2"  title="Pending Referrals" accent="red"  onClick={()=>nav('/counsellor/referrals')} />
      </div>

      <AlertBanner color="warn" icon="⚠️">
        <strong>2 students flagged for urgent follow-up:</strong> Auma Gloria (S4B) — suspected bullying case. Opio James (S5A) — mental health referral pending GP appointment.
      </AlertBanner>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <CardHeader title="📅 Today's Sessions — Sat 07 Mar" />
          {[['9:00 AM','Nakibuule Sarah (S5A)','Academic stress — exam anxiety','blue'],
            ['11:00 AM','Kyaligonza David (S1B)','Bullying report — follow-up','amber'],
            ['2:00 PM','Kevin Ssali (S4A)','Career guidance — university choices','green'],
          ].map(([time,name,topic,col])=>(
            <div key={String(name)} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:'1px solid #f1f5f9' }}>
              <Badge color={col as 'blue'|'amber'|'green'}>{time}</Badge>
              <div><div style={{ fontSize:12, fontWeight:700 }}>{name}</div><div style={{ fontSize:11, color:'#64748b' }}>{topic}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader title="📊 Case Distribution" />
          <ProgressBar label="Academic stress"    value="4 students" pct={50} color="blue"   />
          <ProgressBar label="Bullying / social"  value="2 students" pct={25} color="red"    />
          <ProgressBar label="Mental health"       value="1 student"  pct={13} color="purple" />
          <ProgressBar label="Career guidance"     value="1 student"  pct={12} color="teal"   />
        </Card>
      </div>
    </div>
  );
}
