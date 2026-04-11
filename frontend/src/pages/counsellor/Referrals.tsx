import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const REFERRALS = [
  { student:'Opio James',   cls:'S5A', type:'GP — Mental Health',     to:'Dr. Lubega (Mukono Health Centre)', st:'Pending GP appt',  date:'04 Mar' },
  { student:'Auma Gloria',  cls:'S4B', type:'DHM — Bullying escalation',to:'Deputy Head Mistress',            st:'Awaiting DHM action',date:'05 Mar' },
  { student:'Birungi Agnes',cls:'S3B', type:'Social Worker',           to:'District Social Welfare Office',   st:'Completed',        date:'20 Feb' },
  { student:'Chebet Sarah', cls:'S4A', type:'Parent meeting requested', to:'Parent/Guardian',                 st:'Meeting Sat 14 Mar',date:'03 Mar' },
];
const stColor = { 'Pending GP appt':'amber', 'Awaiting DHM action':'red', 'Completed':'green', 'Meeting Sat 14 Mar':'blue' } as const;

export default function Referrals() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Referrals" subtitle={`${REFERRALS.filter(r=>r.st!=='Completed').length} open referrals`}
        actions={[{ label:'➕ Create Referral', variant:'primary', onClick:()=>toast('Referral form opened','info') }]}
      />
      <Card>
        <DataTable rows={REFERRALS} keyFn={(_,i)=>i} columns={[
          { key:'student', header:'Student',    render:r=><span style={{fontWeight:700}}>{r.student}</span>                                 },
          { key:'cls',     header:'Class',      render:r=><Badge color="teal">{r.cls}</Badge>                                               },
          { key:'type',    header:'Referral Type',render:r=><span style={{fontWeight:600}}>{r.type}</span>                                  },
          { key:'to',      header:'Referred To', render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.to}</span>                      },
          { key:'date',    header:'Date',        render:r=><span style={{fontSize:11,color:'#94a3b8'}}>{r.date}</span>                    },
          { key:'st',      header:'Status',      render:r=><Badge color={stColor[r.st as keyof typeof stColor]??'gray'}>{r.st}</Badge>    },
          {
            key:'actions', header:'',
            render:r=>(
              <div style={{display:'flex',gap:6}}>
                <Btn size="sm" onClick={()=>toast(`${r.student} referral updated`,'info')}>Update</Btn>
                {r.st !== 'Completed' && <Btn size="sm" variant="success" onClick={()=>toast(`${r.student} referral closed`,'success')}>Close</Btn>}
              </div>
            ),
          },
        ]} />
      </Card>
    </div>
  );
}
