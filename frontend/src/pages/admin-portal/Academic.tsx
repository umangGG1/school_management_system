import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { termsApi, type ApiTerm } from '../../lib/api';

const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api';
const authFetch = (path: string) =>
  fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('smissi_token')}` } })
    .then(r => r.json())
    .then((j: any) => j?.data ?? j);

const academicEndpoints = {
  classes:  () => authFetch('/academic/classes'),
  subjects: () => authFetch('/academic/subjects'),
};

/* ─── Seed fallback data ──────────────────────────────────────────── */
const SEED_TERMS: ApiTerm[] = [
  { id: 'term-1', name: 'Term 1 2026', startDate: '2026-01-13', endDate: '2026-04-04', weeks: 12, status: 'current'  },
  { id: 'term-2', name: 'Term 2 2026', startDate: '2026-05-11', endDate: '2026-08-07', weeks: 13, status: 'upcoming' },
  { id: 'term-3', name: 'Term 3 2026', startDate: '2026-09-07', endDate: '2026-11-20', weeks: 11, status: 'upcoming' },
];

const SEED_CLASSES = [
  { id: '1', name: 'S.1W', stream: 'West',  studentCount: 52, form: 'S.1', formTutor: 'Ms. Nakakande Mary'    },
  { id: '2', name: 'S.1E', stream: 'East',  studentCount: 50, form: 'S.1', formTutor: 'Mr. Ssali Brian'        },
  { id: '3', name: 'S.2W', stream: 'West',  studentCount: 48, form: 'S.2', formTutor: 'Ms. Achieng Prossy'     },
  { id: '4', name: 'S.3A', stream: 'Arts',  studentCount: 46, form: 'S.3', formTutor: 'Mr. Byamugisha Kenneth' },
  { id: '5', name: 'S.4A', stream: 'Arts',  studentCount: 44, form: 'S.4', formTutor: 'Mr. Kato Emmanuel'      },
];

const SEED_SUBJECTS = [
  { id: '1', name: 'Mathematics',         department: 'Science & Math',  hod: 'Mrs. Atim Norah',       teacherCount: 4, classCount: 8 },
  { id: '2', name: 'English Language',    department: 'Languages',        hod: 'Ms. Nakagolo Patricia', teacherCount: 3, classCount: 8 },
  { id: '3', name: 'Biology',             department: 'Science & Math',  hod: 'Mrs. Atim Norah',       teacherCount: 2, classCount: 4 },
  { id: '4', name: 'History',             department: 'Humanities',       hod: 'Ms. Achieng Prossy',    teacherCount: 2, classCount: 4 },
  { id: '5', name: 'Commerce',            department: 'Business Studies', hod: 'Mr. Kato Emmanuel',     teacherCount: 2, classCount: 4 },
];

export default function AdminAcademic() {
  const [tab, setTab]       = useState<'terms' | 'classes' | 'subjects'>('terms');
  const [terms,    setTerms]    = useState<ApiTerm[]>(SEED_TERMS);
  const [classes,  setClasses]  = useState<any[]>(SEED_CLASSES);
  const [subjects, setSubjects] = useState<any[]>(SEED_SUBJECTS);
  const [offline,  setOffline]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      termsApi.list(),
      academicEndpoints.classes(),
      academicEndpoints.subjects(),
    ])
      .then(([t, c, s]) => {
        if (Array.isArray(t) && t.length) setTerms(t);
        if (Array.isArray(c) && c.length) setClasses(c);
        if (Array.isArray(s) && s.length) setSubjects(s);
        setOffline(false);
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <PageHeader
        title="Academic Configuration"
        subtitle="Manage terms, classes, subjects and streams"
        actions={[{ label: '+ Add', onClick: () => {}, variant: 'primary' }]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: '#f8fafc', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {(['terms', 'classes', 'subjects'] as const).map(t => (
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
          {loading ? <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</div> : terms.map(t => (
            <Card key={t.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>{t.name}</span>
                    <Badge variant={t.status === 'current' ? 'success' : 'secondary'} size="sm">
                      {t.status === 'current' ? '🟢 Current' : '📅 Upcoming'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {fmt(t.startDate)} — {fmt(t.endDate)} · {t.weeks} weeks
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,80px)', gap: 10 }}>
                  {[['Start', fmt(t.startDate)], ['End', fmt(t.endDate)], ['Weeks', t.weeks]].map(([l, v]) => (
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
          {loading ? <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['Class', 'Form', 'Stream', 'Students', 'Form Tutor', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 800, color: '#1e293b' }}>{c.name}</td>
                    <td style={{ padding: '10px 10px', color: '#64748b' }}>{c.form ?? c.name?.slice(0, 2) ?? '—'}</td>
                    <td style={{ padding: '10px 10px' }}><Badge variant="blue" size="sm">{c.stream}</Badge></td>
                    <td style={{ padding: '10px 10px', color: '#1e293b', fontWeight: 600 }}>{c.studentCount ?? c.students ?? 0}</td>
                    <td style={{ padding: '10px 10px', color: '#64748b' }}>{c.formTutor ?? c.classTutor ?? '—'}</td>
                    <td style={{ padding: '10px 10px' }}><Btn variant="ghost" size="sm" onClick={() => {}}>Edit</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Subjects */}
      {tab === 'subjects' && (
        <Card>
          {loading ? <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['Subject', 'Department', 'HOD', 'Teachers', 'Classes'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 700, color: '#1e293b' }}>{s.name}</td>
                    <td style={{ padding: '10px 10px' }}><Badge variant="indigo" size="sm">{s.department ?? s.dept ?? '—'}</Badge></td>
                    <td style={{ padding: '10px 10px', color: '#64748b' }}>{s.hod ?? '—'}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600, color: '#6366f1' }}>{s.teacherCount ?? s.teachers ?? '—'}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600, color: '#6366f1' }}>{s.classCount ?? s.classes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
