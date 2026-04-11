import { useState }   from 'react';
import { useToast }   from '../../contexts/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const ACTIVITIES = [
  { name:'Football (Boys)',       icon:'⚽', cat:'sports',     members:45, patron:'Mr. Kakooza',   day:'Sat 8:00 AM',  venue:'School Pitch',  active:true  },
  { name:'Netball (Girls)',       icon:'🏐', cat:'sports',     members:38, patron:'Ms. Nambi',     day:'Tue 4:00 PM',  venue:'Court',         active:true  },
  { name:'Athletics',             icon:'🏃', cat:'sports',     members:32, patron:'Mr. Kakooza',   day:'Thu 4:30 PM',  venue:'Track',         active:true  },
  { name:'Swimming',              icon:'🏊', cat:'sports',     members:22, patron:'Mr. Lubwama',   day:'Sat 7:00 AM',  venue:'Pool',          active:true  },
  { name:'Debate Club',           icon:'🗣️', cat:'club',       members:25, patron:'Ms. Nakato',    day:'Mon 4:00 PM',  venue:'Boardroom',     active:true  },
  { name:'Science Club',          icon:'🔬', cat:'club',       members:32, patron:'Mr. Ssemwanga', day:'Mon 4:30 PM',  venue:'Lab 2',         active:false },
  { name:'Computer Club',         icon:'💻', cat:'club',       members:30, patron:'Ms. Nakabugo',  day:'Tue 4:00 PM',  venue:'Computer Lab',  active:true  },
  { name:'Photography Club',      icon:'📸', cat:'club',       members:20, patron:'Mrs. Atim',     day:'Tue 4:30 PM',  venue:'Room 6',        active:false },
  { name:'School Choir',          icon:'🎵', cat:'arts',       members:50, patron:'Ms. Grace',     day:'Sat 10:00 AM', venue:'Music Room',    active:true  },
  { name:'Drama Club',            icon:'🎭', cat:'arts',       members:28, patron:'Mr. Kato',      day:'Sat 2:00 PM',  venue:'School Hall',   active:true  },
  { name:'Cultural Dance Troupe', icon:'💃', cat:'arts',       members:36, patron:'Ms. Nambi',     day:'Wed 3:00 PM',  venue:'School Hall',   active:true  },
  { name:'Scripture Union',       icon:'✝️', cat:'faith',      members:45, patron:'Chaplain',      day:'Thu 4:00 PM',  venue:'Chapel',        active:true  },
  { name:'Muslim Students Assoc.',icon:'☪️', cat:'faith',      members:31, patron:'Sheikh Lubega', day:'Fri 4:00 PM',  venue:'Room 3',        active:true  },
  { name:'Student Guild Council', icon:'🏛️', cat:'leadership', members:12, patron:'ECA Coord.',   day:'Wed 5:00 PM',  venue:'Boardroom',     active:true  },
  { name:'Prefects Council',      icon:'⭐', cat:'leadership', members:20, patron:'DHM',           day:'Mon 5:00 PM',  venue:'DHM Office',    active:true  },
  { name:'Community Service',     icon:'🤝', cat:'community',  members:40, patron:'Mr. Opolot',    day:'Sat 2:00 PM',  venue:'Community',     active:true  },
];

const catColors: Record<string,[string,string]> = {
  sports:     ['#fff7ed','#c2410c'],
  club:       ['#eff6ff','#1d4ed8'],
  arts:       ['#f5f3ff','#5b21b6'],
  faith:      ['#fef3c7','#92400e'],
  leadership: ['#fff1f2','#be123c'],
  community:  ['#f0fdfa','#0f766e'],
};

export default function Registry() {
  const { toast }     = useToast();
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? ACTIVITIES : ACTIVITIES.filter(a => a.cat === filter);

  return (
    <div>
      <PageHeader title="Activities Registry" subtitle={`${ACTIVITIES.length} activities · ${ACTIVITIES.reduce((a,act)=>a+act.members,0)} students enrolled`}
        actions={[
          { label:'📄 Export', onClick:()=>toast('Registry exported','info') },
          { label:'➕ Add Activity', variant:'primary', onClick:()=>toast('Activity form opened','info') },
        ]}
      >
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ padding:'6px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, background:'#f8fafc' }}>
          <option value="all">All</option>
          <option value="sports">Sports</option>
          <option value="club">Clubs</option>
          <option value="arts">Arts</option>
          <option value="faith">Faith</option>
          <option value="leadership">Leadership</option>
        </select>
      </PageHeader>

      {list.map(a => {
        const [bg, color] = catColors[a.cat] ?? ['#f8fafc','#1e293b'];
        return (
          <div key={a.name} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:14, marginBottom:10, boxShadow:'0 1px 3px rgba(0,0,0,.06)', display:'flex', alignItems:'center', gap:14, transition:'all .2s' }}>
            <div style={{ width:42, height:42, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>{a.name}</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Patron: {a.patron} · {a.day} · {a.venue}</div>
            </div>
            <Badge color={color === '#5b21b6' ? 'purple' : color === '#1d4ed8' ? 'blue' : color === '#c2410c' ? 'orange' : color === '#92400e' ? 'amber' : color === '#be123c' ? 'rose' : 'teal'}>{a.cat}</Badge>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:16, fontWeight:800, color:'#16a34a' }}>{a.members}</div>
              <div style={{ fontSize:10, color:'#64748b' }}>students</div>
            </div>
            <Badge color={a.active ? 'green' : 'amber'}>{a.active ? 'Active' : 'Report due'}</Badge>
            <Btn size="sm" onClick={()=>toast(`${a.name} edited`,'info')}>Edit</Btn>
          </div>
        );
      })}
    </div>
  );
}
