import { useToast }     from '../../contexts/ToastContext';
import { PageHeader }   from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }          from '../../components/ui/Btn';
import { Badge }        from '../../components/ui/Badge';
import { DataTable }    from '../../components/ui/DataTable';

export default function Cultural() {
  const { toast } = useToast();
  return (
    <div>
      <PageHeader title="Cultural & Arts Events" subtitle="Drama · Choir · Cultural Dance · Talent · End-of-Term Concert"
        actions={[{ label:'🎭 Add Event', variant:'primary', onClick:()=>toast('Event form opened','info') }]}
      />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:18 }}>
        {[['🎭','#7c3aed','Drama Club','28 members · Patron: Mr. Kato','National Festival · 19 Mar'],
          ['🎵','#16a34a','School Choir','50 members · Patron: Ms. Grace','🥈 2nd — Music Festival'],
          ['💃','#f97316','Cultural Dance Troupe','36 members · Patron: Ms. Nambi','Concert · Fri 27 Mar'],
        ].map(([icon,col,name,sub,ev]) => (
          <div key={String(name)} style={{ background:'#fff', borderRadius:12, border:`1px solid #e2e8f0`, borderTop:`3px solid ${col}`, padding:18, textAlign:'center', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize:28, marginBottom:4 }}>{icon}</div>
            <div style={{ fontSize:13, fontWeight:700 }}>{name}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>{sub}</div>
            <div style={{ fontSize:16, fontWeight:700, color:String(col), margin:'8px 0' }}>{ev}</div>
            <Btn size="sm" onClick={()=>toast(`${name} details opened`,'info')}>View Details</Btn>
          </div>
        ))}
      </div>

      {/* Concert programme table */}
      <Card style={{ marginBottom:16 }}>
        <CardHeader title="🎤 End-of-Term Concert — Fri 27 March 2026"
          action={<div style={{display:'flex',gap:8}}><Btn size="sm" onClick={()=>toast('Programme exported','info')}>📄 Programme</Btn><Btn size="sm" variant="primary" onClick={()=>toast('Submitted to HT ✓','success')}>📤 Submit to HT</Btn></div>}
        />
        <DataTable
          rows={[
            { n:1,  act:'Opening — National Anthem',  grp:'All students',  dur:'3 min',  st:'green', lbl:'Confirmed'          },
            { n:2,  act:'Welcome address',             grp:'Head Prefects', dur:'5 min',  st:'green', lbl:'Confirmed'          },
            { n:3,  act:'Choir: "Tukutendereza"',      grp:'School Choir',  dur:'8 min',  st:'green', lbl:'Ready ✓'            },
            { n:4,  act:'Cultural Dance',              grp:'Dance Troupe',  dur:'10 min', st:'green', lbl:'Rehearsing ✓'       },
            { n:5,  act:'Drama excerpt',               grp:'Drama Club',    dur:'15 min', st:'amber', lbl:'Costume pending'    },
            { n:6,  act:'Talent Show',                 grp:'Open',          dur:'20 min', st:'amber', lbl:'Auditions Fri 13'   },
            { n:7,  act:'SU Praise',                   grp:'SU Group',      dur:'10 min', st:'green', lbl:'Confirmed'          },
            { n:8,  act:'Awards — ECA Achievers',      grp:'ECA Coord.',    dur:'12 min', st:'blue',  lbl:'Awards TBC'         },
            { n:9,  act:'HT Closing Remarks',          grp:'Head Teacher',  dur:'8 min',  st:'green', lbl:'Confirmed'          },
          ]}
          keyFn={r=>r.n}
          columns={[
            { key:'n',   header:'#',       render:r=><span style={{color:'#94a3b8',fontSize:11}}>{r.n}</span>, width:'30px' },
            { key:'act', header:'Act',     render:r=><span style={{fontWeight:600}}>{r.act}</span> },
            { key:'grp', header:'Group',   render:r=><span style={{color:'#64748b',fontSize:11}}>{r.grp}</span> },
            { key:'dur', header:'Duration',render:r=><span style={{color:'#64748b',fontSize:11}}>{r.dur}</span> },
            { key:'lbl', header:'Status',  render:r=><Badge color={r.st as 'green'|'amber'|'blue'}>{r.lbl}</Badge> },
          ]}
        />
      </Card>
    </div>
  );
}
