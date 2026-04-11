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
      <PageHeader title="Settings" subtitle="Manage your profile and notification preferences" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>👤 Profile</div>
          <FormField label="Full Name"><TextInput defaultValue={user?.name ?? 'Ms. Nakakande Mary'} /></FormField>
          <FormField label="Role"><TextInput defaultValue="HOD Mathematics / Class Teacher" /></FormField>
          <FormField label="Email"><TextInput defaultValue="nakakande@smissi.ac.ug" type="email" /></FormField>
          <Btn variant="primary" onClick={() => toast('Profile updated ✓', 'success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🔔 Notification Preferences</div>
          <FormField label="Assignment submission alerts"><SelectInput><option>Immediate</option><option>Daily digest</option><option>Off</option></SelectInput></FormField>
          <FormField label="Attendance reminder"><SelectInput><option>Before each class</option><option>End of day</option><option>Off</option></SelectInput></FormField>
          <FormField label="Marks entry deadline alert"><SelectInput><option>3 days before</option><option>1 day before</option><option>Off</option></SelectInput></FormField>
          <Btn variant="primary" onClick={() => toast('Preferences saved ✓', 'success')}>Save Preferences</Btn>
        </Card>
      </div>
    </div>
  );
}
