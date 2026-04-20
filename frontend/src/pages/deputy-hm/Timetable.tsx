import { useState, useEffect } from 'react';
import { PageHeader }       from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }            from '../../components/ui/Badge';
import { Modal }            from '../../components/ui/Modal';
import { useToast }         from '../../contexts/ToastContext';
import { academicApi }      from '../../lib/api';

const PERIODS = ['P1 (7:30)', 'P2 (8:30)', 'P3 (9:30)', 'P4 (10:45)', 'P5 (11:45)', 'P6 (1:30)', 'P7 (2:30)', 'P8 (3:30)'];
const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const CLASSES = ['S1A', 'S1B', 'S2A', 'S2B', 'S3A', 'S3B', 'S4A', 'S4B', 'S5A', 'S5B', 'S6A', 'S6B'];

interface TimetableCell { subject: string; teacher: string; }
type TimetableGrid = Record<string, TimetableCell | null>;

const SEED_TIMETABLE: TimetableGrid = {
  'Monday_P1':    { subject: 'Mathematics',   teacher: 'Mr. Byamugisha' },
  'Monday_P2':    { subject: 'English',        teacher: 'Ms. Nakato'    },
  'Monday_P3':    { subject: 'Physics',        teacher: 'Mr. Okello'    },
  'Monday_P4':    { subject: 'Chemistry',      teacher: 'Ms. Atim'      },
  'Monday_P5':    { subject: 'Biology',        teacher: 'Mr. Ssali'     },
  'Monday_P6':    { subject: 'History',        teacher: 'Ms. Kagwa'     },
  'Monday_P7':    { subject: 'Geography',      teacher: 'Mr. Onen'      },
  'Monday_P8':    { subject: 'Computer',       teacher: 'Mr. Mugisha'   },
  'Tuesday_P1':   { subject: 'English',        teacher: 'Ms. Nakato'    },
  'Tuesday_P2':   { subject: 'Mathematics',    teacher: 'Mr. Byamugisha'},
  'Tuesday_P3':   { subject: 'Biology',        teacher: 'Mr. Ssali'     },
  'Tuesday_P4':   { subject: 'Physics',        teacher: 'Mr. Okello'    },
  'Tuesday_P5':   { subject: 'Chemistry',      teacher: 'Ms. Atim'      },
  'Tuesday_P6':   { subject: 'Literature',     teacher: 'Ms. Nakato'    },
  'Wednesday_P1': { subject: 'Mathematics',    teacher: 'Mr. Byamugisha'},
  'Wednesday_P2': { subject: 'Computer',       teacher: 'Mr. Mugisha'   },
  'Wednesday_P3': { subject: 'Physics',        teacher: 'Mr. Okello'    },
  'Wednesday_P4': { subject: 'CRE',            teacher: 'Rev. Kizito'   },
  'Wednesday_P5': { subject: 'Biology',        teacher: 'Mr. Ssali'     },
  'Thursday_P1':  { subject: 'Chemistry',      teacher: 'Ms. Atim'      },
  'Thursday_P2':  { subject: 'English',        teacher: 'Ms. Nakato'    },
  'Thursday_P3':  { subject: 'Mathematics',    teacher: 'Mr. Byamugisha'},
  'Thursday_P4':  { subject: 'Geography',      teacher: 'Mr. Onen'      },
  'Thursday_P5':  { subject: 'History',        teacher: 'Ms. Kagwa'     },
  'Friday_P1':    { subject: 'Biology',        teacher: 'Mr. Ssali'     },
  'Friday_P2':    { subject: 'Physics',        teacher: 'Mr. Okello'    },
  'Friday_P3':    { subject: 'Mathematics',    teacher: 'Mr. Byamugisha'},
  'Friday_P4':    { subject: 'English',        teacher: 'Ms. Nakato'    },
  'Friday_P5':    { subject: 'Computer',       teacher: 'Mr. Mugisha'   },
  'Friday_P6':    { subject: 'Chemistry',      teacher: 'Ms. Atim'      },
};

const SEED_COVER = [
  { id: 'c1', subject: 'Mathematics', class: 'S4A', period: 'P3', day: 'Today', reason: 'Mr. Byamugisha — sick leave', assignedTo: 'Ms. Nakato Joyce', status: 'ASSIGNED' },
  { id: 'c2', subject: 'Physics',     class: 'S5B', period: 'P5', day: 'Today', reason: 'Mr. Okello — training workshop', assignedTo: '',              status: 'UNASSIGNED' },
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#dbeafe', English: '#dcfce7', Physics: '#fce7f3', Chemistry: '#fff7ed',
  Biology: '#f0fdf4', History: '#fdf4ff', Geography: '#ecfdf5', Computer: '#eff6ff',
  Literature: '#fdf2f8', CRE: '#fefce8',
};

