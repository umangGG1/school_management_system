import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const fmt = (n: number) => `UGX ${n.toLocaleString()}`;
const EXPENSES = [
  { date:'06 Mar', cat:'Utilities',    desc:'Uganda National Water (March)',     amount:1_800_000, approved:true,  req:'REQ-2026-081' },
  { date:'05 Mar', cat:'Supplies',     desc:'Science lab chemicals restock',     amount:3_200_000, approved:true,  req:'REQ-2026-080' },
  { date:'04 Mar', cat:'Maintenance',  desc:'Dormitory roof repair — Block C',   amount:8_500_000, approved:true,  req:'REQ-2026-079' },
  { date:'03 Mar', cat:'Salaries',     desc:'February payroll disbursement',     amount:87_400_000,approved:true,  req:'REQ-2026-078' },
  { date:'01 Mar', cat:'Catering',     desc:'Food supplies — Term 1 Week 7',    amount:12_600_000,approved:false, req:'REQ-2026-077' },
  { date:'28 Feb', cat:'Transport',    desc:'Staff transport allowance — Feb',   amount:4_200_000, approved:true,  req:'REQ-2026-076' },
];

const catColor: Record<string,'blue'|'purple'|'orange'|'teal'|'green'|'amber'> = {
  Utilities:'blue', Supplies:'purple', Maintenance:'orange', Salaries:'teal', Catering:'green', Transport:'amber',
};

export default function Expenses() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Expenses" subtitle="Term 1 expenditure log"
        actions={[
          { label: '📄 Export', onClick: () => toast('Expenses exported', 'info') },
          { label: '➕ Record Expense', variant: 'primary', onClick: () => toast('Expense form opened', 'info') },
        ]}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
        {[['Total This Term', fmt(EXPENSES.reduce((a,e)=>a+e.amount,0)), '#0f766e'], ['Approved', EXPENSES.filter(e=>e.approved).length, '#10b981'], ['Pending Approval', EXPENSES.filter(e=>!e.approved).length, '#f59e0b']].map(([l,v,c]) => (
          <div key={String(l)} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:10,padding:'12px 16px',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:800,color:c as string}}>{v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      <Card>
        <DataTable
          rows={EXPENSES}
          keyFn={(_,i)=>i}
          columns={[
            { key:'date',     header:'Date',       render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.date}</span> },
            { key:'req',      header:'Req No',     render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.req}</span> },
            { key:'cat',      header:'Category',   render:r=><Badge color={catColor[r.cat]??'blue'}>{r.cat}</Badge> },
            { key:'desc',     header:'Description',render:r=><span style={{fontWeight:600}}>{r.desc}</span> },
            { key:'amount',   header:'Amount',     render:r=><span style={{fontWeight:700,color:'#0f766e'}}>{fmt(r.amount)}</span> },
            { key:'approved', header:'Status',     render:r=><Badge color={r.approved?'green':'amber'}>{r.approved?'Approved':'Pending'}</Badge> },
            {
              key:'actions',header:'',
              render:r=>(
                <div style={{display:'flex',gap:6}}>
                  {!r.approved && <Btn size="sm" variant="primary" onClick={()=>toast(`${r.req} approved`,'success')}>Approve</Btn>}
                  <Btn size="sm" onClick={()=>toast(`${r.req} viewed`,'info')}>View</Btn>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
