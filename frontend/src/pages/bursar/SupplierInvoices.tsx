import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { AlertBanner } from '../../components/ui/AlertBanner';

const fmt = (n: number) => `UGX ${(n / 1_000_000).toFixed(2)}M`;
const INVOICES = [
  { supplier:'Mbale Book Distributors',  amount:6_800_000,  due:'10 Mar', status:'Pending', items:'Textbooks — S3 & S4 (200 copies)' },
  { supplier:'Kampala Lab Supplies Ltd', amount:3_200_000,  due:'15 Mar', status:'Pending', items:'Chemistry reagents, glassware' },
  { supplier:'Ngoma Construction Works', amount:8_500_000,  due:'12 Mar', status:'Overdue', items:'Dormitory roof repair' },
  { supplier:'Fresh Farm Foods Uganda',  amount:14_200_000, due:'08 Mar', status:'Paid',    items:'Term 1 Wk 6-8 catering supply' },
  { supplier:'URA — VAT Return',         amount:2_100_000,  due:'28 Feb', status:'Paid',    items:'Q4 2025 VAT filing' },
];
const statusColor = { Pending:'amber', Overdue:'red', Paid:'green' } as const;

export default function SupplierInvoices() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Supplier Invoices" subtitle="Track purchases, approvals, and payments to vendors"
        actions={[
          { label: '📄 Export', onClick: () => toast('Invoices exported', 'info') },
          { label: '➕ Add Invoice', variant: 'primary', onClick: () => toast('Invoice form opened', 'info') },
        ]}
      />
      <AlertBanner color="danger" icon="🧾">
        <strong>1 overdue invoice:</strong> Ngoma Construction Works — UGX 8.5M overdue since 12 Mar. Authorize payment immediately.
      </AlertBanner>
      <Card>
        <DataTable
          rows={INVOICES}
          keyFn={(_,i)=>i}
          columns={[
            { key:'supplier', header:'Supplier',    render:r=><span style={{fontWeight:700}}>{r.supplier}</span> },
            { key:'items',    header:'Description', render:r=><span style={{color:'#64748b',fontSize:11}}>{r.items}</span> },
            { key:'amount',   header:'Amount',      render:r=><span style={{fontWeight:700,color:'#0f766e'}}>{fmt(r.amount)}</span> },
            { key:'due',      header:'Due Date',    render:r=><span style={{fontSize:11}}>{r.due}</span> },
            { key:'status',   header:'Status',      render:r=><Badge color={statusColor[r.status as keyof typeof statusColor]??'gray'}>{r.status}</Badge> },
            {
              key:'actions', header:'',
              render:r=>(
                <div style={{display:'flex',gap:6}}>
                  {r.status !== 'Paid' && <Btn size="sm" variant="primary" onClick={()=>toast(`Payment authorized for ${r.supplier}`,'success')}>💳 Pay</Btn>}
                  <Btn size="sm" onClick={()=>toast(`${r.supplier} invoice viewed`,'info')}>View</Btn>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
