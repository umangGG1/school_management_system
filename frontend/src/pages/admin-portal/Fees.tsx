import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const FEE_STRUCTURE = [
  { form: 'S.1', category: 'Day',      tution: 320_000, boarding: 0,         meals: 0,         dev: 50_000, total: 370_000 },
  { form: 'S.1', category: 'Boarding', tution: 320_000, boarding: 280_000,   meals: 150_000,   dev: 50_000, total: 800_000 },
  { form: 'S.2', category: 'Day',      tution: 330_000, boarding: 0,         meals: 0,         dev: 50_000, total: 380_000 },
  { form: 'S.2', category: 'Boarding', tution: 330_000, boarding: 280_000,   meals: 150_000,   dev: 50_000, total: 810_000 },
  { form: 'S.3', category: 'Day',      tution: 350_000, boarding: 0,         meals: 0,         dev: 60_000, total: 410_000 },
  { form: 'S.3', category: 'Boarding', tution: 350_000, boarding: 290_000,   meals: 155_000,   dev: 60_000, total: 855_000 },
  { form: 'S.4', category: 'Day',      tution: 360_000, boarding: 0,         meals: 0,         dev: 60_000, total: 420_000 },
  { form: 'S.4', category: 'Boarding', tution: 360_000, boarding: 290_000,   meals: 155_000,   dev: 60_000, total: 865_000 },
];

const LEVIES = [
  { name: 'Library Levy',        amount: 15_000, applies: 'All students', status: 'active' },
  { name: 'Sports Levy',         amount: 20_000, applies: 'All students', status: 'active' },
  { name: 'ICT Levy',            amount: 25_000, applies: 'S.3 & S.4',   status: 'active' },
  { name: 'Laboratory Levy',     amount: 30_000, applies: 'Science stream',status: 'active' },
  { name: 'UNEB Registration',   amount: 85_000, applies: 'S.4 only',     status: 'active' },
  { name: 'Uniform Deposit',     amount: 45_000, applies: 'S.1 only',     status: 'active' },
  { name: 'Medical Levy',        amount: 10_000, applies: 'All students', status: 'active' },
];

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;

export default function AdminFees() {
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

      {/* Main fee table */}
      <Card>
        <CardHeader title="📋 Tuition & Boarding Schedule" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                {['Form','Category','Tuition','Boarding','Meals','Dev Levy','Total / Term'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Category' || h === 'Form' ? 'left' : 'right', color: '#64748b', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEE_STRUCTURE.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafbfc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>{f.form}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge variant={f.category === 'Day' ? 'blue' : 'indigo'} size="sm">
                      {f.category === 'Day' ? '☀️ Day' : '🏠 Boarding'}
                    </Badge>
                  </td>
                  {[f.tution, f.boarding, f.meals, f.dev].map((v, idx) => (
                    <td key={idx} style={{ padding: '10px 12px', textAlign: 'right', color: v === 0 ? '#cbd5e1' : '#1e293b' }}>
                      {v === 0 ? '—' : fmt(v)}
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#6366f1', fontSize: 13 }}>
                    {fmt(f.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Additional levies */}
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        <Card>
          <CardHeader title="📦 Additional Levies" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Levy','Amount','Applies To','Status'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Amount' ? 'right' : 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEVIES.map(l => (
                <tr key={l.name} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: '#1e293b' }}>{l.name}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#6366f1' }}>{fmt(l.amount)}</td>
                  <td style={{ padding: '9px 10px', color: '#64748b' }}>{l.applies}</td>
                  <td style={{ padding: '9px 10px' }}>
                    <Badge variant="success" size="sm">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="💰 Collection Summary" />
          {[
            { label: 'Target (Term 1)',  value: 'UGX 92.4M', color: '#1e293b'  },
            { label: 'Collected',        value: 'UGX 77.2M', color: '#10b981'  },
            { label: 'Outstanding',      value: 'UGX 15.2M', color: '#ef4444'  },
            { label: 'Collection Rate',  value: '83.5%',     color: '#6366f1'  },
            { label: 'Defaulters',       value: '38 students',color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <Btn variant="primary" size="sm" onClick={() => {}}>View Fee Reports →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
