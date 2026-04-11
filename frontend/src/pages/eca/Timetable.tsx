import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';
import { Badge }      from '../../components/ui/Badge';
import { AlertBanner } from '../../components/ui/AlertBanner';

export default function Timetable() {
  const { toast } = useToast();
  const SCHEDULE = [
    { day:'Mon', activities:['🗣️ Debate Club — 4:00 PM — Boardroom','✝️ Scripture Union — 4:00 PM — Chapel','🏛️ Guild Council — 5:00 PM — Boardroom','⭐ Prefects — 5:00 PM — DHM Office'] },
    { day:'Tue', activities:['⚽ Netball — 4:00 PM — Court','💻 Computer Club — 4:00 PM — Lab','📸 Photography — 4:30 PM — Room 6'] },
    { day:'Wed', activities:['💃 Cultural Dance — 3:00 PM — School Hall','🏛️ Guild — 5:00 PM — Boardroom'] },
    { day:'Thu', activities:['🏃 Athletics — 4:30 PM — Track','⚽ Football training — 4:30 PM — Pitch','✝️ SU — 4:00 PM — Chapel'] },
    { day:'Fri', activities:['Class time — no ECA'] },
    { day:'Sat', activities:['⚽ Football — 8:00 AM — Pitch','🎵 Choir — 10:00 AM — Music Room','🎭 Drama — 2:00 PM — School Hall','🏊 Swimming — 7:00 AM — Pool'] },
  ];
  return (
    <div>
      <PageHeader title="Timetable & Venues" subtitle="Weekly ECA schedule"
        actions={[
          { label:'📄 Print Timetable', onClick:()=>toast('Timetable printed','info') },
          { label:'📅 Book Venue', variant:'primary', onClick:()=>toast('Venue booking form opened','info') },
        ]}
      />
      <AlertBanner color="danger" icon="⚠️">
        <strong>Venue conflict — Wed 11 Mar:</strong> Guild Council and an S4 Mock exam are both scheduled for the Boardroom. Relocate Guild to Room 3.
      </AlertBanner>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {SCHEDULE.map(d => (
          <div key={d.day} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:'#16a34a' }}>{d.day}</div>
            {d.activities.map(a => (
              <div key={a} style={{ fontSize:11, color:'#374151', padding:'6px 0', borderBottom:'1px solid #f1f5f9' }}>{a}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
