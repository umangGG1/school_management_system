import { useNavigate } from 'react-router-dom';
import { StatCard }    from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AlertBanner } from '../../components/ui/AlertBanner';

const fmt = (n: number) => `UGX ${(n / 1_000_000).toFixed(2)}M`;

const FEE_ROWS = [
  { cls: 'S1', students: 278, expected: 83_400_000, collected: 72_318_000 },
  { cls: 'S2', students: 234, expected: 70_200_000, collected: 57_564_000 },
  { cls: 'S3', students: 214, expected: 64_200_000, collected: 46_224_000 },
  { cls: 'S4', students: 248, expected: 74_400_000, collected: 59_520_000 },
  { cls: 'S5', students: 91,  expected: 27_300_000, collected: 24_570_000 },
  { cls: 'S6', students: 142, expected: 42_600_000, collected: 38_340_000 },
];

const totalExpected  = FEE_ROWS.reduce((a, r) => a + r.expected,  0);
const totalCollected = FEE_ROWS.reduce((a, r) => a + r.collected, 0);
const totalArrears   = totalExpected - totalCollected;
const collPct        = Math.round((totalCollected / totalExpected) * 100);

export default function BursarDashboard() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0d5c57 0%,#0f766e 55%,#0ea5e9 100%)',
        borderRadius: 12, padding: '20px 24px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Finance Office — Term 1 Overview 💰</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 3, marginBottom: 10 }}>SMISSI Senior Secondary · Sat 07 Mar 2026</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[`✅ ${collPct}% collected`, '⚠️ 7 defaulters', '🧾 2 invoices overdue', '📅 Payroll due Fri 13 Mar'].map(c => (
              <span key={c} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {[[fmt(totalCollected), 'Collected'], [fmt(totalArrears), 'Arrears'], ['87', 'Payroll Staff'], ['6', 'Classes']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <Btn variant="primary" onClick={() => navigate('/bursar/fees')}>💳 Receive Payment</Btn>
        <Btn onClick={() => navigate('/bursar/arrears')}>⚠️ Arrears</Btn>
        <Btn onClick={() => navigate('/bursar/expenses')}>📤 Record Expense</Btn>
        <Btn onClick={() => navigate('/bursar/invoices')}>🧾 Invoices</Btn>
        <Btn variant="dark" onClick={() => navigate('/bursar/payroll')}>👥 Process Payroll</Btn>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard icon="💰" value={fmt(totalCollected)} title="Fees Collected"  accent="teal"  trend={`${collPct}%`} trendType="up"   onClick={() => navigate('/bursar/fees')}    />
        <StatCard icon="⚠️" value={fmt(totalArrears)}   title="Outstanding"    accent="amber" trend="7 defaulters"                   onClick={() => navigate('/bursar/arrears')}  />
        <StatCard icon="📤" value="UGX 28.3M"           title="Expenses (Term)" accent="orange" trend="YTD"                          onClick={() => navigate('/bursar/expenses')} />
        <StatCard icon="👥" value="87"                  title="Payroll Staff"  accent="purple" trend="Fri 13 Mar"                    onClick={() => navigate('/bursar/payroll')}  />
      </div>

      <AlertBanner color="danger" icon="🧾">
        <strong>2 invoices are overdue:</strong> Ngoma Construction Works (UGX 8.5M — due 12 Mar) and Mbale Book Distributors (UGX 6.8M — due 10 Mar). Approve payments urgently.
      </AlertBanner>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Fee collection by class */}
        <Card>
          <CardHeader title="💳 Fee Collection by Class — Term 1" action={<Btn size="sm" onClick={() => navigate('/bursar/fees')}>Full report →</Btn>} />
          {FEE_ROWS.map(r => {
            const pct = Math.round((r.collected / r.expected) * 100);
            return (
              <div key={r.cls} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Class {r.cls} — {r.students} students</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>{fmt(r.collected)} / {fmt(r.expected)} ({pct}%)</span>
                </div>
                <ProgressBar label="" value="" pct={pct} color={pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red'} />
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#0f766e' }}>{fmt(totalCollected)} / {fmt(totalExpected)} ({collPct}%)</span>
          </div>
        </Card>

        {/* Recent transactions + top defaulters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader title="⚠️ Top Defaulters" action={<Btn size="sm" onClick={() => navigate('/bursar/arrears')}>All →</Btn>} />
            {[
              { name: 'Auma Gloria',     cls: 'S4B', balance: 1_850_000, days: 81 },
              { name: 'Nakibuule Sarah', cls: 'S5A', balance: 1_275_000, days: 68 },
              { name: 'Okwir James',     cls: 'S3A', balance: 950_000,   days: 72 },
            ].map(d => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{d.cls} · {d.days} days overdue</div>
                </div>
                <Badge color="red">{fmt(d.balance)}</Badge>
              </div>
            ))}
          </Card>

          <Card>
            <CardHeader title="📊 Budget Snapshot" />
            <ProgressBar label="Fees collected"  value={`${collPct}%`} pct={collPct} color="teal" />
            <ProgressBar label="Expenses vs budget" value="62%"         pct={62}      color="orange" />
            <ProgressBar label="Payroll disbursed"  value="84%"         pct={84}      color="green" />
          </Card>
        </div>
      </div>
    </div>
  );
}
