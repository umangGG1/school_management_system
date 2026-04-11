import { useState, useEffect } from 'react';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { FormField }   from '../../components/ui/FormField';
import { schoolApi, type ApiSchool, type UpdateSchoolPayload } from '../../lib/api';

/* ─── Seed / fallback ─────────────────────────────────────────────── */
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

type Draft = UpdateSchoolPayload;

export default function AdminSchool() {
  const [school,   setSchool]   = useState<ApiSchool>(SEED);
  const [draft,    setDraft]    = useState<Draft>({});
  const [editMode, setEdit]     = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [offline,  setOffline]  = useState(false);
  const [toast,    setToast]    = useState<string | null>(null);

  useEffect(() => {
    schoolApi.get()
      .then(s => { setSchool(s); setOffline(false); })
      .catch(() => setOffline(true));
  }, []);

  const val = (k: keyof Draft): string =>
    (editMode ? (draft[k] ?? school[k as keyof ApiSchool]) : school[k as keyof ApiSchool]) as string ?? '';

  const set = (k: keyof Draft) => (v: string) =>
    setDraft(d => ({ ...d, [k]: v }));

  const handleEdit = () => {
    setDraft({});
    setEdit(true);
  };

  const handleCancel = () => {
    setDraft({});
    setEdit(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await schoolApi.update(draft);
      setSchool(updated);
      showToast('✅ School profile saved successfully!');
      setOffline(false);
    } catch {
      // Offline — apply draft locally
      setSchool(prev => ({ ...prev, ...draft }));
      showToast('⚠️ Saved locally (backend offline)');
    } finally {
      setSaving(false);
      setEdit(false);
      setDraft({});
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="School Profile"
        subtitle="Manage your school's identity, contact and MoES details"
        actions={[
          editMode
            ? { label: saving ? '⏳ Saving…' : '💾 Save Changes', onClick: handleSave, variant: 'primary' }
            : { label: '✏️ Edit Profile', onClick: handleEdit, variant: 'secondary' },
        ]}
      />

      {/* Toasts & banners */}
      {toast && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, color: '#15803d' }}>
          {toast}
        </div>
      )}
      {offline && !toast && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data. Changes will be applied locally only.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* School Identity */}
        <Card>
          <CardHeader title="🏫 School Identity" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="School Name"  value={val('name')}        onChange={set('name')}        disabled={!editMode} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="School Code"  value={val('code')}       onChange={set('code')}        disabled={!editMode} />
              <FormField label="Founded Year" value={val('foundedYear')} onChange={set('foundedYear')} disabled={!editMode} />
            </div>
            <FormField label="Motto"      value={val('motto')}      onChange={set('motto')}      disabled={!editMode} />
            <FormField label="Type"       value={val('type')}       onChange={set('type')}       disabled={!editMode} />
            <FormField label="Ownership"  value={val('ownership')}  onChange={set('ownership')}  disabled={!editMode} />
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader title="📞 Contact Details" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="District"  value={val('district')} onChange={set('district')} disabled={!editMode} />
            <FormField label="Address"   value={val('address')}  onChange={set('address')}  disabled={!editMode} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Phone"   value={val('phone')}    onChange={set('phone')}    disabled={!editMode} />
              <FormField label="Email"   value={val('email')}    onChange={set('email')}    disabled={!editMode} type="email" />
            </div>
            <FormField label="Website"   value={val('website')}  onChange={set('website')}  disabled={!editMode} />
          </div>
        </Card>

        {/* Leadership */}
        <Card>
          <CardHeader title="👥 Leadership" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="Head Teacher / Principal"        value={val('principalName')} onChange={set('principalName')} disabled={!editMode} />
            <FormField label="District Education Officer (DEO)" value={val('deoName')}      onChange={set('deoName')}       disabled={!editMode} />
            <FormField label="MoES School ID"                  value={val('moesId')}       onChange={set('moesId')}        disabled={!editMode} />
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
            <FormField label="Streams" value={val('streams')} onChange={set('streams')} disabled={!editMode} />
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