export default function Timetable() {
  const { toast }   = useToast();
  const [selClass, setSelClass] = useState('S4A');
  const [cover,    setCover]    = useState(SEED_COVER);
  const [coverModal, setCoverModal] = useState(false);
  const [selCover, setSelCover] = useState<any>(null);
  const [assignTo, setAssignTo] = useState('');

  useEffect(() => {
    academicApi.getTimetable().catch(() => []);
  }, []);

  const grid = SEED_TIMETABLE;

  const openCover = (c: any) => { setSelCover(c); setAssignTo(''); setCoverModal(true); };
  const assignCover = async () => {
    if (!assignTo.trim()) { toast('Enter teacher name', 'warning'); return; }
    try {
      if (selCover) await academicApi.assignCover(selCover.id, { teacherId: assignTo }).catch(() => null);
      setCover(cv => cv.map(c => c.id === selCover?.id ? { ...c, assignedTo: assignTo, status: 'ASSIGNED' } : c));
      toast('Cover lesson assigned ✓', 'success');
      setCoverModal(false);
    } catch {
      toast('Assigned (offline)', 'info');
      setCoverModal(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Timetabling"
        subtitle="Class timetables and cover lessons"
        actions={[
          { label: '📅 Cover Lessons', variant: 'secondary', onClick: () => {} },
          { label: '+ New Entry', variant: 'primary', onClick: () => toast('Timetable editor coming soon', 'info') },
        ]}
      />

      {/* Cover lessons alert */}
      {cover.filter(c => c.status === 'UNASSIGNED').length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#9a3412' }}>
            {cover.filter(c => c.status === 'UNASSIGNED').length} cover lesson(s) unassigned today
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Timetable grid */}
        <div>
          {/* Class selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {CLASSES.map(c => (
              <button key={c} onClick={() => setSelClass(c)} style={{
                padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: selClass === c ? '#0ea5e9' : '#f8fafc', color: selClass === c ? '#fff' : '#1e293b',
              }}>{c}</button>
            ))}
          </div>

          <Card>
            <CardHeader title={`📅 ${selClass} — Term 1, Week 8`} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', minWidth: 90 }}>Period</th>
                    {DAYS.map(d => <th key={d} style={{ padding: '8px 10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', minWidth: 110 }}>{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(p => {
                    const pKey = p.split(' ')[0];
                    return (
                      <tr key={p} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#475569', fontSize: 11 }}>{p}</td>
                        {DAYS.map(d => {
                          const cell = grid[`${d}_${pKey}`];
                          return (
                            <td key={d} style={{ padding: '5px 6px' }}>
                              {cell ? (
                                <div style={{ background: SUBJECT_COLORS[cell.subject] ?? '#f8fafc', borderRadius: 6, padding: '5px 8px' }}>
                                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 11 }}>{cell.subject}</div>
                                  <div style={{ color: '#64748b', fontSize: 10, marginTop: 1 }}>{cell.teacher}</div>
                                </div>
                              ) : (
                                <div style={{ background: '#fafafa', borderRadius: 6, padding: '5px 8px', color: '#cbd5e1', fontSize: 10, textAlign: 'center' }}>—</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Cover lessons */}
        <Card>
          <CardHeader title="🔄 Cover Lessons" />
          {cover.map(c => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.subject} — {c.class} · {c.period}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{c.reason}</div>
                  {c.assignedTo && <div style={{ fontSize: 11, color: '#0ea5e9', marginTop: 2 }}>→ {c.assignedTo}</div>}
                </div>
                <Badge color={c.status === 'ASSIGNED' ? 'green' : 'red'}>{c.status}</Badge>
              </div>
              {c.status === 'UNASSIGNED' && (
                <button onClick={() => openCover(c)} style={{ marginTop: 8, padding: '5px 12px', borderRadius: 6, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  Assign Cover Teacher
                </button>
              )}
            </div>
          ))}
          {cover.every(c => c.status === 'ASSIGNED') && (
            <div style={{ fontSize: 12, color: '#166534', background: '#dcfce7', borderRadius: 8, padding: '10px', textAlign: 'center', marginTop: 8 }}>
              ✅ All covers assigned
            </div>
          )}
        </Card>
      </div>

      <Modal open={coverModal} onClose={() => setCoverModal(false)} id="cover-assign" title="🔄 Assign Cover Teacher">
        {selCover && (
          <div className="space-y-4">
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
              <strong>{selCover.subject}</strong> — {selCover.class} · {selCover.period} · {selCover.day}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Cover Teacher</label>
              <input value={assignTo} onChange={e => setAssignTo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-sky-400" placeholder="Teacher name…" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCoverModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={assignCover} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg">Assign</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
