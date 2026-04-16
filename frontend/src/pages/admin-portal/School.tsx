import { useState, useEffect } from 'react';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { useToast }    from '../../contexts/ToastContext';
import { schoolApi, type ApiSchool, type UpdateSchoolPayload } from '../../lib/api';

const SEED: ApiSchool = {
  id: '', name: 'SMISSI Secondary School', code: 'SSS/NGA/001',
  motto: 'Knowledge is Power', foundedYear: '1985',
  type: 'Government-Aided', ownership: 'Anglican (COU)',
  district: 'Ngara', address: 'P.O. Box 47, Ngara Sub-county, Northern Uganda',
  phone: '+256 772 123 456', email: 'admin@smissi.ac.ug',
  website: 'https://smissi.ac.ug', logoUrl: '',
  principalName: 'Mr. Ssemanda Julius', deoName: 'Mr. Okurut Charles',
  moesId: 'UG-SSS-0234', streams: 'Sciences, Arts, Business',
  country: 'Uganda', currency: 'UGX',
  isActive: true, createdAt: '', updatedAt: '',
};

const inputStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%', padding: '8px 10px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit',
  boxSizing: 'border-box', background: disabled ? '#f8fafc' : '#fff',
  color: disabled ? '#64748b' : '#1e293b',
});

const Field = ({ label, value, onChange, disabled, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  disabled: boolean; type?: string;
}) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      disabled={disabled} style={inputStyle(disabled)} />
  </div>
);

export default function AdminSchool() {
  const { toast } = useToast();
  const [school,   setSchool]  = useState<ApiSchool>(SEED);
  const [draft,    setDraft]   = useState<UpdateSchoolPayload>({});
  const [editMode, setEdit]    = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [offline,  setOffline] = useState(false);

  useEffect(() => {
    schoolApi.get()
      .then(s => { setSchool(s); setOffline(false); })
      .catch(() => setOffline(true));
  }, []);

  const val = (k: keyof UpdateSchoolPayload): string =>
    ((editMode ? (draft[k] ?? school[k as keyof ApiSchool]) : school[k as keyof ApiSchool]) as string) ?? '';

  const set = (k: keyof UpdateSchoolPayload) => (v: string) =>
    setDraft(d => ({ ...d, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await schoolApi.update(draft);
      setSchool(updated);
      toast('School profile saved', 'success');
      setOffline(false);
    } catch {
      setSchool(prev => ({ ...prev, ...draft }));
      toast('Saved locally (backend offline)', 'info');
    } finally {
      setSaving(false); setEdit(false); setDraft({});
    }
  };

  const handleCancel = () => { setDraft({}); setEdit(false); };

  return (
    <div>
      <PageHeader
        title="School Profile"
        subtitle="Manage your school's identity, contact and MoES details"
        actions={[
          editMode
            ? { label: saving ? '⏳ Saving…' : '💾 Save Changes', onClick: handleSave, variant: 'primary' }
            : { label: '✏️ Edit Profile', onClick: () => { setDraft({}); setEdit(true); }, variant: 'secondary' },
        ]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* School Identity */}
        <Card>
          <CardHeader title="🏫 School Identity" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="School Name"  value={val('name')}        onChange={set('name')}        disabled={!editMode} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="School Code"  value={val('code')}       onChange={set('code')}        disabled={!editMode} />
              <Field label="Founded Year" value={val('foundedYear')} onChange={set('foundedYear')} disabled={!editMode} />
            </div>
            <Field label="Motto"     value={val('motto')}     onChange={set('motto')}     disabled={!editMode} />
            <Field label="Type"      value={val('type')}      onChange={set('type')}      disabled={!editMode} />
            <Field label="Ownership" value={val('ownership')} onChange={set('ownership')} disabled={!editMode} />
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader title="📞 Contact Details" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="District" value={val('district')} onChange={set('district')} disabled={!editMode} />
            <Field label="Address"  value={val('address')}  onChange={set('address')}  disabled={!editMode} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Phone" value={val('phone')} onChange={set('phone')} disabled={!editMode} />
              <Field label="Email" value={val('email')} onChange={set('email')} disabled={!editMode} type="email" />
            </div>
            <Field label="Website" value={val('website')} onChange={set('website')} disabled={!editMode} />
          </div>
        </Card>

        {/* Leadership */}
        <Card>
          <CardHeader title="👥 Leadership" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Head Teacher / Principal"         value={val('principalName')} onChange={set('principalName')} disabled={!editMode} />
            <Field label="District Education Officer (DEO)" value={val('deoName')}       onChange={set('deoName')}       disabled={!editMode} />
            <Field label="MoES School ID"                   value={val('moesId')}        onChange={set('moesId')}        disabled={!editMode} />
          </div>
        </Card>

        {/* Key stats */}
        <Card>
          <CardHeader title="📊 Key Statistics" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Students',    value: '1,204' },
              { label: 'Staff',       value: '47'    },
              { label: 'Classes',     value: '24'    },
              { label: 'Subjects',    value: '24'    },
              { label: 'Dormitories', value: '6'     },
              { label: 'Streams',     value: '3'     },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="Streams" value={val('streams')} onChange={set('streams')} disabled={!editMode} />
          </div>
        </Card>
      </div>

      {editMode && (
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <Btn variant="primary"   onClick={handleSave}   disabled={saving}>
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </Btn>
          <Btn variant="secondary" onClick={handleCancel} disabled={saving}>Cancel</Btn>
        </div>
      )}
    </div>
  );
}
