import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

const TERMS = [
  { term: 'Term 1 2026', start: 'Jan 13', end: 'Apr 04', weeks: 12, status: 'current' as const },
  { term: 'Term 2 2026', start: 'May 11', end: 'Aug 07', weeks: 13, status: 'upcoming' as const },
  { term: 'Term 3 2026', start: 'Sep 07', end: 'Nov 20', weeks: 11, status: 'upcoming' as const },
];

const CLASSES = [
  { name: 'S.1W', stream: 'West',  students: 52, form: 'S.1', tutor: 'Ms. Nakakande Mary'    },
  { name: 'S.1E', stream: 'East',  students: 50, form: 'S.1', tutor: 'Mr. Ssali Brian'        },
  { name: 'S.2W', stream: 'West',  students: 48, form: 'S.2', tutor: 'Ms. Achieng Prossy'     },
  { name: 'S.2E', stream: 'East',  students: 51, form: 'S.2', tutor: 'Mrs. Atim Norah'        },
  { name: 'S.3A', stream: 'Arts',  students: 46, form: 'S.3', tutor: 'Mr. Byamugisha Kenneth' },
  { name: 'S.3S', stream: 'Sci',   students: 45, form: 'S.3', tutor: 'Mrs. Namukasa Joyce'    },
  { name: 'S.4A', stream: 'Arts',  students: 44, form: 'S.4', tutor: 'Mr. Kato Emmanuel'      },
  { name: 'S.4S', stream: 'Sci',   students: 47, form: 'S.4', tutor: 'Mr. Ssemanda Julius'    },
];

const SUBJECTS = [
  { name: 'Mathematics',         dept: 'Science & Math',     hod: 'Mrs. Atim Norah',    teachers: 4, classes: 8 },
  { name: 'English Language',    dept: 'Languages',           hod: 'Ms. Nakagolo Patricia',teachers: 3, classes: 8 },
  { name: 'Biology',             dept: 'Science & Math',     hod: 'Mrs. Atim Norah',    teachers: 2, classes: 4 },
  { name: 'Chemistry',           dept: 'Science & Math',     hod: 'Mrs. Atim Norah',    teachers: 2, classes: 4 },
  { name: 'Physics',             dept: 'Science & Math',     hod: 'Mrs. Atim Norah',    teachers: 2, classes: 4 },
  { name: 'History',             dept: 'Humanities',          hod: 'Ms. Achieng Prossy', teachers: 2, classes: 4 },
  { name: 'Geography',           dept: 'Humanities',          hod: 'Ms. Achieng Prossy', teachers: 2, classes: 4 },
  { name: 'Religious Education', dept: 'Humanities',          hod: 'Ms. Achieng Prossy', teachers: 1, classes: 8 },
  { name: 'Commerce',            dept: 'Business Studies',    hod: 'Mr. Kato Emmanuel',  teachers: 2, classes: 4 },
  { name: 'Economics',           dept: 'Business Studies',    hod: 'Mr. Kato Emmanuel',  teachers: 2, classes: 4 },
];

export default function AdminAcademic() {
  const [tab, setTab] = useState<'terms'|'classes'|'subjects'>('terms');

  return (
    <div>
      <PageHeader
        title="Academic Configuration"
        subtitle="Manage terms, classes, subjects and streams"
        actions={[{ label: '+ Add', onClick: () => {}, variant: 'primary' }]}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: '#f8fafc', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {(['terms','classes','subjects'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 18px', borderRadius: 6, border: 'none', fontFamily: 'inherit',
            background: tab === t ? '#6366f1' : 'transparent',
            color: tab === t ? '#fff' : '#64748b',
            fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {/* Terms */}
      {tab === 'terms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TERMS.map(t => (
            <Card key={t.term}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>{t.term}</span>
                    <Badge variant={t.status === 'current' ? 'success' : 'secondary'} size="sm">
                      {t.status === 'current' ? '🟢 Current' : '📅 Upcoming'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {t.start} — {t.end} · {t.weeks} weeks
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,80px)', gap: 10 }}>
                  {[['Start', t.start],['End', t.end],['Weeks', t.weeks]].map(([l,v]) => (
                    <div key={l as string} style={{ textAlign: 'center', padding: '8px', background: '#f8fafc', borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>{v}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <Btn variant="ghost" size="sm" onClick={() => {}}>Edit</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Classes */}
      {tab === 'classes' && (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Class','Form','Stream','Students','Form Tutor','Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASSES.map(c => (
                <tr key={c.name} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 800, color: '#1e293b' }}>{c.name}</td>
                  <td style={{ padding: '10px 10px', color: '#64748b' }}>{c.form}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <Badge variant="blue" size="sm">{c.stream}</Badge>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#1e293b', fontWeight: 600 }}>{c.students}</td>
                  <td style={{ padding: '10px 10px', color: '#64748b' }}>{c.tutor}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <Btn variant="ghost" size="sm" onClick={() => {}}>Edit</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Subjects */}
      {tab === 'subjects' && (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Subject','Department','HOD','Teachers','Classes'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map(s => (
                <tr key={s.name} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 700, color: '#1e293b' }}>{s.name}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <Badge variant="indigo" size="sm">{s.dept}</Badge>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#64748b' }}>{s.hod}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600, color: '#6366f1' }}>{s.teachers}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600, color: '#6366f1' }}>{s.classes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
