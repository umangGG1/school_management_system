import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';

const EXAMS = [
  { date:'Mon 06 Apr', time:'8:00–10:00', subject:'S4 Mathematics', venue:'Hall A', invigilators:'2', status:'Draft',     papers:'40 copies' },
  { date:'Mon 06 Apr', time:'11:00–1:00', subject:'S4 English',     venue:'Hall A', invigilators:'2', status:'Confirmed', papers:'40 copies' },
  { date:'Tue 07 Apr', time:'8:00–10:00', subject:'S6 Physics P1',  venue:'Hall B', invigilators:'2', status:'Draft',     papers:'28 copies' },
  { date:'Tue 07 Apr', time:'11:00–1:00', subject:'S5 Biology',     venue:'Lab 1',  invigilators:'1', status:'Confirmed', papers:'35 copies' },
  { date:'Wed 08 Apr', time:'8:00–10:00', subject:'S3 Mathematics', venue:'Hall A', invigilators:'3', status:'Draft',     papers:'44 copies' },
  { date:'Thu 09 Apr', time:'8:00–11:00', subject:'S4 Chemistry P2',venue:'Lab 2',  invigilators:'2', status:'Confirmed', papers:'40 copies' },
];

export default function Schedule() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Exam Schedule" subtitle="End-term Examinations — Week 12 (Mon 06 Apr – Fri 25 Apr 2026)"
        actions={[
          { label:'🖨️ Print Timetable', onClick:()=>toast('Timetable sent to printer','info') },
          { label:'📤 Distribute to Staff', variant:'primary', onClick:()=>toast('Timetable sent to all staff portals ✓','success') },
        ]}
      />
      <Card>
        <DataTable rows={EXAMS} keyFn={(_,i)=>i} columns={[
          { key:'date',       header:'Date',        render:r=><span style={{fontWeight:600}}>{r.date}</span>                    },
          { key:'time',       header:'Time',        render:r=><span style={{color:'#64748b',fontSize:11}}>{r.time}</span>      },
          { key:'subject',    header:'Subject',     render:r=><span style={{fontWeight:700}}>{r.subject}</span>               },
          { key:'venue',      header:'Venue',       render:r=><Badge color="blue">{r.venue}</Badge>                            },
          { key:'invigilators',header:'Invigilators',render:r=><span style={{color:'#64748b'}}>{r.invigilators} teachers</span> },
          { key:'papers',     header:'Papers',      render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.papers}</span>   },
          { key:'status',     header:'Status',      render:r=><Badge color={r.status==='Confirmed'?'green':'amber'}>{r.status}</Badge> },
          {
            key:'actions', header:'',
            render:r=>(
              <div style={{display:'flex',gap:6}}>
                <Btn size="sm" onClick={()=>toast(`${r.subject} edited`,'info')}>Edit</Btn>
                {r.status === 'Draft' && <Btn size="sm" variant="primary" onClick={()=>toast(`${r.subject} confirmed ✓`,'success')}>Confirm</Btn>}
              </div>
            ),
          },
        ]} />
      </Card>
    </div>
  );
}
