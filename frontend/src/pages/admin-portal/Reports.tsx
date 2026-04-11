import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { ProgressBar } from '../../components/ui/ProgressBar';

const REPORTS = [
  { id:'RPT-001', name:'Term 1 Fee Collection', type:'finance', generated:'Mar 07 09:00', size:'2.1 MB', status:'ready' },
  { id:'RPT-002', name:'Staff Attendance Report', type:'hr',    generated:'Mar 06 17:00', size:'0.8 MB', status:'ready' },
  { id:'RPT-003', name:'Student Academic Results S.4', type:'academic',generated:'Mar 06 15:30',size:'3.4 MB',status:'ready'},
  { id:'RPT-004', name:'Welfare & Counselling Summary', type:'welfare', generated:'Mar 05',size:'1.2 MB',status:'ready'},
  { id:'RPT-005', name:'MoES EMIS Submission (Term 1)', type:'moes', generated:'Pending',size:'—',status:'pending'},
  { id:'RPT-006', name:'Annual Budget Variance', type:'finance', generated:'Feb 28',size:'4.7 MB',status:'ready'},
];

const TYPE_MAP: Record<string,'indigo'|'green'|'blue'|'amber'|'teal'> = {
  finance:'green', hr:'blue', academic:'indigo', welfare:'teal', moes:'amber',
};

const KPI = [
  { label:'Attendance Rate',    val:87, color:'#6366f1' },
  { label:'Fee Collection',     val:83, color:'#10b981' },
  { label:'Curriculum Coverage',val:72, color:'#3b82f6' },
  { label:'Boarding Capacity',  val:91, color:'#f59e0b' },
];

export default function AdminReports() {
  const [generating, setGenerating] = useState(false);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="System-wide reports — finance, academics, welfare & MoES"
        actions={[
          { label: generating ? '⏳ Generating…' : '⚡ Generate New', onClick: () => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }, variant: 'primary' },
          { label: '📤 Export All', onClick: () => {}, variant: 'secondary' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
        {/* Report list */}
        <Card>
          <CardHeader title="📋 Available Reports" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REPORTS.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{r.name}</span>
                    <Badge variant={TYPE_MAP[r.type]} size="sm">{r.type}</Badge>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    {r.id} · Generated: {r.generated} · {r.size}
                  </div>
                </div>
                {r.status === 'ready' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn variant="primary" size="sm" onClick={() => {}}>📥 Download</Btn>
                    <Btn variant="ghost"   size="sm" onClick={() => {}}>View</Btn>
                  </div>
                ) : (
                  <Badge variant="amber" size="sm">⏳ Pending</Badge>
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
                <ProgressBar value={k.val} max={100} color={k.color} />
              </div>
            ))}
          </Card>

          <Card>
            <CardHeader title="📅 Scheduled Reports" />
            {[
              { name: 'MoES Monthly',    freq: 'Monthly',  next: 'Apr 01' },
              { name: 'Finance Digest',  freq: 'Weekly',   next: 'Mar 14' },
              { name: 'Staff Summary',   freq: 'Monthly',  next: 'Apr 01' },
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
