import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function ExamReports() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Exam Reports" subtitle="Results analysis and publication"
        actions={[{ label:'📄 Export Analysis', variant:'primary', onClick:()=>toast('Report exported','info') }]}
      />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {[['📈 Results Analysis Report','Class-by-class grade distribution with trend analysis'],
          ['🏆 Top Performers Report','Student rankings and distinction lists'],
          ['⚠️ At-Risk Students','Students below pass mark needing intervention'],
          ['📊 Subject Performance Summary','Average scores and pass rates per subject'],
        ].map(([title, sub]) => (
          <Card key={String(title)}>
            <CardHeader title={title} subtitle={sub} action={<Btn size="sm" variant="primary" onClick={()=>toast(`${title} opened`,'info')}>View</Btn>} />
            <ProgressBar label="Data available" value="100%" pct={100} color="purple" />
          </Card>
        ))}
      </div>
    </div>
  );
}
