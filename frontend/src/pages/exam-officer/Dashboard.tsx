import { useNavigate } from 'react-router-dom';
import { StatCard }    from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { AlertBanner } from '../../components/ui/AlertBanner';

export default function ExamDashboard() {
  const nav = useNavigate();
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#4c1d95 0%,#7c3aed 55%,#a21caf 100%)', borderRadius:12, padding:'20px 24px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.05)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>Examination Office — Term 1, 2026 📝</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.65)', marginTop:3, marginBottom:10 }}>SMISSI Senior Secondary · Sat 07 Mar 2026 · Week 8 of 14</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['📅 End-term: Week 12', '⚠️ 3 papers not secured', '📊 Results entry open: S4 & S5', '🔒 Master copies secured'].map(c=>(
              <span key={c} style={{ background:'rgba(255,255,255,.15)', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600 }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:20, position:'relative', zIndex:1, flexShrink:0 }}>
          {[['1,207','Students'],['42','Papers'],['6','Classes'],['3','Venues']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center' }}><div style={{ fontSize:22, fontWeight:800 }}>{v}</div><div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginTop:1 }}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
        <Btn variant="primary" onClick={()=>nav('/exam-officer/schedule')}>📅 Exam Schedule</Btn>
        <Btn onClick={()=>nav('/exam-officer/results')}>📊 Results Entry</Btn>
        <Btn variant="danger" onClick={()=>nav('/exam-officer/paper-security')}>🔒 Paper Security</Btn>
        <Btn onClick={()=>nav('/exam-officer/marking')}>✅ Marking Schemes</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        <StatCard icon="📅" value="Week 12"  title="End-term Exams"   accent="purple" />
        <StatCard icon="📊" value="3 of 6"   title="Results Entered"  accent="blue"   />
        <StatCard icon="🔒" value="39"        title="Papers Secured"   accent="green"  />
        <StatCard icon="⚠️" value="3"         title="Security Issues"  accent="red"    trendType="down" trend="↑ urgent" />
      </div>

      <AlertBanner color="danger" icon="🔒">
        <strong>3 exam papers not yet secured:</strong> S6 Physics, S4 Chemistry, S3 Mathematics. These must be stored in the locked safe before Tuesday. Contact Mr. Byamugisha immediately.
      </AlertBanner>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <CardHeader title="📅 Upcoming Exam Calendar" action={<Btn size="sm" onClick={()=>nav('/exam-officer/schedule')}>Full schedule →</Btn>} />
          {[['Week 10 · Mon 23 Mar', 'Mock Exams — S4 & S6','amber'],['Week 12 · Mon 06 Apr','End-term Written Papers','red'],['Week 13 · Mon 13 Apr','Practicals — Science & Art','orange'],['Week 14 · Fri 25 Apr','Term 1 Results deadline','blue']].map(([wk,ev,col])=>(
            <div key={String(ev)} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <Badge color={col as 'amber'|'red'|'orange'|'blue'}>{wk}</Badge>
              <span style={{ fontSize:12, fontWeight:600 }}>{ev}</span>
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader title="📊 Results Entry Status" action={<Btn size="sm" onClick={()=>nav('/exam-officer/results')}>Enter marks →</Btn>} />
          {[['S4 Mathematics','Entered ✓','green'],['S4 English','Entered ✓','green'],['S5 Biology','Entered ✓','green'],['S4 Chemistry','Pending','amber'],['S6 Physics','Pending','amber'],['S3 Mathematics','Not started','red']].map(([s,st,col])=>(
            <div key={s} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontSize:12, fontWeight:600 }}>{s}</span>
              <Badge color={col as 'green'|'amber'|'red'}>{st}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
