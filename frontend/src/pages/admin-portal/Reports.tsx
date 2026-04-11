import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { adminReportsApi, type ApiReport } from '../../lib/api';
import { ProgressBar } from '../../components/ui/ProgressBar';

/* ─── Seed fallback ───────────────────────────────────────────────── */
const SEED_REPORTS: ApiReport[] = [
  { id: 'RPT-001', name: 'Term 1 Fee Collection',         type: 'finance',  generatedAt: null, size: null,      status: 'pending' },
  { id: 'RPT-002', name: 'Staff Attendance Report',       type: 'hr',       generatedAt: null, size: null,      status: 'pending' },
  { id: 'RPT-003', name: 'Student Academic Results S.4',  type: 'academic', generatedAt: null, size: null,      status: 'pending' },
  { id: 'RPT-004', name: 'Welfare & Counselling Summary', type: 'welfare',  generatedAt: null, size: null,      status: 'pending' },
  { id: 'RPT-005', name: 'MoES EMIS Submission (Term 1)',type: 'moes',     generatedAt: null, size: null,      status: 'pending' },
  { id: 'RPT-006', name: 'Annual Budget Variance',        type: 'finance',  generatedAt: null, size: null,      status: 'pending' },
];

const TYPE_MAP: Record<string, 'indigo' | 'green' | 'blue' | 'amber' | 'teal'> = {
  finance: 'green', hr: 'blue', academic: 'indigo', welfare: 'teal', moes: 'amber',
};

const KPI = [
  { label: 'Attendance Rate',     val: 87, color: '#6366f1' as const },
  { label: 'Fee Collection',      val: 83, color: '#10b981' as const },
  { label: 'Curriculum Coverage', val: 72, color: '#3b82f6' as const },
  { label: 'Boarding Capacity',   val: 91, color: '#f59e0b' as const },
];

export default function AdminReports() {
  const [reports,    setReports]    = useState<ApiReport[]>(SEED_REPORTS);
  const [loading,    setLoading]    = useState(false);
  const [offline,    setOffline]    = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    adminReportsApi.list()
      .then(r => { setReports(r); setOffline(false); })
      .catch(() => setOffline(true));
  }, []);

  const handleGenerate = async (report: ApiReport) => {
    setGenerating(report.id);
    try {
      const updated = await adminReportsApi.generate({ type: report.type, term: 'Term 1', format: 'PDF' });
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, ...updated, status: 'ready' } : r));
    } catch {
      // Optimistic update when backend offline
      setReports(prev => prev.map(r => r.id === report.id
        ? { ...r, status: 'ready', generatedAt: new Date().toISOString(), size: '2.1 MB' }
        : r));
    } finally {
      setGenerating(null);
    }
  };

  const fmt = (iso: string | null) => iso
    ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="System-wide reports — finance, academics, welfare & MoES"
        actions={[
          { label: '📤 Export All', onClick: () => {}, variant: 'secondary' },
        ]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
        {/* Report list */}
        <Card>
          <CardHeader title="📋 Available Reports" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{r.name}</span>
                    <Badge variant={TYPE_MAP[r.type] ?? 'indigo'} size="sm">{r.type}</Badge>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    {r.id} · Generated: {fmt(r.generatedAt)} {r.size ? `· ${r.size}` : ''}
                  </div>
                </div>
                {r.status === 'ready' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn variant="primary" size="sm" onClick={() => {}}>📥 Download</Btn>
                    <Btn variant="ghost"   size="sm" onClick={() => {}}>View</Btn>
                  </div>
                ) : (
                  <Btn variant="secondary" size="sm" disabled={generating === r.id} onClick={() => handleGenerate(r)}>
                    {generating === r.id ? '⏳ Generating…' : '⚡ Generate'}
                  </Btn>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* KPI panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader title="📊 School KPIs" />
            {KPI.map(k => (
              <div key={k.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{k.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: k.color }}>{k.val}%</span>
                </div>
                <ProgressBar value={String(k.val)} pct={k.val} label="" color="teal" />
              </div>
            ))}
          </Card>

          <Card>
            <CardHeader title="📅 Scheduled Reports" />
            {[
              { name: 'MoES Monthly',   freq: 'Monthly', next: 'Apr 01' },
              { name: 'Finance Digest', freq: 'Weekly',  next: 'Mar 14' },
              { name: 'Staff Summary',  freq: 'Monthly', next: 'Apr 01' },
            ].map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.freq}</div>
                </div>
                <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{s.next}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
