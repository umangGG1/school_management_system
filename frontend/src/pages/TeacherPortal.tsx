import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── types ── */
type Page = 'dashboard'|'classes'|'attendance'|'marks'|'notes'|'assignments'|'curriculum'|'communications'|'portals'|'settings';
type Modal = 'takeAttendance'|'enterMarks'|'addNote'|'newAssignment'|'msgModal'|null;
type ToastT = { id: number; msg: string; type: 'success'|'warning'|'info'|'danger'|'default' };

/* ── colour palette ── */
const V = {
  acc:'#2563eb', accSoft:'#eff6ff', accDark:'#1d4ed8',
  success:'#10b981', successSoft:'#ecfdf5',
  danger:'#ef4444', dangerSoft:'#fef2f2',
  warn:'#f59e0b', warnSoft:'#fffbeb',
  blue:'#3b82f6', blueSoft:'#eff6ff',
  purple:'#8b5cf6', purpleSoft:'#f5f3ff',
  teal:'#0d9488', tealSoft:'#f0fdfa',
  orange:'#f97316', orangeSoft:'#fff7ed',
  indigo:'#6366f1', indigoSoft:'#eef2ff',
  primary:'#1e293b', bg:'#f8fafc', card:'#fff', border:'#e2e8f0',
  text:'#1e293b', muted:'#64748b', light:'#94a3b8',
};

/* ── static data ── */
const MY_CLASSES = [
  { code:'S4A', subject:'Mathematics', room:'Room 12', students:42, period:'P1 · 7:30–8:20', status:'Done', attendance:95 },
  { code:'S5A', subject:'Mathematics', room:'Room 08', students:38, period:'P2 · 8:20–9:10', status:'Done', attendance:89 },
  { code:'S3B', subject:'Mathematics', room:'Room 15', students:44, period:'P4 · 10:30–11:20', status:'Now', attendance:93 },
  { code:'S6A', subject:'Further Mathematics', room:'Room 12', students:28, period:'P6 · 13:00–13:50', status:'Upcoming', attendance:0 },
  { code:'S4B', subject:'Mathematics', room:'Room 09', students:40, period:'P7 · 14:00–14:50', status:'Upcoming', attendance:0 },
];

type Student = { name:string; reg:string; score:number; grade:string; attendance:string; present?:boolean };
const S4A_STUDENTS: Student[] = [
  { name:'Akello Rose',      reg:'S4A/001', score:87, grade:'D1', attendance:'96%', present:true },
  { name:'Byamugisha Peter', reg:'S4A/002', score:72, grade:'C4', attendance:'89%', present:true },
  { name:'Chebet Sarah',     reg:'S4A/003', score:65, grade:'C5', attendance:'76%', present:false },
  { name:'Ddungu Moses',     reg:'S4A/004', score:55, grade:'C6', attendance:'84%', present:true },
  { name:'Ezati John',       reg:'S4A/005', score:45, grade:'P7', attendance:'71%', present:true },
  { name:'Farida Amina',     reg:'S4A/006', score:91, grade:'D1', attendance:'100%', present:true },
  { name:'Gatete Sam',       reg:'S4A/007', score:61, grade:'C5', attendance:'80%', present:false },
  { name:'Harriet Nakato',   reg:'S4A/008', score:78, grade:'C4', attendance:'92%', present:true },
  { name:'Ismail Karim',     reg:'S4A/009', score:83, grade:'D2', attendance:'88%', present:true },
  { name:'Jjuuko Fred',      reg:'S4A/010', score:39, grade:'F9', attendance:'62%', present:false },
];

const SUBJECT_UNITS = [
  { unit:'1. Sets & Functions', coverage:100, weeks:2, status:'Done' },
  { unit:'2. Algebra & Quadratics', coverage:100, weeks:3, status:'Done' },
  { unit:'3. Geometry & Trigonometry', coverage:82, weeks:3, status:'In Progress' },
  { unit:'4. Statistics & Probability', coverage:40, weeks:2, status:'In Progress' },
  { unit:'5. Calculus — Differentiation', coverage:0, weeks:3, status:'Not Started' },
  { unit:'6. Calculus — Integration', coverage:0, weeks:2, status:'Not Started' },
];

const ASSIGNMENTS = [
  { title:'Quadratics Problem Set', cls:'S4A', due:'09 Mar 2026', submitted:38, total:42, status:'Active' },
  { title:'Trigonometry Worksheet', cls:'S3B', due:'11 Mar 2026', submitted:12, total:44, status:'Active' },
  { title:'Further Maths — Past Paper 2024', cls:'S6A', due:'14 Mar 2026', submitted:5, total:28, status:'Active' },
  { title:'Sets & Functions End Test', cls:'S4A', due:'28 Feb 2026', submitted:42, total:42, status:'Marked' },
  { title:'Algebra Mid-term Test', cls:'S5A', due:'20 Feb 2026', submitted:38, total:38, status:'Marked' },
];

const LESSON_NOTES = [
  { date:'06 Mar', cls:'S4B', topic:'Trigonometric Identities — sinA cosB formulas', type:'Lesson Note', status:'Shared' },
  { date:'05 Mar', cls:'S3B', topic:'Geometry — Proof by congruence triangles', type:'Lesson Note', status:'Draft' },
  { date:'04 Mar', cls:'S6A', topic:'Further Maths — Matrices & Determinants', type:'Scheme of Work', status:'Shared' },
  { date:'03 Mar', cls:'S5A', topic:'Statistics — Mean, Median, Mode & Standard Deviation', type:'Lesson Note', status:'Shared' },
  { date:'28 Feb', cls:'S4A', topic:'Quadratics — Completing the Square', type:'Lesson Note', status:'Shared' },
];

/* ── helpers ── */
function gradeColor(g:string):[string,string]{
  if(!g||g==='—')return[V.card,V.muted];
  const n=parseInt(g.replace(/[A-Z]/g,''));
  if(g.startsWith('D'))return[V.successSoft,V.success];
  if(g.startsWith('C'))return[V.blueSoft,V.blue];
  if(g.startsWith('P'))return[V.warnSoft,'#b45309'];
  return[V.dangerSoft,V.danger];
}
function statusChipCols(s:string):[string,string]{
  return s==='Done'?[V.successSoft,V.success]:s==='Now'?[V.blueSoft,V.blue]:s==='Upcoming'?['#f1f5f9',V.muted]:[V.warnSoft,'#b45309'];
}

