import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── types ── */
type Page = 'dashboard'|'fees'|'arrears'|'expenses'|'payroll'|'invoices'|'reports'|'communications'|'portals'|'settings';
type Modal = 'receivePayment'|'recordExpense'|'addInvoice'|'sendReminder'|'payrollModal'|'msgModal'|null;
type ToastT = { id: number; msg: string; type: 'success'|'warning'|'info'|'danger'|'default' };

/* ── colours ── */
const V = {
  acc:'#0f766e', accSoft:'#f0fdfa', accDark:'#0d5c57',
  success:'#10b981', successSoft:'#ecfdf5',
  danger:'#ef4444', dangerSoft:'#fef2f2',
  warn:'#f59e0b', warnSoft:'#fffbeb',
  blue:'#3b82f6', blueSoft:'#eff6ff',
  purple:'#8b5cf6', purpleSoft:'#f5f3ff',
  orange:'#f97316', orangeSoft:'#fff7ed',
  rose:'#f43f5e', roseSoft:'#fff1f2',
  primary:'#1e293b', bg:'#f7fbfa', card:'#fff', border:'#e2e8f0',
  text:'#1e293b', muted:'#64748b', light:'#94a3b8',
};

/* ── static data ── */
const FEE_ROWS = [
  { cls:'S1', students:278, expected:83400000, collected:72318000 },
  { cls:'S2', students:234, expected:70200000, collected:57564000 },
  { cls:'S3', students:214, expected:64200000, collected:46224000 },
  { cls:'S4', students:248, expected:74400000, collected:59520000 },
  { cls:'S5', students:91,  expected:27300000, collected:24570000 },
  { cls:'S6', students:142, expected:42600000, collected:38340000 },
];

const DEFAULTERS = [
  { name:'Nakibuule Sarah', cls:'S5A', balance:1275000, days:68, parent:'Mrs. Nakibuule (+256 772 111 222)', lastPaid:'12 Jan' },
  { name:'Okwir James',     cls:'S3A', balance:950000,  days:72, parent:'Mr. Okwir (+256 782 333 444)',    lastPaid:'08 Jan' },
  { name:'Auma Gloria',     cls:'S4B', balance:1850000, days:81, parent:'Ms. Auma (+256 701 555 666)',     lastPaid:'05 Jan' },
  { name:'Ssemwogerere T.', cls:'S2A', balance:750000,  days:61, parent:'Mr. Ssemwog (+256 774 777 888)', lastPaid:'18 Jan' },
  { name:'Namanya Patrick', cls:'S6A', balance:425000,  days:64, parent:'Mrs. Namanya (+256 752 999 000)', lastPaid:'14 Jan' },
  { name:'Kyaligonza David',cls:'S1B', balance:1100000, days:55, parent:'Mr. Kyaligonza (+256 712 001 002)', lastPaid:'20 Jan' },
  { name:'Birungi Agnes',   cls:'S3B', balance:625000,  days:77, parent:'Mrs. Birungi (+256 791 003 004)',  lastPaid:'03 Jan' },
];

const EXPENSES = [
  { date:'06 Mar', category:'Utilities', desc:'Uganda National Water (March)', amount:1800000, approved:true, requisitionNo:'REQ-2026-081' },
  { date:'05 Mar', category:'Supplies', desc:'Science lab chemicals restock', amount:3200000, approved:true, requisitionNo:'REQ-2026-080' },
  { date:'04 Mar', category:'Maintenance', desc:'Dormitory roof repair — Block C', amount:8500000, approved:true, requisitionNo:'REQ-2026-079' },
  { date:'03 Mar', category:'Salaries', desc:'February payroll disbursement', amount:87400000, approved:true, requisitionNo:'REQ-2026-078' },
  { date:'01 Mar', category:'Catering', desc:'Food supplies — Term 1 Week 7', amount:12600000, approved:false, requisitionNo:'REQ-2026-077' },
  { date:'28 Feb', category:'Transport', desc:'Staff transport allowance — Feb', amount:4200000, approved:true, requisitionNo:'REQ-2026-076' },
];

const INVOICES = [
  { supplier:'Mbale Book Distributors',  amount:6800000,  due:'10 Mar',  status:'Pending',  items:'Textbooks — S3 & S4 (200 copies)' },
  { supplier:'Kampala Lab Supplies Ltd', amount:3200000,  due:'15 Mar',  status:'Pending',  items:'Chemistry reagents, glassware' },
  { supplier:'Ngoma Construction Works', amount:8500000,  due:'12 Mar',  status:'Overdue',  items:'Dormitory roof repair' },
  { supplier:'Fresh Farm Foods Uganda',  amount:14200000, due:'08 Mar',  status:'Paid',     items:'Term 1 Wk 6-8 catering supply' },
  { supplier:'URA — VAT Return',         amount:2100000,  due:'28 Feb',  status:'Paid',     items:'Q4 2025 VAT filing' },
];

const STAFF_PAYROLL = [
  { name:'Ssemanda Julius',  role:'Head Teacher',      gross:4200000, tax:630000, net:3570000, status:'Paid' },
  { name:'Nakakande Mary',   role:'HOD Mathematics',   gross:2800000, tax:420000, net:2380000, status:'Paid' },
  { name:'Byamugisha Fred',  role:'Senior Teacher',    gross:2400000, tax:360000, net:2040000, status:'Paid' },
  { name:'Opio Grace',       role:'Class Teacher',     gross:1900000, tax:285000, net:1615000, status:'Paid' },
  { name:'Tumwine Robert',   role:'Lab Technician',    gross:1600000, tax:240000, net:1360000, status:'Pending' },
  { name:'Nakato Agnes',     role:'Matron',            gross:1400000, tax:210000, net:1190000, status:'Pending' },
];

const fmt = (n:number) => `UGX ${(n/1000000).toFixed(2)}M`;
const fmtFull = (n:number) => `UGX ${n.toLocaleString()}`;

