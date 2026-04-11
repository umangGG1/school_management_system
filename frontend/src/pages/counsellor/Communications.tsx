import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { FormField, TextInput, SelectInput, TextAreaInput } from '../../components/ui/FormField';
import { Btn }        from '../../components/ui/Btn';

export default function CounsellorComms() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Communications" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <CardHeader title="📬 Inbox (4 unread)" />
          {[{from:'DHM',title:'Bullying case — Auma Gloria — please report by Monday',unread:true,bg:'#0ea5e9'},
            {from:'HT',title:'Term welfare statistics needed for governors meeting',unread:true,bg:'#1e293b'},
            {from:'Nurse',title:'Medical referral — Opio James follow-up',unread:true,bg:'#ec4899'},
            {from:"Auma's Parent",title:'Parent requesting meeting this week',unread:true,bg:'#8b5cf6'},
          ].map(m=>(
            <div key={m.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 8px',background:'#f0fdfa',borderRadius:8,marginBottom:4,cursor:'pointer'}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{m.from.slice(0,2).toUpperCase()}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{m.title}</div><div style={{fontSize:10,color:'#64748b',marginTop:1}}>{m.from}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader title="✍️ Compose" />
          <FormField label="To"><SelectInput><option>Head Teacher</option><option>Deputy HM</option><option>Parent/Guardian</option><option>Nurse</option><option>All Staff</option></SelectInput></FormField>
          <FormField label="Subject"><TextInput placeholder="Subject…" /></FormField>
          <FormField label="Message (confidential)"><TextAreaInput placeholder="Keep student information confidential…" /></FormField>
          <Btn variant="primary" onClick={()=>toast('Sent ✓','success')}>📤 Send</Btn>
        </Card>
      </div>
    </div>
  );
}
