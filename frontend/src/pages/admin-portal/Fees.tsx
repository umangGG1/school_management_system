import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { Modal }      from '../../components/ui/Modal';
import { useToast }   from '../../contexts/ToastContext';
import { feeStructureApi, type ApiFeeStructureItem } from '../../lib/api';

const SEED_STRUCTURE = [
  { id: 's1d', form: 'S.1', category: 'Day',      tuition: 320_000, boarding: 0,       meals: 0,       devLevy: 50_000, total: 370_000 },
  { id: 's1b', form: 'S.1', category: 'Boarding', tuition: 320_000, boarding: 280_000, meals: 150_000, devLevy: 50_000, total: 800_000 },
  { id: 's2d', form: 'S.2', category: 'Day',      tuition: 330_000, boarding: 0,       meals: 0,       devLevy: 50_000, total: 380_000 },
  { id: 's2b', form: 'S.2', category: 'Boarding', tuition: 330_000, boarding: 280_000, meals: 150_000, devLevy: 50_000, total: 810_000 },
  { id: 's3d', form: 'S.3', category: 'Day',      tuition: 350_000, boarding: 0,       meals: 0,       devLevy: 60_000, total: 410_000 },
  { id: 's3b', form: 'S.3', category: 'Boarding', tuition: 350_000, boarding: 290_000, meals: 155_000, devLevy: 60_000, total: 855_000 },
  { id: 's4d', form: 'S.4', category: 'Day',      tuition: 360_000, boarding: 0,       meals: 0,       devLevy: 60_000, total: 420_000 },
  { id: 's4b', form: 'S.4', category: 'Boarding', tuition: 360_000, boarding: 290_000, meals: 155_000, devLevy: 60_000, total: 865_000 },
];

type LevyRow = { name: string; amount: number; applies: string; status: string };
const DEFAULT_LEVIES: LevyRow[] = [
  { name: 'Library Levy',      amount: 15_000, applies: 'All students',   status: 'active' },
  { name: 'Sports Levy',       amount: 20_000, applies: 'All students',   status: 'active' },
  { name: 'ICT Levy',          amount: 25_000, applies: 'S.3 & S.4',     status: 'active' },
  { name: 'Laboratory Levy',   amount: 30_000, applies: 'Science stream', status: 'active' },
  { name: 'UNEB Registration', amount: 85_000, applies: 'S.4 only',      status: 'active' },
];

type FeeRow = { id?: string; form?: string; classLevel?: string; category?: string; tuition?: number; boarding?: number; meals?: number; devLevy?: number; total?: number };
const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
const EMPTY_LEVY = { name: '', amount: 0, applies: 'All students', status: 'active' };