/* ── tiny shared components ── */
function Chip({bg,color,children}:{bg:string;color:string;children:React.ReactNode}){
  return <span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:bg,color}}><span style={{fontSize:7}}>●</span>{children}</span>;
}
function Btn({variant='se',size='md',style:ext,onClick,children}:{variant?:string;size?:string;style?:React.CSSProperties;onClick?:()=>void;children:React.ReactNode}){
  const c:{[k:string]:[string,string,string]}={pr:[V.acc,'#fff','transparent'],se:['#f8fafc',V.text,V.border],da:[V.dangerSoft,V.danger,'rgba(239,68,68,.2)'],wa:[V.warnSoft,'#b45309','rgba(245,158,11,.2)'],su:[V.successSoft,V.success,'rgba(16,185,129,.2)'],dk:[V.primary,'#fff','transparent'],ro:[V.roseSoft,'#f43f5e','rgba(244,63,94,.2)']};
  const [bg,fg,bd]=c[variant]??c.se;
  return <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:5,padding:size==='sm'?'4px 10px':'7px 14px',borderRadius:8,fontSize:size==='sm'?11:12,fontWeight:600,cursor:'pointer',border:`1px solid ${bd}`,background:bg,color:fg,fontFamily:'inherit',transition:'all .15s',...ext}}>{children}</button>;
}
function Card({children,style}:{children:React.ReactNode;style?:React.CSSProperties}){
  return <div style={{background:V.card,borderRadius:12,border:`1px solid ${V.border}`,boxShadow:'0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)',padding:18,...style}}>{children}</div>;
}
function CardHead({title,action}:{title:React.ReactNode;action?:React.ReactNode}){
  return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><div style={{fontSize:14,fontWeight:700}}>{title}</div>{action}</div>;
}
function Prog({label,value,pct,col='teal'}:{label:string;value:string;pct:number;col?:string}){
  const cc:{[k:string]:string}={teal:V.acc,green:V.success,blue:V.blue,amber:V.warn,red:V.danger,purple:V.purple,orange:V.orange};
  return <div style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:12,fontWeight:600}}>{label}</span><span style={{fontSize:12,fontWeight:700,color:V.muted}}>{value}</span></div><div style={{height:7,background:'#f1f5f9',borderRadius:10,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,borderRadius:10,background:cc[col]??V.acc,transition:'width .4s ease'}}/></div></div>;
}
function StatCard({col='teal',icon,val,label,badge,onClick}:{col?:string;icon:string;val:string;label:string;badge?:[string,string];onClick?:()=>void}){
  const t:{[k:string]:string}={teal:V.acc,green:V.success,red:V.danger,amber:V.warn,blue:V.blue,purple:V.purple,orange:V.orange};
  const b:{[k:string]:string}={teal:V.accSoft,green:V.successSoft,red:V.dangerSoft,amber:V.warnSoft,blue:V.blueSoft,purple:V.purpleSoft,orange:V.orangeSoft};
  return <div onClick={onClick} style={{background:V.card,borderRadius:12,padding:'16px 18px',border:`1px solid ${V.border}`,borderTop:`3px solid ${t[col]??V.acc}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)',cursor:onClick?'pointer':'default',transition:'all .2s'}}
    onMouseEnter={e=>onClick&&((e.currentTarget as HTMLElement).style.transform='translateY(-2px)')}
    onMouseLeave={e=>((e.currentTarget as HTMLElement).style.transform='none')}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
      <div style={{width:34,height:34,borderRadius:8,background:b[col]??V.accSoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>{icon}</div>
      {badge&&<span style={{fontSize:10,fontWeight:600,padding:'2px 6px',borderRadius:20,background:badge[0]==='up'?V.successSoft:badge[0]==='dn'?V.dangerSoft:'#f1f5f9',color:badge[0]==='up'?V.success:badge[0]==='dn'?V.danger:V.muted}}>{badge[1]}</span>}
    </div>
    <div style={{fontSize:24,fontWeight:800}}>{val}</div>
    <div style={{fontSize:11,color:V.muted,marginTop:2}}>{label}</div>
  </div>;
}
function Modal({open,onClose,title,children,wide}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode;wide?:boolean}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
    <div onClick={e=>e.stopPropagation()} style={{background:V.card,borderRadius:14,padding:24,width:wide?720:540,maxWidth:'100%',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.2)',animation:'mIn .2s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}><div style={{fontSize:15,fontWeight:700}}>{title}</div><button onClick={onClose} style={{width:26,height:26,borderRadius:6,border:`1px solid ${V.border}`,background:'#f8fafc',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button></div>
      {children}
    </div>
  </div>;
}
function FG({label,children}:{label:string;children:React.ReactNode}){return <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:700,color:V.muted,marginBottom:5,display:'block',textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</label>{children}</div>;}
function FI({placeholder,value,type='text'}:{placeholder?:string;value?:string;type?:string}){return <input defaultValue={value} type={type} placeholder={placeholder} style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none',boxSizing:'border-box'}}/>;}
function FS({children}:{children:React.ReactNode}){return <select style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none'}}>{children}</select>;}
function FTA({placeholder,minH=80}:{placeholder?:string;minH?:number}){return <textarea placeholder={placeholder} style={{width:'100%',padding:'8px 11px',border:`1px solid ${V.border}`,borderRadius:8,fontSize:12,fontFamily:'inherit',background:'#f8fafc',color:V.text,outline:'none',resize:'vertical',minHeight:minH,boxSizing:'border-box'}}/>;}

/* ══════════════════════════════════════════
   MAIN BURSAR PORTAL
══════════════════════════════════════════ */
export default function BursarPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>('dashboard');
  const [modal, setModal] = useState<Modal>(null);
  const [toasts, setToasts] = useState<ToastT[]>([]);

  const totalExpected = FEE_ROWS.reduce((s,r)=>s+r.expected,0);
  const totalCollected = FEE_ROWS.reduce((s,r)=>s+r.collected,0);
  const totalArrears = totalExpected - totalCollected;
  const collectionPct = Math.round(totalCollected/totalExpected*100);

  const toast=useCallback((msg:string,type:ToastT['type']='default')=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  },[]);

  useEffect(()=>{
    setTimeout(()=>toast('💰 3 supplier invoices due this week','warning'),900);
    setTimeout(()=>toast('⚠️ 7 students with arrears > 60 days','danger'),2400);
  },[toast]);

  const navSections = [
    {label:'Overview',items:[{id:'dashboard',icon:'🏠',label:'Dashboard'},{id:'reports',icon:'📊',label:'Financial Reports'}]},
    {label:'Fee Management',items:[{id:'fees',icon:'💰',label:'Fee Collection'},{id:'arrears',icon:'⚠️',label:'Arrears & Defaulters',badge:7}]},
    {label:'Expenditure',items:[{id:'expenses',icon:'🧾',label:'Expenses'},{id:'invoices',icon:'📦',label:'Supplier Invoices',badge:3},{id:'payroll',icon:'👥',label:'Payroll'}]},
    {label:'Admin',items:[{id:'communications',icon:'💬',label:'Communications'},{id:'portals',icon:'🔗',label:'Portals'}]},
  ];
  const pageTitles:{[k:string]:string}={dashboard:'Dashboard',fees:'Fee Collection',arrears:'Arrears & Defaulters',expenses:'Expenses',payroll:'Payroll',invoices:'Supplier Invoices',reports:'Financial Reports',communications:'Communications',portals:'Portals',settings:'Settings'};

  /* ── Sidebar ── */
  const Sidebar=()=>(
    <div style={{width:256,background:V.primary,minHeight:'100vh',position:'fixed',left:0,top:0,bottom:0,display:'flex',flexDirection:'column',zIndex:100,overflowY:'auto'}}>
      <div style={{padding:'14px 14px 10px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(15,118,110,.25)',border:'1px solid rgba(15,118,110,.4)',borderRadius:8,padding:'7px 10px',marginBottom:10}}>
          <div style={{width:26,height:26,borderRadius:6,background:V.acc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>💰</div>
          <div><div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.9)',letterSpacing:'.07em',textTransform:'uppercase'}}>SMISSI</div><div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>Bursar / Finance</div></div>
        </div>
      </div>
      <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#0f766e,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0}}>KE</div>
        <div><div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{user?.name??'Mr. Kato Emmanuel'}</div><div style={{fontSize:10,color:'rgba(255,255,255,.38)'}}>Finance Officer</div></div>
        <div style={{width:6,height:6,borderRadius:'50%',background:V.success,marginLeft:'auto',boxShadow:'0 0 0 2px rgba(16,185,129,.25)'}}/>
      </div>
      {navSections.map(sec=>(
        <div key={sec.label} style={{padding:'10px 8px 2px'}}>
          <div style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.22)',textTransform:'uppercase',letterSpacing:'.12em',padding:'0 6px',marginBottom:3}}>{sec.label}</div>
          {sec.items.map(item=>(
            <div key={item.id} onClick={()=>setPage(item.id as Page)} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 8px',borderRadius:7,cursor:'pointer',color:page===item.id?'#fff':'rgba(255,255,255,.52)',fontSize:12,fontWeight:500,marginBottom:1,background:page===item.id?'rgba(15,118,110,.35)':'transparent',position:'relative',transition:'all .15s'}}>
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
  const Topbar=()=>(
    <header style={{height:60,background:V.card,borderBottom:`1px solid ${V.border}`,display:'flex',alignItems:'center',padding:'0 22px',gap:14,position:'sticky',top:0,zIndex:50}}>
      <div><div style={{fontSize:15,fontWeight:700}}>{pageTitles[page]}</div><div style={{fontSize:11,color:V.muted,marginTop:1}}>Finance Office · Term 1, 2026 · Sat 07 Mar 2026</div></div>
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
        <span style={{background:V.accSoft,color:V.accDark,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20,border:`1px solid rgba(15,118,110,.2)`}}>{collectionPct}% collected</span>
        <span style={{background:'#f1f5f9',color:V.muted,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20}}>Sat, 07 Mar</span>
        <button style={{width:34,height:34,borderRadius:8,border:`1px solid ${V.border}`,background:V.card,cursor:'pointer',fontSize:15,position:'relative',color:V.muted,display:'flex',alignItems:'center',justifyContent:'center'}}>🔔<span style={{position:'absolute',top:5,right:5,width:6,height:6,background:V.danger,borderRadius:'50%',border:'1.5px solid #fff'}}/></button>
      </div>
    </header>
  );

  /* ─── DASHBOARD ─── */
  const PageDashboard=()=>(
    <div>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#0d5c57 0%,#0f766e 55%,#065f46 100%)',borderRadius:12,padding:'20px 24px',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-50,top:-50,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,.05)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontSize:18,fontWeight:700,margin:0}}>Finance Overview — Term 1, 2026 💰</h2>
          <p style={{fontSize:12,color:'rgba(255,255,255,.65)',marginTop:3}}>SMISSI Senior Secondary School · Bursar Office · Sat 07 Mar 2026</p>
          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
            <span style={{background:'rgba(255,255,255,.15)',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600}}>💰 {collectionPct}% fees collected</span>
            <span style={{background:'rgba(239,68,68,.3)',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600}}>⚠️ {DEFAULTERS.length} defaulters (60+ days)</span>
            <span style={{background:'rgba(255,255,255,.15)',borderRadius:6,padding:'4px 10px',fontSize:11,fontWeight:600}}>📦 3 invoices due this week</span>
          </div>
        </div>
        <div style={{display:'flex',gap:20,position:'relative',zIndex:1,flexShrink:0}}>
          {[[fmt(totalCollected),'Collected'],[fmt(totalArrears),'Arrears'],[`${collectionPct}%`,'Rate'],['1,207','Students']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:800}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginTop:1}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
        <Btn variant="pr" onClick={()=>setModal('receivePayment')}>💳 Receive Payment</Btn>
        <Btn onClick={()=>setModal('sendReminder')}>📱 Send Reminders</Btn>
        <Btn onClick={()=>setModal('recordExpense')}>🧾 Record Expense</Btn>
        <Btn onClick={()=>setModal('addInvoice')}>📦 Add Invoice</Btn>
        <Btn variant="dk" onClick={()=>toast('Financial report generating...','info')}>📊 Generate Report</Btn>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="teal" icon="💰" val={`${collectionPct}%`} label="Collection Rate" badge={['up','↑ 8%']} onClick={()=>setPage('fees')}/>
        <StatCard col="green" icon="✅" val={fmt(totalCollected)} label="Total Collected (Term 1)" onClick={()=>setPage('fees')}/>
        <StatCard col="red" icon="⚠️" val={fmt(totalArrears)} label="Outstanding Arrears" badge={['dn','High']} onClick={()=>setPage('arrears')}/>
        <StatCard col="amber" icon="🧾" val={String(DEFAULTERS.length)} label="60+ Day Defaulters" badge={['dn','Action needed']} onClick={()=>setPage('arrears')}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="blue" icon="📦" val="3" label="Invoices Due (This Week)" onClick={()=>setPage('invoices')}/>
        <StatCard col="purple" icon="👥" val="2" label="Payroll Items Pending" onClick={()=>setPage('payroll')}/>
        <StatCard col="orange" icon="🧾" val={fmt(EXPENSES.reduce((a,e)=>a+e.amount,0))} label="Expenses This Term"/>
        <StatCard col="green" icon="📊" val="UGX 58M" label="Surplus Projection (Term 1)"/>
      </div>

      {/* Main grid */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:18}}>
        <Card>
          <CardHead title="💰 Fee Collection by Class — Term 1" action={<Btn size="sm" onClick={()=>toast('Exporting CSV...','info')}>📤 Export CSV</Btn>}/>
          {FEE_ROWS.map(r=>{
            const pct=Math.round(r.collected/r.expected*100);
            const col=pct>=85?'green':pct>=70?'amber':'red';
            return <div key={r.cls} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:12,fontWeight:700}}>Senior {r.cls.slice(1)} <span style={{color:V.muted,fontWeight:400}}>({r.students} students)</span></span>
                <span style={{fontSize:12,fontWeight:700,color:pct>=85?V.success:pct>=70?V.warn:V.danger}}>{pct}% · {fmt(r.collected)} / {fmt(r.expected)}</span>
              </div>
              <Prog label="" value="" pct={pct} col={col}/>
            </div>;
          })}
          <div style={{paddingTop:10,borderTop:`1px solid ${V.border}`,display:'flex',gap:20,fontSize:12}}>
            <span style={{fontWeight:700,color:V.success}}>Collected: {fmt(totalCollected)}</span>
            <span style={{color:V.danger,fontWeight:700}}>Arrears: {fmt(totalArrears)}</span>
            <span style={{color:V.muted}}>Total Expected: {fmt(totalExpected)}</span>
          </div>
        </Card>
        <div>
          <Card style={{marginBottom:16}}>
            <CardHead title="⚠️ Urgent Actions"/>
            {[{dot:'red',t:'Ngoma Construction invoice overdue — UGX 8.5M',s:'Due 01 Mar · 6 days overdue'},
              {dot:'red',t:'7 students with 60+ day arrears — reminders needed',s:'Highest: Auma Gloria S4B — UGX 1.85M'},
              {dot:'amber',t:'February payroll — 2 staff payments pending',s:'Tumwine Robert, Nakato Agnes'},
              {dot:'amber',t:'URA PAYE return — March deadline',s:'Due 15 Mar · Prepare now'},
              {dot:'blue',t:'Catering invoice due signature — Fresh Farm Foods',s:'UGX 14.2M · Due 08 Mar'},
            ].map(a=>(
              <div key={a.t} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'9px 0',borderBottom:`1px solid ${V.border}`}}>
                <div style={{width:7,height:7,borderRadius:'50%',marginTop:4,flexShrink:0,background:a.dot==='red'?V.danger:a.dot==='amber'?V.warn:V.blue,boxShadow:`0 0 0 3px ${a.dot==='red'?V.dangerSoft:a.dot==='amber'?V.warnSoft:V.blueSoft}`}}/>
                <div><div style={{fontSize:12,fontWeight:600}}>{a.t}</div><div style={{fontSize:10,color:V.muted,marginTop:1}}>{a.s}</div></div>
              </div>
            ))}
          </Card>
          <Card>
            <CardHead title="📊 Expense Breakdown (Term 1)"/>
            <Prog label="Salaries & Payroll" value="UGX 87.4M" pct={74} col="teal"/>
            <Prog label="Catering & Food" value="UGX 12.6M" pct={24} col="orange"/>
            <Prog label="Maintenance" value="UGX 8.5M" pct={18} col="amber"/>
            <Prog label="Supplies & Materials" value="UGX 6.8M" pct={14} col="blue"/>
            <Prog label="Utilities" value="UGX 1.8M" pct={6} col="purple"/>
            <Prog label="Transport Allowance" value="UGX 4.2M" pct={10} col="green"/>
          </Card>
        </div>
      </div>
    </div>
  );

  /* ─── FEES ─── */
  const PageFees=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Fee Collection</div><div style={{fontSize:12,color:V.muted}}>Track payments, receipt students, and manage fee structure</div></div>
        <div style={{display:'flex',gap:8}}>
          <Btn onClick={()=>toast('Fee structure opened','info')}>📋 Fee Structure</Btn>
          <Btn variant="pr" onClick={()=>setModal('receivePayment')}>💳 Receive Payment</Btn>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="teal" icon="💰" val={`${collectionPct}%`} label="Overall Collection Rate" badge={['up','↑ 8%']}/>
        <StatCard col="green" icon="✅" val={fmt(totalCollected)} label="Collected This Term"/>
        <StatCard col="red" icon="⚠️" val={fmt(totalArrears)} label="Outstanding Arrears"/>
        <StatCard col="blue" icon="👥" val="1,207" label="Total Students"/>
      </div>
      <Card>
        <CardHead title="📊 Detailed Collection by Class"/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Class','Students','Expected','Collected','Arrears','Rate','Status'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {FEE_ROWS.map(r=>{
                const pct=Math.round(r.collected/r.expected*100);
                const arrears=r.expected-r.collected;
                const [bg,color]=pct>=85?[V.successSoft,V.success]:pct>=70?[V.warnSoft,'#b45309']:[V.dangerSoft,V.danger];
                return <tr key={r.cls} style={{borderBottom:`1px solid ${V.border}`}}>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700}}>Senior {r.cls.slice(1)}</td>
                  <td style={{padding:'10px 12px',fontSize:12}}>{r.students}</td>
                  <td style={{padding:'10px 12px',fontSize:12}}>{fmt(r.expected)}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:V.success}}>{fmt(r.collected)}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:V.danger}}>{fmt(arrears)}</td>
                  <td style={{padding:'10px 12px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,height:6,background:'#f1f5f9',borderRadius:10,minWidth:60,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:pct>=85?V.success:pct>=70?V.warn:V.danger,borderRadius:10}}/></div>
                      <span style={{fontSize:11,fontWeight:700,color:pct>=85?V.success:pct>=70?V.warn:V.danger,minWidth:32}}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{padding:'10px 12px'}}><Chip bg={bg} color={color}>{pct>=85?'On Track':pct>=70?'Lagging':'Critical'}</Chip></td>
                </tr>;
              })}
              <tr style={{background:'#f8fafc',borderTop:`2px solid ${V.border}`}}>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:800}}>TOTAL</td>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:700}}>1,207</td>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:700}}>{fmt(totalExpected)}</td>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:800,color:V.success}}>{fmt(totalCollected)}</td>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:800,color:V.danger}}>{fmt(totalArrears)}</td>
                <td colSpan={2} style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:V.acc}}>{collectionPct}% overall</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─── ARREARS ─── */
  const PageArrears=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Arrears & Defaulters</div><div style={{fontSize:12,color:V.muted}}>Students with outstanding fees · Term 1, 2026</div></div>
        <div style={{display:'flex',gap:8}}>
          <Btn onClick={()=>toast('Arrears report exported','info')}>📤 Export Report</Btn>
          <Btn variant="pr" onClick={()=>setModal('sendReminder')}>📱 Send Bulk Reminders</Btn>
        </div>
      </div>
      <div style={{background:V.dangerSoft,border:'1px solid rgba(239,68,68,.2)',borderRadius:10,padding:'12px 18px',marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:V.danger,marginBottom:4}}>⚠️ Fee Collection Policy</div>
        <div style={{fontSize:11,color:'#b91c1c',lineHeight:1.7}}>Students with arrears above UGX 500,000 or 60+ days overdue should be flagged to the Head Teacher. Students with outstanding fees must not be allowed to sit term exams per Board policy.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="red" icon="⚠️" val={String(DEFAULTERS.length)} label="60+ Days Overdue"/>
        <StatCard col="amber" icon="💰" val={fmt(DEFAULTERS.reduce((a,d)=>a+d.balance,0))} label="Total Arrears (Defaulters)"/>
        <StatCard col="orange" icon="📱" val="0" label="Reminders Sent Today"/>
        <StatCard col="blue" icon="🔒" val="2" label="Exam Access Blocked"/>
      </div>
      <Card>
        <CardHead title="📋 Defaulters List — 60+ Days Outstanding" action={<Btn size="sm" onClick={()=>toast('List exported to Excel','info')}>📤 Export XLS</Btn>}/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['#','Student','Class','Balance','Days Overdue','Last Payment','Parent Contact','Action'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {DEFAULTERS.map((d,i)=>{
                const urgent=d.days>=75;
                return <tr key={d.name} style={{borderBottom:`1px solid ${V.border}`,background:urgent?'#fff9f9':'transparent'}}>
                  <td style={{padding:'10px 12px',fontSize:12,color:V.muted}}>{i+1}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700}}>{d.name}</td>
                  <td style={{padding:'10px 12px'}}><span style={{background:V.blueSoft,color:V.blue,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20}}>{d.cls}</span></td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:800,color:V.danger}}>{fmtFull(d.balance)}</td>
                  <td style={{padding:'10px 12px'}}><Chip bg={urgent?V.dangerSoft:V.warnSoft} color={urgent?V.danger:'#b45309'}>{d.days} days</Chip></td>
                  <td style={{padding:'10px 12px',fontSize:11,color:V.muted}}>{d.lastPaid}</td>
                  <td style={{padding:'10px 12px',fontSize:11,color:V.muted}}>{d.parent}</td>
                  <td style={{padding:'10px 12px'}}>
                    <div style={{display:'flex',gap:4}}>
                      <Btn size="sm" variant="wa" onClick={()=>toast(`Reminder sent to ${d.name}'s parent via SMS`,'warning')}>📱 SMS</Btn>
                      <Btn size="sm" variant="pr" onClick={()=>setModal('receivePayment')}>💳 Pay</Btn>
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

  /* ─── EXPENSES ─── */
  const PageExpenses=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Expenses</div><div style={{fontSize:12,color:V.muted}}>Track and approve all school expenditure</div></div>
        <Btn variant="pr" onClick={()=>setModal('recordExpense')}>🧾 Record Expense</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="teal" icon="💸" val={fmt(EXPENSES.reduce((a,e)=>a+e.amount,0))} label="Total Expenses (Term 1)"/>
        <StatCard col="green" icon="✅" val={String(EXPENSES.filter(e=>e.approved).length)} label="Approved"/>
        <StatCard col="amber" icon="⏳" val={String(EXPENSES.filter(e=>!e.approved).length)} label="Pending Approval"/>
        <StatCard col="blue" icon="📋" val={String(EXPENSES.length)} label="Total Records"/>
      </div>
      <Card>
        <CardHead title="🧾 Expense Register — Term 1" action={<Btn size="sm" onClick={()=>toast('Export generated','info')}>📤 Export</Btn>}/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Date','Req No.','Category','Description','Amount','Status',''].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {EXPENSES.map((e,i)=>{
                const catColor:{[k:string]:[string,string]}={'Salaries':[V.accSoft,V.accDark],'Catering':[V.orangeSoft,V.orange],'Maintenance':[V.warnSoft,'#b45309'],'Supplies':[V.blueSoft,V.blue],'Utilities':[V.purpleSoft,V.purple],'Transport':[V.successSoft,V.success]};
                const [bg2,c2]=catColor[e.category]??[V.accSoft,V.accDark];
                return <tr key={i} style={{borderBottom:`1px solid ${V.border}`}}>
                  <td style={{padding:'10px 12px',fontSize:12,color:V.muted}}>{e.date}</td>
                  <td style={{padding:'10px 12px',fontSize:11,color:V.muted}}>{e.requisitionNo}</td>
                  <td style={{padding:'10px 12px'}}><span style={{display:'inline-flex',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:bg2,color:c2}}>{e.category}</span></td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{e.desc}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:V.text}}>{fmt(e.amount)}</td>
                  <td style={{padding:'10px 12px'}}><Chip bg={e.approved?V.successSoft:V.warnSoft} color={e.approved?V.success:'#b45309'}>{e.approved?'Approved':'Pending'}</Chip></td>
                  <td style={{padding:'10px 12px'}}>{!e.approved&&<Btn size="sm" variant="pr" onClick={()=>toast('Expense approved ✓','success')}>✓ Approve</Btn>}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─── INVOICES ─── */
  const PageInvoices=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Supplier Invoices</div><div style={{fontSize:12,color:V.muted}}>Manage incoming supplier bills and payments</div></div>
        <Btn variant="pr" onClick={()=>setModal('addInvoice')}>📦 Add Invoice</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="amber" icon="⏳" val={String(INVOICES.filter(i=>i.status==='Pending').length)} label="Pending Payment"/>
        <StatCard col="red" icon="🚨" val={String(INVOICES.filter(i=>i.status==='Overdue').length)} label="Overdue"/>
        <StatCard col="green" icon="✅" val={String(INVOICES.filter(i=>i.status==='Paid').length)} label="Paid"/>
        <StatCard col="teal" icon="💸" val={fmt(INVOICES.filter(i=>i.status!=='Paid').reduce((a,inv)=>a+inv.amount,0))} label="Total Outstanding"/>
      </div>
      <Card>
        <CardHead title="📦 Invoice Register"/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Supplier','Items','Amount','Due Date','Status',''].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {INVOICES.map((inv,i)=>{
                const paid=inv.status==='Paid';const overdue=inv.status==='Overdue';
                return <tr key={i} style={{borderBottom:`1px solid ${V.border}`,background:overdue?'#fff9f9':paid?'#f9fffe':'transparent'}}>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{inv.supplier}</td>
                  <td style={{padding:'10px 12px',fontSize:11,color:V.muted}}>{inv.items}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:paid?V.success:overdue?V.danger:V.text}}>{fmt(inv.amount)}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:overdue?V.danger:V.muted}}>{inv.due}</td>
                  <td style={{padding:'10px 12px'}}><Chip bg={paid?V.successSoft:overdue?V.dangerSoft:V.warnSoft} color={paid?V.success:overdue?V.danger:'#b45309'}>{inv.status}</Chip></td>
                  <td style={{padding:'10px 12px'}}>
                    {!paid&&<Btn size="sm" variant={overdue?'ro':'pr'} onClick={()=>toast(`Payment for ${inv.supplier} initiated`,'success')}>💳 Pay</Btn>}
                    {paid&&<span style={{fontSize:11,color:V.success,fontWeight:600}}>✓ Settled</span>}
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─── PAYROLL ─── */
  const grossTotal=STAFF_PAYROLL.reduce((a,s)=>a+s.gross,0);
  const netTotal=STAFF_PAYROLL.reduce((a,s)=>a+s.net,0);
  const PagePayroll=()=>(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div><div style={{fontSize:17,fontWeight:700}}>Payroll</div><div style={{fontSize:12,color:V.muted}}>Manage salary disbursements and PAYE</div></div>
        <div style={{display:'flex',gap:8}}>
          <Btn onClick={()=>toast('Payroll report generated','info')}>📊 Payroll Report</Btn>
          <Btn variant="pr" onClick={()=>setModal('payrollModal')}>💸 Process Payroll</Btn>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18}}>
        <StatCard col="teal" icon="👥" val={String(STAFF_PAYROLL.length)} label="Staff on Payroll"/>
        <StatCard col="green" icon="💰" val={fmt(grossTotal)} label="Gross Payroll (Feb)"/>
        <StatCard col="blue" icon="📊" val={fmt(grossTotal-netTotal)} label="Total PAYE (Feb)"/>
        <StatCard col="amber" icon="⏳" val="2" label="Payments Pending"/>
      </div>
      <Card>
        <CardHead title="👥 February 2026 Payroll" action={<Btn size="sm" onClick={()=>toast('PAYE schedule exported','info')}>📤 URA Export</Btn>}/>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Staff Member','Role','Gross Pay','PAYE (Tax)','Net Pay','Status',''].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {STAFF_PAYROLL.map((s,i)=>{
                const paid=s.status==='Paid';
                return <tr key={i} style={{borderBottom:`1px solid ${V.border}`}}>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{s.name}</td>
                  <td style={{padding:'10px 12px',fontSize:11,color:V.muted}}>{s.role}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700}}>{fmtFull(s.gross)}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:V.danger}}>{fmtFull(s.tax)}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:800,color:V.success}}>{fmtFull(s.net)}</td>
                  <td style={{padding:'10px 12px'}}><Chip bg={paid?V.successSoft:V.warnSoft} color={paid?V.success:'#b45309'}>{s.status}</Chip></td>
                  <td style={{padding:'10px 12px'}}>{!paid&&<Btn size="sm" variant="pr" onClick={()=>toast(`${s.name} — payment processed ✓`,'success')}>💸 Pay</Btn>}</td>
                </tr>;
              })}
              <tr style={{background:'#f8fafc',borderTop:`2px solid ${V.border}`}}>
                <td colSpan={2} style={{padding:'10px 12px',fontSize:12,fontWeight:700}}>TOTAL</td>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:800}}>{fmtFull(grossTotal)}</td>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:V.danger}}>{fmtFull(grossTotal-netTotal)}</td>
                <td style={{padding:'10px 12px',fontSize:12,fontWeight:800,color:V.success}}>{fmtFull(netTotal)}</td>
                <td colSpan={2}/>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─── REPORTS ─── */
  const PageReports=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:4}}>Financial Reports</div>
      <div style={{fontSize:12,color:V.muted,marginBottom:18}}>Generate and export financial summaries for governance and audit</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:18}}>
        {[['📊','Fee Collection Summary','Term 1 detailed by class and student','teal'],['💸','Expense Report','All expenditure with categories','amber'],['👥','Payroll Register','Monthly payroll & PAYE schedule','blue'],['📦','Supplier/Creditors Report','Outstanding invoices & payment history','orange'],['📈','Income vs Expenditure','P&L statement — Term 1','green'],['🏛️','Board Financial Report','Executive summary for Board meeting','purple']].map(([icon,title,sub,col])=>{
          const b:{[k:string]:string}={teal:V.acc,amber:V.warn,blue:V.blue,orange:V.orange,green:V.success,purple:V.purple};
          const bg:{[k:string]:string}={teal:V.accSoft,amber:V.warnSoft,blue:V.blueSoft,orange:V.orangeSoft,green:V.successSoft,purple:V.purpleSoft};
          return <div key={String(title)} style={{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:18,boxShadow:'0 1px 3px rgba(0,0,0,.06)',cursor:'pointer',transition:'all .2s'}} onClick={()=>toast(`Generating ${title}...`,'info')}>
            <div style={{width:40,height:40,borderRadius:10,background:bg[String(col)]??V.accSoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:12}}>{icon}</div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{title}</div>
            <div style={{fontSize:11,color:V.muted,marginBottom:12}}>{sub}</div>
            <div style={{display:'flex',gap:5}}>
              <Btn size="sm" variant="pr" onClick={e=>{e.stopPropagation();toast(`Exporting ${title} to PDF...`,'success');}}>📄 PDF</Btn>
              <Btn size="sm" onClick={e=>{e.stopPropagation();toast(`Exporting ${title} to Excel...`,'info');}}>📊 Excel</Btn>
            </div>
          </div>;
        })}
      </div>
    </div>
  );

  /* ─── COMMUNICATIONS ─── */
  const PageCommunications=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Communications</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <CardHead title="📬 Inbox"/>
          {[{init:'HT',bg:'#1e293b',from:'Head Teacher',title:'Term 1 Budget Review — meeting Thu 12 Mar',sub:'3 hrs ago'},
            {init:'PR',bg:'linear-gradient(135deg,#ef4444,#f97316)',from:'Parent (Nakibuule)',title:'Fee payment plan request — Sarah S5A',sub:'5 hrs ago · Unread'},
            {init:'BOD',bg:V.acc,from:'School Board',title:'Q1 Financial Report requested by 15 Mar',sub:'Yesterday'},
            {init:'URA',bg:'linear-gradient(135deg,#1e293b,#374151)',from:'URA',title:'PAYE March deadline reminder',sub:'2 days ago'},
          ].map(m=>(
            <div key={m.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 6px',background:m.sub.includes('Unread')?V.accSoft:'transparent',borderRadius:8,marginBottom:5,cursor:'pointer'}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{m.init}</div>
              <div><div style={{fontSize:12,fontWeight:600}}>{m.title}</div><div style={{fontSize:10,color:V.muted,marginTop:1}}>{m.from} · {m.sub}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHead title="✉️ Compose"/>
          <FG label="To"><FS><option>Head Teacher</option><option>Deputy HM</option><option>Parent / Guardian (re: fees)</option><option>School Board</option><option>Supplier</option><option>URA</option></FS></FG>
          <FG label="Subject"><FI placeholder="Subject..."/></FG>
          <FG label="Message"><FTA placeholder="Your message..."/></FG>
          <Btn variant="pr" onClick={()=>toast('Message sent ✓','success')}>📤 Send</Btn>
        </Card>
      </div>
    </div>
  );

  /* ─── PORTALS ─── */
  const PagePortals=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Portal Quick Access</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {[['🏫','#059669',V.successSoft,'Head Teacher','/ht/dashboard'],['📋','#0ea5e9','#f0f9ff','Deputy HM','/deputy-hm'],['📝','#7c3aed',V.purpleSoft,'Exam Officer','/exam-officer'],['👩‍🏫','#2563eb',V.blueSoft,'Teacher Portal','/teacher'],['🎒',V.purple,V.purpleSoft,'Student Portal','/student'],['👨‍👩‍👧',V.orange,V.orangeSoft,'Parent Portal','/parent']].map(([icon,border,bg,title,path])=>(
          <div key={String(title)} onClick={()=>navigate(String(path))} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:V.card,border:`1px solid ${V.border}`,borderRadius:10,cursor:'pointer',borderLeft:`4px solid ${border}`,boxShadow:'0 1px 3px rgba(0,0,0,.06)',transition:'all .2s'}}>
            <div style={{width:36,height:36,borderRadius:9,background:String(bg),display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{icon}</div>
            <div style={{fontSize:12,fontWeight:700}}>{title}</div>
            <span style={{marginLeft:'auto',color:V.light}}>↗</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─── SETTINGS ─── */
  const PageSettings=()=>(
    <div>
      <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>Settings</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Profile</div>
          <FG label="Full Name"><FI value="Mr. Kato Emmanuel"/></FG>
          <FG label="Role"><FI value="Bursar / Finance Officer"/></FG>
          <FG label="Email"><FI value="e.kato@smissi.ac.ug" type="email"/></FG>
          <FG label="Phone"><FI value="+256 772 000 200"/></FG>
          <Btn variant="pr" onClick={()=>toast('Profile updated ✓','success')}>Save Changes</Btn>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Finance Settings</div>
          <FG label="Default currency"><FS><option>UGX (Ugandan Shilling)</option><option>USD</option></FS></FG>
          <FG label="Fee reminder frequency"><FS><option>Weekly</option><option>Every 2 weeks</option><option>Monthly</option></FS></FG>
          <FG label="Overdue threshold (days)"><FI value="60" type="number"/></FG>
          <FG label="Auto-block exams at arrears"><FS><option>UGX 500,000</option><option>UGX 1,000,000</option><option>Any arrears</option><option>Disabled</option></FS></FG>
          <Btn variant="pr" onClick={()=>toast('Settings saved ✓','success')}>Save</Btn>
        </Card>
      </div>
    </div>
  );

  /* ═══════════ RENDER ═══════════ */
  return (
    <div style={{minHeight:'100vh',background:V.bg,display:'flex',fontFamily:"'DM Sans',sans-serif",fontSize:14}}>
      <Sidebar/>
      <div style={{marginLeft:256,flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <Topbar/>
        <div style={{padding:20,flex:1}}>
          {page==='dashboard'&&<PageDashboard/>}
          {page==='fees'&&<PageFees/>}
          {page==='arrears'&&<PageArrears/>}
          {page==='expenses'&&<PageExpenses/>}
          {page==='payroll'&&<PagePayroll/>}
          {page==='invoices'&&<PageInvoices/>}
          {page==='reports'&&<PageReports/>}
          {page==='communications'&&<PageCommunications/>}
          {page==='portals'&&<PagePortals/>}
          {page==='settings'&&<PageSettings/>}
        </div>
      </div>

      {/* ── MODALS ── */}
      <Modal open={modal==='receivePayment'} onClose={()=>setModal(null)} title="💳 Receive Fee Payment">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Student Name"><FI placeholder="Full name or Student ID..."/></FG>
          <FG label="Class"><FI placeholder="e.g. S4A"/></FG>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Amount (UGX)"><FI type="number" placeholder="e.g. 300000"/></FG>
          <FG label="Payment Method"><FS><option>Cash</option><option>MTN MoMo</option><option>Airtel Money</option><option>Bank Transfer (Stanbic)</option><option>Bank Transfer (Equity)</option><option>Cheque</option></FS></FG>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Date"><FI type="date" value="2026-03-07"/></FG>
          <FG label="Reference / MoMo Ref"><FI placeholder="Transaction reference..."/></FG>
        </div>
        <FG label="Term"><FS><option>Term 1, 2026</option><option>Term 2, 2026</option><option>Term 3, 2025</option></FS></FG>
        <FG label="Payment for"><FS><option>School fees (full)</option><option>School fees (partial payment)</option><option>Boarding fees</option><option>Exam/UNEB fees</option><option>Other</option></FS></FG>
        <FG label="Notes"><FTA placeholder="Any additional notes about this payment..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Payment received & receipt generated ✓','success');}}>💾 Record & Print Receipt</Btn></div>
      </Modal>

      <Modal open={modal==='recordExpense'} onClose={()=>setModal(null)} title="🧾 Record Expense">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Date"><FI type="date" value="2026-03-07"/></FG>
          <FG label="Category"><FS><option>Salaries</option><option>Catering / Food</option><option>Maintenance</option><option>Supplies</option><option>Utilities</option><option>Transport</option><option>Medical</option><option>Other</option></FS></FG>
        </div>
        <FG label="Description"><FI placeholder="e.g. Science lab chemicals restock..."/></FG>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Amount (UGX)"><FI type="number" placeholder="Amount in UGX"/></FG>
          <FG label="Requisition No."><FI placeholder="REQ-2026-xxx"/></FG>
        </div>
        <FG label="Approved By"><FS><option>Head Teacher</option><option>School Board</option><option>Self (petty cash)</option></FS></FG>
        <FG label="Supplier / Vendor"><FI placeholder="Supplier name..."/></FG>
        <FG label="Notes"><FTA placeholder="Additional details..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Expense recorded ✓','success');}}>Save</Btn></div>
      </Modal>

      <Modal open={modal==='addInvoice'} onClose={()=>setModal(null)} title="📦 Add Supplier Invoice">
        <FG label="Supplier Name"><FI placeholder="Supplier / vendor name..."/></FG>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Invoice Amount (UGX)"><FI type="number" placeholder="Amount..."/></FG>
          <FG label="Invoice Date"><FI type="date"/></FG>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <FG label="Due Date"><FI type="date"/></FG>
          <FG label="Category"><FS><option>Supplies</option><option>Maintenance</option><option>Catering</option><option>Services</option><option>Other</option></FS></FG>
        </div>
        <FG label="Items Description"><FTA placeholder="Describe what was supplied or serviced..."/></FG>
        <FG label="Payment Terms"><FS><option>Net 7 days</option><option>Net 14 days</option><option>Net 30 days</option><option>On delivery</option></FS></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Invoice recorded ✓','success');}}>Save Invoice</Btn></div>
      </Modal>

      <Modal open={modal==='sendReminder'} onClose={()=>setModal(null)} title="📱 Send Fee Reminders">
        <div style={{background:V.warnSoft,border:'1px solid rgba(245,158,11,.25)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:11,color:'#92400e',fontWeight:600}}>⚠️ Reminders will be sent via SMS to parent/guardian contacts on file.</div>
        <FG label="Send to"><FS><option>All defaulters (60+ days) — 7 students</option><option>All students with any arrears</option><option>Specific class</option><option>Individual student</option></FS></FG>
        <FG label="Message Template"><FS><option>Standard fee reminder</option><option>Urgent — exam access warning</option><option>Custom message</option></FS></FG>
        <FG label="Custom Message (optional)"><FTA placeholder="Dear Parent/Guardian, This is a reminder that your child has outstanding school fees of UGX XXX for Term 1, 2026. Please contact the school bursar at your earliest convenience. Thank you."/></FG>
        <div style={{background:'#f8fafc',borderRadius:8,padding:12,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Will be sent to:</div>
          {DEFAULTERS.slice(0,4).map(d=>(
            <div key={d.name} style={{fontSize:11,color:V.muted,marginBottom:3}}>• {d.name} ({d.cls}) — {fmtFull(d.balance)} — {d.parent}</div>
          ))}
          <div style={{fontSize:11,color:V.muted}}>... and {DEFAULTERS.length-4} more</div>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast(`${DEFAULTERS.length} SMS reminders sent ✓`,'success');}}>📱 Send Reminders</Btn></div>
      </Modal>

      <Modal open={modal==='payrollModal'} onClose={()=>setModal(null)} title="💸 Process Payroll — February 2026" wide>
        <div style={{background:V.accSoft,border:`1px solid rgba(15,118,110,.2)`,borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:11,color:V.accDark,fontWeight:600}}>💰 Total Net Payroll: {fmtFull(netTotal)} · PAYE: {fmtFull(grossTotal-netTotal)} · Confirm before processing.</div>
        <div style={{overflowX:'auto',marginBottom:14}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Staff','Role','Gross','PAYE','Net','Confirm'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,fontWeight:700,color:V.muted,textTransform:'uppercase',padding:'9px 12px',background:'#f8fafc',borderBottom:`1px solid ${V.border}`}}>{h}</th>)}</tr></thead>
            <tbody>
              {STAFF_PAYROLL.map((s,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${V.border}`}}>
                  <td style={{padding:'8px 12px',fontSize:12,fontWeight:600}}>{s.name}</td>
                  <td style={{padding:'8px 12px',fontSize:11,color:V.muted}}>{s.role}</td>
                  <td style={{padding:'8px 12px',fontSize:12}}>{fmtFull(s.gross)}</td>
                  <td style={{padding:'8px 12px',fontSize:12,color:V.danger}}>{fmtFull(s.tax)}</td>
                  <td style={{padding:'8px 12px',fontSize:12,fontWeight:700,color:V.success}}>{fmtFull(s.net)}</td>
                  <td style={{padding:'8px 12px'}}><input type="checkbox" defaultChecked={s.status==='Paid'} style={{accentColor:V.acc}}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <FG label="Payment Method"><FS><option>Bank transfer (Stanbic — school acc.)</option><option>MTN MoMo</option><option>Cash (petty cash)</option></FS></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Payroll processed — all payments initiated ✓','success');}}>💸 Process & Disburse</Btn></div>
      </Modal>

      <Modal open={modal==='msgModal'} onClose={()=>setModal(null)} title="✉️ Send Message">
        <FG label="To"><FS><option>Head Teacher</option><option>Parent / Guardian</option><option>School Board</option><option>Supplier</option></FS></FG>
        <FG label="Subject"><FI placeholder="Subject..."/></FG>
        <FG label="Message"><FTA placeholder="Your message..."/></FG>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant="pr" onClick={()=>{setModal(null);toast('Message sent ✓','success');}}>📤 Send</Btn></div>
      </Modal>

      {/* Toasts */}
      <div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:7}}>
        {toasts.map(t=>(
          <div key={t.id} style={{background:t.type==='success'?'#064e3b':t.type==='warning'?'#78350f':t.type==='info'?'#164e63':t.type==='danger'?'#7f1d1d':'#1e293b',color:'#fff',padding:'10px 16px',borderRadius:9,fontSize:12,fontWeight:500,display:'flex',alignItems:'center',gap:7,boxShadow:'0 8px 24px rgba(0,0,0,.2)',borderLeft:`3px solid ${t.type==='success'?V.success:t.type==='warning'?V.warn:t.type==='info'?V.blue:t.type==='danger'?V.danger:V.muted}`,maxWidth:320,animation:'sIn .25s ease'}}>
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
