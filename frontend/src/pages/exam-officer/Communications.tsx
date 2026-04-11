import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { FormField, TextInput, SelectInput, TextAreaInput } from '../../components/ui/FormField';
import { Btn }        from '../../components/ui/Btn';

export default function Communications() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Communications" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <CardHeader title="📬 Inbox (2 unread)" />
          {[{from:'HT',title:'Results deadline extension — confirm receipt',sub:'2 hrs ago · Unread',unread:true,bg:'#1e293b'},
            {from:'DHM',title:'Timetable conflict — Room A Mon 06 Apr',sub:'4 hrs ago · Unread',unread:true,bg:'#0ea5e9'},
            {from:'Treasurer',title:'Exam fee collection summary required',sub:'Yesterday',unread:false,bg:'#0f766e'},
          ].map(m=>(
            <div key={m.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 8px',background:m.unread?'#f5f3ff':'transparent',borderRadius:8,marginBottom:4}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{m.from.slice(0,2).toUpperCase()}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:m.unread?700:600}}>{m.title}</div><div style={{fontSize:10,color:'#64748b',marginTop:1}}>{m.from} · {m.sub}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader title="✍️ Compose" />
          <FormField label="To"><SelectInput><option>Head Teacher</option><option>All Teachers</option><option>DHM</option><option>Bursar</option></SelectInput></FormField>
          <FormField label="Subject"><TextInput placeholder="Subject…" /></FormField>
          <FormField label="Message"><TextAreaInput placeholder="Type message…" /></FormField>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="primary" onClick={()=>toast('Sent ✓','success')}>📤 Send</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
