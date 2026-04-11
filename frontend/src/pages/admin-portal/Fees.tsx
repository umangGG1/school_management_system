import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { feeStructureApi, type ApiFeeStructureItem } from '../../lib/api';

/* ─── Seed fallback ───────────────────────────────────────────────── */
const SEED_STRUCTURE = [
  { form: 'S.1', category: 'Day',      tuition: 320_000, boarding: 0,       meals: 0,       devLevy: 50_000, total: 370_000 },
  { form: 'S.1', category: 'Boarding', tuition: 320_000, boarding: 280_000, meals: 150_000, devLevy: 50_000, total: 800_000 },
  { form: 'S.2', category: 'Day',      tuition: 330_000, boarding: 0,       meals: 0,       devLevy: 50_000, total: 380_000 },
  { form: 'S.2', category: 'Boarding', tuition: 330_000, boarding: 280_000, meals: 150_000, devLevy: 50_000, total: 810_000 },
  { form: 'S.3', category: 'Day',      tuition: 350_000, boarding: 0,       meals: 0,       devLevy: 60_000, total: 410_000 },
  { form: 'S.3', category: 'Boarding', tuition: 350_000, boarding: 290_000, meals: 155_000, devLevy: 60_000, total: 855_000 },
  { form: 'S.4', category: 'Day',      tuition: 360_000, boarding: 0,       meals: 0,       devLevy: 60_000, total: 420_000 },
  { form: 'S.4', category: 'Boarding', tuition: 360_000, boarding: 290_000, meals: 155_000, devLevy: 60_000, total: 865_000 },
];

const LEVIES = [
  { name: 'Library Levy',      amount: 15_000, applies: 'All students',  status: 'active' },
  { name: 'Sports Levy',       amount: 20_000, applies: 'All students',  status: 'active' },
  { name: 'ICT Levy',          amount: 25_000, applies: 'S.3 & S.4',    status: 'active' },
  { name: 'Laboratory Levy',   amount: 30_000, applies: 'Science stream',status: 'active' },
  { name: 'UNEB Registration', amount: 85_000, applies: 'S.4 only',     status: 'active' },
  { name: 'Uniform Deposit',   amount: 45_000, applies: 'S.1 only',     status: 'active' },
  { name: 'Medical Levy',      amount: 10_000, applies: 'All students',  status: 'active' },
];

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

type FeeRow = {
  form?: string; classLevel?: string;
  category?: string;
  tuition?: number; total?: number;
  boarding?: number; meals?: number; devLevy?: number;
};

export default function AdminFees() {
  const [structure, setStructure] = useState<FeeRow[]>(SEED_STRUCTURE);
  const [offline,   setOffline]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    feeStructureApi.list('Term 1', new Date().getFullYear().toString())
      .then(items => {
        if (Array.isArray(items) && items.length) {
          setStructure(items.map(i => ({
            form: i.classLevel, category: i.category,
            tuition: i.tuition, boarding: i.boarding,
            meals: i.meals, devLevy: i.devLevy, total: i.total,
          })));
        }
        setOffline(false);
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Fee Structure"
        subtitle="Term 1 2026 — UGX rates approved by Board of Governors"
        actions={[
          { label: '✏️ Edit Structure', onClick: () => {}, variant: 'secondary' },
          { label: '📤 Export PDF',     onClick: () => {}, variant: 'primary'   },
        ]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        {/* Main table */}
        <Card>
          <CardHeader title="📋 Tuition & Boarding Structure" />
          {loading ? <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['Form', 'Category', 'Tuition', 'Boarding', 'Meals', 'Dev Levy', 'TOTAL'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Form' || h === 'Category' ? 'left' : 'right', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
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
                        <Badge variant={isBoarding ? 'blue' : 'success'} size="sm">{row.category}</Badge>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.tuition ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.boarding ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.meals ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{fmt(row.devLevy ?? 0)}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#6366f1' }}>{fmt(row.total ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Levies */}
        <Card>
          <CardHeader title="⚖️ Levies & Charges" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LEVIES.map(l => (
              <div key={l.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{l.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{l.applies}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{fmt(l.amount)}</div>
                  <Badge variant="success" size="sm">{l.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn variant="ghost" size="sm" onClick={() => {}}>+ Add Levy</Btn>
          </div>
        </Card>
      </div>

      {/* Summary */}
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { label: 'Avg Day Fee (S.1–S.4)',      value: fmt(Math.round(structure.filter(r => (r.category ?? '') === 'Day').reduce((s, r) => s + (r.total ?? 0), 0) / Math.max(structure.filter(r => (r.category ?? '') === 'Day').length, 1))) },
          { label: 'Avg Boarding Fee (S.1–S.4)', value: fmt(Math.round(structure.filter(r => (r.category ?? '') === 'Boarding').reduce((s, r) => s + (r.total ?? 0), 0) / Math.max(structure.filter(r => (r.category ?? '') === 'Boarding').length, 1))) },
          { label: 'Total Levies',               value: fmt(LEVIES.reduce((s, l) => s + l.amount, 0)) },
          { label: 'Structures Defined',          value: `${structure.length}` },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#6366f1', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
