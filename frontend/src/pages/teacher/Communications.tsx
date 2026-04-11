import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { FormField, TextInput, SelectInput, TextAreaInput, FormRow } from '../../components/ui/FormField';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';

const INBOX = [
  { from: 'DHM',           init:'DH', bg:'#1e293b', title:"Friday's school trip — teacher duty roster", sub:'2 hrs ago · Unread', unread: true },
  { from: 'Nakakande HOD', init:'NK', bg:'#2563eb', title:'Syllabus coverage report — submit by Wed 11 Mar', sub:'4 hrs ago · Unread', unread: true },
  { from: 'Kevin Ssali',   init:'KS', bg:'#8b5cf6', title:'Request to rebook maths tutorial session', sub:'Yesterday', unread: false },
  { from: 'Exam Officer',  init:'EO', bg:'#7c3aed', title:"S6 end-of-term exam timetable — teacher's copy", sub:'2 days ago', unread: false },
];

export default function CommunicationsPage() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Communications" subtitle="Inbox · Compose messages to students, parents, and staff" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader title={`📬 Inbox (${INBOX.filter(m => m.unread).length} unread)`} />
          {INBOX.map(m => (
            <div key={m.title} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 8px', background: m.unread ? '#eff6ff' : 'transparent',
              borderRadius: 8, marginBottom: 4, cursor: 'pointer',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{m.init}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: m.unread ? 700 : 600 }}>{m.title}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{m.from} · {m.sub}</div>
              </div>
              {m.unread && <Badge color="blue">New</Badge>}
            </div>
          ))}
        </Card>

        <Card>
          <CardHeader title="✍️ Compose Message" />
          <FormField label="Send To">
            <SelectInput>
              <option>Student (individual)</option>
              <option>Parent / Guardian</option>
              <option>HOD / Deputy HM</option>
              <option>Class group (S4A, S5A…)</option>
              <option>Exam Officer</option>
            </SelectInput>
          </FormField>
          <FormField label="Subject"><TextInput placeholder="e.g. Assignment feedback for…" /></FormField>
          <FormField label="Message"><TextAreaInput placeholder="Type your message…" minHeight={100} /></FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn onClick={() => toast('Draft saved', 'info')}>💾 Draft</Btn>
            <Btn variant="primary" onClick={() => toast('Message sent ✓', 'success')}>📤 Send</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
