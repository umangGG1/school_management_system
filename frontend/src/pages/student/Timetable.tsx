import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { studentSelfApi } from '../../lib/api';

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { key: 'P1', time: '7:30 – 8:30'  },
  { key: 'P2', time: '8:30 – 9:30'  },
  { key: 'P3', time: '9:30 – 10:30' },
  { key: 'P4', time: '10:45 – 11:45'},
  { key: 'P5', time: '11:45 – 12:45'},
  { key: 'B',  time: '12:45 – 1:30',  isBreak: true },
  { key: 'P6', time: '1:30 – 2:30'  },
  { key: 'P7', time: '2:30 – 3:30'  },
  { key: 'P8', time: '3:30 – 4:30'  },
];

interface Cell { subject: string; teacher: string; room?: string; }
type Grid = Record<string, Cell | null>;

const SEED_GRID: Grid = {
  'Monday_P1':    { subject: 'Mathematics', teacher: 'Mr. Byamugisha', room: 'R4' },
  'Monday_P2':    { subject: 'English',     teacher: 'Ms. Nakato',     room: 'R4' },
  'Monday_P3':    { subject: 'Physics',     teacher: 'Mr. Okello',     room: 'Lab 1' },
  'Monday_P4':    { subject: 'Chemistry',   teacher: 'Ms. Atim',       room: 'Lab 2' },
  'Monday_P5':    { subject: 'Biology',     teacher: 'Mr. Ssali',      room: 'Lab 3' },
  'Monday_P6':    { subject: 'History',     teacher: 'Ms. Kagwa',      room: 'R4' },
  'Monday_P7':    { subject: 'Geography',   teacher: 'Mr. Onen',       room: 'R4' },
  'Monday_P8':    { subject: 'Computer',    teacher: 'Mr. Mugisha',    room: 'ICT Lab' },
  'Tuesday_P1':   { subject: 'English',     teacher: 'Ms. Nakato',     room: 'R4' },
  'Tuesday_P2':   { subject: 'Mathematics', teacher: 'Mr. Byamugisha', room: 'R4' },
  'Tuesday_P3':   { subject: 'Biology',     teacher: 'Mr. Ssali',      room: 'Lab 3' },
  'Tuesday_P4':   { subject: 'Physics',     teacher: 'Mr. Okello',     room: 'Lab 1' },
  'Tuesday_P5':   { subject: 'Chemistry',   teacher: 'Ms. Atim',       room: 'Lab 2' },
  'Tuesday_P6':   { subject: 'Literature',  teacher: 'Ms. Nakato',     room: 'R4' },
  'Tuesday_P7':   { subject: 'CRE',         teacher: 'Rev. Kizito',    room: 'R5' },
  'Wednesday_P1': { subject: 'Mathematics', teacher: 'Mr. Byamugisha', room: 'R4' },
  'Wednesday_P2': { subject: 'Computer',    teacher: 'Mr. Mugisha',    room: 'ICT Lab' },
  'Wednesday_P3': { subject: 'Physics',     teacher: 'Mr. Okello',     room: 'Lab 1' },
  'Wednesday_P4': { subject: 'CRE',         teacher: 'Rev. Kizito',    room: 'R5' },
  'Wednesday_P5': { subject: 'Biology',     teacher: 'Mr. Ssali',      room: 'Lab 3' },
  'Wednesday_P6': { subject: 'Geography',   teacher: 'Mr. Onen',       room: 'R4' },
  'Thursday_P1':  { subject: 'Chemistry',   teacher: 'Ms. Atim',       room: 'Lab 2' },
  'Thursday_P2':  { subject: 'English',     teacher: 'Ms. Nakato',     room: 'R4' },
  'Thursday_P3':  { subject: 'Mathematics', teacher: 'Mr. Byamugisha', room: 'R4' },
  'Thursday_P4':  { subject: 'Geography',   teacher: 'Mr. Onen',       room: 'R4' },
  'Thursday_P5':  { subject: 'History',     teacher: 'Ms. Kagwa',      room: 'R4' },
  'Thursday_P6':  { subject: 'Biology',     teacher: 'Mr. Ssali',      room: 'Lab 3' },
  'Thursday_P7':  { subject: 'Computer',    teacher: 'Mr. Mugisha',    room: 'ICT Lab' },
  'Friday_P1':    { subject: 'Biology',     teacher: 'Mr. Ssali',      room: 'Lab 3' },
  'Friday_P2':    { subject: 'Physics',     teacher: 'Mr. Okello',     room: 'Lab 1' },
  'Friday_P3':    { subject: 'Mathematics', teacher: 'Mr. Byamugisha', room: 'R4' },
  'Friday_P4':    { subject: 'English',     teacher: 'Ms. Nakato',     room: 'R4' },
  'Friday_P5':    { subject: 'Computer',    teacher: 'Mr. Mugisha',    room: 'ICT Lab' },
  'Friday_P6':    { subject: 'Chemistry',   teacher: 'Ms. Atim',       room: 'Lab 2' },
  'Friday_P7':    { subject: 'History',     teacher: 'Ms. Kagwa',      room: 'R4' },
};

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics: { bg: '#dbeafe', text: '#1d4ed8' },
  English:     { bg: '#dcfce7', text: '#166534' },
  Physics:     { bg: '#fce7f3', text: '#9d174d' },
  Chemistry:   { bg: '#fff7ed', text: '#9a3412' },
  Biology:     { bg: '#f0fdf4', text: '#15803d' },
  History:     { bg: '#fdf4ff', text: '#7e22ce' },
  Geography:   { bg: '#ecfdf5', text: '#065f46' },
  Computer:    { bg: '#eff6ff', text: '#1e40af' },
  Literature:  { bg: '#fdf2f8', text: '#9d174d' },
  CRE:         { bg: '#fefce8', text: '#854d0e' },
};

