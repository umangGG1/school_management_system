import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const STUDENTS = [
  { name:'Nakibuule Sarah', cls:'S5A', issue:'Academic stress / exam anxiety', sessions:4, status:'active',  risk:'moderate', last:'07 Mar' },
  { name:'Auma Gloria',     cls:'S4B', issue:'Bullying — suspected victim',    sessions:2, status:'urgent',  risk:'high',     last:'05 Mar' },
  { name:'Opio James',      cls:'S5A', issue:'Mental health — depression signs',sessions:3,status:'urgent',  risk:'high',     last:'04 Mar' },
  { name:'Kevin Ssali',     cls:'S4A', issue:'Career guidance',                sessions:1, status:'active',  risk:'low',      last:'03 Mar' },
  { name:'Kyaligonza David',cls:'S1B', issue:'Settling in — homesickness',     sessions:3, status:'active',  risk:'low',      last:'02 Mar' },
  { name:'Birungi Agnes',   cls:'S3B', issue:'Peer pressure / social issues',  sessions:2, status:'active',  risk:'moderate', last:'28 Feb' },
  { name:'Chebet Sarah',    cls:'S4A', issue:'Family difficulties',            sessions:5, status:'resolved',risk:'low',      last:'25 Feb' },
  { name:'Ezati John',      cls:'S4A', issue:'Academic performance',           sessions:6, status:'resolved',risk:'low',      last:'20 Feb' },
];

const riskColor = { low:'green', moderate:'amber', high:'red' } as const;
const statusColor = { active:'blue', urgent:'red', resolved:'green' } as const;

export default function Students() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Student Welfare — Caseload" subtitle={`${STUDENTS.length} students · ${STUDENTS.filter(s=>s.status==='urgent').length} urgent · ${STUDENTS.filter(s=>s.status==='resolved').length} resolved`}
        actions={[{ label:'➕ Add Case', variant:'primary', onClick:()=>toast('Case form opened','info') }]}
      />
      <Card>
        <DataTable rows={STUDENTS} keyFn={(_,i)=>i} columns={[
          { key:'name',     header:'Student',      render:r=><span style={{fontWeight:700}}>{r.name}</span>                                    },
          { key:'cls',      header:'Class',        render:r=><Badge color="teal">{r.cls}</Badge>                                               },
          { key:'issue',    header:'Issue',        render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.issue}</span>                     },
          { key:'sessions', header:'Sessions',     render:r=><span style={{fontWeight:600}}>{r.sessions}</span>                               },
          { key:'risk',     header:'Risk',         render:r=><Badge color={riskColor[r.risk as keyof typeof riskColor]}>{r.risk}</Badge>      },
          { key:'status',   header:'Status',       render:r=><Badge color={statusColor[r.status as keyof typeof statusColor]}>{r.status}</Badge> },
          { key:'last',     header:'Last session', render:r=><span style={{fontSize:11,color:'#94a3b8'}}>{r.last}</span>                    },
          {
            key:'actions', header:'',
            render:r=>(
              <div style={{display:'flex',gap:6}}>
                <Btn size="sm" onClick={()=>toast(`${r.name} case opened`,'info')}>View</Btn>
                <Btn size="sm" variant="primary" onClick={()=>toast(`Session logged for ${r.name}`,'success')}>Log Session</Btn>
              </div>
            ),
          },
        ]} />
      </Card>
    </div>
  );
}
