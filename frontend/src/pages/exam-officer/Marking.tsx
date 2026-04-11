import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const MARKING = [
  { subj:'S4 Mathematics',  marker:'Ms. Nakakande',  status:'Shared',  points:100 },
  { subj:'S4 English',      marker:'Mr. Opolot',      status:'Shared',  points:100 },
  { subj:'S5 Biology',      marker:'Mr. Ssemwanga',   status:'Draft',   points:100 },
  { subj:'S6 Physics P1',   marker:'Mr. Lubwama',     status:'Draft',   points:100 },
  { subj:'S4 Chemistry P2', marker:'Ms. Nakabugo',    status:'Pending', points:100 },
  { subj:'S3 Mathematics',  marker:'Ms. Nakakande',   status:'Pending', points:100 },
];

export default function Marking() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Marking Schemes" subtitle="Distribute marking guides to examiners"
        actions={[{ label:'➕ Upload Scheme', variant:'primary', onClick:()=>toast('Upload dialog opened','info') }]}
      />
      <Card>
        <DataTable rows={MARKING} keyFn={(_,i)=>i} columns={[
          { key:'subj',   header:'Subject',        render:r=><span style={{fontWeight:700}}>{r.subj}</span>                              },
          { key:'marker', header:'Chief Examiner',  render:r=><span style={{color:'#64748b',fontSize:12}}>{r.marker}</span>             },
          { key:'points', header:'Total Marks',     render:r=><span style={{fontWeight:600}}>{r.points}</span>                          },
          { key:'status', header:'Status',          render:r=><Badge color={r.status==='Shared'?'green':r.status==='Draft'?'blue':'amber'}>{r.status}</Badge> },
          {
            key:'actions', header:'',
            render:r=>(
              <div style={{display:'flex',gap:6}}>
                {r.status !== 'Shared' && <Btn size="sm" variant="primary" onClick={()=>toast(`${r.subj} scheme shared ✓`,'success')}>📤 Share</Btn>}
                <Btn size="sm" onClick={()=>toast(`${r.subj} scheme viewed`,'info')}>View</Btn>
              </div>
            ),
          },
        ]} />
      </Card>
    </div>
  );
}
