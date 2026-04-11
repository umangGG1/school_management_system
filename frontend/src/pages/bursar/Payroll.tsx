import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { AlertBanner } from '../../components/ui/AlertBanner';

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
const STAFF = [
  { name:'Ssemanda Julius', role:'Head Teacher',    gross:4_200_000, tax:630_000, net:3_570_000, status:'Paid'    },
  { name:'Nakakande Mary',  role:'HOD Mathematics', gross:2_800_000, tax:420_000, net:2_380_000, status:'Paid'    },
  { name:'Byamugisha Fred', role:'Senior Teacher',  gross:2_400_000, tax:360_000, net:2_040_000, status:'Paid'    },
  { name:'Opio Grace',      role:'Class Teacher',   gross:1_900_000, tax:285_000, net:1_615_000, status:'Paid'    },
  { name:'Tumwine Robert',  role:'Lab Technician',  gross:1_600_000, tax:240_000, net:1_360_000, status:'Pending' },
  { name:'Nakato Agnes',    role:'Matron',          gross:1_400_000, tax:210_000, net:1_190_000, status:'Pending' },
];

export default function Payroll() {
  const { toast } = useToast();
  const totalNet = STAFF.reduce((a, s) => a + s.net, 0);
  return (
    <div>
      <PageHeader title="Payroll" subtitle="Monthly salary processing — PAYE tax deductions"
        actions={[
          { label: '📄 Payslips', onClick: () => toast('Payslips generated', 'info') },
          { label: '💰 Process All Pending', variant: 'primary', onClick: () => toast('All pending salaries processed ✓', 'success') },
        ]}
      />
      <AlertBanner color="info" icon="📅">
        Payroll due date: <strong>Friday 13 March</strong>. 2 staff members still have pending status. Process before the deadline to avoid delays.
      </AlertBanner>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[['Staff', STAFF.length, '#0f766e'], ['Paid', STAFF.filter(s=>s.status==='Paid').length, '#10b981'], ['Pending', STAFF.filter(s=>s.status==='Pending').length, '#f59e0b'], ['Net Payroll', `${(totalNet/1_000_000).toFixed(1)}M`, '#0f766e']].map(([l,v,c]) => (
          <div key={String(l)} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:10,padding:'12px 16px',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:800,color:c as string}}>{v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      <Card>
        <CardHeader title="👥 Payroll Register — March 2026" />
        <DataTable
          rows={STAFF}
          keyFn={(_,i)=>i}
          columns={[
            { key:'name',   header:'Staff Member', render:r=><span style={{fontWeight:700}}>{r.name}</span> },
            { key:'role',   header:'Role',         render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.role}</span> },
            { key:'gross',  header:'Gross',        render:r=><span>{fmt(r.gross)}</span> },
            { key:'tax',    header:'PAYE',         render:r=><span style={{color:'#ef4444'}}>-{fmt(r.tax)}</span> },
            { key:'net',    header:'Net Pay',      render:r=><span style={{fontWeight:700,color:'#0f766e'}}>{fmt(r.net)}</span> },
            { key:'status', header:'Status',       render:r=><Badge color={r.status==='Paid'?'green':'amber'}>{r.status}</Badge> },
            {
              key:'actions', header:'',
              render:r=>(
                r.status === 'Pending'
                  ? <Btn size="sm" variant="primary" onClick={()=>toast(`${r.name} salary processed`,'success')}>Process</Btn>
                  : <Btn size="sm" onClick={()=>toast('Payslip printed','info')}>Slip</Btn>
              ),
            },
          ]}
        />
        <div style={{marginTop:12,padding:'10px 12px',background:'#f0fdfa',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,fontWeight:700}}>Total Net Payroll</span>
          <span style={{fontSize:14,fontWeight:800,color:'#0f766e'}}>{fmt(totalNet)}</span>
        </div>
      </Card>
    </div>
  );
}
