import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { FormField, TextInput, SelectInput, TextAreaInput, FormRow } from '../../components/ui/FormField';
import { DataTable }  from '../../components/ui/DataTable';

const SESSIONS = [
  { date:'07 Mar, 9:00 AM',  student:'Nakibuule Sarah',  cls:'S5A', type:'Individual', topic:'Exam anxiety coping strategies',    status:'Completed' },
  { date:'07 Mar, 11:00 AM', student:'Kyaligonza David', cls:'S1B', type:'Individual', topic:'Homesickness follow-up',             status:'Upcoming'  },
  { date:'07 Mar, 2:00 PM',  student:'Kevin Ssali',      cls:'S4A', type:'Individual', topic:'Career guidance — university entry', status:'Upcoming'  },
  { date:'05 Mar, 2:00 PM',  student:'Auma Gloria',      cls:'S4B', type:'Individual', topic:'Bullying incident review',           status:'Completed' },
  { date:'04 Mar, 3:00 PM',  student:'Opio James',       cls:'S5A', type:'Individual', topic:'Mental health — check-in',           status:'Completed' },
];

export default function Sessions() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Counselling Sessions & Notes" subtitle="Session log and scheduling"
        actions={[{ label:'📅 Schedule Session', variant:'primary', onClick:()=>toast('Session scheduling opened','info') }]}
      />
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        <Card>
          <CardHeader title="📅 Session Log" />
          <DataTable rows={SESSIONS} keyFn={(_,i)=>i} columns={[
            { key:'date',    header:'Date/Time',    render:r=><span style={{fontWeight:600,fontSize:11}}>{r.date}</span>                              },
            { key:'student', header:'Student',      render:r=><span style={{fontWeight:700}}>{r.student}</span>                                       },
            { key:'cls',     header:'Class',        render:r=><Badge color="teal">{r.cls}</Badge>                                                      },
            { key:'topic',   header:'Topic',        render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.topic}</span>                            },
            { key:'status',  header:'Status',       render:r=><Badge color={r.status==='Completed'?'green':'amber'}>{r.status}</Badge>                },
            {
              key:'actions', header:'',
              render:r=>(
                <div style={{display:'flex',gap:6}}>
                  <Btn size="sm" onClick={()=>toast(`${r.student} session notes opened`,'info')}>Notes</Btn>
                </div>
              ),
            },
          ]} />
        </Card>
        <Card>
          <CardHeader title="📝 Log New Session" />
          <FormField label="Student"><TextInput placeholder="Search student…" /></FormField>
          <FormField label="Session Type"><SelectInput><option>Individual</option><option>Group</option><option>Parent meeting</option></SelectInput></FormField>
          <FormField label="Issue Category"><SelectInput><option>Academic stress</option><option>Bullying</option><option>Mental health</option><option>Career guidance</option><option>Family issues</option><option>Social</option></SelectInput></FormField>
          <FormRow>
            <FormField label="Date"><TextInput type="date" /></FormField>
            <FormField label="Duration (mins)"><TextInput type="number" placeholder="30" /></FormField>
          </FormRow>
          <FormField label="Session Notes"><TextAreaInput placeholder="Confidential session notes…" /></FormField>
          <Btn variant="primary" onClick={()=>toast('Session logged ✓','success')}>✅ Save Session</Btn>
        </Card>
      </div>
    </div>
  );
}
