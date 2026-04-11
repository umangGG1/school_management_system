import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { DataTable }  from '../../components/ui/DataTable';
import { AlertBanner } from '../../components/ui/AlertBanner';

const PATRONS = [
  { name:'Mr. Kakooza Brian',    subject:'P.E.',        activities:['Football','Athletics'],     reports:'Submitted', active:true  },
  { name:'Ms. Nambi Grace',      subject:'English',     activities:['Netball','Dance Troupe'],   reports:'Submitted', active:true  },
  { name:'Mr. Ssemwanga Paul',   subject:'Biology',     activities:['Science Club'],             reports:'Overdue',   active:false },
  { name:'Mr. Kato Geoffrey',    subject:'Literature',  activities:['Drama Club'],               reports:'Submitted', active:true  },
  { name:'Ms. Nakato Agnes',     subject:'History',     activities:['Debate Club'],              reports:'Submitted', active:true  },
  { name:'Ms. Grace Nantongo',   subject:'Music',       activities:['School Choir'],             reports:'Submitted', active:true  },
  { name:'Mr. Lubwama Steven',   subject:'Sciences',    activities:['Swimming'],                 reports:'Overdue',   active:true  },
  { name:'Ms. Nakabugo Sarah',   subject:'ICT',         activities:['Computer Club'],            reports:'Submitted', active:true  },
  { name:'Chaplain Ochieng',     subject:'RE',          activities:['Scripture Union'],          reports:'Submitted', active:true  },
];

export default function Patrons() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Teacher Patrons" subtitle={`${PATRONS.length} assigned patrons · ${PATRONS.filter(p=>p.reports==='Overdue').length} reports overdue`}
        actions={[
          { label:'📤 Send Reminder to All', variant:'warning', onClick:()=>toast('Reminders sent to patrons with overdue reports ✓','success') },
          { label:'➕ Assign Patron', variant:'primary', onClick:()=>toast('Patron assignment form opened','info') },
        ]}
      />
      {PATRONS.some(p => p.reports === 'Overdue') && (
        <AlertBanner color="warn" icon="⚠️">
          {PATRONS.filter(p=>p.reports==='Overdue').length} patrons have overdue Term 1 activity reports. These are required for the end-of-term review.
        </AlertBanner>
      )}
      <Card>
        <CardHeader title="👩‍🏫 All Patrons" />
        <DataTable
          rows={PATRONS}
          keyFn={(_,i)=>i}
          columns={[
            { key:'name',       header:'Name',       render:r=><span style={{fontWeight:700}}>{r.name}</span>                                         },
            { key:'subject',    header:'Subject',    render:r=><span style={{fontSize:12,color:'#64748b'}}>{r.subject}</span>                        },
            { key:'activities', header:'Activities', render:r=><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{r.activities.map(a=><Badge key={a} color="green">{a}</Badge>)}</div> },
            { key:'reports',    header:'Term Report',render:r=><Badge color={r.reports==='Submitted'?'green':'red'}>{r.reports}</Badge>               },
            { key:'active',     header:'Status',    render:r=><Badge color={r.active?'green':'amber'}>{r.active?'Active':'Inactive'}</Badge>          },
            {
              key:'actions', header:'',
              render:r=>(
                <div style={{display:'flex',gap:6}}>
                  {r.reports === 'Overdue' && <Btn size="sm" variant="warning" onClick={()=>toast(`Reminder sent to ${r.name}`,'success')}>📤 Chase</Btn>}
                  <Btn size="sm" onClick={()=>toast(`${r.name} profile opened`,'info')}>View</Btn>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
