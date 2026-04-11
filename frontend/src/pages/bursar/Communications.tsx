import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { FormField, TextInput, SelectInput, TextAreaInput } from '../../components/ui/FormField';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';

const INBOX = [
  { from:'HT',    init:'HT', bg:'#1e293b', title:'Budget approval request — Drama costumes', sub:'1 hr ago · Unread',  unread:true },
  { from:'ECA',   init:'EC', bg:'#16a34a', title:'Football transport request — Sat 14 Mar',  sub:'2 hrs ago · Unread', unread:true },
  { from:'DHM',   init:'DH', bg:'#0ea5e9', title:'Supplier invoice — Ngoma Construction',    sub:'Yesterday',          unread:false },
];

export default function Communications() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Communications" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader title={`📬 Inbox (${INBOX.filter(m=>m.unread).length} unread)`} />
          {INBOX.map(m => (
            <div key={m.title} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 8px', background:m.unread?'#f0fdfa':'transparent', borderRadius:8, marginBottom:4, cursor:'pointer' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:m.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>{m.init}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:m.unread?700:600 }}>{m.title}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:1 }}>{m.from} · {m.sub}</div>
              </div>
              {m.unread && <Badge color="teal">New</Badge>}
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader title="✍️ Compose" />
          <FormField label="To"><SelectInput><option>Head Teacher</option><option>Deputy HM</option><option>ECA Coordinator</option><option>All Staff</option></SelectInput></FormField>
          <FormField label="Subject"><TextInput placeholder="Subject…" /></FormField>
          <FormField label="Message"><TextAreaInput placeholder="Type your message…" /></FormField>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn onClick={()=>toast('Draft saved','info')}>Draft</Btn>
            <Btn variant="primary" onClick={()=>toast('Sent ✓','success')}>📤 Send</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
