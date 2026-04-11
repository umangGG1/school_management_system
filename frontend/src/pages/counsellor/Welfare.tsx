import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { AlertBanner } from '../../components/ui/AlertBanner';

const ISSUES = [
  { title:'Suspected bullying — Auma Gloria (S4B)', cat:'Bullying',    sev:'high',   owner:'Counsellor + DHM', st:'open',      date:'05 Mar' },
  { title:'Exam anxiety — Nakibuule Sarah (S5A)',   cat:'Academic',    sev:'moderate',owner:'Counsellor',      st:'monitoring',date:'04 Mar' },
  { title:'Homesickness — Kyaligonza David (S1B)',  cat:'Boarding',    sev:'low',    owner:'Counsellor+Matron',st:'monitoring',date:'02 Mar' },
  { title:'Mental health referral — Opio James',    cat:'Mental Health',sev:'high',  owner:'Counsellor + GP',  st:'pending',   date:'03 Mar' },
  { title:'Family difficulties — Birungi Agnes',    cat:'Family',      sev:'moderate',owner:'Counsellor + DHM', st:'open',     date:'28 Feb' },
];
const sevColor = { high:'red', moderate:'amber', low:'green' } as const;
const stColor  = { open:'blue', monitoring:'amber', pending:'red', resolved:'green' } as const;

export default function Welfare() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Welfare Issues" subtitle={`${ISSUES.filter(i=>i.sev==='high').length} high-priority issues open`}
        actions={[{ label:'➕ Log Issue', variant:'primary', onClick:()=>toast('Issue form opened','info') }]}
      />
      <AlertBanner color="danger" icon="🚨">
        <strong>2 high-priority issues require immediate attention:</strong> Suspected bullying (Auma Gloria) and mental health referral (Opio James). Escalate to DHM today.
      </AlertBanner>
      {ISSUES.map(issue => (
        <div key={issue.title} style={{ background:'#fff', border:`1px solid ${issue.sev==='high'?'rgba(239,68,68,.3)':'#e2e8f0'}`, borderRadius:10, padding:14, marginBottom:10, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <Badge color={sevColor[issue.sev as keyof typeof sevColor]}>{issue.sev} priority</Badge>
            <Badge color="teal">{issue.cat}</Badge>
            <span style={{ fontSize:13, fontWeight:700 }}>{issue.title}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            <div style={{ fontSize:11, color:'#64748b' }}>Owner: {issue.owner} · Reported: {issue.date}</div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <Badge color={stColor[issue.st as keyof typeof stColor]}>{issue.st}</Badge>
              <Btn size="sm" onClick={()=>toast(`${issue.title} viewed`,'info')}>View</Btn>
              <Btn size="sm" variant="danger" onClick={()=>toast('Escalated to DHM ✓','success')}>🚨 Escalate</Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
