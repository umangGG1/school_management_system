import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── types ── */
type Page = 'dashboard'|'students'|'casenotes'|'sessions'|'safeguarding'|'health'|'ovc'|'career'|'communications'|'announcements'|'portals'|'settings';
type CareerTab = 's6'|'s4'|'groups'|'resources';
type ToastT = { id:number; msg:string; type:'success'|'warning'|'info'|'danger'|'default' };
type Modal = 'session'|'newCase'|'note'|'safeguard'|'health'|'ovc'|'career'|'msg'|null;

/* ── palette ── */
const V = {
  acc:'#0d9488', accSoft:'#f0fdfa', accDark:'#0f766e',
  success:'#10b981', successSoft:'#ecfdf5',
  danger:'#ef4444', dangerSoft:'#fef2f2',
  warn:'#f59e0b', warnSoft:'#fffbeb',
  blue:'#3b82f6', blueSoft:'#eff6ff',
  purple:'#8b5cf6', purpleSoft:'#f5f3ff',
  rose:'#f43f5e', roseSoft:'#fff1f2',
  orange:'#f97316', orangeSoft:'#fff7ed',
  indigo:'#6366f1', indigoSoft:'#eef2ff',
  sage:'#84a98c', sageSoft:'#f2f7f2',
  primary:'#1e293b', bg:'#f7fbfa', card:'#fff', border:'#e2e8f0',
  text:'#1e293b', muted:'#64748b', light:'#94a3b8',
};

/* ── static data ── */
const CASES = [
  {name:'Nakato Sarah',cls:'S4B',age:17,gender:'F',flags:['Safeguarding','OVC','Abuse risk'],priority:'high',initials:'NS',grad:'linear-gradient(135deg,#ef4444,#f97316)',issue:'Suspected physical abuse at home · semi-orphan',last:'05 Mar',next:'07 Mar',cat:'safeguarding'},
  {name:'Tumwine Eric',cls:'S4B',age:16,gender:'M',flags:['OVC','Double orphan','Absences'],priority:'high',initials:'TE',grad:'linear-gradient(135deg,#f59e0b,#10b981)',issue:'Double orphan · guardian unresponsive · 4 absences',last:'04 Mar',next:'07 Mar',cat:'ovc'},
  {name:'Byamugisha Ruth',cls:'S6A',age:18,gender:'F',flags:['Exam anxiety','Emotional distress'],priority:'medium',initials:'BR',grad:'linear-gradient(135deg,#8b5cf6,#3b82f6)',issue:'Severe exam anxiety · UNEB pressure · crying in dorm',last:'06 Mar',next:'07 Mar',cat:'academic'},
  {name:'Namukasa Grace',cls:'S5A',age:17,gender:'F',flags:['Health referral','Menstrual health'],priority:'medium',initials:'NG',grad:'linear-gradient(135deg,#0d9488,#10b981)',issue:'Menstrual health concern · referred to health centre',last:'01 Mar',next:'07 Mar',cat:'health'},
  {name:'Opio James',cls:'S3A',age:15,gender:'M',flags:['Bullying','Safeguarding'],priority:'high',initials:'OJ',grad:'linear-gradient(135deg,#ef4444,#8b5cf6)',issue:'Senior perpetrating bullying on S1B student',last:'04 Mar',next:'09 Mar',cat:'safeguarding'},
  {name:'Ssali Kevin',cls:'S4A',age:16,gender:'M',flags:['Academic decline','Family'],priority:'medium',initials:'SK',grad:'linear-gradient(135deg,#64748b,#3b82f6)',issue:'Sharp academic drop · domestic instability',last:'03 Mar',next:'09 Mar',cat:'academic'},
  {name:'Nansubuga Rita',cls:'S4A',age:16,gender:'F',flags:['OVC','Single orphan'],priority:'low',initials:'NR',grad:'linear-gradient(135deg,#0d9488,#84a98c)',issue:'Single orphan · church sponsored · occasional low moods',last:'28 Feb',next:'14 Mar',cat:'ovc'},
  {name:'Akello Rose',cls:'S4A',age:16,gender:'F',flags:['OVC','Stable'],priority:'low',initials:'AR',grad:'linear-gradient(135deg,#10b981,#0d9488)',issue:'Single orphan · doing well academically · quarterly review',last:'20 Feb',next:'30 Mar',cat:'ovc'},
  {name:'Mugisha Brian',cls:'S1B',age:13,gender:'M',flags:['OVC','Bullying victim','Double orphan'],priority:'high',initials:'MB',grad:'linear-gradient(135deg,#f43f5e,#8b5cf6)',issue:'Bullying victim · double orphan from Lira · withdrawn',last:'04 Mar',next:'09 Mar',cat:'safeguarding'},
  {name:'Kigozi Phillip',cls:'S3B',age:15,gender:'M',flags:['Health referral','HIV/VCT'],priority:'medium',initials:'KP',grad:'linear-gradient(135deg,#6366f1,#8b5cf6)',issue:'Requested VCT information · referred to health centre',last:'20 Feb',next:'14 Mar',cat:'health'},
];

const FLAG_COLORS: Record<string,[string,string]> = {
  'Safeguarding':[V.dangerSoft,V.danger],'Abuse risk':[V.dangerSoft,V.danger],'Bullying':[V.dangerSoft,V.danger],'Bullying victim':[V.dangerSoft,V.danger],
  'Double orphan':[V.warnSoft,'#b45309'],'Single orphan':[V.warnSoft,'#b45309'],'Absences':[V.warnSoft,'#b45309'],
  'OVC':[V.accSoft,V.accDark],'Stable':[V.successSoft,V.success],'Sponsored':[V.successSoft,V.success],
  'Health referral':[V.purpleSoft,V.purple],'Menstrual health':[V.purpleSoft,V.purple],'HIV/VCT':[V.purpleSoft,V.purple],
  'Exam anxiety':[V.blueSoft,V.blue],'Academic decline':[V.blueSoft,V.blue],'Family':[V.blueSoft,V.blue],'Emotional distress':[V.blueSoft,V.blue],
};

const NOTE_DATA: Record<string,{name:string;cls:string;age:number;gender:string;status:string;opened:string;issue:string;flags:string[];notes:{date:string;type:string;conf:boolean;body:string;action:string;risk:string}[]}> = {
  nakato:{name:'Nakato Sarah',cls:'S4B',age:17,gender:'Female',status:'Active — High Priority',opened:'05 Mar 2026',issue:'Suspected physical abuse',flags:['Safeguarding','Semi-Orphan','High Risk'],
    notes:[
      {date:'06 Mar 2026',type:'Follow-up',conf:true,body:'Brief check-in at lunchtime in corridor — Sarah looked tired but acknowledged me. She is staying in the dormitory this weekend (not going home). This is a positive safety measure. Arranged a full session for tomorrow morning (Saturday 07 Mar, 10:00 AM).',action:'Session booked for Sat 07 Mar 10 AM · Social welfare officer to be contacted Mon 09 Mar',risk:'High'},
      {date:'05 Mar 2026',type:'Safeguarding',conf:true,body:'Student referred by Mr. Opolot (class teacher) who noticed bruising on arms and left cheek. Met with student 3:00 PM in counsellor office. Student was tearful. After approx. 20 minutes she disclosed that "Father hits me when he drinks." Mother died in 2022. Observed bruising on both forearms. DHM (Mr. Tumwebaze) notified by phone at 4:15 PM. Case opened.',action:'DHM notified · Police referral under consideration',risk:'High'},
    ]},
  tumwine:{name:'Tumwine Eric',cls:'S4B',age:16,gender:'Male',status:'Active — High Priority',opened:'14 Jan 2026',issue:'OVC — Double orphan',flags:['Double Orphan','Absences','Fees Risk'],
    notes:[
      {date:'04 Mar 2026',type:'Session Note',conf:false,body:'Eric has had 4 absences this week. When I found him this afternoon, he was sitting alone behind the science block. He said he had been "thinking too much." He disclosed that his grandmother is ill and he is worried about her. He mentioned he wants to go home but has no transport. He has not eaten lunch for two days — says he has no pocket money. Arranged emergency meal access through matron.',action:'Emergency meals arranged · Home visit planned · Fees review with Bursar',risk:'High'},
      {date:'14 Jan 2026',type:'OVC Check-in',conf:false,body:'Eric came on the OVC register from last term. Both parents deceased. Grandmother is elderly and cannot travel to school. Eric is performing below potential (38% in Physics) and showing disengagement. He said he wants to "just finish S4 and find work."',action:'Enrolled in school mentorship programme · Referred to Bursar for hardship bursary',risk:'Medium'},
    ]},
  byamugisha:{name:'Byamugisha Ruth',cls:'S6A',age:18,gender:'Female',status:'Active — Medium',opened:'28 Feb 2026',issue:'Exam anxiety / Emotional distress',flags:['Exam Anxiety','UNEB Pressure'],
    notes:[
      {date:'06 Mar 2026',type:'Session Note',conf:false,body:'Ruth came 15 minutes early and looked exhausted. She said she was awake until 2 AM studying. She has been avoiding friends. I introduced journaling as a coping strategy. She agreed to try. I raised gently the idea of talking to her parents — she became defensive, saying "you don\'t know my dad." I did not push.',action:'Peer buddy arranged · Session next Saturday 07 Mar 9:00 AM',risk:'Medium'},
      {date:'28 Feb 2026',type:'Session Note',conf:false,body:'Ruth self-referred after her class teacher mentioned she had been crying during a free period. She described feeling "like I cannot breathe when I think about the exams." She said her parents have told her she MUST get into Makerere. She has been sleeping very little and has stopped eating breakfast.',action:'Weekly individual sessions booked · Parents to be contacted re: pressure',risk:'Medium'},
    ]},
  namukasa:{name:'Namukasa Grace',cls:'S5A',age:17,gender:'Female',status:'Active — Medium',opened:'01 Mar 2026',issue:'Health referral — menstrual health',flags:['Health Referral','Menstrual Health'],
    notes:[{date:'01 Mar 2026',type:'Referral',conf:true,body:'Student disclosed irregular menstrual cycle, significant pain, and has missed 3 classes this term due to pain. Referred to school health centre for gynaecological assessment. No feedback received.',action:'Follow-up with health centre due today',risk:'Medium'}]},
  opio:{name:'Opio James',cls:'S3A',age:15,gender:'Male',status:'Active — High Priority',opened:'04 Mar 2026',issue:'Bullying — perpetrator',flags:['Bullying','Safeguarding'],
    notes:[{date:'04 Mar 2026',type:'Safeguarding',conf:false,body:'Dormitory prefect reported that Opio James (S3A) has been physically intimidating Mugisha Brian (S1B). The bullying includes name-calling, taking food, and reported pinching in dormitory. Three witnesses identified. Both students interviewed separately.',action:'DHM informed · Disciplinary referral sent · Victim support session booked',risk:'High'}]},
};

