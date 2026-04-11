import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const SUBJECTS = ['S4A','S4B','S5A','S6A','S3A'];
const ENTERED = [
  { sub:'S4 Mathematics', cls:'S4A,S4B', avg:62, high:91, low:39, pass:76 },
  { sub:'S4 English',     cls:'S4A,S4B', avg:58, high:88, low:32, pass:71 },
  { sub:'S5 Biology',     cls:'S5A',     avg:69, high:94, low:41, pass:83 },
];

export default function ResultsEntry() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Results Entry" subtitle="Enter and publish student results by subject & class"
        actions={[
          { label:'📊 Export Results', onClick:()=>toast('Results exported','info') },
          { label:'📤 Publish to Student Portals', variant:'primary', onClick:()=>toast('Results published ✓','success') },
        ]}
      />
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {SUBJECTS.map(c => (
            <Btn key={c} size="sm" onClick={()=>toast(`${c} marks entry opened`,'info')}>{c} — Enter Marks</Btn>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="📊 Entered Results — Summary" />
        <DataTable rows={ENTERED} keyFn={(_,i)=>i} columns={[
          { key:'sub',  header:'Subject',    render:r=><span style={{fontWeight:700}}>{r.sub}</span> },
          { key:'cls',  header:'Classes',   render:r=><span style={{color:'#64748b',fontSize:11}}>{r.cls}</span> },
          { key:'avg',  header:'Class Avg', render:r=><span style={{fontWeight:700,color:'#7c3aed'}}>{r.avg}%</span> },
          { key:'high', header:'Highest',   render:r=><Badge color="green">{r.high}</Badge> },
          { key:'low',  header:'Lowest',    render:r=><Badge color="red">{r.low}</Badge> },
          { key:'pass', header:'Pass Rate', render:r=><Badge color={r.pass>=80?'green':r.pass>=70?'amber':'red'}>{r.pass}%</Badge> },
          {
            key:'actions', header:'',
            render:r=>(
              <div style={{display:'flex',gap:6}}>
                <Btn size="sm" onClick={()=>toast(`${r.sub} edited`,'info')}>Edit</Btn>
                <Btn size="sm" variant="primary" onClick={()=>toast(`${r.sub} published ✓`,'success')}>📤 Publish</Btn>
              </div>
            ),
          },
        ]} />
      </Card>
    </div>
  );
}
