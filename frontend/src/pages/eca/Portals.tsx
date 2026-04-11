import { useNavigate } from 'react-router-dom';
import { PageHeader }  from '../../components/ui/PageHeader';

const LIST = [
  { label:'Head Teacher', icon:'🏫', path:'/ht/dashboard',           border:'#6366f1', bg:'#eef2ff' },
  { label:'Deputy HM',    icon:'📋', path:'/deputy-hm/dashboard',    border:'#0ea5e9', bg:'#f0f9ff' },
  { label:'Bursar',       icon:'💰', path:'/bursar/dashboard',       border:'#0f766e', bg:'#f0fdfa' },
  { label:'Teacher',      icon:'👩‍🏫',path:'/teacher/dashboard',      border:'#2563eb', bg:'#eff6ff' },
  { label:'Exam Officer', icon:'📝', path:'/exam-officer/dashboard', border:'#7c3aed', bg:'#f5f3ff' },
  { label:'Counsellor',   icon:'💚', path:'/counsellor/dashboard',  border:'#0d9488', bg:'#f0fdfa' },
];
export default function Portals() {
  const nav = useNavigate();
  return (
    <div>
      <PageHeader title="Portal Quick Access" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {LIST.map(p => (
          <div key={p.path} onClick={()=>nav(p.path)} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'#fff', border:`1px solid #e2e8f0`, borderRadius:12, borderLeft:`4px solid ${p.border}`, cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,.06)', transition:'all .2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
            <div style={{ width:38, height:38, borderRadius:10, background:p.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{p.icon}</div>
            <div style={{ fontSize:13, fontWeight:700 }}>{p.label}</div>
            <span style={{ marginLeft:'auto', color:'#94a3b8', fontSize:16 }}>↗</span>
          </div>
        ))}
      </div>
    </div>
  );
}