/* ── tiny shared components ── */
function Chip({bg,color,children}:{bg:string;color:string;children:React.ReactNode}){
  return <span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:bg,color}}><span style={{fontSize:7}}>●</span>{children}</span>;
}
function Btn({variant='se',size='md',style:extStyle,onClick,children}:{variant?:string;size?:string;style?:React.CSSProperties;onClick?:()=>void;children:React.ReactNode}){
  const configs:{[k:string]:[string,string,string]}={pr:[V.acc,'#fff','transparent'],se:['#f8fafc',V.text,V.border],da:[V.dangerSoft,V.danger,'rgba(239,68,68,.2)'],wa:[V.warnSoft,'#b45309','rgba(245,158,11,.2)'],su:[V.successSoft,V.success,'rgba(16,185,129,.2)'],dk:[V.primary,'#fff','transparent'],ro:['#fff1f2','#f43f5e','rgba(244,63,94,.2)'],in:[V.indigoSoft,V.indigo,'rgba(99,102,241,.2)']};
  const [bg,fg,bd]=configs[variant]??configs.se;
  return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:5,padding:size==='sm'?'4px 10px':'7px 14px',borderRadius:8,fontSize:size==='sm'?11:12,fontWeight:600,cursor:'pointer',border:`1px solid ${bd}`,background:bg,color:fg,fontFamily:'inherit',transition:'all .15s',...extStyle}}>{children}</button>;
}
function Card({children,style}:{children:React.ReactNode;style?:React.CSSProperties}){
  return <div style={{background:V.card,borderRadius:12,border:`1px solid ${V.border}`,boxShadow:'0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)',padding:18,...style}}>{children}</div>;
}
function CardHead({title,action}:{title:React.ReactNode;action?:React.ReactNode}){
  return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><div style={{fontSize:14,fontWeight:700}}>{title}</div>{action}</div>;
}
function Prog({label,value,pct,col='blue'}:{label:string;value:string;pct:number;col?:string}){
  const cols:{[k:string]:string}={green:V.success,blue:V.blue,amber:V.warn,red:V.danger,teal:V.teal,purple:V.purple,orange:V.orange};
  return <div style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:12,fontWeight:600}}>{label}</span><span style={{fontSize:12,fontWeight:700,color:V.muted}}>{value}</span></div><div style={{height:7,background:'#f1f5f9',borderRadius:10,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,borderRadius:10,background:cols[col]??V.blue,transition:'width .4s ease'}}/></div></div>;
}
function StatCard({col='blue',icon,val,label,badge,onClick}:{col?:string;icon:string;val:string;label:string;badge?:[string,string];onClick?:()=>void}){
  const topBorder:{[k:string]:string}={blue:V.blue,green:V.success,red:V.danger,amber:V.warn,purple:V.purple,teal:V.teal,orange:V.orange,indigo:V.indigo};
  const iconBg:{[k:string]:string}={blue:V.blueSoft,green:V.successSoft,red:V.dangerSoft,amber:V.warnSoft,purple:V.purpleSoft,teal:V.tealSoft,orange:V.orangeSoft,indigo:V.indigoSoft};
  return <div onClick={onClick} style={{background:V.card,borderRadius:12,padding:'16px 18px',border:`1px solid ${V.border}`,borderTop:`3px solid ${topBorder[col]??V.blue}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)',cursor:onClick?'pointer':'default',transition:'all .2s'}}
    onMouseEnter={e=>onClick&&((e.currentTarget as HTMLElement).style.transform='translateY(-2px)')}
    onMouseLeave={e=>((e.currentTarget as HTMLElement).style.transform='none')}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
      <div style={{width:34,height:34,borderRadius:8,background:iconBg[col]??V.blueSoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>{icon}</div>
      {badge&&<span style={{fontSize:10,fontWeight:600,padding:'2px 6px',borderRadius:20,background:badge[0]==='up'?V.successSoft:badge[0]==='dn'?V.dangerSoft:'#f1f5f9',color:badge[0]==='up'?V.success:badge[0]==='dn'?V.danger:V.muted}}>{badge[1]}</span>}
    </div>
    <div style={{fontSize:24,fontWeight:800}}>{val}</div>
    <div style={{fontSize:11,color:V.muted,marginTop:2}}>{label}</div>
  </div>;
}
function Modal({open,onClose,title,children,wide}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode;wide?:boolean}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
    <div onClick={e=>e.stopPropagation()} style={{background:V.card,borderRadius:14,padding:24,width:wide?700:540,maxWidth:'100%',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.2)',animation:'mIn .2s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}><div style={{fontSize:15,fontWeight:700}}>{title}</div><button onClick={onClose} style={{width:26,height:26,borderRadius:6,border:`1px solid ${V.border}`,background:'#f8fafc',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button></div>
      {children}
    </div>
  </div>;
}
function FG({label,children}:{label:string;children:React.ReactNode}){return <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:700,color:V.muted,marginBottom:5,display:'block',textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</label>{children}</div>;}
function FI({placeholder,value,type='text',onChange}:{placeholder?:string;value?:string;type?:string;onChange?:(v:string)=>void}){return <input defaultValue={value} type={type} placeholder={placeholder} onChange={e=>onChange?.(e.target.value)} style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none',boxSizing:'border-box'}}/>;}
function FS({children}:{children:React.ReactNode}){return <select style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none'}}>{children}</select>;}
function FTA({placeholder,minH=80}:{placeholder?:string;minH?:number}){return <textarea placeholder={placeholder} style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none',resize:'vertical',minHeight:minH,boxSizing:'border-box'}}/>;}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function TeacherPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>('dashboard');
  const [modal, setModal] = useState<Modal>(null);
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const [attClass, setAttClass] = useState('S4A');
  const [marksClass, setMarksClass] = useState('S4A');
  const [attendance, setAttendance] = useState<Record<string,boolean>>({});
  const [scores, setScores] = useState<Record<string,number>>(
    Object.fromEntries(S4A_STUDENTS.map(s=>[s.reg,s.score]))
  );

  const toast=useCallback((msg:string,type:ToastT['type']='default')=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  },[]);

  useEffect(()=>{
    setTimeout(()=>toast('📚 S3B class starts in 15 minutes — Room 15','info'),800);
    setTimeout(()=>toast('📝 2 assignments need marking — S4A, S6A','warning'),2400);
  },[toast]);

  // Init attendance state
  useEffect(()=>{
    const init:Record<string,boolean>={};
    S4A_STUDENTS.forEach(s=>{ init[s.reg]=s.present??true; });
    setAttendance(init);
  },[]);

  const navSections = [
    { label:'Overview', items:[{id:'dashboard',icon:'🏠',label:'Dashboard'},{id:'classes',icon:'📚',label:'My Classes'}] },
    { label:'Teaching', items:[{id:'attendance',icon:'✅',label:'Attendance'},{id:'marks',icon:'📊',label:'Marks & Grades'},{id:'notes',icon:'📝',label:'Lesson Notes'},{id:'assignments',icon:'📋',label:'Assignments'}] },
    { label:'Academic', items:[{id:'curriculum',icon:'🗂️',label:'Curriculum Coverage'}] },
    { label:'Admin', items:[{id:'communications',icon:'💬',label:'Communications',badge:3},{id:'portals',icon:'🔗',label:'Portals'}] },
  ];
  const pageTitles:{[k:string]:string}={dashboard:'Dashboard',classes:'My Classes',attendance:'Attendance',marks:'Marks & Grades',notes:'Lesson Notes',assignments:'Assignments',curriculum:'Curriculum Coverage',communications:'Communications',portals:'Portals',settings:'Settings'};

  /* ── Sidebar ── */
  const Sidebar = () => (
    <div style={{width:256,background:V.primary,minHeight:'100vh',position:'fixed',left:0,top:0,bottom:0,display:'flex',flexDirection:'column',zIndex:100,overflowY:'auto'}}>
      <div style={{padding:'14px 14px 10px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,99,235,.25)',border:'1px solid rgba(37,99,235,.4)',borderRadius:8,padding:'7px 10px',marginBottom:10}}>
          <div style={{width:26,height:26,borderRadius:6,background:V.acc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>📚</div>
          <div><div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.9)',letterSpacing:'.07em',textTransform:'uppercase'}}>SMISSI</div><div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>Teacher Portal</div></div>
        </div>
      </div>
      <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0}}>NM</div>
        <div><div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{user?.name??'Ms. Nakakande Mary'}</div><div style={{fontSize:10,color:'rgba(255,255,255,.38)'}}>HOD Mathematics</div></div>
        <div style={{width:6,height:6,borderRadius:'50%',background:V.success,marginLeft:'auto',boxShadow:'0 0 0 2px rgba(16,185,129,.25)'}}/>
      </div>
      {navSections.map(sec=>(
        <div key={sec.label} style={{padding:'10px 8px 2px'}}>
          <div style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.22)',textTransform:'uppercase',letterSpacing:'.12em',padding:'0 6px',marginBottom:3}}>{sec.label}</div>
          {sec.items.map(item=>(
            <div key={item.id} onClick={()=>setPage(item.id as Page)} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 8px',borderRadius:7,cursor:'pointer',color:page===item.id?'#fff':'rgba(255,255,255,.52)',fontSize:12,fontWeight:500,marginBottom:1,background:page===item.id?'rgba(37,99,235,.35)':'transparent',position:'relative',transition:'all .15s'}}>
              {page===item.id&&<div style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',width:3,height:18,background:V.acc,borderRadius:'0 3px 3px 0'}}/>}
              <span style={{fontSize:14,width:18,textAlign:'center'}}>{item.icon}</span>
              {item.label}
              {item.badge&&<span style={{marginLeft:'auto',background:V.danger,color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:20}}>{item.badge}</span>}
            </div>
          ))}
        </div>
      ))}
      <div style={{marginTop:'auto',padding:10,borderTop:'1px solid rgba(255,255,255,.07)'}}>
        <div onClick={()=>setPage('settings')} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 8px',borderRadius:7,cursor:'pointer',color:'rgba(255,255,255,.52)',fontSize:12,marginBottom:7}}><span>⚙️</span> Settings</div>
        <button onClick={()=>{logout();navigate('/login');}} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 10px',borderRadius:7,border:'none',background:'rgba(239,68,68,.12)',color:'#fca5a5',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>🚪 Logout</button>
      </div>
    </div>
  );

  /* ── Topbar ── */
  const Topbar = () => (
    <header style={{height:60,background:V.card,borderBottom:`1px solid ${V.border}`,display:'flex',alignItems:'center',padding:'0 22px',gap:14,position:'sticky',top:0,zIndex:50}}>
      <div><div style={{fontSize:15,fontWeight:700}}>{pageTitles[page]}</div><div style={{fontSize:11,color:V.muted,marginTop:1}}>HOD Mathematics · Term 1, Week 8 · Sat 07 Mar 2026</div></div>
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
        <span style={{background:V.blueSoft,color:V.accDark,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20,border:`1px solid rgba(37,99,235,.2)`}}>Week 8 of 14</span>
        <span style={{background:'#f1f5f9',color:V.muted,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20}}>Sat, 07 Mar</span>
        <button style={{width:34,height:34,borderRadius:8,border:`1px solid ${V.border}`,background:V.card,cursor:'pointer',fontSize:15,position:'relative',color:V.muted,display:'flex',alignItems:'center',justifyContent:'center'}}>🔔<span style={{position:'absolute',top:5,right:5,width:6,height:6,background:V.danger,borderRadius:'50%',border:'1.5px solid #fff'}}/></button>
      </div>
    </header>
  );

  /* ─────── DASHBOARD ─────── */
  const PageDashboard = () => (
    <div>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#7c3aed 100%)',borderRadius:12,padding:'20px 24px',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-40,top:-40,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,.05)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontSize:18,fontWeight:700,margin:0}}>Good morning, Ms. Nakakande 👋</h2>
          <p style={{fontSize:12,color:'rgba(255,255,255,.65)',marginTop:3}}>SMISSI Senior Secondary · HOD Mathematics · Sat 07 Mar 2026</p>
          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
            {[['📚 5 classes today',false],['✅ 2 classes done',false],['⚠️ 2 assignments to mark',true],['📊 S4A end-term marks due Friday',true]].map(([t,red])=>(
              <span key={String(t)} style={{background:red?'rgba(239,68,68,.3)':'rgba(255,255,255,.15)',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600}}>{String(t)}</span>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:20,position:'relative',zIndex:1,flexShrink:0}}>
          {[['152','Students Today'],['68%','Syllabus Done'],['87%','Avg. Attendance'],['2','Pending Mark']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:800}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginTop:1}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
        <Btn variant="pr" onClick={()=>setModal('takeAttendance')}>✅ Take Attendance</Btn>
        <Btn onClick={()=>setModal('enterMarks')}>📊 Enter Marks</Btn>
        <Btn onClick={()=>setModal('addNote')}>📝 Add Lesson Note</Btn>
        <Btn onClick={()=>setModal('newAssignment')}>📋 New Assignment</Btn>
        <Btn variant="in" onClick={()=>setModal('msgModal')}>💬 Message Student</Btn>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="blue" icon="📚" val="5" label="Classes Today" badge={['fl','Sat 07 Mar']} onClick={()=>setPage('classes')}/>
        <StatCard col="green" icon="✅" val="87%" label="Avg. Attendance (Term)" badge={['up','↑ 3%']}/>
        <StatCard col="amber" icon="📊" val="2" label="Assignments to Mark" badge={['dn','Due this week']} onClick={()=>setPage('assignments')}/>
        <StatCard col="purple" icon="🗂️" val="68%" label="Syllabus Coverage" badge={['fl','Week 8']} onClick={()=>setPage('curriculum')}/>
      </div>

      {/* Main grid */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:18}}>
        {/* Today's classes */}
        <Card>
          <CardHead title="📅 Today's Classes — Sat 07 Mar" action={<span onClick={()=>setPage('classes')} style={{fontSize:11,color:V.acc,fontWeight:600,cursor:'pointer'}}>All classes →</span>}/>
          {MY_CLASSES.map(c=>{
            const [bg,color]=statusChipCols(c.status);
            return <div key={c.code+c.period} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${V.border}`}}>
              <div style={{fontSize:11,fontWeight:700,color:V.muted,width:90,flexShrink:0}}>{c.period.split('·')[0].trim()}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:V.text}}>{c.code} — {c.subject}</div>
                <div style={{fontSize:11,color:V.muted}}>{c.room} · {c.students} students</div>
              </div>
              <Chip bg={bg} color={color}>{c.status}</Chip>
              {c.status!=='Upcoming'&&c.attendance>0&&<div style={{fontSize:11,fontWeight:700,color:c.attendance>=90?V.success:c.attendance>=75?V.warn:V.danger}}>{c.attendance}%</div>}
              {c.status==='Upcoming'&&<Btn size="sm" variant="pr" onClick={()=>setModal('takeAttendance')}>Take Att.</Btn>}
            </div>;
          })}
        </Card>

        {/* Right column */}
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="📊 Class Performance Summary"/>
            {[['S4A','Maths',86,'green'],['S5A','Maths',74,'blue'],['S3B','Maths',69,'amber'],['S6A','Further Maths',79,'teal']].map(([cls,sub,pct,col])=>(
              <Prog key={String(cls)} label={`${cls} — ${sub}`} value={`${pct}%`} pct={Number(pct)} col={String(col)}/>
            ))}
          </Card>
          <Card>
            <CardHead title="📋 Pending Actions"/>
            {[{dot:'red',t:'Mark S4A Quadratics assignment (38/42 submitted)',s:'Due Tue 10 Mar'},
              {dot:'red',t:'Enter S6A end-term practical marks',s:'Deadline: Fri 13 Mar'},
              {dot:'amber',t:'Submit S5A syllabus coverage report to HOD',s:'Due this week'},
              {dot:'blue',t:'Parent-teacher meeting — Kevin Ssali (S4A)',s:'Thu 12 Mar 2:00 PM'},
            ].map(a=>(
              <div key={a.t} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 0',borderBottom:`1px solid ${V.border}`}}>
                <div style={{width:7,height:7,borderRadius:'50%',marginTop:4,flexShrink:0,background:a.dot==='red'?V.danger:a.dot==='amber'?V.warn:V.blue,boxShadow:`0 0 0 3px ${a.dot==='red'?V.dangerSoft:a.dot==='amber'?V.warnSoft:V.blueSoft}`}}/>
                <div><div style={{fontSize:12,fontWeight:600}}>{a.t}</div><div style={{fontSize:10,color:V.muted,marginTop:1}}>{a.s}</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );

  /* ─────── MY CLASSES ─────── */
  const PageClasses = () => (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>My Classes</div><div style={{fontSize:12,color:V.muted}}>5 classes · Term 1, 2026 · HOD Mathematics</div></div>
        <Btn variant="pr" onClick={()=>setModal('takeAttendance')}>✅ Take Attendance</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="blue" icon="👥" val="152" label="Total Students"/>
        <StatCard col="green" icon="✅" val="87%" label="Avg Attendance (Term)"/>
        <StatCard col="amber" icon="📊" val="74%" label="Avg Class Score"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {MY_CLASSES.map(c=>{
          const [bg,color]=statusChipCols(c.status);
          return <div key={c.code} style={{background:V.card,borderRadius:12,border:`1px solid ${V.border}`,borderLeft:`4px solid ${c.status==='Done'?V.success:c.status==='Now'?V.blue:V.border}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)',padding:18}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:V.text}}>{c.code}</div>
                <div style={{fontSize:13,fontWeight:600,color:V.muted,marginTop:2}}>{c.subject}</div>
              </div>
              <Chip bg={bg} color={color}>{c.status}</Chip>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
              {[['📍',c.room],['👥',`${c.students} students`],['🕐',c.period.split('·')[1]?.trim()??''],['📊',c.attendance>0?`${c.attendance}% att.`:'—']].map(([ic,val])=>(
                <div key={String(ic)} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:V.muted}}><span>{ic}</span>{val}</div>
              ))}
            </div>
            <div style={{display:'flex',gap:6}}>
              <Btn size="sm" onClick={()=>setModal('takeAttendance')}>✅ Attendance</Btn>
              <Btn size="sm" onClick={()=>setModal('enterMarks')}>📊 Marks</Btn>
              <Btn size="sm" variant="pr" onClick={()=>setModal('addNote')}>📝 Note</Btn>
            </div>
          </div>;
        })}
      </div>
    </div>
  );

  /* ─────── ATTENDANCE ─────── */
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = S4A_STUDENTS.length;
  const PageAttendance = () => (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Attendance</div><div style={{fontSize:12,color:V.muted}}>Mark and review student attendance · Term 1, 2026</div></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select value={attClass} onChange={e=>setAttClass(e.target.value)} style={{padding:'6px 10px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,background:'#f8fafc',fontFamily:'inherit'}}>
            {['S4A','S5A','S3B','S6A','S4B'].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <Btn variant="pr" onClick={()=>toast('Attendance saved ✓','success')}>💾 Save Attendance</Btn>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="green" icon="✅" val={String(presentCount)} label="Present Today"/>
        <StatCard col="red" icon="❌" val={String(totalCount-presentCount)} label="Absent"/>
        <StatCard col="blue" icon="📊" val={`${Math.round(presentCount/totalCount*100)}%`} label="Attendance Rate"/>
        <StatCard col="amber" icon="⚠️" val="3" label="Chronic Absence (≤70%)"/>
      </div>
      <Card>
        <CardHead title={`✅ ${attClass} — Attendance · Sat 07 Mar 2026`} action={<div style={{display:'flex',gap:6}}><Btn size="sm" onClick={()=>{const all:Record<string,boolean>={};S4A_STUDENTS.forEach(s=>{all[s.reg]=true;});setAttendance(all);}}>Mark All Present</Btn><Btn size="sm" variant="da" onClick={()=>{const none:Record<string,boolean>={};S4A_STUDENTS.forEach(s=>{none[s.reg]=false;});setAttendance(none);}}>Mark All Absent</Btn></div>}/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['#','Student','Reg No.','Term Att.','Today','Action'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {S4A_STUDENTS.map((s,i)=>{
                const present=attendance[s.reg]??true;
                const [bg,color]=present?[V.successSoft,V.success]:[V.dangerSoft,V.danger];
                return <tr key={s.reg} style={{borderBottom:`1px solid ${V.border}`}}>
                  <td style={{padding:'10px 12px',fontSize:12,color:V.muted}}>{i+1}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{s.name}</td>
                  <td style={{padding:'10px 12px',fontSize:11,color:V.muted}}>{s.reg}</td>
                  <td style={{padding:'10px 12px'}}><div style={{fontSize:11,fontWeight:700,color:parseFloat(s.attendance)>=85?V.success:parseFloat(s.attendance)>=70?V.warn:V.danger}}>{s.attendance}</div></td>
                  <td style={{padding:'10px 12px'}}><Chip bg={bg} color={color}>{present?'Present':'Absent'}</Chip></td>
                  <td style={{padding:'10px 12px'}}>
                    <button onClick={()=>setAttendance(a=>({...a,[s.reg]:!a[s.reg]}))} style={{padding:'4px 12px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${present?V.dangerSoft:V.successSoft}`,background:present?V.dangerSoft:V.successSoft,color:present?V.danger:V.success,fontFamily:'inherit'}}>
                      {present?'Mark Absent':'Mark Present'}
                    </button>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:14,padding:'10px 12px',background:'#f8fafc',borderRadius:8,fontSize:12,display:'flex',gap:20}}>
          <span style={{color:V.success,fontWeight:700}}>Present: {presentCount}</span>
          <span style={{color:V.danger,fontWeight:700}}>Absent: {totalCount-presentCount}</span>
          <span style={{color:V.muted}}>Rate: {Math.round(presentCount/totalCount*100)}%</span>
          <span style={{color:V.muted,marginLeft:'auto'}}>Sat 07 Mar 2026 · P4 Mathematics</span>
        </div>
      </Card>
    </div>
  );

  /* ─────── MARKS & GRADES ─────── */
  const calcGrade=(n:number)=>n>=80?'D1':n>=75?'D2':n>=70?'C3':n>=65?'C4':n>=60?'C5':n>=55?'C6':n>=50?'P7':n>=45?'P8':'F9';
  const classAvg=Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/Object.values(scores).length);

  const PageMarks = () => (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Marks & Grades</div><div style={{fontSize:12,color:V.muted}}>Enter, verify, and publish student marks · Term 1, 2026</div></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select value={marksClass} onChange={e=>setMarksClass(e.target.value)} style={{padding:'6px 10px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,background:'#f8fafc',fontFamily:'inherit'}}>
            {['S4A','S5A','S3B','S6A','S4B'].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <Btn onClick={()=>toast('Marks exported to PDF','info')}>📤 Export</Btn>
          <Btn variant="pr" onClick={()=>toast('Marks saved & submitted ✓','success')}>💾 Save & Submit</Btn>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="blue" icon="📊" val={`${classAvg}%`} label="Class Average"/>
        <StatCard col="green" icon="🏆" val={String(Object.values(scores).filter(s=>s>=70).length)} label="Distinction/Credit"/>
        <StatCard col="amber" icon="⚠️" val={String(Object.values(scores).filter(s=>s<50).length)} label="Below Pass"/>
        <StatCard col="red" icon="❌" val={String(Object.values(scores).filter(s=>s<45).length)} label="Fail (F9)"/>
      </div>
      <Card>
        <CardHead title={`📊 ${marksClass} — End of Term Marks · Mathematics`} action={<span style={{fontSize:11,background:V.warnSoft,color:'#b45309',padding:'3px 8px',borderRadius:20,fontWeight:700}}>⚠ Not yet submitted</span>}/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['#','Student','Marks (/100)','%','Grade','Rank','Action'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {S4A_STUDENTS
                .map(s=>({...s,sc:scores[s.reg]??s.score}))
                .sort((a,b)=>b.sc-a.sc)
                .map((s,i)=>{
                  const g=calcGrade(s.sc);
                  const [bg,color]=gradeColor(g);
                  return <tr key={s.reg} style={{borderBottom:`1px solid ${V.border}`,background:i%2===0?'transparent':'#fafbfc'}}>
                    <td style={{padding:'10px 12px',fontSize:12,color:V.muted}}>{i+1}</td>
                    <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{s.name}</td>
                    <td style={{padding:'10px 12px'}}>
                      <input type="number" value={s.sc} min={0} max={100}
                        onChange={e=>setScores(prev=>({...prev,[s.reg]:Math.min(100,Math.max(0,parseInt(e.target.value)||0))}))}
                        style={{width:60,padding:'4px 8px',border:`1px solid ${V.border}`,borderRadius:6,fontSize:12,fontFamily:'inherit',background:'#f8fafc',textAlign:'center'}}/>
                    </td>
                    <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:s.sc>=70?V.success:s.sc>=50?V.warn:V.danger}}>{s.sc}%</td>
                    <td style={{padding:'10px 12px'}}><span style={{display:'inline-flex',alignItems:'center',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:bg,color}}>{g}</span></td>
                    <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:V.muted}}>#{i+1}</td>
                    <td style={{padding:'10px 12px'}}><Btn size="sm" onClick={()=>toast(`${s.name}'s mark verified ✓`,'success')}>✓ Verify</Btn></td>
                  </tr>;
                })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:14,padding:'10px 14px',background:'#f8fafc',borderRadius:8,fontSize:12,display:'flex',gap:16,flexWrap:'wrap'}}>
          <span style={{fontWeight:700}}>Class Avg: <span style={{color:classAvg>=70?V.success:classAvg>=50?V.warn:V.danger}}>{classAvg}%</span></span>
          <span style={{color:V.muted}}>Pass Rate: {Object.values(scores).filter(s=>s>=50).length}/{S4A_STUDENTS.length} ({Math.round(Object.values(scores).filter(s=>s>=50).length/S4A_STUDENTS.length*100)}%)</span>
          <span style={{color:V.muted}}>Highest: <b style={{color:V.success}}>{Math.max(...Object.values(scores))}%</b></span>
          <span style={{color:V.muted}}>Lowest: <b style={{color:V.danger}}>{Math.min(...Object.values(scores))}%</b></span>
        </div>
      </Card>
    </div>
  );

  /* ─────── LESSON NOTES ─────── */
  const PageNotes = () => (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Lesson Notes & Resources</div><div style={{fontSize:12,color:V.muted}}>Create, share, and manage teaching resources</div></div>
        <Btn variant="pr" onClick={()=>setModal('addNote')}>📝 New Note / Resource</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="blue" icon="📝" val="18" label="Notes This Term"/>
        <StatCard col="green" icon="✅" val="14" label="Shared with Students"/>
        <StatCard col="amber" icon="📋" val="4" label="Draft / Pending Review"/>
      </div>
      <Card>
        <CardHead title="📝 Recent Lesson Notes"/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Date','Class','Topic','Type','Status',''].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {LESSON_NOTES.map((n,i)=>{
                const shared=n.status==='Shared';
                return <tr key={i} style={{borderBottom:`1px solid ${V.border}`}}>
                  <td style={{padding:'10px 12px',fontSize:12,color:V.muted}}>{n.date}</td>
                  <td style={{padding:'10px 12px'}}><span style={{background:V.blueSoft,color:V.blue,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20}}>{n.cls}</span></td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{n.topic}</td>
                  <td style={{padding:'10px 12px'}}><span style={{background:n.type==='Scheme of Work'?V.purpleSoft:V.accSoft??V.blueSoft,color:n.type==='Scheme of Work'?V.purple:V.acc,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20}}>{n.type}</span></td>
                  <td style={{padding:'10px 12px'}}><Chip bg={shared?V.successSoft:V.warnSoft} color={shared?V.success:'#b45309'}>{n.status}</Chip></td>
                  <td style={{padding:'10px 12px'}}><div style={{display:'flex',gap:5}}><Btn size="sm">✏️ Edit</Btn>{!shared&&<Btn size="sm" variant="pr" onClick={()=>toast('Note shared with class ✓','success')}>Share</Btn>}</div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─────── ASSIGNMENTS ─────── */
  const PageAssignments = () => (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Assignments</div><div style={{fontSize:12,color:V.muted}}>Create, distribute, and mark assignments</div></div>
        <Btn variant="pr" onClick={()=>setModal('newAssignment')}>📋 New Assignment</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="blue" icon="📋" val="5" label="Active Assignments"/>
        <StatCard col="amber" icon="⏳" val="2" label="Awaiting Marking"/>
        <StatCard col="green" icon="✅" val="2" label="Marked & Returned"/>
        <StatCard col="red" icon="⚠️" val="8" label="Not Yet Submitted"/>
      </div>
      <Card>
        <CardHead title="📋 All Assignments — Term 1"/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Title','Class','Due Date','Submitted','Progress','Status',''].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {ASSIGNMENTS.map((a,i)=>{
                const pct=Math.round(a.submitted/a.total*100);
                const marked=a.status==='Marked';
                return <tr key={i} style={{borderBottom:`1px solid ${V.border}`}}>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{a.title}</td>
                  <td style={{padding:'10px 12px'}}><span style={{background:V.blueSoft,color:V.blue,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20}}>{a.cls}</span></td>
                  <td style={{padding:'10px 12px',fontSize:12,color:V.muted}}>{a.due}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700}}>{a.submitted}/{a.total}</td>
                  <td style={{padding:'10px 12px',minWidth:120}}>
                    <div style={{height:6,background:'#f1f5f9',borderRadius:10,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:pct===100?V.success:pct>=75?V.blue:V.warn,borderRadius:10}}/>
                    </div>
                    <div style={{fontSize:10,color:V.muted,marginTop:3}}>{pct}%</div>
                  </td>
                  <td style={{padding:'10px 12px'}}><Chip bg={marked?V.successSoft:V.blueSoft} color={marked?V.success:V.blue}>{a.status}</Chip></td>
                  <td style={{padding:'10px 12px'}}>
                    <div style={{display:'flex',gap:5}}>
                      {!marked&&<Btn size="sm" variant="pr" onClick={()=>toast(`Opening ${a.cls} marking sheet...`,'info')}>📊 Mark</Btn>}
                      <Btn size="sm" onClick={()=>toast('Assignment details opened','info')}>View</Btn>
                    </div>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─────── CURRICULUM COVERAGE ─────── */
  const overallCoverage = Math.round(SUBJECT_UNITS.reduce((a,u)=>a+u.coverage,0)/SUBJECT_UNITS.length);
  const PageCurriculum = () => (
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:4}}>Curriculum Coverage</div>
      <div style={{fontSize:12,color:V.muted,marginBottom:18}}>S4 Mathematics · Uganda National Curriculum · Term 1, 2026</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="blue" icon="📖" val={`${overallCoverage}%`} label="Overall Coverage"/>
        <StatCard col="green" icon="✅" val={String(SUBJECT_UNITS.filter(u=>u.status==='Done').length)} label="Units Complete"/>
        <StatCard col="amber" icon="🔄" val={String(SUBJECT_UNITS.filter(u=>u.status==='In Progress').length)} label="In Progress"/>
        <StatCard col="red" icon="⏳" val={String(SUBJECT_UNITS.filter(u=>u.status==='Not Started').length)} label="Not Started"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        <Card>
          <CardHead title="📚 Unit-by-Unit Progress" action={<Btn size="sm" onClick={()=>toast('Syllabus report submitted to DHM ✓','success')}>📤 Submit to DHM</Btn>}/>
          {SUBJECT_UNITS.map((u,i)=>{
            const [bg,color]=u.status==='Done'?[V.successSoft,V.success]:u.status==='In Progress'?[V.blueSoft,V.blue]:['#f1f5f9',V.muted];
            return <div key={i} style={{marginBottom:16,padding:'12px 14px',background:'#f8fafc',borderRadius:9,border:`1px solid ${V.border}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700}}>{u.unit}</div>
                  <div style={{fontSize:10,color:V.muted}}>{u.weeks} weeks allocated</div>
                </div>
                <Chip bg={bg} color={color}>{u.status}</Chip>
                <span style={{fontSize:12,fontWeight:800,color:u.coverage===100?V.success:u.coverage>0?V.blue:V.muted}}>{u.coverage}%</span>
              </div>
              <Prog label="" value="" pct={u.coverage} col={u.status==='Done'?'green':u.status==='In Progress'?'blue':'amber'}/>
              {u.status==='In Progress'&&<Btn size="sm" variant="pr" onClick={()=>toast('Coverage updated ✓','success')}>Update Progress</Btn>}
            </div>;
          })}
        </Card>
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="📊 Coverage by Subject (All Classes)"/>
            {[['S4A — Maths',68,'blue'],['S5A — Maths',72,'teal'],['S3B — Maths',61,'amber'],['S6A — Further Maths',55,'purple'],['S4B — Maths',68,'blue']].map(([l,p,c])=>(
              <Prog key={String(l)} label={String(l)} value={`${p}%`} pct={Number(p)} col={String(c)}/>
            ))}
          </Card>
          <Card>
            <CardHead title="📅 Upcoming Unit Deadlines"/>
            {[{unit:'Geometry — complete',cls:'S4A',due:'14 Mar',urgent:true},{unit:'Statistics — intro',cls:'S4B',due:'18 Mar',urgent:false},{unit:'Calculus — start',cls:'S6A',due:'21 Mar',urgent:false}].map(d=>(
              <div key={d.unit} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 0',borderBottom:`1px solid ${V.border}`}}>
                <div style={{width:7,height:7,borderRadius:'50%',marginTop:4,flexShrink:0,background:d.urgent?V.danger:V.warn,boxShadow:`0 0 0 3px ${d.urgent?V.dangerSoft:V.warnSoft}`}}/>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{d.unit}</div><div style={{fontSize:10,color:V.muted}}>{d.cls} · Due {d.due}</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );

  /* ─────── COMMUNICATIONS ─────── */
  const PageCommunications = () => (
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Communications</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <CardHead title="📬 Inbox (3 unread)"/>
          {[{init:'HT',bg:'#1e293b',from:'Head Teacher',title:'S4A end-term marks deadline reminder',sub:'2 hrs ago · Unread'},
            {init:'EO',bg:'linear-gradient(135deg,#7c3aed,#f43f5e)',from:'Exam Officer',title:'S6 Further Maths paper — moderation required',sub:'3 hrs ago · Unread'},
            {init:'PR',bg:'linear-gradient(135deg,#ef4444,#f97316)',from:'Parent (Ssali)',title:'Kevin academic performance — meeting request',sub:'Yesterday · Unread'},
            {init:'SC',bg:'linear-gradient(135deg,#0d9488,#84a98c)',from:'Counsellor',title:'S4A student — low attendance concern shared',sub:'2 days ago'},
          ].map(m=>(
            <div key={m.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 6px',background:m.sub.includes('Unread')?V.accSoft:'transparent',borderRadius:8,marginBottom:5,cursor:'pointer'}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{m.init}</div>
              <div><div style={{fontSize:12,fontWeight:600}}>{m.title}</div><div style={{fontSize:10,color:V.muted,marginTop:1}}>{m.from} · {m.sub}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHead title="✉️ Compose Message"/>
          <FG label="To"><FS><option>Head Teacher</option><option>Deputy HM</option><option>HOD (own)</option><option>Exam Officer</option><option>School Counsellor</option><option>Parent / Guardian</option><option>Student</option></FS></FG>
          <FG label="Subject"><FI placeholder="Subject..."/></FG>
          <FG label="Message"><FTA placeholder="Type your message here..."/></FG>
          <Btn variant="pr" onClick={()=>toast('Message sent ✓','success')}>📤 Send</Btn>
        </Card>
      </div>
    </div>
  );

  /* ─────── PORTALS ─────── */
  const PagePortals = () => (
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Portal Quick Access</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {[['🏫','#059669',V.successSoft,'Head Teacher','/ht/dashboard'],['📋','#0ea5e9','#f0f9ff','Deputy HM','/deputy-hm'],['📝','#7c3aed',V.purpleSoft,'Exam Officer','/exam-officer'],['💚','#0d9488',V.tealSoft,'School Counsellor','/counsellor'],['🎒',V.purple,V.purpleSoft,'Student Portal','/student'],['👨‍👩‍👧',V.orange,V.orangeSoft,'Parent Portal','/parent']].map(([icon,border,bg,title,path])=>(
          <div key={String(title)} onClick={()=>navigate(String(path))} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:V.card,border:`1px solid ${V.border}`,borderRadius:10,cursor:'pointer',borderLeft:`4px solid ${border}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)',transition:'all .2s'}}>
            <div style={{width:36,height:36,borderRadius:9,background:String(bg),display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{icon}</div>
            <div style={{fontSize:12,fontWeight:700}}>{title}</div>
            <span style={{marginLeft:'auto',color:V.light}}>↗</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─────── SETTINGS ─────── */
  const PageSettings = () => (
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Settings</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Profile</div>
          <FG label="Full Name"><FI value="Ms. Nakakande Mary"/></FG>
          <FG label="Role"><FI value="HOD Mathematics, Senior Teacher"/></FG>
          <FG label="Email"><FI value="m.nakakande@smissi.ac.ug" type="email"/></FG>
          <FG label="Phone"><FI value="+256 772 000 111"/></FG>
          <Btn variant="pr" onClick={()=>toast('Profile updated ✓','success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Preferences</div>
          <FG label="Default class view"><FS><option>S4A</option><option>S5A</option><option>S3B</option><option>S6A</option></FS></FG>
          <FG label="Mark entry format"><FS><option>Out of 100</option><option>Out of 80</option><option>Custom</option></FS></FG>
          <FG label="Notifications"><FS><option>All notifications</option><option>Urgent only</option><option>Off</option></FS></FG>
          <Btn variant="pr" onClick={()=>toast('Preferences saved ✓','success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );

  /* ═══════════════════════════
     RENDER
  ═══════════════════════════ */
  return (
    <div style={{minHeight:'100vh',background:V.bg,display:'flex',fontFamily:"'DM Sans',sans-serif",fontSize:14}}>
      <Sidebar/>
      <div style={{marginLeft:256,flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <Topbar/>
        <div style={{padding:20,flex:1}}>
          {page==='dashboard'&&<PageDashboard/>}
          {page==='classes'&&<PageClasses/>}
          {page==='attendance'&&<PageAttendance/>}
          {page==='marks'&&<PageMarks/>}
          {page==='notes'&&<PageNotes/>}
          {page==='assignments'&&<PageAssignments/>}
          {page==='curriculum'&&<PageCurriculum/>}
          {page==='communications'&&<PageCommunications/>}
          {page==='portals'&&<PagePortals/>}
          {page==='settings'&&<PageSettings/>}
        </div>
      </div>

      {/* ── MODALS ── */}
      <Modal open={modal==='takeAttendance'} onClose={()=>setModal(null)} title="✅ Take Attendance">
        <FG label="Class"><FS><option>S4A — Mathematics</option><option>S5A — Mathematics</option><option>S3B — Mathematics</option><option>S6A — Further Maths</option></FS></FG>
        <FG label="Date & Period">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <FI type="date" value="2026-03-07"/>
            <FS><option>P1 (7:30)</option><option>P2 (8:20)</option><option>P4 (10:30)</option><option>P6 (13:00)</option></FS>
          </div>
        </FG>
        <div style={{background:'#f8fafc',borderRadius:8,padding:12,marginBottom:14}}>
          {S4A_STUDENTS.slice(0,6).map(s=>(
            <div key={s.reg} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${V.border}`}}>
              <span style={{fontSize:12,fontWeight:600}}>{s.name}</span>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setAttendance(a=>({...a,[s.reg]:true}))} style={{padding:'3px 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${attendance[s.reg]===true?V.success:V.border}`,background:attendance[s.reg]===true?V.successSoft:'transparent',color:attendance[s.reg]===true?V.success:V.muted,fontFamily:'inherit'}}>P</button>
                <button onClick={()=>setAttendance(a=>({...a,[s.reg]:false}))} style={{padding:'3px 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${attendance[s.reg]===false?V.danger:V.border}`,background:attendance[s.reg]===false?V.dangerSoft:'transparent',color:attendance[s.reg]===false?V.danger:V.muted,fontFamily:'inherit'}}>A</button>
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:V.muted,marginTop:6}}>Showing 6 of {S4A_STUDENTS.length} · Open full attendance page for all students</div>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Attendance saved ✓','success');}}>Save Attendance</Btn></div>
      </Modal>

      <Modal open={modal==='enterMarks'} onClose={()=>setModal(null)} title="📊 Enter Marks" wide>
        <FG label="Class & Assessment">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <FS><option>S4A — Mathematics</option><option>S5A — Mathematics</option><option>S6A — Further Maths</option></FS>
            <FS><option>End of Term Exam</option><option>Mid-Term Test</option><option>Assignment</option><option>CAT</option></FS>
          </div>
        </FG>
        <FG label="Maximum Score"><FI value="100" type="number"/></FG>
        <div style={{background:'#f8fafc',borderRadius:8,padding:12,marginBottom:14,maxHeight:300,overflowY:'auto'}}>
          {S4A_STUDENTS.map(s=>(
            <div key={s.reg} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:`1px solid ${V.border}`}}>
              <span style={{fontSize:12,fontWeight:600,flex:1}}>{s.name}</span>
              <span style={{fontSize:10,color:V.muted,width:70}}>{s.reg}</span>
              <input type="number" defaultValue={s.score} min={0} max={100} style={{width:65,padding:'4px 8px',border:`1px solid ${V.border}`,borderRadius:6,fontSize:12,fontFamily:'inherit',background:'#fff',textAlign:'center'}}/>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Marks saved successfully ✓','success');}}>Save Marks</Btn></div>
      </Modal>

      <Modal open={modal==='addNote'} onClose={()=>setModal(null)} title="📝 Add Lesson Note / Resource">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Class"><FS><option>S4A</option><option>S5A</option><option>S3B</option><option>S6A</option></FS></FG>
          <FG label="Date"><FI type="date" value="2026-03-07"/></FG>
        </div>
        <FG label="Topic / Title"><FI placeholder="e.g. Trigonometric Identities — sinA cosB formulas"/></FG>
        <FG label="Note Type"><FS><option>Lesson Note</option><option>Scheme of Work</option><option>Worksheet / Exercise</option><option>Past Paper</option><option>Summary Sheet</option></FS></FG>
        <FG label="Content / Notes"><FTA placeholder="Write the full lesson note, key points, examples, or upload a description..." minH={120}/></FG>
        <FG label="Learning Objectives"><FTA placeholder="By the end of this lesson, students will be able to..." minH={60}/></FG>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Share with students?"><FS><option>Yes — share immediately</option><option>No — save as draft</option></FS></FG>
          <FG label="Duration (periods)"><FI value="1" type="number"/></FG>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Lesson note saved ✓','success');}}>Save Note</Btn></div>
      </Modal>

      <Modal open={modal==='newAssignment'} onClose={()=>setModal(null)} title="📋 New Assignment">
        <FG label="Title"><FI placeholder="e.g. Quadratics Problem Set — Chapter 4"/></FG>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Class"><FS><option>S4A</option><option>S5A</option><option>S3B</option><option>S6A</option><option>All my classes</option></FS></FG>
          <FG label="Due Date"><FI type="date"/></FG>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Max Score"><FI value="20" type="number"/></FG>
          <FG label="Type"><FS><option>Homework</option><option>Class Test</option><option>Project</option><option>Past Paper Practice</option></FS></FG>
        </div>
        <FG label="Instructions"><FTA placeholder="Describe what students should do, resources to use, how to submit..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Assignment created & shared ✓','success');}}>Create & Share</Btn></div>
      </Modal>

      <Modal open={modal==='msgModal'} onClose={()=>setModal(null)} title="💬 Send Message">
        <FG label="To"><FS><option>Head Teacher</option><option>Deputy HM (Academic)</option><option>Exam Officer</option><option>School Counsellor</option><option>Parent / Guardian</option><option>Student</option></FS></FG>
        <FG label="Subject"><FI placeholder="Subject..."/></FG>
        <FG label="Message"><FTA placeholder="Your message..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Message sent ✓','success');}}>📤 Send</Btn></div>
      </Modal>

      {/* Toasts */}
      <div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:7}}>
        {toasts.map(t=>(
          <div key={t.id} style={{background:t.type==='success'?'#064e3b':t.type==='warning'?'#78350f':t.type==='info'?'#1e3a5f':t.type==='danger'?'#7f1d1d':'#1e293b',color:'#fff',padding:'10px 16px',borderRadius:9,fontSize:12,fontWeight:500,display:'flex',alignItems:'center',gap:7,boxShadow:'0 8px 24px rgba(0,0,0,.2)',borderLeft:`3px solid ${t.type==='success'?V.success:t.type==='warning'?V.warn:t.type==='info'?V.blue:t.type==='danger'?V.danger:V.muted}`,maxWidth:320,animation:'sIn .25s ease'}}>
            <span>{t.type==='success'?'✅':t.type==='warning'?'⚠️':t.type==='info'?'ℹ️':t.type==='danger'?'🚨':'💬'}</span>{t.msg}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes mIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes sIn{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}
        body{margin:0}*{box-sizing:border-box}
      `}</style>
    </div>
  );
}
