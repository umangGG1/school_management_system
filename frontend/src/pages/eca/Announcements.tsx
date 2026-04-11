import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Btn }        from '../../components/ui/Btn';

const ANNOUNCEMENTS = [
  { tag: 'ECA OFFICE', tagBg: '#f97316', title: 'End-of-Term Concert — All Activities Performing Fri 27 March', body: 'All clubs, sports teams, arts groups and societies are invited to perform at the End-of-Term Concert on Friday 27 March. Patrons must submit their group\'s act details to the ECA office by Tuesday 10 March. Talent show auditions: Friday 13 March, 3 PM.', date: '07 Mar 2026', border: '#f97316' },
  { tag: 'ELECTIONS',  tagBg: '#16a34a', title: 'Prefect Elections — Wednesday 11 March, 10:00 AM', body: 'All students are required to vote in the annual prefect elections on Wednesday 11 March at 10:00 AM in the Main Hall. Candidates are posted on all noticeboards. Voting is by secret ballot. Results announced Thursday morning.', date: '07 Mar 2026', border: '#16a34a' },
];

export default function Announcements() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Announcements" subtitle="School-wide ECA announcements and circulars"
        actions={[{ label: '📢 New Announcement', variant: 'primary', onClick: () => toast('Announcement form opened','info') }]}
      />
      {ANNOUNCEMENTS.map(a => (
        <div key={a.title} style={{ background:'#fff', border:`1px solid #e2e8f0`, borderRadius:10, padding:'14px 18px', boxShadow:'0 1px 3px rgba(0,0,0,.06)', marginBottom:12, borderLeft:`4px solid ${a.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ background:a.tagBg, color:'#fff', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4 }}>{a.tag}</span>
            <div style={{ fontSize:13, fontWeight:700 }}>{a.title}</div>
          </div>
          <div style={{ fontSize:12, color:'#64748b', lineHeight:1.7 }}>{a.body}</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>{a.date} · ECA Coordinator</span>
            <div style={{ display:'flex', gap:6 }}>
              <Btn size="sm" onClick={()=>toast('Announcement edited','info')}>✏️ Edit</Btn>
              <Btn size="sm" onClick={()=>toast('Announcement printed','info')}>🖨️ Print</Btn>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
