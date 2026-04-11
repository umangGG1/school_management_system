import { useNavigate } from 'react-router-dom';
import { StatCard }    from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AlertBanner } from '../../components/ui/AlertBanner';

const ACTIONS = [
  { dot: 'amber', text: '⚽ Football transport not arranged — District Champ Sat 14 Mar', sub: '26-player squad · Municipal Stadium · Bus needed by Wednesday', link: '/eca/sports' },
  { dot: 'red',   text: '🎭 Drama costumes budget approval needed — National Drama Thu 19 Mar', sub: 'UGX 180,000 required · Submit to Bursar by Mon 09 Mar', link: null },
  { dot: 'amber', text: '📋 Patron report overdue — Science Club (Mr. Ssemwanga)', sub: 'Term 1 activity report due last Friday · No submission', link: '/eca/patrons' },
  { dot: 'amber', text: '🏛️ Prefect election notices not yet posted — vote Wed 11 Mar', sub: 'Notices must go up today · Candidates confirmed', link: '/eca/leadership' },
  { dot: 'blue',  text: '🎤 School Concert programme needs Head Teacher approval', sub: 'Concert Fri 27 Mar · Programme drafted · Submit to HT by Tue 10 Mar', link: '/eca/cultural' },
  { dot: 'blue',  text: '📋 Debate Club — National competition registration closes Mon 09 Mar', sub: 'Team of 4 selected · Entry fee UGX 40,000 · Pay to Bursar', link: '/eca/competitions' },
];

const dotCol: Record<string, { dot: string; bg: string }> = {
  red:   { dot: '#ef4444', bg: '#fef2f2' },
  amber: { dot: '#f59e0b', bg: '#fffbeb' },
  blue:  { dot: '#3b82f6', bg: '#eff6ff' },
};

export default function ECADashboard() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg,#14532d 0%,#16a34a 55%,#f97316 100%)', borderRadius: 12, padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>ECA Office — Term 1, 2026 ⭐</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 3, marginBottom: 10 }}>SMISSI · Sat 07 Mar 2026 · Week 8 of 13</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['⚽ District Football: Sat 14 Mar', '🏆 National Drama: Thu 19 Mar', '🎤 Concert: Fri 27 Mar', '📋 Prefect elections: Wed 11 Mar'].map(c => (
              <span key={c} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {[['22','Activities'],['614','Enrolled'],['18','Patrons'],['6','Competitions']].map(([v,l]) => (
            <div key={l} style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <Btn variant="primary" onClick={() => navigate('/eca/registry')}>➕ Add Activity</Btn>
        <Btn onClick={() => navigate('/eca/sports')}>⚽ Fixtures</Btn>
        <Btn variant="orange" onClick={() => navigate('/eca/competitions')}>🏆 Competitions</Btn>
        <Btn onClick={() => navigate('/eca/cultural')}>🎭 Cultural Events</Btn>
        <Btn onClick={() => navigate('/eca/attendance')}>✅ Take Attendance</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 14 }}>
        <StatCard icon="🎯" value="22"  title="Total Activities"  accent="green"  trend="Active"     onClick={() => navigate('/eca/registry')}      />
        <StatCard icon="👥" value="614" title="Enrolled Students" accent="teal"   trend="↑ 48"  trendType="up" onClick={() => navigate('/eca/registry')} />
        <StatCard icon="⚽" value="8"   title="Sports Teams"     accent="orange" trend="8 teams"    onClick={() => navigate('/eca/sports')}        />
        <StatCard icon="🏆" value="6"   title="Competitions"      accent="purple" trend="3 upcoming" onClick={() => navigate('/eca/competitions')}   />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard icon="🎭" value="4"   title="Arts Groups"       accent="purple" onClick={() => navigate('/eca/cultural')}    />
        <StatCard icon="🏛️" value="42"  title="Student Leaders"   accent="rose"   onClick={() => navigate('/eca/leadership')}  />
        <StatCard icon="✅" value="82%" title="ECA Attendance"    accent="green"  trendType="up" trend="↑" onClick={() => navigate('/eca/attendance')} />
        <StatCard icon="👩‍🏫" value="18" title="Teacher Patrons"   accent="gold"   onClick={() => navigate('/eca/patrons')}     />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader title="⚠️ Action Required" />
          {ACTIONS.map(a => {
            const { dot, bg } = dotCol[a.dot] ?? dotCol.blue;
            return (
              <div key={a.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: dot, boxShadow: `0 0 0 3px ${bg}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{a.sub}</div>
                </div>
                {a.link && <span onClick={() => navigate(a.link!)} style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', cursor: 'pointer', padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>→</span>}
              </div>
            );
          })}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader title="📅 Upcoming Events" />
            {[['District Football Championship', 'Sat 14 Mar · Municipal Stadium', 'amber', 'Transport pending'],
              ['National Drama Festival',       'Thu 19 Mar · National Theatre',  'red',   'Budget pending'],
              ['Prefect Elections',              'Wed 11 Mar · Main Hall',         'amber', 'Notices needed'],
              ['End-of-Term Concert',            'Fri 27 Mar · School Hall',       'green', 'Planning underway'],
            ].map(([title, sub, col, chip]) => (
              <div key={String(title)} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{sub}</div>
                <Badge color={col as 'amber'|'red'|'green'}>{chip}</Badge>
              </div>
            ))}
          </Card>
          <Card>
            <CardHeader title="📊 Participation by Category" />
            <ProgressBar label="Sports"          value="228 students" pct={85} color="orange" />
            <ProgressBar label="Clubs"           value="186"         pct={70} color="blue"   />
            <ProgressBar label="Arts & Culture"  value="124"         pct={47} color="purple" />
            <ProgressBar label="Faith"           value="76"          pct={29} color="gold"   />
          </Card>
        </div>
      </div>
    </div>
  );
}
