import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { FormField }  from '../../components/ui/FormField';

const INITIAL = {
  name:       'SMISSI Secondary School',
  code:       'SSS/NGA/001',
  motto:      'Knowledge is Power',
  founded:    '1985',
  type:       'Government-Aided',
  ownership:  'Anglican (COU)',
  district:   'Ngara',
  address:    'P.O. Box 47, Ngara Sub-county, Northern Uganda',
  phone:      '+256 772 123 456',
  email:      'admin@smissi.ac.ug',
  website:    'https://smissi.ac.ug',
  principal:  'Mr. Ssemanda Julius',
  deo:        'Mr. Okurut Charles',
  moes_id:    'UG-SSS-0234',
  students:   '1,204',
  staff:      '47',
  classes:    '24',
  stream:     'Sciences, Arts, Business',
};

export default function AdminSchool() {
  const [data, setData]     = useState(INITIAL);
  const [editMode, setEdit] = useState(false);
  const [saved, setSaved]   = useState(false);

  const set = (k: keyof typeof INITIAL) => (v: string) => setData(d => ({ ...d, [k]: v }));

  const handleSave = () => { setEdit(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <PageHeader
        title="School Profile"
        subtitle="Manage your school's identity, contact and MoES details"
        actions={[
          editMode
            ? { label: saved ? '✅ Saved!' : '💾 Save Changes', onClick: handleSave, variant: 'primary' }
            : { label: '✏️ Edit Profile', onClick: () => setEdit(true), variant: 'secondary' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* School Identity */}
        <Card>
          <CardHeader title="🏫 School Identity" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="School Name" value={data.name} onChange={set('name')} disabled={!editMode} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="School Code"  value={data.code}   onChange={set('code')}   disabled={!editMode} />
              <FormField label="Founded Year" value={data.founded} onChange={set('founded')} disabled={!editMode} />
            </div>
            <FormField label="Motto"      value={data.motto}     onChange={set('motto')}     disabled={!editMode} />
            <FormField label="Type"       value={data.type}      onChange={set('type')}      disabled={!editMode} />
            <FormField label="Ownership"  value={data.ownership} onChange={set('ownership')} disabled={!editMode} />
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader title="📞 Contact Details" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="District"  value={data.district} onChange={set('district')} disabled={!editMode} />
            <FormField label="Address"   value={data.address}  onChange={set('address')}  disabled={!editMode} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Phone"   value={data.phone}   onChange={set('phone')}   disabled={!editMode} />
              <FormField label="Email"   value={data.email}   onChange={set('email')}   disabled={!editMode} type="email" />
            </div>
            <FormField label="Website"   value={data.website} onChange={set('website')} disabled={!editMode} />
          </div>
        </Card>

        {/* Leadership */}
        <Card>
          <CardHeader title="👥 Leadership" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="Head Teacher / Principal" value={data.principal} onChange={set('principal')} disabled={!editMode} />
            <FormField label="District Education Officer (DEO)" value={data.deo} onChange={set('deo')} disabled={!editMode} />
            <FormField label="MoES School ID" value={data.moes_id} onChange={set('moes_id')} disabled={!editMode} />
          </div>
        </Card>

        {/* Key stats (read-only) */}
        <Card>
          <CardHeader title="📊 Key Statistics" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Students',     value: data.students },
              { label: 'Staff',        value: data.staff    },
              { label: 'Classes',      value: data.classes  },
              { label: 'Subjects',     value: '24'          },
              { label: 'Dormitories',  value: '6'           },
              { label: 'Streams',      value: '3'           },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '14px 8px', borderRadius: 10,
                background: '#f8fafc', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <FormField label="Science / Arts / Business Streams" value={data.stream} onChange={set('stream')} disabled={!editMode} />
          </div>
        </Card>
      </div>

      {editMode && (
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <Btn variant="primary"   onClick={handleSave}>💾 Save Changes</Btn>
          <Btn variant="secondary" onClick={() => { setData(INITIAL); setEdit(false); }}>Cancel</Btn>
        </div>
      )}
    </div>
  );
}
