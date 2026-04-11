import { useToast }   from '../../contexts/ToastContext';
import { useAuth }    from '../../contexts/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { FormField, TextInput, SelectInput } from '../../components/ui/FormField';
import { Btn }        from '../../components/ui/Btn';

export default function Settings() {
  const { user }  = useAuth();
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Settings" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>👤 Profile</div>
          <FormField label="Full Name"><TextInput defaultValue={user?.name ?? 'Exam Officer'} /></FormField>
          <FormField label="Email"><TextInput defaultValue="exams@smissi.ac.ug" type="email" /></FormField>
          <Btn variant="primary" onClick={()=>toast('Saved ✓','success')}>Save</Btn>
        </Card>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>🔔 Preferences</div>
          <FormField label="Results publishing requires HT approval"><SelectInput><option>Yes (recommended)</option><option>No</option></SelectInput></FormField>
          <FormField label="Paper security daily reminder"><SelectInput><option>7:00 AM</option><option>8:00 AM</option><option>Off</option></SelectInput></FormField>
          <Btn variant="primary" onClick={()=>toast('Saved ✓','success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );
}
