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
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>👤 Profile</div>
          <FormField label="Full Name"><TextInput defaultValue={user?.name ?? 'ECA Coordinator'} /></FormField>
          <FormField label="Email"><TextInput defaultValue="eca@smissi.ac.ug" type="email" /></FormField>
          <Btn variant="primary" onClick={()=>toast('Profile updated ✓','success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>🔔 Preferences</div>
          <FormField label="Attendance alert threshold (%)"><SelectInput><option>70%</option><option>75%</option><option>80%</option></SelectInput></FormField>
          <FormField label="Fixture reminder (days before)"><SelectInput><option>3 days</option><option>5 days</option><option>7 days</option></SelectInput></FormField>
          <FormField label="Patron report deadline alert"><SelectInput><option>3 days before end of term</option><option>1 week before</option></SelectInput></FormField>
          <Btn variant="primary" onClick={()=>toast('Preferences saved ✓','success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );
}
