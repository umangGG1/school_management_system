import { useState }   from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const CLASSES = ['S4A', 'S5A', 'S3B', 'S6A', 'S4B'];

type AttStatus = 'present' | 'absent' | 'late';

interface AttRow { name: string; reg: string; status: AttStatus; }

const BASE_STUDENTS: AttRow[] = [
  { name: 'Akello Rose',      reg: 'S4A/001', status: 'present' },
  { name: 'Byamugisha Peter', reg: 'S4A/002', status: 'present' },
  { name: 'Chebet Sarah',     reg: 'S4A/003', status: 'absent'  },
  { name: 'Ddungu Moses',     reg: 'S4A/004', status: 'present' },
  { name: 'Ezati John',       reg: 'S4A/005', status: 'present' },
  { name: 'Farida Amina',     reg: 'S4A/006', status: 'present' },
  { name: 'Gatete Sam',       reg: 'S4A/007', status: 'absent'  },
  { name: 'Harriet Nakato',   reg: 'S4A/008', status: 'present' },
  { name: 'Ismail Karim',     reg: 'S4A/009', status: 'present' },
  { name: 'Jjuuko Fred',      reg: 'S4A/010', status: 'late'    },
];

const statusColor = { present: 'green', absent: 'red', late: 'amber' } as const;

export default function Attendance() {
  const { toast }    = useToast();
  const [cls, setCls]    = useState('S4A');
  const [rows, setRows]  = useState<AttRow[]>(BASE_STUDENTS);
  const [date]           = useState('Sat 07 Mar 2026');

  const toggle = (idx: number) => {
    setRows(r => r.map((row, i) => i !== idx ? row : {
      ...row,
      status: row.status === 'present' ? 'absent' : row.status === 'absent' ? 'late' : 'present',
    }));
  };

  const present = rows.filter(r => r.status === 'present').length;
  const absent  = rows.filter(r => r.status === 'absent').length;
  const late    = rows.filter(r => r.status === 'late').length;
  const pct     = Math.round((present / rows.length) * 100);

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle={`${cls} · ${date}`}
        actions={[{ label: '💾 Save Attendance', variant: 'primary', onClick: () => toast('Attendance saved ✓', 'success') }]}
      />

      {/* Class selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {CLASSES.map(c => (
          <button key={c} onClick={() => setCls(c)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: cls === c ? '#2563eb' : '#f8fafc',
            color: cls === c ? '#fff' : '#1e293b',
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
          }}>{c}</button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[['✅ Present', present, '#10b981'], ['❌ Absent', absent, '#ef4444'], ['⏰ Late', late, '#f59e0b'], [`${pct}%`, 'Rate', '#2563eb']].map(([l, v, c]) => (
          <div key={String(l)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title={`${cls} — Register · ${date}`} action={
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn size="sm" onClick={() => setRows(r => r.map(row => ({ ...row, status: 'present' })))}>Mark All Present</Btn>
            <Btn size="sm" variant="danger" onClick={() => toast('Attendance exported', 'info')}>📄 Export</Btn>
          </div>
        } />
        <DataTable
          rows={rows}
          keyFn={(r, i) => i}
          columns={[
            { key: 'reg',  header: '#',       render: (_, i) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{i + 1}</span>, width: '40px' },
            { key: 'name', header: 'Student', render: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
            { key: 'reg',  header: 'Reg No',  render: r => <span style={{ color: '#64748b' }}>{r.reg}</span> },
            {
              key: 'status', header: 'Status',
              render: (r, i) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge color={statusColor[r.status]}>{r.status}</Badge>
                  <Btn size="sm" onClick={() => toggle(i)}>Toggle</Btn>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