const TODAY_DAY = DAYS[new Date().getDay() - 1] ?? 'Monday';

export default function StudentTimetable() {
  const [selDay, setSelDay] = useState(TODAY_DAY);
  const [grid,   setGrid]   = useState<Grid>(SEED_GRID);
  const [view,   setView]   = useState<'day' | 'week'>('week');

  useEffect(() => {
    studentSelfApi.getTimetable()
      .then(data => { if (data.length) setGrid({}); /* use API data when available */ })
      .catch(() => null);
  }, []);

  const todayCells = PERIODS.map(p => ({
    ...p,
    cell: !p.isBreak ? (grid[`${selDay}_${p.key}`] ?? null) : null,
  }));

  return (
    <div>
      <PageHeader
        title="My Timetable"
        subtitle="S4A · Term 1, 2026"
        actions={[
          { label: view === 'week' ? '📅 Day View' : '📅 Week View', variant: 'secondary', onClick: () => setView(v => v === 'week' ? 'day' : 'week') },
        ]}
      />

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {DAYS.map(d => (
          <button key={d} onClick={() => setSelDay(d)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: selDay === d ? '#7c3aed' : '#f8fafc',
            color:      selDay === d ? '#fff'    : '#1e293b',
          }}>
            {d}
            {d === TODAY_DAY && <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.8 }}>●</span>}
          </button>
        ))}
      </div>

      {view === 'day' ? (
        /* Day view — vertical list */
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayCells.map(p => (
              <div key={p.key}>
                {p.isBreak ? (
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                    🍽️ Lunch Break · {p.time}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 14, padding: '10px 12px', border: '1px solid #f1f5f9', borderRadius: 10, alignItems: 'center' }}>
                    <div style={{ minWidth: 80, textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{p.key}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{p.time}</div>
                    </div>
                    <div style={{ width: 3, height: 40, borderRadius: 2, background: p.cell ? (SUBJECT_COLORS[p.cell.subject]?.text ?? '#cbd5e1') : '#f1f5f9' }} />
                    {p.cell ? (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{p.cell.subject}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.cell.teacher} · {p.cell.room}</div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, fontSize: 12, color: '#cbd5e1' }}>Free period</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* Week view — grid */
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', minWidth: 100 }}>Period</th>
                  {DAYS.map(d => (
                    <th key={d} style={{ padding: '8px 10px', fontWeight: 700, color: d === TODAY_DAY ? '#7c3aed' : '#64748b', borderBottom: '1px solid #e2e8f0', minWidth: 110, textAlign: 'center' }}>
                      {d}{d === TODAY_DAY ? ' ●' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(p => (
                  <tr key={p.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 10px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{p.key}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{p.time}</div>
                    </td>
                    {p.isBreak ? (
                      <td colSpan={5} style={{ padding: '6px 10px', textAlign: 'center', background: '#fafafa', color: '#94a3b8', fontSize: 11 }}>
                        🍽️ Lunch Break
                      </td>
                    ) : DAYS.map(d => {
                      const cell = grid[`${d}_${p.key}`];
                      const colors = cell ? (SUBJECT_COLORS[cell.subject] ?? { bg: '#f8fafc', text: '#64748b' }) : null;
                      return (
                        <td key={d} style={{ padding: '4px 6px' }}>
                          {cell ? (
                            <div style={{ background: colors!.bg, borderRadius: 6, padding: '5px 7px', minHeight: 42 }}>
                              <div style={{ fontWeight: 700, color: colors!.text, fontSize: 11 }}>{cell.subject}</div>
                              <div style={{ color: '#64748b', fontSize: 10, marginTop: 1 }}>{cell.teacher}</div>
                              {cell.room && <div style={{ color: '#94a3b8', fontSize: 9, marginTop: 1 }}>{cell.room}</div>}
                            </div>
                          ) : (
                            <div style={{ background: '#fafafa', borderRadius: 6, padding: '5px 7px', minHeight: 42, color: '#e2e8f0', textAlign: 'center', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
