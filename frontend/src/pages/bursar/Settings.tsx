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
          <FormField label="Full Name"><TextInput defaultValue={user?.name ?? 'Bursar'} /></FormField>
          <FormField label="Email"><TextInput defaultValue="bursar@smissi.ac.ug" type="email" /></FormField>
          <Btn variant="primary" onClick={()=>toast('Profile updated ✓','success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>🔔 Preferences</div>
          <FormField label="Payment receipt auto-print"><SelectInput><option>Yes</option><option>No</option></SelectInput></FormField>
          <FormField label="Arrears alert threshold (days)"><SelectInput><option>30 days</option><option>60 days</option><option>90 days</option></SelectInput></FormField>
          <FormField label="Payroll reminder"><SelectInput><option>5 days before</option><option>3 days before</option></SelectInput></FormField>
          <Btn variant="primary" onClick={()=>toast('Preferences saved ✓','success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );
}
