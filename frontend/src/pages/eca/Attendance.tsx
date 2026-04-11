import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card }        from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

const ACTIVITIES = [
  { name:'⚽ Football',       rate:88, trend:'up',   low:false },
  { name:'🏐 Netball',        rate:92, trend:'up',   low:false },
  { name:'🎭 Drama Club',     rate:74, trend:'down', low:false },
  { name:'🎵 School Choir',   rate:91, trend:'up',   low:false },
  { name:'🗣️ Debate Club',    rate:67, trend:'down', low:true  },
  { name:'🔬 Science Club',   rate:58, trend:'down', low:true  },
  { name:'💻 Computer Club',  rate:83, trend:'flat', low:false },
  { name:'✝️ Scripture Union', rate:79, trend:'flat', low:false },
  { name:'💃 Cultural Dance', rate:85, trend:'up',   low:false },
];

export default function Attendance() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="ECA Attendance" subtitle="Real-time participation tracking by activity"
        actions={[
          { label:'📄 Export Report', onClick:()=>toast('Attendance report exported','info') },
          { label:'✅ Take Attendance', variant:'primary', onClick:()=>toast('Attendance session started','info') },
        ]}
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[['Avg. Rate', '80%', '#16a34a'], ['Below 70%', ACTIVITIES.filter(a=>a.rate<70).length, '#ef4444'], ['Above 90%', ACTIVITIES.filter(a=>a.rate>=90).length, '#10b981'], ['Activities', ACTIVITIES.length, '#2563eb']].map(([l,v,c])=>(
          <div key={String(l)} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:10,padding:'12px 16px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:800,color:c as string}}>{v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {ACTIVITIES.map(a => (
          <div key={a.name} style={{ background:'#fff', border:`1px solid ${a.low?'rgba(239,68,68,.3)':'#e2e8f0'}`, borderRadius:10, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:700 }}>{a.name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {a.low && <Badge color="red">Low</Badge>}
                <span style={{ fontSize:16, fontWeight:800, color:a.rate>=85?'#16a34a':a.rate>=70?'#f59e0b':'#ef4444' }}>{a.rate}%</span>
              </div>
            </div>
            <ProgressBar label="" value="" pct={a.rate} color={a.rate>=85?'green':a.rate>=70?'amber':'red'} />
            {a.low && <Btn size="sm" variant="warning" onClick={()=>toast(`Patron notified about ${a.name} attendance`,'success')}>📤 Alert Patron</Btn>}
          </div>
        ))}
      </div>
    </div>
  );
}