/* ── helpers ── */
function flagStyle(f:string):[string,string]{return FLAG_COLORS[f]??[V.accSoft,V.accDark];}
function priorityCol(p:string){return p==='high'?'re':p==='medium'?'am':'gr';}

/* ── tiny components ── */
function Chip({col,children}:{col:string;children:React.ReactNode}){
  const map:Record<string,[string,string]>={gr:[V.successSoft,V.success],re:[V.dangerSoft,V.danger],am:[V.warnSoft,'#b45309'],bl:[V.blueSoft,V.blue],pu:[V.purpleSoft,V.purple],te:[V.accSoft,V.accDark],gy:['#f1f5f9',V.muted],ro:[V.roseSoft,V.rose],or:[V.orangeSoft,V.orange]};
  const [bg,color]=map[col]??[V.accSoft,V.accDark];
  return <span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:bg,color}}><span style={{fontSize:7}}>●</span>{children}</span>;
}
function Btn({variant='se',size='md',onClick,children}:{variant?:string;size?:string;onClick?:()=>void;children:React.ReactNode}){
  const c:Record<string,[string,string,string]>={pr:[V.acc,'#fff','transparent'],se:['#f8fafc',V.text,V.border],da:[V.dangerSoft,V.danger,'rgba(239,68,68,.2)'],wa:[V.warnSoft,'#b45309','rgba(245,158,11,.2)'],su:[V.successSoft,V.success,'rgba(16,185,129,.2)'],dk:[V.primary,'#fff','transparent'],ro:[V.roseSoft,V.rose,'rgba(244,63,94,.2)']};
  const [bg,fg,bd]=c[variant]??c.se;
  return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:5,padding:size==='sm'?'4px 10px':'7px 14px',borderRadius:8,fontSize:size==='sm'?11:12,fontWeight:600,cursor:'pointer',border:`1px solid ${bd}`,background:bg,color:fg,fontFamily:'inherit',transition:'all .15s'}}>{children}</button>;
}
function Card({children,style}:{children:React.ReactNode;style?:React.CSSProperties}){
  return <div style={{background:V.card,borderRadius:12,border:`1px solid ${V.border}`,boxShadow:'0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)',padding:18,...style}}>{children}</div>;
}
function CardHead({title,action}:{title:React.ReactNode;action?:React.ReactNode}){
  return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><div style={{fontSize:14,fontWeight:700}}>{title}</div>{action}</div>;
}
function Prog({label,value,pct,col}:{label:string;value:string;pct:number;col:string}){
  const colMap:Record<string,string>={gr:V.success,bl:V.blue,am:V.warn,re:V.danger,te:V.acc,pu:V.purple,or:V.orange};
  return <div style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:12,fontWeight:600}}>{label}</span><span style={{fontSize:12,fontWeight:700,color:V.muted}}>{value}</span></div><div style={{height:7,background:'#f1f5f9',borderRadius:10,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,borderRadius:10,background:colMap[col]??V.acc}}/></div></div>;
}
function StatCard({col,icon,val,label,badge,onClick}:{col:string;icon:string;val:string;label:string;badge?:[string,string];onClick?:()=>void}){
  const topC:Record<string,string>={gr:V.success,re:V.danger,am:V.warn,bl:V.blue,pu:V.purple,or:V.orange,te:V.acc,ro:V.rose,'':V.acc};
  const bgC:Record<string,string>={gr:V.successSoft,re:V.dangerSoft,am:V.warnSoft,bl:V.blueSoft,pu:V.purpleSoft,or:V.orangeSoft,te:V.accSoft,ro:V.roseSoft,'':V.accSoft};
  return <div onClick={onClick} style={{background:V.card,borderRadius:12,padding:'16px 18px',border:`1px solid ${V.border}`,borderTop:`3px solid ${topC[col]??V.acc}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)',cursor:onClick?'pointer':'default',transition:'all .2s'}}
    onMouseEnter={e=>onClick&&((e.currentTarget as HTMLElement).style.transform='translateY(-2px)')}
    onMouseLeave={e=>((e.currentTarget as HTMLElement).style.transform='none')}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
      <div style={{width:34,height:34,borderRadius:8,background:bgC[col]??V.accSoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>{icon}</div>
      {badge&&<span style={{fontSize:10,fontWeight:600,padding:'2px 6px',borderRadius:20,background:badge[0]==='up'?V.successSoft:badge[0]==='dn'?V.dangerSoft:'#f1f5f9',color:badge[0]==='up'?V.success:badge[0]==='dn'?V.danger:V.muted}}>{badge[1]}</span>}
    </div>
    <div style={{fontSize:24,fontWeight:800}}>{val}</div>
    <div style={{fontSize:11,color:V.muted,marginTop:2}}>{label}</div>
  </div>;
}
function Modal({open,onClose,title,children,wide}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode;wide?:boolean}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
    <div onClick={e=>e.stopPropagation()} style={{background:V.card,borderRadius:14,padding:24,width:wide?680:540,maxWidth:'100%',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.2)',animation:'mIn .2s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}><div style={{fontSize:15,fontWeight:700}}>{title}</div><button onClick={onClose} style={{width:26,height:26,borderRadius:6,border:`1px solid ${V.border}`,background:'#f8fafc',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button></div>
      {children}
    </div>
  </div>;
}
function ConfBanner(){return <div style={{background:'#fef2f2',border:'1px solid rgba(239,68,68,.2)',borderRadius:8,padding:'10px 14px',fontSize:11,color:'#b91c1c',fontWeight:600,display:'flex',alignItems:'center',gap:8,marginBottom:16}}>🔒 Session records are confidential — accessible to counsellor only</div>;}
function FG({label,children}:{label:string;children:React.ReactNode}){return <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:700,color:V.muted,marginBottom:5,display:'block',textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</label>{children}</div>;}
function FI({placeholder,value,type='text'}:{placeholder?:string;value?:string;type?:string}){return <input defaultValue={value} type={type} placeholder={placeholder} style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none',boxSizing:'border-box'}}/>;}
function FS({children}:{children:React.ReactNode}){return <select style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none'}}>{children}</select>;}
function FTA({placeholder,minH=80}:{placeholder?:string;minH?:number}){return <textarea placeholder={placeholder} style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none',resize:'vertical',minHeight:minH,boxSizing:'border-box'}}/>;}
function SessionSlot({time,name,sub,badge,done,onClick}:{time:string;name:string;sub:string;badge?:React.ReactNode;done?:boolean;onClick?:()=>void}){
  return <div style={{background:done?'#f8fafc':'#f0fdfa',borderRadius:9,padding:'10px 12px',marginBottom:8,border:`1px solid ${done?V.border:'rgba(13,148,136,.3)'}`,display:'flex',alignItems:'center',gap:12,opacity:done?.65:1}}>
    <div style={{fontSize:11,fontWeight:700,color:V.muted,width:55,flexShrink:0}}>{time}</div>
    <div style={{flex:1}} onClick={onClick}><div style={{fontSize:12,fontWeight:700}}>{name}</div><div style={{fontSize:10,color:V.muted}}>{sub}</div></div>
    {badge}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   MAIN PORTAL
══════════════════════════════════════════════════════════ */
export default function CounsellorPortal(){
  const {user,logout}=useAuth();
  const navigate=useNavigate();
  const [page,setPage]=useState<Page>('dashboard');
  const [modal,setModal]=useState<Modal>(null);
  const [caseFilter,setCaseFilter]=useState('all');
  const [cnStudent,setCnStudent]=useState('nakato');
  const [careerTab,setCareerTab]=useState<CareerTab>('s6');
  const [toasts,setToasts]=useState<ToastT[]>([]);

  const toast=useCallback((msg:string,type:ToastT['type']='default')=>{
    const id=Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  },[]);

  useEffect(()=>{
    setTimeout(()=>toast('🛡️ 2 open safeguarding cases require action today','danger'),800);
    setTimeout(()=>toast('📅 Session with Byamugisha Ruth at 9:00 AM today','info'),2200);
    setTimeout(()=>toast('🌱 Tumwine Eric missed lunch — welfare check needed','warning'),3800);
  },[toast]);

  const navSections=[
    {label:'Overview',items:[{id:'dashboard',icon:'🏠',label:'Dashboard'},{id:'announcements',icon:'📣',label:'Announcements',badge:2,badgeT:'re'}]},
    {label:'Student Support',items:[{id:'students',icon:'👥',label:'My Caseload',badge:18,badgeT:'am'},{id:'casenotes',icon:'🗂️',label:'Case Notes',badge:3,badgeT:'te'},{id:'sessions',icon:'📅',label:'Sessions'}]},
    {label:'Specialist Areas',items:[{id:'safeguarding',icon:'🛡️',label:'Safeguarding',badge:2,badgeT:'re'},{id:'health',icon:'🏥',label:'Health Referrals'},{id:'ovc',icon:'🌱',label:'OVC Tracker'},{id:'career',icon:'🎓',label:'Career Guidance'}]},
    {label:'Admin',items:[{id:'communications',icon:'💬',label:'Communications',badge:3,badgeT:'re'},{id:'portals',icon:'🔗',label:'Portals'}]},
  ];

  const pageTitle:Record<Page,string>={dashboard:'Dashboard',students:'My Caseload',casenotes:'Case Notes',sessions:'Sessions & Calendar',safeguarding:'Safeguarding & Child Protection',health:'Health Referrals',ovc:'OVC Tracker',career:'Career Guidance',communications:'Communications',announcements:'Announcements',portals:'Portals',settings:'Settings'};

  /* ── Sidebar ── */
  const Sidebar=()=>(
    <div style={{width:260,background:V.primary,minHeight:'100vh',position:'fixed',left:0,top:0,bottom:0,display:'flex',flexDirection:'column',zIndex:100,overflowY:'auto'}}>
      <div style={{padding:'14px 14px 10px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(13,148,136,.22)',border:'1px solid rgba(13,148,136,.38)',borderRadius:8,padding:'7px 10px',marginBottom:10}}>
          <div style={{width:26,height:26,borderRadius:6,background:V.acc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>💚</div>
          <div><div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.9)',letterSpacing:'.07em',textTransform:'uppercase'}}>SMISSI</div><div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>School Counsellor</div></div>
        </div>
      </div>
      <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#0d9488,#84a98c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0}}>SC</div>
        <div><div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{user?.name??'School Counsellor'}</div><div style={{fontSize:10,color:'rgba(255,255,255,.38)'}}>Pastoral Care & Guidance</div></div>
        <div style={{width:6,height:6,borderRadius:'50%',background:V.success,marginLeft:'auto',boxShadow:'0 0 0 2px rgba(16,185,129,.25)'}}/>
      </div>
      {navSections.map(sec=>(
        <div key={sec.label} style={{padding:'10px 8px 2px'}}>
          <div style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.22)',textTransform:'uppercase',letterSpacing:'.12em',padding:'0 6px',marginBottom:3}}>{sec.label}</div>
          {sec.items.map(item=>(
            <div key={item.id} onClick={()=>setPage(item.id as Page)} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 8px',borderRadius:7,cursor:'pointer',color:page===item.id?'#fff':'rgba(255,255,255,.52)',fontSize:12,fontWeight:500,marginBottom:1,background:page===item.id?'rgba(13,148,136,.3)':'transparent',position:'relative',transition:'all .15s'}}>
              {page===item.id&&<div style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',width:3,height:18,background:V.acc,borderRadius:'0 3px 3px 0'}}/>}
              <span style={{fontSize:14,width:18,textAlign:'center'}}>{item.icon}</span>
              {item.label}
              {item.badge&&<span style={{marginLeft:'auto',background:item.badgeT==='am'?V.warn:item.badgeT==='te'?V.acc:V.danger,color:item.badgeT==='am'?'#000':'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:20}}>{item.badge}</span>}
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
  const Topbar=()=>(
    <header style={{height:60,background:V.card,borderBottom:`1px solid ${V.border}`,display:'flex',alignItems:'center',padding:'0 22px',gap:14,position:'sticky',top:0,zIndex:50}}>
      <div><div style={{fontSize:15,fontWeight:700}}>{pageTitle[page]}</div><div style={{fontSize:11,color:V.muted,marginTop:1}}>Pastoral Care · Term 1, Week 8 · Sat 07 Mar 2026</div></div>
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
        <span style={{background:'#fef2f2',color:'#b91c1c',fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:20,border:'1px solid rgba(239,68,68,.2)',display:'flex',alignItems:'center',gap:4}}>🔒 CONFIDENTIAL</span>
        <span style={{background:V.accSoft,color:V.accDark,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20}}>Sat, 07 Mar</span>
        <button style={{width:34,height:34,borderRadius:8,border:`1px solid ${V.border}`,background:V.card,cursor:'pointer',fontSize:15,position:'relative',color:V.muted,display:'flex',alignItems:'center',justifyContent:'center'}}>🔔<span style={{position:'absolute',top:5,right:5,width:6,height:6,background:V.danger,borderRadius:'50%',border:'1.5px solid #fff'}}/></button>
      </div>
    </header>
  );

  /* ─────────────── PAGES ─────────────── */

  /* Dashboard */
  const PageDashboard=()=>(
    <div>
      <div style={{background:'linear-gradient(135deg,#0f766e 0%,#0d9488 55%,#84a98c 100%)',borderRadius:12,padding:'20px 24px',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-60,top:-60,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.05)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontSize:18,fontWeight:700,margin:0}}>Counselling Office 💚</h2>
          <p style={{fontSize:12,color:'rgba(255,255,255,.65)',marginTop:3}}>SMISSI Senior Secondary School · Term 1, Week 8 · Sat 07 Mar 2026</p>
          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
            {[['👥 18 active cases',false],['🛡️ 2 open safeguarding cases',true],['🌱 12 OVC students on register',false],['📅 6 sessions today',false]].map(([t,red])=>(
              <span key={String(t)} style={{background:red?'rgba(239,68,68,.3)':'rgba(255,255,255,.15)',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600}}>{String(t)}</span>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:20,position:'relative',zIndex:1,flexShrink:0}}>
          {[['18','Active Cases'],['124','Sessions (Term)'],['12','OVC Students'],['2','Safeguarding']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:800}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginTop:1}}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
        <Btn variant="pr" onClick={()=>setModal('session')}>📅 Log Session</Btn>
        <Btn onClick={()=>setModal('newCase')}>➕ Open New Case</Btn>
        <Btn variant="ro" onClick={()=>setPage('safeguarding')}>🛡️ Safeguarding</Btn>
        <Btn onClick={()=>setPage('ovc')}>🌱 OVC Register</Btn>
        <Btn onClick={()=>setPage('health')}>🏥 Health Referral</Btn>
        <Btn variant="dk" onClick={()=>setModal('msg')}>💬 Message DHM</Btn>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="te" icon="👥" val="18" label="Students on Caseload" badge={['fl','Active']} onClick={()=>setPage('students')}/>
        <StatCard col="re" icon="🛡️" val="2" label="Open Safeguarding" badge={['dn','Urgent']} onClick={()=>setPage('safeguarding')}/>
        <StatCard col="am" icon="🌱" val="12" label="OVC on Register" badge={['fl','Monitored']} onClick={()=>setPage('ovc')}/>
        <StatCard col="gr" icon="📅" val="6" label="Sessions Scheduled" badge={['fl','Today']} onClick={()=>setPage('sessions')}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="pu" icon="🏥" val="7" label="Health Referrals (Term)" badge={['fl','3 pending']} onClick={()=>setPage('health')}/>
        <StatCard col="bl" icon="🎓" val="32" label="Career Sessions (Term)" badge={['up','↑ 12']} onClick={()=>setPage('career')}/>
        <StatCard col="or" icon="👨‍👩‍👧" val="8" label="Parent Contacts" badge={['fl','2 pending']}/>
        <StatCard col="" icon="✅" val="18" label="Sessions This Week" badge={['up','This week']}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:18}}>
        <Card>
          <CardHead title="⚠️ Urgent — Requires Action Today"/>
          {[
            {dot:'re',title:'🛡️ Nakato Sarah (S4B) — Suspected physical abuse at home',sub:'Reported by class teacher · Opened 05 Mar · Requires DHM notification today',action:'Open Case →',dest:()=>setPage('safeguarding')},
            {dot:'re',title:'🛡️ Opio James (S3A) — Bullying — repeated physical intimidation',sub:'Victim: Mugisha Brian · Reported by dorm prefect · Case opened 04 Mar',action:'Open Case →',dest:()=>setPage('safeguarding')},
            {dot:'am',title:'🏥 Namukasa Grace (S5A) — Follow-up after health referral',sub:'Referred to health centre 01 Mar · No feedback received · Check in needed',action:'Follow Up →',dest:()=>setPage('health')},
            {dot:'am',title:'🌱 Tumwine Eric (S4B) — OVC — 4 absences this week',sub:'Double orphan · No guardian response · Home visit needed',action:'View →',dest:()=>setPage('ovc')},
            {dot:'am',title:'😔 Byamugisha Ruth (S6A) — Severe exam anxiety',sub:'Reported crying in dormitory · UNEB pressure · Session needed before Monday',action:'Book →',dest:()=>setModal('session')},
            {dot:'bl',title:'👨‍👩‍👧 Parent meeting — Ssali family (S4A)',sub:'Requested by mother · Student academic decline · Thu 12 Mar 2:00 PM',action:'View',dest:()=>setPage('sessions')},
          ].map(a=>(
            <div key={a.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:`1px solid ${V.border}`}}>
              <div style={{width:7,height:7,borderRadius:'50%',marginTop:5,flexShrink:0,background:a.dot==='re'?V.danger:a.dot==='am'?V.warn:V.blue,boxShadow:`0 0 0 3px ${a.dot==='re'?V.dangerSoft:a.dot==='am'?V.warnSoft:V.blueSoft}`}}/>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{a.title}</div><div style={{fontSize:10,color:V.muted,marginTop:1}}>{a.sub}</div></div>
              <span onClick={a.dest} style={{fontSize:10,fontWeight:700,color:V.acc,cursor:'pointer',padding:'3px 7px',borderRadius:5,whiteSpace:'nowrap',flexShrink:0}}>{a.action}</span>
            </div>
          ))}
        </Card>
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="📅 Today's Sessions" action={<span onClick={()=>setPage('sessions')} style={{fontSize:11,color:V.acc,fontWeight:600,cursor:'pointer'}}>Full →</span>}/>
            <SessionSlot time="9:00 AM" name="Byamugisha Ruth" sub="S6A · Exam anxiety · 45 min" badge={<Chip col="am">Upcoming</Chip>}/>
            <SessionSlot time="10:00 AM" name="Nakato Sarah" sub="S4B · Safeguarding follow-up · Confidential" badge={<Chip col="re">Urgent</Chip>}/>
            <SessionSlot time="11:30 AM" name="Career Group — S6" sub="University applications · 12 students · Boardroom" badge={<Chip col="bl">Group</Chip>}/>
            <SessionSlot time="2:00 PM" name="Tumwine Eric" sub="S4B · OVC welfare check · 30 min" badge={<Chip col="te">OVC</Chip>}/>
            <SessionSlot time="7:30 AM" name="Okello James" sub="S3A · Peer conflict · Done" badge={<Chip col="gr">Done ✓</Chip>} done/>
          </Card>
          <Card>
            <CardHead title="📊 Caseload by Issue Type"/>
            <Prog label="Academic stress / Exams" value="6" pct={75} col="bl"/>
            <Prog label="Family / Home issues" value="4" pct={50} col="am"/>
            <Prog label="Bullying / Peer conflict" value="3" pct={37} col="or"/>
            <Prog label="OVC / Vulnerability" value="3" pct={37} col="te"/>
            <Prog label="Health / Physical" value="2" pct={25} col="pu"/>
          </Card>
        </div>
      </div>
    </div>
  );

  /* Caseload */
  const filtered=CASES.filter(c=>caseFilter==='all'||caseFilter==='urgent'?caseFilter==='urgent'?c.priority==='high':true:c.cat===caseFilter);
  const PageStudents=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>My Caseload</div><div style={{fontSize:12,color:V.muted}}>18 active students · All records strictly confidential</div></div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <select value={caseFilter} onChange={e=>setCaseFilter(e.target.value)} style={{padding:'6px 10px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,width:150}}>
            {[['all','All Cases'],['urgent','Urgent Only'],['safeguarding','Safeguarding'],['ovc','OVC'],['health','Health'],['career','Career'],['academic','Academic']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <Btn variant="pr" onClick={()=>setModal('newCase')}>➕ Open New Case</Btn>
        </div>
      </div>
      {filtered.map(c=>{
        const [priB,priT]=c.priority==='high'?[V.dangerSoft,V.danger]:c.priority==='medium'?[V.warnSoft,'#b45309']:[V.successSoft,V.success];
        return <div key={c.name} onClick={()=>setPage('casenotes')} style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,marginBottom:10,boxShadow:'0 1px 3px rgba(0,0,0,.06)',display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',transition:'all .2s'}}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=V.acc;(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(0,0,0,.1)';}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=V.border;(e.currentTarget as HTMLElement).style.boxShadow='0 1px 3px rgba(0,0,0,.06)';}}>
          <div style={{width:38,height:38,borderRadius:'50%',background:c.grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0}}>{c.initials}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700}}>{c.name}</div>
            <div style={{fontSize:11,color:V.muted,marginTop:2}}>{c.cls} · Last session: {c.last} · Next: {c.next}</div>
            <div style={{fontSize:11,color:V.muted,marginTop:3}}>{c.issue}</div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:6}}>
              {c.flags.map(f=>{const [bg,color]=flagStyle(f);return <span key={f} style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:bg,color}}>{f}</span>;})}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'flex-end',flexShrink:0}}>
            <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:priB,color:priT}}>{c.priority.charAt(0).toUpperCase()+c.priority.slice(1)}</span>
            <Btn size="sm" onClick={e=>{e.stopPropagation();setModal('session');}}>📅 Book</Btn>
            <Btn size="sm" onClick={e=>{e.stopPropagation();setModal('note');}}>📝 Note</Btn>
          </div>
        </div>;
      })}
    </div>
  );

  /* Case Notes */
  const noteD=NOTE_DATA[cnStudent]??NOTE_DATA.nakato;
  const typeColMap:Record<string,string>={'Safeguarding':'re','Follow-up':'bl','OVC Check-in':'te','Session Note':'am','Referral':'pu'};
  const PageCaseNotes=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Case Notes</div><div style={{fontSize:12,color:V.muted}}>All notes strictly confidential · Access restricted to counsellor</div></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <select value={cnStudent} onChange={e=>setCnStudent(e.target.value)} style={{padding:'6px 10px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,width:200}}>
            {[['nakato','Nakato Sarah (S4B)'],['tumwine','Tumwine Eric (S4B)'],['byamugisha','Byamugisha Ruth (S6A)'],['namukasa','Namukasa Grace (S5A)'],['opio','Opio James (S3A)']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <Btn variant="pr" onClick={()=>setModal('note')}>✏️ Add Note</Btn>
        </div>
      </div>
      <div style={{background:V.dangerSoft,border:'1px solid rgba(239,68,68,.2)',borderRadius:9,padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
        <span>🔒</span><div style={{fontSize:12,fontWeight:600,color:'#b91c1c'}}>STRICTLY CONFIDENTIAL — These records are protected. Do not share without student consent or legal obligation.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
        <Card>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#0d9488,#84a98c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#fff',margin:'0 auto 8px'}}>{noteD.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
            <div style={{fontSize:14,fontWeight:700}}>{noteD.name}</div>
            <div style={{fontSize:11,color:V.muted}}>{noteD.cls} · Age {noteD.age} · {noteD.gender}</div>
          </div>
          <div style={{height:1,background:V.border,margin:'14px 0'}}/>
          <div style={{display:'flex',flexDirection:'column',gap:7,fontSize:12}}>
            <div><span style={{color:V.muted}}>Case status:</span> <b>{noteD.status}</b></div>
            <div><span style={{color:V.muted}}>Opened:</span> {noteD.opened}</div>
            <div><span style={{color:V.muted}}>Primary issue:</span> {noteD.issue}</div>
            <div style={{marginTop:4,display:'flex',gap:4,flexWrap:'wrap'}}>
              {noteD.flags.map(f=>{const [bg,color]=flagStyle(f);return <span key={f} style={{display:'inline-flex',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:bg,color}}>{f}</span>;})}
            </div>
          </div>
          <div style={{height:1,background:V.border,margin:'14px 0'}}/>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <Btn variant="pr" onClick={()=>setModal('note')}>✏️ Add Note</Btn>
            <Btn onClick={()=>setModal('session')}>📅 Book Session</Btn>
            <Btn variant="wa" onClick={()=>toast('Case summary exported','info')}>📄 Export Summary</Btn>
          </div>
        </Card>
        <div>
          {noteD.notes.map((n,i)=>(
            <div key={i} style={{background:n.conf?'#fef9f9':'#fffef7',border:`1px solid ${n.conf?'#fca5a5':'#fde68a'}`,borderRadius:10,padding:14,marginBottom:10,position:'relative'}}>
              {n.conf&&<span style={{position:'absolute',top:10,right:10,background:V.dangerSoft,color:V.danger,fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:20,border:'1px solid rgba(239,68,68,.3)'}}>🔒 CONFIDENTIAL</span>}
              <div style={{fontSize:10,color:V.muted,fontWeight:600}}>{n.date}</div>
              <Chip col={typeColMap[n.type]??'gy'}>{n.type}</Chip>
              <div style={{marginTop:6,fontSize:12,lineHeight:1.7}}>{n.body}</div>
              {n.action&&<div style={{background:'#f8fafc',borderRadius:6,padding:'8px 10px',marginTop:8,fontSize:11}}><b>Action taken:</b> {n.action}</div>}
              <div style={{marginTop:8,display:'flex',gap:5,alignItems:'center'}}>
                <Btn size="sm" onClick={()=>setModal('note')}>✏️ Add Follow-up</Btn>
                <span style={{fontSize:10,color:V.muted,marginLeft:'auto'}}>Risk: <b>{n.risk}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* Sessions */
  const PageSessions=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Sessions & Calendar</div><div style={{fontSize:12,color:V.muted}}>Schedule · log · follow-up</div></div>
        <Btn variant="pr" onClick={()=>setModal('session')}>📅 Log / Book Session</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <CardHead title="📅 This Week — Sat 07 Mar"/>
          <div style={{fontSize:11,fontWeight:700,color:V.muted,textTransform:'uppercase',marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${V.border}`}}>Saturday 07 Mar</div>
          <SessionSlot time="9:00 AM" name="Byamugisha Ruth · S6A" sub="Exam anxiety · Individual" badge={<div style={{display:'flex',gap:5}}><Btn size="sm" onClick={()=>setModal('note')}>📝 Note</Btn><Chip col="am">Today</Chip></div>}/>
          <SessionSlot time="10:00 AM" name="Nakato Sarah · S4B" sub="🔒 Safeguarding · Confidential" badge={<div style={{display:'flex',gap:5}}><Btn size="sm" onClick={()=>setModal('note')}>📝 Note</Btn><Chip col="re">Urgent</Chip></div>}/>
          <SessionSlot time="11:30 AM" name="Career Group S6 · 12 students" sub="University applications · Boardroom" badge={<Btn size="sm" onClick={()=>setModal('note')}>📝 Note</Btn>}/>
          <SessionSlot time="2:00 PM" name="Tumwine Eric · S4B" sub="OVC welfare check · 30 min" badge={<div style={{display:'flex',gap:5}}><Btn size="sm" onClick={()=>setModal('note')}>📝 Note</Btn><Chip col="te">OVC</Chip></div>}/>
          <div style={{fontSize:11,fontWeight:700,color:V.muted,textTransform:'uppercase',margin:'14px 0 8px',paddingTop:10,borderTop:`1px solid ${V.border}`}}>Monday 09 Mar</div>
          <SessionSlot time="8:00 AM" name="Ssali Kevin · S4A" sub="Academic decline · Parent meeting prep" badge={<Chip col="gy">Upcoming</Chip>}/>
          <SessionSlot time="11:00 AM" name="Grief Support Group · S3/S4" sub="5 students · Counselling room" badge={<Chip col="pu">Group</Chip>}/>
        </Card>
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="📊 Session Stats — Term 1"/>
            <Prog label="Individual sessions" value="86" pct={85} col="te"/>
            <Prog label="Group sessions" value="22" pct={55} col="bl"/>
            <Prog label="Parent meetings" value="8" pct={20} col="am"/>
            <Prog label="Teacher consultations" value="8" pct={20} col="or"/>
            <div style={{height:1,background:V.border,margin:'14px 0'}}/>
            <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Upcoming Follow-Ups</div>
            {[{dot:'am',t:'Namukasa Grace — health referral follow-up',s:'Due today · Referred 01 Mar'},{dot:'bl',t:'Okello Brian — career session follow-up',s:'Due Mon 09 Mar'},{dot:'te',t:'Tumwine Eric — OVC welfare check',s:'Due today · 4 absences this week'}].map(a=>(
              <div key={a.t} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:`1px solid ${V.border}`}}>
                <div style={{width:7,height:7,borderRadius:'50%',marginTop:5,flexShrink:0,background:a.dot==='am'?V.warn:a.dot==='bl'?V.blue:V.acc}}/>
                <div><div style={{fontSize:12,fontWeight:600}}>{a.t}</div><div style={{fontSize:10,color:V.muted}}>{a.s}</div></div>
              </div>
            ))}
          </Card>
          <Card>
            <CardHead title="📋 Session Log — Recent"/>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>{['Date','Student','Type','Duration','Follow-up'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
                <tbody>
                  {[['06 Mar','Akello Rose','bl','Academic','40 min','13 Mar'],['06 Mar','Opio James','re','Bullying','50 min','09 Mar'],['05 Mar','Nakato Sarah','re','Safeguarding','60 min','07 Mar'],['05 Mar','Career Group S6','te','Career','60 min','07 Mar'],['04 Mar','Tumwine Eric','am','OVC','30 min','07 Mar']].map(([dt,nm,col,tp,dur,fu])=>(
                    <tr key={nm+dt} style={{borderBottom:`1px solid ${V.border}`}}>
                      <td style={{padding:'10px 12px',fontSize:12}}>{dt}</td>
                      <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{nm}</td>
                      <td style={{padding:'10px 12px'}}><Chip col={col}>{tp}</Chip></td>
                      <td style={{padding:'10px 12px',fontSize:12}}>{dur}</td>
                      <td style={{padding:'10px 12px',fontSize:12}}>{fu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  /* Safeguarding */
  const PageSafeguarding=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Safeguarding & Child Protection</div><div style={{fontSize:12,color:V.muted}}>All cases strictly confidential · Notify DHM for serious concerns</div></div>
        <div style={{display:'flex',gap:8}}><Btn variant="ro" onClick={()=>setModal('safeguard')}>🚨 Report New Concern</Btn><Btn variant="dk" onClick={()=>setModal('msg')}>📤 Notify DHM</Btn></div>
      </div>
      <div style={{background:V.dangerSoft,border:'1px solid rgba(239,68,68,.25)',borderRadius:10,padding:'12px 18px',marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:V.danger,marginBottom:4}}>🛡️ SMISSI Child Protection Policy</div>
        <div style={{fontSize:11,color:'#b91c1c',lineHeight:1.7}}>Any concern about child abuse, neglect or exploitation must be reported to the Deputy Head Master and documented here within 24 hours. Do not investigate alone. Preserve confidentiality but override it when a child is at risk of serious harm.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="re" icon="🚨" val="2" label="Open Cases"/>
        <StatCard col="am" icon="👁️" val="3" label="Monitoring"/>
        <StatCard col="gr" icon="✅" val="8" label="Closed (Term)"/>
        <StatCard col="bl" icon="📤" val="1" label="Referred to External"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:V.danger}}>🔴 Open Cases — Immediate Attention</div>
          {[
            {name:'Nakato Sarah — S4B',opened:'05 Mar 2026 · Reported by: Class Teacher (Mr. Opolot)',body:'Student arrived Monday with bruising on arms and face. When asked, became very distressed and said "things at home are bad." Father is the suspected perpetrator. Mother died 2022 — student is semi-orphan.',flags:[['re','Physical Abuse'],['am','Semi-Orphan'],['bl','DHM Notified']],actions:[['da','📝 Add Update',()=>setModal('note')],['wa','📤 Refer to Social Worker',()=>toast('Referral form opened','info')],['se','🚔 Police Referral',()=>toast('Police referral recorded','danger')]]},
            {name:'Opio James (victim: Mugisha Brian) — S3A',opened:'04 Mar 2026 · Reported by: Dormitory Prefect',body:'Senior student Opio James (S3A) has been physically intimidating Mugisha Brian (S1B). The bullying includes name-calling, taking food, and reported pinching in dormitory. Three witnesses identified.',flags:[['re','Bullying'],['am','Ethnic Dimension'],['bl','DHM Informed']],actions:[['da','📝 Add Update',()=>setModal('note')],['wa','⚖️ Refer to DHM',()=>toast('Disciplinary referral sent to DHM','success')],['su','💚 Support Victim',()=>toast('Victim support session booked','success')]]},
          ].map(c=>(
            <div key={c.name} style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,marginBottom:10,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{background:V.dangerSoft,color:V.danger,border:'1px solid rgba(239,68,68,.25)',borderRadius:20,fontSize:10,fontWeight:700,padding:'3px 8px'}}>🔴 OPEN</span>
                <div style={{fontSize:13,fontWeight:700}}>{c.name}</div>
              </div>
              <div style={{fontSize:11,color:V.muted,marginBottom:8}}>{c.opened}</div>
              <div style={{fontSize:12,lineHeight:1.6,marginBottom:10}}><b>Concern:</b> {c.body}</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
                {c.flags.map(([col,lbl])=>{const [bg,color]=col==='re'?[V.dangerSoft,V.danger]:col==='am'?[V.warnSoft,'#b45309']:[V.blueSoft,V.blue];return <span key={lbl} style={{display:'inline-flex',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:bg,color}}>{lbl}</span>;})}
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {c.actions.map(([v,lbl,fn])=><Btn key={String(lbl)} variant={String(v)} size="sm" onClick={fn as ()=>void}>{String(lbl)}</Btn>)}
              </div>
            </div>
          ))}
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:'#b45309'}}>🟡 Monitoring</div>
          <div style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{background:V.warnSoft,color:'#b45309',border:'1px solid rgba(245,158,11,.25)',borderRadius:20,fontSize:10,fontWeight:700,padding:'3px 8px'}}>🟡 MONITORING</span>
              <div style={{fontSize:13,fontWeight:700}}>Ssali Kevin — S4A</div>
            </div>
            <div style={{fontSize:12,lineHeight:1.6,marginBottom:8,color:V.muted}}>Concerning academic drop and withdrawal. History of domestic instability. No acute concern currently but watching closely. Monthly check-ins scheduled.</div>
            <Btn size="sm" onClick={()=>setModal('note')}>📝 Update</Btn>
          </div>
        </div>
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="📋 Safeguarding Principles"/>
            <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:12}}>
              {[['danger','When to break confidentiality: When a child is at risk of serious harm — you MUST act even without consent.'],['blue','Document everything: Date, time, exact words used, physical observations, who was present.'],['warn','Never investigate alone: Always involve the DHM. For criminal matters, involve police.'],['acc','Support the child: Believe them. Stay calm. Don\'t promise confidentiality you cannot keep.'],['success','Refer externally when needed: Police, Probation & Social Welfare, hospitals, NGOs (e.g. MIFUMI, ANPPCAN Uganda).']].map(([type,text])=>{
                const bg=type==='danger'?V.dangerSoft:type==='success'?V.successSoft:'#f8fafc';
                const bd=type==='danger'?V.danger:type==='success'?V.success:type==='warn'?V.warn:type==='acc'?V.acc:V.blue;
                return <div key={type} style={{background:bg,borderRadius:8,padding:'10px 12px',borderLeft:`3px solid ${bd}`}} dangerouslySetInnerHTML={{__html:`<b>${text.split(':')[0]}:</b>${text.split(':').slice(1).join(':')}`}}/>;
              })}
            </div>
          </Card>
          <Card>
            <CardHead title="📁 Closed Cases — Term 1"/>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>{['Student','Issue','Outcome','Closed'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
                <tbody>
                  {[['Apio Grace','Domestic neglect','gr','Resolved','28 Feb'],['Wasswa Dan','Peer harassment','gr','Resolved','20 Feb'],['Nakamya Doris','Emotional abuse','pu','Referred','15 Feb']].map(([n,i,c,o,d])=>(
                    <tr key={n} style={{borderBottom:`1px solid ${V.border}`}}>
                      <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{n}</td>
                      <td style={{padding:'10px 12px',fontSize:12}}>{i}</td>
                      <td style={{padding:'10px 12px'}}><Chip col={String(c)}>{o}</Chip></td>
                      <td style={{padding:'10px 12px',fontSize:12}}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  /* Health */
  const PageHealth=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Health Referrals</div><div style={{fontSize:12,color:V.muted}}>All health concerns handled with strict confidentiality</div></div>
        <Btn variant="pr" onClick={()=>setModal('health')}>🏥 New Referral</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="am" icon="⏳" val="3" label="Pending Follow-Up"/>
        <StatCard col="gr" icon="✅" val="4" label="Referred & Seen"/>
        <StatCard col="pu" icon="🩺" val="7" label="Total Referrals (Term)"/>
        <StatCard col="re" icon="🚨" val="1" label="Urgent / Acute"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Active & Pending Referrals</div>
          {[
            {chip:'am',chipTxt:'Pending Follow-Up',name:'Namukasa Grace — S5A',date:'Referred 01 Mar 2026',body:'Student disclosed irregular menstrual cycle, significant pain, and has missed 3 classes this term due to pain. Referred to school health centre for gynaecological assessment. No feedback received.',flags:[['teal','Menstrual health'],['blue','Health centre']],actions:[['wa','📞 Chase Health Centre',()=>toast('Follow-up reminder sent to health centre','info')],['se','📝 Add Note',()=>setModal('note')]]},
            {chip:'re',chipTxt:'Confidential — Urgent',name:'Student A — S4 (identity protected)',date:'Opened 04 Mar 2026',body:'Student disclosed possible pregnancy. Extremely distressed. Referred to health centre for confirmation. Arranged for private transport. Guardian not yet informed — student requested time.',flags:[['red','Pregnancy'],['amber','Guardian pending'],['purple','Highly confidential']],actions:[['da','📝 Update',()=>setModal('note')],['wa','📤 Social Welfare',()=>toast('Referral to social welfare recorded','info')]]},
            {chip:'am',chipTxt:'Pending Follow-Up',name:'Kigozi Phillip — S3B',date:'Referred 20 Feb 2026',body:'Student requested HIV testing information privately. Referred to nearby VCT centre (Jinja Road Health Centre IV) with a note of referral. Awaiting student feedback.',flags:[['purple','HIV/VCT'],['blue','External referral']],actions:[['se','📝 Follow Up',()=>setModal('note')]]},
          ].map(r=>(
            <div key={r.name} style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,marginBottom:10,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                <Chip col={r.chip}>{r.chipTxt}</Chip>
                <div style={{fontSize:13,fontWeight:700}}>{r.name}</div>
                <div style={{fontSize:10,color:V.muted,marginLeft:'auto'}}>{r.date}</div>
              </div>
              <div style={{fontSize:12,lineHeight:1.7,marginBottom:8}}><b>Concern:</b> {r.body}</div>
              <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
                {r.flags.map(([col,lbl])=>{const colorMap:Record<string,[string,string]>={teal:[V.accSoft,V.accDark],blue:[V.blueSoft,V.blue],red:[V.dangerSoft,V.danger],amber:[V.warnSoft,'#b45309'],purple:[V.purpleSoft,V.purple]};const [bg,color]=colorMap[col]??[V.accSoft,V.accDark];return <span key={lbl} style={{display:'inline-flex',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:bg,color}}>{lbl}</span>;})}
              </div>
              <div style={{display:'flex',gap:6}}>{r.actions.map(([v,lbl,fn])=><Btn key={String(lbl)} variant={String(v)} size="sm" onClick={fn as ()=>void}>{String(lbl)}</Btn>)}</div>
            </div>
          ))}
        </div>
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="🏥 Health Referral Resources"/>
            <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:12}}>
              {[['#0d9488','#f0fdfa','School Health Centre','On-site · Mon–Fri 8 AM–5 PM · School nurse on duty'],['#3b82f6','#f8fafc','Jinja Road Health Centre IV','VCT services · ANC · General OPD · 3 km from school'],['#8b5cf6','#f8fafc','Marie Stopes Uganda','Reproductive health · Confidential · 0800 200 005 (free)'],['#f59e0b','#f8fafc','Mental Health Support (Butabika)','Serious mental health referrals · National referral hospital'],['#10b981',V.successSoft,'Period poverty support','School has emergency sanitary supply · Request from counsellor office']].map(([bd,bg,title,sub])=>(
                <div key={title} style={{background:bg,borderRadius:8,padding:'10px 12px',borderLeft:`3px solid ${bd}`}}><b>{title}</b><div style={{color:V.muted}}>{sub}</div></div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHead title="📊 Health Issue Types (Term)"/>
            <Prog label="Menstrual health" value="3" pct={70} col="te"/>
            <Prog label="Reproductive health" value="2" pct={45} col="pu"/>
            <Prog label="Mental health" value="1" pct={25} col="bl"/>
            <Prog label="HIV/VCT" value="1" pct={25} col="am"/>
          </Card>
        </div>
      </div>
    </div>
  );

  /* OVC */
  const PageOVC=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>OVC — Orphans & Vulnerable Children</div><div style={{fontSize:12,color:V.muted}}>12 students on register · Welfare monitoring · Term 1, 2026</div></div>
        <div style={{display:'flex',gap:8}}><Btn onClick={()=>toast('OVC report exported','info')}>📄 Export Report</Btn><Btn variant="pr" onClick={()=>setModal('ovc')}>➕ Add to Register</Btn></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="re" icon="😔" val="5" label="Double Orphans"/>
        <StatCard col="am" icon="👤" val="7" label="Single Orphans / At-Risk"/>
        <StatCard col="bl" icon="💰" val="4" label="On Bursary / Sponsor"/>
        <StatCard col="te" icon="📅" val="3" label="Welfare Checks Due"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:V.danger}}>🔴 High Priority — Immediate Attention</div>
          {[
            {name:'Tumwine Eric — S4B',chips:[['re','Double Orphan'],['am','4 absences']],body:'Both parents deceased. Living with elderly grandmother in Mukono. Guardian is unresponsive to school letters. 4 absences this week — reason unknown. Fees partially paid (sponsor). At risk of dropout.',flags:[['red','Double orphan'],['amber','Fees partial'],['blue','Home visit needed']],actions:[['da','🏠 Log Home Visit',()=>toast('Home visit logged for this weekend','success')],['wa','📝 Update',()=>setModal('note')],['se','💰 Bursary',()=>toast('Bursary application sent to Bursar','info')]]},
            {name:'Nakato Sarah — S4B',chips:[['re','Abuse Risk'],['am','Semi-Orphan']],body:'Mother deceased 2022. Living with father + stepmother. Active safeguarding case re: suspected physical abuse. Highly vulnerable. Welfare checks weekly.',flags:[['red','Safeguarding open'],['amber','Semi-orphan']],actions:[['ro','🛡️ Safeguarding',()=>setPage('safeguarding')],['se','📝 Update',()=>setModal('note')]]},
          ].map(c=>(
            <div key={c.name} style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,marginBottom:10,borderLeft:`4px solid ${V.danger}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                <div style={{fontSize:13,fontWeight:700}}>{c.name}</div>
                {c.chips.map(([col,lbl])=><Chip key={lbl} col={col}>{lbl}</Chip>)}
              </div>
              <div style={{fontSize:12,lineHeight:1.7,marginBottom:8}}>{c.body}</div>
              <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
                {c.flags.map(([col,lbl])=>{const cMap:Record<string,[string,string]>={red:[V.dangerSoft,V.danger],amber:[V.warnSoft,'#b45309'],blue:[V.blueSoft,V.blue]};const [bg,color]=cMap[col]??[V.accSoft,V.accDark];return <span key={lbl} style={{display:'inline-flex',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:bg,color}}>{lbl}</span>;})}
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{c.actions.map(([v,lbl,fn])=><Btn key={String(lbl)} variant={String(v)} size="sm" onClick={fn as ()=>void}>{String(lbl)}</Btn>)}</div>
            </div>
          ))}
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,marginTop:6,color:'#b45309'}}>🟡 Medium Priority — Monthly Monitoring</div>
          {[['Nansubuga Rita — S4A',[['am','Single Orphan'],['bl','Sponsored']],'Father deceased. Mother remarried. School fees paid by church sponsor. Performing well (68%). Emotionally stable but occasional low moods.'],['Mugisha Brian — S1B',[['am','Bullying Victim'],['bl','Double Orphan']],'Both parents deceased. Raised by uncle in Lira. New to school. Currently victim in active bullying safeguarding case. Quiet, withdrawn.']].map(([name,chips_,body])=>(
            <div key={String(name)} style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,marginBottom:10,borderLeft:`4px solid ${V.warn}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                <div style={{fontSize:13,fontWeight:700}}>{String(name)}</div>
                {(chips_ as [string,string][]).map(([c,l])=><Chip key={l} col={c}>{l}</Chip>)}
              </div>
              <div style={{fontSize:12,lineHeight:1.7,marginBottom:8}}>{String(body)}</div>
              <Btn size="sm" onClick={()=>setModal('note')}>📝 Monthly Check-in</Btn>
            </div>
          ))}
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,marginTop:6,color:V.success}}>🟢 Stable — Quarterly Review</div>
          <div style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,borderLeft:`4px solid ${V.success}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
              <div style={{fontSize:13,fontWeight:700}}>Akello Rose — S4A</div><Chip col="gr">Stable</Chip><Chip col="bl">Sponsored</Chip>
            </div>
            <div style={{fontSize:12,color:V.muted}}>Single orphan. Performing well (95%). Church scholarship. Resilient, good peer support. Quarterly review next: 30 Mar.</div>
          </div>
        </div>
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="💰 Bursary & Sponsorship"/>
            <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:12}}>
              {[['School Hardship Fund','Contact Bursar · Confidential application · UGX available'],['NSSF/Government OVC Bursary','Apply through DHM · District Social Welfare Officer'],['Church / Faith Sponsors','3 students currently sponsored · Contact chaplain'],['NGO Referrals','ANPPCAN Uganda · TASO · Straight Talk Foundation']].map(([t,s])=>(
                <div key={t} style={{background:'#f8fafc',borderRadius:8,padding:'10px 12px'}}><div style={{fontWeight:700}}>{t}</div><div style={{color:V.muted}}>{s}</div></div>
              ))}
            </div>
            <Btn variant="pr" onClick={()=>toast('Bursary referral form opened','info')} style={{marginTop:10,width:'100%'} as React.CSSProperties}>💰 Apply for Student Bursary</Btn>
          </Card>
          <Card>
            <CardHead title="📊 OVC Summary"/>
            <Prog label="Double orphans" value="5/12" pct={42} col="re"/>
            <Prog label="Single orphans" value="4/12" pct={33} col="am"/>
            <Prog label="On sponsorship" value="4/12" pct={33} col="bl"/>
            <Prog label="Stable / Low risk" value="4/12" pct={33} col="gr"/>
          </Card>
        </div>
      </div>
    </div>
  );

  /* Career */
  const PageCareer=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Career Guidance & University Prep</div><div style={{fontSize:12,color:V.muted}}>Subject choices · University applications · Career exploration</div></div>
        <Btn variant="pr" onClick={()=>setModal('career')}>📋 Log Career Session</Btn>
      </div>
      <div style={{display:'flex',background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:4,width:'fit-content',marginBottom:16,gap:2}}>
        {([['s6','🎓 S6 — University'],['s4','📚 S4 — Subject Choice'],['groups','👥 Group Sessions'],['resources','📖 Resources']] as [CareerTab,string][]).map(([t,lbl])=>(
          <button key={t} onClick={()=>setCareerTab(t)} style={{padding:'6px 14px',borderRadius:7,border:'none',background:careerTab===t?V.acc:'transparent',color:careerTab===t?'#fff':V.muted,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{lbl}</button>
        ))}
      </div>
      {careerTab==='s6'&&<div>
        <div style={{background:V.accSoft,border:'1px solid rgba(13,148,136,.2)',borderRadius:9,padding:'12px 18px',marginBottom:16,fontSize:12,fontWeight:600,color:V.accDark}}>📅 UNEB results expected April 2026 · University application deadline (Public): June 2026 · Private universities: Rolling admissions</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:18}}>
          {[['72','S6 candidates',V.acc],['48','Had career session',V.blue],['24','Still need session',V.warn]].map(([v,l,c])=>(
            <div key={l} style={{background:V.card,borderRadius:12,border:`1px solid ${V.border}`,padding:18,textAlign:'center',boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
              <div style={{fontSize:28,fontWeight:800,color:String(c)}}>{v}</div><div style={{fontSize:12,color:V.muted}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Recent S6 Career Sessions</div>
            {[{init:'NS',grad:'linear-gradient(135deg,#0d9488,#84a98c)',name:'Namukasa Joyce — S6A',sub:'Session: 04 Mar · Aggregate 4 target',career:'Medicine / Nursing',targets:'Makerere (MBChB), Mbarara (Nursing)',fin:'Government sponsorship · Parents can supplement',warn:''},
              {init:'SB',grad:'linear-gradient(135deg,#0d9488,#3b82f6)',name:'Ssemakula Brian — S6A',sub:'Session: 03 Mar · Aggregate 6 target',career:'Engineering (Electrical)',targets:'Makerere (Elect. Eng.), Kyambogo',fin:'Loan + family · No sponsor yet',warn:''},
              {init:'BR',grad:'linear-gradient(135deg,#7c3aed,#f43f5e)',name:'Byamugisha Ruth — S6A',sub:'Session: 06 Mar · Currently anxious',career:'Law',targets:'Makerere (LLB), MUBS',fin:'',warn:'⚠ Exam anxiety — needs emotional support first'},
            ].map(s=>(
              <div key={s.name} style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:14,marginBottom:10,boxShadow:'0 1px 3px rgba(0,0,0,.06)',display:'flex',alignItems:'flex-start',gap:12}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:s.grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>{s.init}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700}}>{s.name}</div>
                  <div style={{fontSize:11,color:V.muted,marginTop:2}}>{s.sub}</div>
                  <div style={{marginTop:6,fontSize:12}}><b>Career interest:</b> {s.career}</div>
                  <div style={{fontSize:12,color:V.muted}}>Targets: {s.targets}</div>
                  {s.fin&&<div style={{fontSize:12,color:V.muted}}>Financial plan: {s.fin}</div>}
                  {s.warn&&<div style={{fontSize:12,color:V.warn,fontWeight:600}}>{s.warn}</div>}
                </div>
                <Btn size="sm" onClick={()=>setModal(s.warn?'session':'career')}>{s.warn?'📅 Book':'📝 Update'}</Btn>
              </div>
            ))}
          </div>
          <Card>
            <CardHead title="📊 S6 Career Interests"/>
            <Prog label="Medicine / Health" value="18" pct={75} col="re"/>
            <Prog label="Engineering / Tech" value="14" pct={58} col="bl"/>
            <Prog label="Business / Commerce" value="12" pct={50} col="am"/>
            <Prog label="Law" value="10" pct={42} col="pu"/>
            <Prog label="Education / Teaching" value="8" pct={33} col="te"/>
            <Prog label="Agriculture / Environment" value="6" pct={25} col="gr"/>
            <Prog label="Undecided" value="4" pct={17} col="or"/>
            <div style={{height:1,background:V.border,margin:'14px 0'}}/>
            <div style={{fontSize:11,color:V.muted,lineHeight:1.7}}><b>Counsellor note:</b> Many students cite family expectations as primary career driver. Group session on values + career identity scheduled.</div>
          </Card>
        </div>
      </div>}
      {careerTab==='s4'&&<div>
        <div style={{background:V.warnSoft,border:'1px solid rgba(245,158,11,.25)',borderRadius:9,padding:'12px 18px',marginBottom:16,fontSize:12,fontWeight:600,color:'#92400e'}}>⚠️ S4 students choosing A-Level combinations for S5 — deadline: End of Term 1. Counsellor should meet all S4 students who are uncertain about their combination.</div>
        <Card>
          <CardHead title="📚 S4 — Subject Combination Guidance" action={<Btn variant="pr" size="sm" onClick={()=>setModal('career')}>+ Add Student</Btn>}/>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Student','Current Strengths','Combination Interest','Career Idea','Counselled',''].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
              <tbody>
                {[['Mugisha Ronald','Sciences 87%','PCB (Physics, Chem, Bio)','Medicine','gr'],['Akello Rose','Sciences 95%','PCM (Physics, Chem, Maths)','Engineering','gr'],['Ssali Kevin','Mixed 52%','Undecided','Unclear','am'],['Tumwine Eric','Sciences 38%','Needs realistic guidance','Vocational?','am']].map(([n,str,comb,car,col])=>(
                  <tr key={n} style={{borderBottom:`1px solid ${V.border}`}}>
                    <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{n}</td>
                    <td style={{padding:'10px 12px',fontSize:12}}>{str}</td>
                    <td style={{padding:'10px 12px',fontSize:12}}>{comb}</td>
                    <td style={{padding:'10px 12px',fontSize:12}}>{car}</td>
                    <td style={{padding:'10px 12px'}}><Chip col={col}>{col==='gr'?'Yes ✓':'Pending'}</Chip></td>
                    <td style={{padding:'10px 12px'}}><Btn size="sm" onClick={()=>col==='am'?setModal('session'):setModal('career')}>{col==='am'?'Book':'Update'}</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>}
      {careerTab==='groups'&&<Card>
        <CardHead title="👥 Group Career Sessions" action={<Btn variant="pr" size="sm" onClick={()=>setModal('session')}>+ Schedule</Btn>}/>
        <SessionSlot time="11:30 AM" name="S6 University Application Workshop" sub="12 students · UNEB scoring, JAB process, forms · Boardroom" badge={<Chip col="am">Today</Chip>}/>
        <SessionSlot time="Mon 09 Mar" name="Values & Career Identity — S6" sub="Who am I? What do I love? Facilitated reflection · 20 students" badge={<Chip col="gy">Upcoming</Chip>}/>
        <SessionSlot time="Wed 11 Mar" name="S4 Combination Guidance Talk" sub="All S4 students · Subject combinations explained · Main hall" badge={<Chip col="gy">Upcoming</Chip>}/>
        <SessionSlot time="05 Mar" name="University Life — Guest Speaker" sub="Makerere alumnus · 45 S6 students · Done" badge={<Chip col="gr">Done ✓</Chip>} done/>
      </Card>}
      {careerTab==='resources'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:16}}>
        {[['🏛️ Public Universities',['Makerere University','Kyambogo University','Makerere Business School','Gulu University','Mbarara University','Busitema University','Kabale University']],['🏫 Private Universities',['Uganda Christian University','Nkumba University','IUIU (Islamic)','Kampala International','Cavendish University','Uganda Martyrs Univ.','St. Lawrence University']],['💼 Scholarships',['Government sponsorship (JAB)','MasterCard Foundation','Uganda Women Education','District bursaries','Church scholarships','NGO scholarships (BRAC, etc.)','African Leadership Academy']]].map(([title,items])=>(
          <Card key={String(title)}><div style={{fontSize:13,fontWeight:700,marginBottom:10}}>{String(title)}</div><div style={{fontSize:12,color:V.muted,lineHeight:1.8}}>{(items as string[]).join(' · ').split(' · ').map((s,i)=><div key={i}>{s}</div>)}</div></Card>
        ))}
      </div>}
    </div>
  );

  /* Communications */
  const PageCommunications=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Communications</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <CardHead title="Inbox (3 unread)"/>
          {[{init:'DHM',bg:V.primary,title:'Nakato Sarah — safeguarding update needed',sub:'Deputy HM · 1 hr ago · Unread'},
            {init:'CT',bg:'linear-gradient(135deg,#059669,#14b8a6)',title:'S4B student very withdrawn this week — please check',sub:'Class Teacher (Mr. Opolot) · 2 hrs ago · Unread'},
            {init:'PR',bg:'linear-gradient(135deg,#ef4444,#f97316)',title:"My son's career guidance — when can we meet?",sub:'Parent (Ssemakula family) · Yesterday · Unread'},
            {init:'HT',bg:V.primary,title:'OVC report requested for Board meeting',sub:'Head Teacher · 2 days ago'},
          ].map(m=>(
            <div key={m.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 6px',background:m.sub.includes('Unread')?V.accSoft:'transparent',borderRadius:8,marginBottom:5,cursor:'pointer'}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{m.init}</div>
              <div><div style={{fontSize:12,fontWeight:600}}>{m.title}</div><div style={{fontSize:10,color:V.muted,marginTop:1}}>{m.sub}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHead title="💬 Compose"/>
          <div style={{background:'#fef9f9',borderRadius:7,padding:'8px 10px',fontSize:11,color:'#b91c1c',fontWeight:600,marginBottom:12}}>🔒 Do not share student details beyond what is necessary.</div>
          <FG label="Send To"><FS><option>🏫 Deputy HM</option><option>🏫 Head Teacher</option><option>👩‍🏫 Class Teacher</option><option>👨‍👩‍👧 Parent / Guardian</option><option>🏥 School Health Centre</option><option>📝 Examination Officer</option></FS></FG>
          <FG label="Subject"><FI placeholder="Subject..."/></FG>
          <FG label="Message"><FTA placeholder="Your message..."/></FG>
          <Btn variant="pr" onClick={()=>toast('Message sent ✓','success')}>📤 Send</Btn>
        </Card>
      </div>
    </div>
  );

  /* Announcements */
  const PageAnnouncements=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Announcements</div>
      <div style={{background:V.dangerSoft,border:'1px solid rgba(239,68,68,.2)',borderRadius:10,padding:'14px 18px',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <span style={{background:V.danger,color:'#fff',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4}}>URGENT · Head Teacher</span>
          <div style={{fontSize:13,fontWeight:700}}>UNEB Inspection — Counselling Records Audit</div>
        </div>
        <div style={{fontSize:12,color:V.muted,lineHeight:1.6}}>UNEB inspectors may request to see the counsellor's register and safeguarding log. Please ensure all case files are up to date, the OVC register is printed, and the referral log is complete.</div>
        <div style={{fontSize:11,color:V.light,marginTop:8}}>06 Mar 2026 · Head Teacher</div>
      </div>
      <div style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:'14px 18px',boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <span style={{background:V.acc,color:'#fff',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4}}>PASTORAL · Deputy HM</span>
          <div style={{fontSize:13,fontWeight:700}}>S6 Exam Anxiety — Counsellor Support Week</div>
        </div>
        <div style={{fontSize:12,color:V.muted,lineHeight:1.6}}>Several S6 students are showing signs of significant exam stress. Please prioritise drop-in sessions this week and consider running a group session on coping strategies.</div>
        <div style={{fontSize:11,color:V.light,marginTop:8}}>05 Mar 2026 · Deputy HM</div>
      </div>
    </div>
  );

  /* Portals */
  const PagePortals=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Portal Quick Access</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {[['🏫','#059669',V.successSoft,'Head Teacher','Mr. Ssemanda Julius','/ht/dashboard'],['📋','#0ea5e9','#f0f9ff','Deputy HM','Mr. Tumwebaze','/deputy-hm'],['👩‍🏫',V.acc,V.accSoft,'Teacher Portal','All teachers','/teacher'],['📝','#f43f5e',V.roseSoft,'Exam Officer','Examinations','/exam-officer'],['💰',V.warn,V.warnSoft,'Bursar','Bursary referrals','/bursar'],['🎒',V.purple,V.purpleSoft,'Student Portal','Results & timetable','/student']].map(([icon,border,bg,title,sub,path])=>(
          <div key={String(title)} onClick={()=>navigate(String(path))} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:V.card,border:`1px solid ${V.border}`,borderRadius:10,cursor:'pointer',borderLeft:`4px solid ${border}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)',transition:'all .2s'}}>
            <div style={{width:36,height:36,borderRadius:9,background:String(bg),display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{icon}</div>
            <div><div style={{fontSize:12,fontWeight:700}}>{title}</div><div style={{fontSize:10,color:V.muted}}>{sub}</div></div>
            <span style={{marginLeft:'auto',color:V.light}}>↗</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* Settings */
  const PageSettings=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Settings</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Profile</div>
          <FG label="Full Name"><FI value="School Counsellor"/></FG>
          <FG label="Role"><FI value="School Counsellor & Guidance Officer"/></FG>
          <FG label="Email"><FI value="counsellor@smissi.ac.ug" type="email"/></FG>
          <FG label="Emergency Contact (DHM)"><FI value="+256 700 000 002"/></FG>
          <Btn variant="pr" onClick={()=>toast('Profile updated ✓','success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Confidentiality Settings</div>
          <FG label="Case note access"><FS><option>Counsellor only</option><option>Counsellor + Head Teacher</option></FS></FG>
          <FG label="Safeguarding alert — auto-notify"><FS><option>Deputy HM (immediate)</option><option>Head Teacher + Deputy HM</option></FS></FG>
          <FG label="OVC report frequency"><FS><option>Monthly</option><option>Every 2 weeks</option><option>Weekly</option></FS></FG>
          <Btn variant="pr" onClick={()=>toast('Settings saved ✓','success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );

  /* ── render ── */
  return (
    <div style={{minHeight:'100vh',background:V.bg,display:'flex',fontFamily:"'DM Sans', sans-serif",fontSize:14}}>
      <Sidebar/>
      <div style={{marginLeft:260,flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <Topbar/>
        <div style={{padding:20,flex:1}}>
          {page==='dashboard'&&<PageDashboard/>}
          {page==='students'&&<PageStudents/>}
          {page==='casenotes'&&<PageCaseNotes/>}
          {page==='sessions'&&<PageSessions/>}
          {page==='safeguarding'&&<PageSafeguarding/>}
          {page==='health'&&<PageHealth/>}
          {page==='ovc'&&<PageOVC/>}
          {page==='career'&&<PageCareer/>}
          {page==='communications'&&<PageCommunications/>}
          {page==='announcements'&&<PageAnnouncements/>}
          {page==='portals'&&<PagePortals/>}
          {page==='settings'&&<PageSettings/>}
        </div>
      </div>

      {/* ── MODALS ── */}
      <Modal open={modal==='session'} onClose={()=>setModal(null)} title="📅 Log / Book Session">
        <ConfBanner/>
        <FG label="Student"><FI placeholder="Student name and class..."/></FG>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Date"><FI type="date" value="2026-03-07"/></FG>
          <FG label="Time"><FI type="time" value="09:00"/></FG>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Session Type"><FS><option>Individual</option><option>Group</option><option>Parent meeting</option><option>Teacher consultation</option></FS></FG>
          <FG label="Duration"><FS><option>30 minutes</option><option>45 minutes</option><option>60 minutes</option><option>90 minutes</option></FS></FG>
        </div>
        <FG label="Issue / Theme"><FS><option>Academic stress / Exam anxiety</option><option>Family / Home issues</option><option>Bullying / Peer conflict</option><option>OVC welfare check</option><option>Safeguarding</option><option>Health referral</option><option>Career guidance</option><option>Grief / Bereavement</option><option>Substance use</option><option>Relationships</option><option>Other</option></FS></FG>
        <FG label="Session Notes"><FTA placeholder="Brief notes on the session..."/></FG>
        <FG label="Follow-up Date"><FI type="date"/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Session logged ✓','success');}}>Save Session</Btn></div>
      </Modal>

      <Modal open={modal==='newCase'} onClose={()=>setModal(null)} title="➕ Open New Case">
        <ConfBanner/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Student Name"><FI placeholder="Full name"/></FG>
          <FG label="Class"><FI placeholder="e.g. S4B"/></FG>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Age"><FI type="number" placeholder="Age"/></FG>
          <FG label="Gender"><FS><option>Female</option><option>Male</option><option>Prefer not to say</option></FS></FG>
        </div>
        <FG label="Primary Concern"><FS><option>Academic stress</option><option>Family / Home</option><option>Bullying</option><option>OVC / Vulnerability</option><option>Safeguarding</option><option>Health</option><option>Career guidance</option><option>Grief / Loss</option><option>Mental health</option></FS></FG>
        <FG label="Referred By"><FS><option>Self-referred</option><option>Class teacher</option><option>Fellow student</option><option>Parent/Guardian</option><option>DHM</option><option>Dormitory prefect</option></FS></FG>
        <FG label="OVC Status"><FS><option>Not OVC</option><option>Double orphan</option><option>Single orphan</option><option>Child in difficult circumstances</option></FS></FG>
        <FG label="Initial Presenting Issue"><FTA placeholder="Brief description of the concern..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Case opened ✓','success');}}>Open Case</Btn></div>
      </Modal>

      <Modal open={modal==='note'} onClose={()=>setModal(null)} title="✏️ Add Case Note">
        <ConfBanner/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Date"><FI type="date" value="2026-03-07"/></FG>
          <FG label="Note Type"><FS><option>Session note</option><option>Observation</option><option>Referral</option><option>Safeguarding update</option><option>Parent contact</option><option>Follow-up</option></FS></FG>
        </div>
        <FG label="Note"><FTA placeholder="Record what was discussed, observed, or decided. Use the student's own words where relevant. Note any risks, action taken, and next steps..." minH={130}/></FG>
        <FG label="Risk Level"><FS><option>Low — monitoring</option><option>Medium — active support</option><option>High — urgent action needed</option><option>Critical — immediate escalation</option></FS></FG>
        <FG label="Next Action"><FI placeholder="e.g. Follow up session in 1 week, refer to health centre..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Note saved to case file ✓','success');}}>Save Note</Btn></div>
      </Modal>

      <Modal open={modal==='safeguard'} onClose={()=>setModal(null)} title="🚨 Report Safeguarding Concern">
        <div style={{background:V.dangerSoft,border:'1px solid rgba(239,68,68,.25)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:11,color:'#b91c1c',fontWeight:600}}>⚠️ After completing this form, you MUST notify the Deputy HM verbally today. For immediate danger, contact the police.</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Student Name"><FI placeholder="Full name"/></FG>
          <FG label="Class"><FI placeholder="e.g. S4B"/></FG>
        </div>
        <FG label="Type of Concern"><FS><option>Physical abuse</option><option>Emotional abuse</option><option>Sexual abuse / exploitation</option><option>Neglect</option><option>Bullying</option><option>Child marriage</option><option>Substance use</option><option>Other</option></FS></FG>
        <FG label="Who reported / how discovered"><FI placeholder="e.g. Student self-disclosed, teacher referred, observed..."/></FG>
        <FG label="Detailed Account"><FTA placeholder="Record exactly what was said, seen, or reported. Use direct quotes where possible. Note time, date, location, and any witnesses..." minH={120}/></FG>
        <FG label="Immediate Risk Level"><FS><option>High — child at risk now</option><option>Medium — monitoring needed</option><option>Unclear — further investigation</option></FS></FG>
        <FG label="Action Taken So Far"><FTA placeholder="What have you done since becoming aware of this concern?"/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="ro" onClick={()=>{setModal(null);toast('Safeguarding case opened · Notify DHM now','danger');}}>🚨 Open Safeguarding Case</Btn></div>
      </Modal>

      <Modal open={modal==='health'} onClose={()=>setModal(null)} title="🏥 New Health Referral">
        <ConfBanner/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Student"><FI placeholder="Student name / protected if needed"/></FG>
          <FG label="Class"><FI placeholder="e.g. S5A"/></FG>
        </div>
        <FG label="Health Concern"><FS><option>Menstrual health</option><option>Reproductive health / Pregnancy</option><option>HIV/AIDS — VCT referral</option><option>Mental health</option><option>Substance use</option><option>General physical health</option><option>Other</option></FS></FG>
        <FG label="Referred To"><FS><option>School health centre</option><option>Jinja Road Health Centre IV</option><option>Marie Stopes Uganda</option><option>Butabika Hospital (mental health)</option><option>Private clinic</option></FS></FG>
        <FG label="Brief Notes"><FTA placeholder="What was the presenting concern? What was arranged?"/></FG>
        <FG label="Follow-up Date"><FI type="date"/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Health referral logged ✓','success');}}>Log Referral</Btn></div>
      </Modal>

      <Modal open={modal==='ovc'} onClose={()=>setModal(null)} title="🌱 Add Student to OVC Register">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Student Name"><FI placeholder="Full name"/></FG>
          <FG label="Class"><FI/></FG>
        </div>
        <FG label="OVC Category"><FS><option>Double orphan (both parents deceased)</option><option>Single orphan (one parent deceased)</option><option>Child with chronically ill parent</option><option>Child in difficult circumstances (poverty, neglect)</option></FS></FG>
        <FG label="Guardian / Caregiver"><FI placeholder="Name and relationship"/></FG>
        <FG label="Guardian Contact"><FI placeholder="Phone number"/></FG>
        <FG label="Fees Status"><FS><option>Fully sponsored</option><option>Partially sponsored</option><option>Fees arrears — at risk</option><option>Unknown</option></FS></FG>
        <FG label="Key Vulnerabilities / Concerns"><FTA placeholder="What makes this student particularly vulnerable?"/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Student added to OVC register ✓','success');}}>Add to Register</Btn></div>
      </Modal>

      <Modal open={modal==='career'} onClose={()=>setModal(null)} title="🎓 Log Career Session">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Student"><FI placeholder="Student name"/></FG>
          <FG label="Class"><FI placeholder="e.g. S6A"/></FG>
        </div>
        <FG label="Career Interest(s)"><FI placeholder="e.g. Medicine, Engineering, Law..."/></FG>
        <FG label="Target Universities"><FI placeholder="e.g. Makerere (MBChB), Mbarara..."/></FG>
        <FG label="Subject Combination (S4/S5)"><FI placeholder="e.g. PCB, HEG, MEG..."/></FG>
        <FG label="Financial Plan"><FS><option>Government sponsorship (JAB)</option><option>Family funding</option><option>Scholarship / NGO sponsor</option><option>Loan</option><option>Unknown / not discussed</option></FS></FG>
        <FG label="Session Notes"><FTA placeholder="What was discussed? Any concerns? Next steps?"/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Career session logged ✓','success');}}>Save</Btn></div>
      </Modal>

      <Modal open={modal==='msg'} onClose={()=>setModal(null)} title="💬 Send Message">
        <div style={{background:'#fef2f2',border:'1px solid rgba(239,68,68,.2)',borderRadius:8,padding:'10px 14px',fontSize:11,color:'#b91c1c',fontWeight:600,marginBottom:16}}>🔒 Do not include identifying student details unnecessarily</div>
        <FG label="To"><FS><option>Deputy HM (Mr. Tumwebaze)</option><option>Head Teacher</option><option>Class Teacher</option><option>School Health Centre</option><option>Bursar (re: bursary)</option></FS></FG>
        <FG label="Subject"><FI placeholder="Subject..."/></FG>
        <FG label="Message"><FTA placeholder="Your message..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Message sent ✓','success');}}>📤 Send</Btn></div>
      </Modal>

      {/* Toasts */}
      <div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:7}}>
        {toasts.map(t=>(
          <div key={t.id} style={{background:t.type==='success'?'#064e3b':t.type==='warning'?'#78350f':t.type==='info'?'#164e63':t.type==='danger'?'#7f1d1d':V.text,color:'#fff',padding:'10px 16px',borderRadius:9,fontSize:12,fontWeight:500,display:'flex',alignItems:'center',gap:7,boxShadow:'0 8px 24px rgba(0,0,0,.2)',borderLeft:`3px solid ${t.type==='success'?V.success:t.type==='warning'?V.warn:t.type==='info'?V.blue:t.type==='danger'?V.danger:V.muted}`,maxWidth:320,animation:'sIn .25s ease'}}>
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
