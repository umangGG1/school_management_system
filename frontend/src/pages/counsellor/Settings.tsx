import { useToast }   from '../../contexts/ToastContext';
import { useAuth }    from '../../contexts/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { FormField, TextInput, SelectInput } from '../../components/ui/FormField';
import { Btn }        from '../../components/ui/Btn';

export default function CounsellorSettings() {
  const { user }  = useAuth();
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Settings" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>👤 Profile</div>
          <FormField label="Full Name"><TextInput defaultValue={user?.name ?? 'School Counsellor'} /></FormField>
          <FormField label="Email"><TextInput defaultValue="counsellor@smissi.ac.ug" type="email" /></FormField>
          <Btn variant="primary" onClick={()=>toast('Saved ✓','success')}>Save</Btn>
        </Card>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>🔒 Privacy & Confidentiality</div>
          <FormField label="Case notes visibility"><SelectInput><option>Counsellor only (private)</option><option>Counsellor + HT (on request)</option></SelectInput></FormField>
          <FormField label="At-risk alert recipients"><SelectInput><option>HT + DHM</option><option>HT only</option><option>DHM only</option></SelectInput></FormField>
          <Btn variant="primary" onClick={()=>toast('Saved ✓','success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );
}
