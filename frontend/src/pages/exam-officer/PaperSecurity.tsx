import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader }  from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { DataTable }   from '../../components/ui/DataTable';

const PAPERS = [
  { subj:'S4 Mathematics',    status:'Secured ✓', vault:'Safe A-1', sealed:true,  copies:40, lastCheck:'Sat 07 Mar 8:00 AM' },
  { subj:'S4 English',        status:'Secured ✓', vault:'Safe A-2', sealed:true,  copies:40, lastCheck:'Sat 07 Mar 8:00 AM' },
  { subj:'S5 Biology',        status:'Secured ✓', vault:'Safe A-3', sealed:true,  copies:35, lastCheck:'Sat 07 Mar 8:00 AM' },
  { subj:'S4 Chemistry P2',   status:'Secured ✓', vault:'Safe B-1', sealed:true,  copies:40, lastCheck:'Sat 07 Mar 8:00 AM' },
  { subj:'S6 Physics P1',     status:'⚠️ MISSING', vault:'—',        sealed:false, copies:0,  lastCheck:'Not found'         },
  { subj:'S4 Chemistry P1',   status:'⚠️ MISSING', vault:'—',        sealed:false, copies:0,  lastCheck:'Not found'         },
  { subj:'S3 Mathematics',    status:'⚠️ MISSING', vault:'—',        sealed:false, copies:0,  lastCheck:'Not found'         },
];

export default function PaperSecurity() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Paper Security" subtitle="Exam paper custody, vault log, and distribution control"
        actions={[
          { label:'🖨️ Print Custody Log', onClick:()=>toast('Custody log printed','info') },
          { label:'✅ Mark as Secured', variant:'primary', onClick:()=>toast('Security check recorded ✓','success') },
        ]}
      />
      <div style={{ background:'#fef2f2', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'14px 16px', marginBottom:18, display:'flex', gap:12, alignItems:'flex-start' }}>
        <span style={{ fontSize:20, flexShrink:0 }}>🔒</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#ef4444' }}>Security Alert — 3 papers not secured!</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>S6 Physics P1, S4 Chemistry P1, and S3 Mathematics are not in the vault. Contact the Head of Department immediately. These must be secured before Tuesday morning.</div>
        </div>
      </div>
      <Card>
        <CardHeader title="📚 All Exam Papers — Custody Register" />
        <DataTable rows={PAPERS} keyFn={(_,i)=>i} columns={[
          { key:'subj',      header:'Subject',       render:r=><span style={{fontWeight:700}}>{r.subj}</span>                                           },
          { key:'status',    header:'Status',        render:r=><Badge color={r.sealed?'green':'red'}>{r.status}</Badge>                                 },
          { key:'vault',     header:'Vault Location',render:r=><span style={{color:'#64748b',fontSize:11}}>{r.vault}</span>                            },
          { key:'copies',    header:'Copies',        render:r=><span>{r.copies > 0 ? `${r.copies} copies` : '—'}</span>                               },
          { key:'lastCheck', header:'Last Check',    render:r=><span style={{fontSize:11,color:'#64748b'}}>{r.lastCheck}</span>                        },
          {
            key:'actions', header:'',
            render:r=>(
              !r.sealed
                ? <div style={{display:'flex',gap:6}}>
                    <Btn size="sm" variant="danger" onClick={()=>toast(`${r.subj} — alert sent to HoD`,'success')}>🚨 Alert HoD</Btn>
                    <Btn size="sm" variant="primary" onClick={()=>toast(`${r.subj} marked secured`,'success')}>✅ Secure</Btn>
                  </div>
                : <Btn size="sm" onClick={()=>toast(`${r.subj} log viewed`,'info')}>View Log</Btn>
            ),
          },
        ]} />
      </Card>
    </div>
  );
}