export default function AdminFees() {
  const { toast } = useToast();
  const [structure, setStructure] = useState<FeeRow[]>(SEED_STRUCTURE);
  const [levies,    setLevies]    = useState<LevyRow[]>(DEFAULT_LEVIES);
  const [offline,   setOffline]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Edit Structure modal
  const [editOpen,  setEditOpen]  = useState(false);
  const [editRow,   setEditRow]   = useState<FeeRow | null>(null);
  const [editForm,  setEditForm]  = useState<Partial<FeeRow>>({});
  const [saving,    setSaving]    = useState(false);

  // Add Levy modal
  const [levyOpen,  setLevyOpen]  = useState(false);
  const [newLevy,   setNewLevy]   = useState(EMPTY_LEVY);

  useEffect(() => {
    setLoading(true);
    feeStructureApi.list('Term 1', new Date().getFullYear().toString())
      .then(items => {
        if (Array.isArray(items) && items.length) {
          setStructure(items.map(i => ({
            id: i.id, form: i.classLevel, category: i.category,
            tuition: i.tuition, boarding: i.boarding,
            meals: i.meals, devLevy: i.devLevy, total: i.total,
          })));
        }
        setOffline(false);
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (row: FeeRow) => {
    setEditRow(row);
    setEditForm({ tuition: row.tuition, boarding: row.boarding, meals: row.meals, devLevy: row.devLevy });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    const newTotal = (editForm.tuition ?? 0) + (editForm.boarding ?? 0) + (editForm.meals ?? 0) + (editForm.devLevy ?? 0);
    const updated = { ...editForm, total: newTotal };
    try {
      if (editRow.id && !editRow.id.startsWith('s')) {
        await feeStructureApi.update(editRow.id, { ...updated, classLevel: editRow.form, category: editRow.category } as Partial<ApiFeeStructureItem>);
      }
      setStructure(prev => prev.map(r => r.id === editRow.id ? { ...r, ...updated } : r));
      toast('Fee structure updated', 'success');
    } catch {
      setStructure(prev => prev.map(r => r.id === editRow.id ? { ...r, ...updated } : r));
      toast('Updated (offline)', 'info');
    } finally { setSaving(false); setEditOpen(false); setEditRow(null); }
  };

  const handleExportPDF = () => {
    const rows = [['Form','Category','Tuition','Boarding','Meals','Dev Levy','Total'],
      ...structure.map(r => [r.form ?? r.classLevel ?? '', r.category ?? '', r.tuition ?? 0, r.boarding ?? 0, r.meals ?? 0, r.devLevy ?? 0, r.total ?? 0])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'smissi_fee_structure.csv'; a.click();
    toast('Fee structure exported', 'success');
  };

  const handleAddLevy = async () => {
    if (!newLevy.name.trim()) return;
    setLevies(prev => [...prev, { ...newLevy }]);
    toast(`Levy "${newLevy.name}" added`, 'success');
    setLevyOpen(false); setNewLevy(EMPTY_LEVY);
  };

  return (
    <div>
      <PageHeader
        title="Fee Structure"
        subtitle="Term 1 2026 — UGX rates approved by Board of Governors"
        actions={[
          { label: '✏️ Edit Structure', onClick: () => { if (structure[0]) openEdit(structure[0]); }, variant: 'secondary' },
          { label: '📤 Export CSV',     onClick: handleExportPDF, variant: 'primary' },
        ]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        <Card>
          <CardHeader title="📋 Tuition & Boarding Structure" />
          {loading ? <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['Form', 'Category', 'Tuition', 'Boarding', 'Meals', 'Dev Levy', 'TOTAL', ''].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Form' || h === 'Category' || h === '' ? 'left' : 'right', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {structure.map((row, i) => {
                  const form = row.form ?? row.classLevel ?? '—';
                  const isBoarding = (row.category ?? '') === 'Boarding';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc', background: isBoarding ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '10px 10px', fontWeight: 700, color: '#1e293b' }}>{form}</td>
                      <td style={{ padding: '10px 10px' }}>
                        <Badge color={isBoarding ? 'blue' : 'green'}>{row.category}</Badge>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.tuition ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.boarding ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.meals ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.devLevy ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#6366f1' }}>{fmt(row.total ?? 0)}</td>
                      <td style={{ padding: '10px 10px' }}>
                        <Btn variant="ghost" size="sm" onClick={() => openEdit(row)}>Edit</Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeader title="⚖️ Levies & Charges" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {levies.map(l => (
              <div key={l.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{l.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{l.applies}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{fmt(l.amount)}</div>
                  <Badge color="green">{l.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn variant="ghost" size="sm" onClick={() => setLevyOpen(true)}>+ Add Levy</Btn>
          </div>
        </Card>
      </div>

      {/* Edit Row Modal */}
      <Modal id="edit-fee" open={editOpen} onClose={() => setEditOpen(false)} title={`✏️ Edit ${editRow?.form} ${editRow?.category} Fees`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(['tuition','boarding','meals','devLevy'] as const).map(key => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'capitalize' }}>{key === 'devLevy' ? 'Dev Levy' : key} (UGX)</label>
              <input type="number" value={editForm[key] ?? 0}
                onChange={e => setEditForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ padding: '8px 12px', borderRadius: 8, background: '#f0fdf4', fontSize: 12, fontWeight: 700, color: '#15803d' }}>
            Total: {fmt((editForm.tuition ?? 0) + (editForm.boarding ?? 0) + (editForm.meals ?? 0) + (editForm.devLevy ?? 0))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" size="sm" onClick={() => setEditOpen(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save'}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Add Levy Modal */}
      <Modal id="add-levy" open={levyOpen} onClose={() => setLevyOpen(false)} title="⚖️ Add Levy" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['Levy Name', 'name', 'text'], ['Amount (UGX)', 'amount', 'number'], ['Applies To', 'applies', 'text']].map(([label, key, type]) => (
            <div key={key as string}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
              <input type={type as string} value={(newLevy as any)[key as string]}
                onChange={e => setNewLevy(f => ({ ...f, [key as string]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" size="sm" onClick={() => setLevyOpen(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={handleAddLevy}>Add Levy</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
