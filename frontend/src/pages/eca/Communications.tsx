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
          <CardHeader title="📬 Inbox (3 unread)" />
          {[{from:'Bursar',title:'Budget request approved — Drama UGX 180k',sub:'1 hr ago · Unread',unread:true,bg:'#0f766e'},
            {from:'Football Patron',title:'District transport confirmation needed',sub:'3 hrs ago · Unread',unread:true,bg:'#f97316'},
            {from:'HT',title:'ECA awards ceremony — confirm attendees',sub:'Yesterday',unread:false,bg:'#1e293b'},
          ].map(m=>(
            <div key={m.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 8px',background:m.unread?'#f0fdf4':'transparent',borderRadius:8,marginBottom:4,cursor:'pointer'}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{m.from.slice(0,2).toUpperCase()}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:m.unread?700:600}}>{m.title}</div><div style={{fontSize:10,color:'#64748b',marginTop:1}}>{m.from} · {m.sub}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader title="✍️ Compose / Send Circular" />
          <FormField label="Send To"><SelectInput><option>All Students</option><option>All Patrons</option><option>Sports Teams only</option><option>Individual</option></SelectInput></FormField>
          <FormField label="Subject"><TextInput placeholder="e.g. End-of-Term Concert reminder" /></FormField>
          <FormField label="Message"><TextAreaInput placeholder="Type your circular or message…" /></FormField>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>toast('Draft saved','info')}>Draft</Btn>
            <Btn variant="primary" onClick={()=>toast('Circular sent to all ✓','success')}>📢 Send Circular</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
