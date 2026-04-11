import { useToast }   from '../../contexts/ToastContext';
import { useAuth }    from '../../contexts/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function CounsellorReports() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Reports" actions={[{ label:'📄 Export', variant:'primary', onClick:()=>toast('Report exported','info') }]} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[['📊 Term Welfare Summary','Term 1 caseload statistics and outcomes'],
          ['⚠️ At-Risk Students Report','Students with open medium/high-risk cases'],
          ['📅 Session Log Report','All counselling sessions this term'],
          ['🔗 Referral Status Report','All referrals and follow-up actions'],
        ].map(([t,s]) => (
          <Card key={String(t)}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{t}</div>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:12 }}>{s}</div>
            <ProgressBar label="Completeness" value="100%" pct={100} color="teal" />
            <Btn size="sm" variant="primary" onClick={()=>toast(`${t} opened`,'info')}>View Report</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}
