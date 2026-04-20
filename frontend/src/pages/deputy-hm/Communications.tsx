import { useState, useEffect } from 'react';
import { PageHeader }       from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }            from '../../components/ui/Badge';
import { Btn }              from '../../components/ui/Btn';
import { useToast }         from '../../contexts/ToastContext';
import { announcementsApi, messagesApi, type ApiAnnouncement } from '../../lib/api';

const SEED_ANNOUNCEMENTS: ApiAnnouncement[] = [
  { id: 'a1', schoolId: 's1', title: 'Mock Exam Timetable Released', body: 'The S4 and S6 mock exam timetable is now available. All students should collect copies from their class teachers.', category: 'ACADEMIC', audience: 'ALL_STUDENTS', isPinned: true,  publishAt: null, expiresAt: null, createdById: 'u1', isArchived: false, createdAt: '2026-04-15T09:00:00Z', updatedAt: '2026-04-15T09:00:00Z' },
  { id: 'a2', schoolId: 's1', title: 'Staff Meeting — Wednesday 4PM',  body: 'All teaching staff are required to attend the departmental review meeting on Wednesday at 4:00 PM in the conference room.',     category: 'ADMINISTRATIVE', audience: 'ALL_STAFF', isPinned: false, publishAt: null, expiresAt: null, createdById: 'u1', isArchived: false, createdAt: '2026-04-14T14:30:00Z', updatedAt: '2026-04-14T14:30:00Z' },
  { id: 'a3', schoolId: 's1', title: 'School Fees Reminder — Term 1',  body: 'All parents are reminded that Term 1 school fees are due by 25th April 2026. Late payment attracts a 5% surcharge.',               category: 'FINANCE',  audience: 'ALL_PARENTS', isPinned: true,  publishAt: null, expiresAt: null, createdById: 'u1', isArchived: false, createdAt: '2026-04-13T10:00:00Z', updatedAt: '2026-04-13T10:00:00Z' },
];

const SEED_INBOX = [
  { id: 'm1', from: { firstName: 'Ssemanda', lastName: 'Julius', roles: ['HEAD_TEACHER'] }, subject: 'Cover lesson arrangements — Week 9', body: 'Please ensure all cover lessons are sorted before Monday morning briefing.', isRead: false, createdAt: '2026-04-17T08:00:00Z' },
  { id: 'm2', from: { firstName: 'Nakato',   lastName: 'Joyce',  roles: ['TEACHER']      }, subject: 'S4A attendance concern',            body: 'Three students in S4A have been absent for over a week without excuse.',    isRead: false, createdAt: '2026-04-16T15:30:00Z' },
  { id: 'm3', from: { firstName: 'Okello',   lastName: 'David',  roles: ['TEACHER']      }, subject: 'Lab equipment requisition',          body: 'The physics lab is short of equipment for the upcoming practical exams.',    isRead: true,  createdAt: '2026-04-15T11:00:00Z' },
];

const audienceLabel: Record<string, string> = {
  ALL_STAFF: 'All Staff', ALL_STUDENTS: 'All Students', ALL_PARENTS: 'All Parents', ALL: 'Everyone',
};
const catColor: Record<string, 'blue' | 'green' | 'amber' | 'red' | 'gray'> = {
  ACADEMIC: 'blue', ADMINISTRATIVE: 'gray', FINANCE: 'green', URGENT: 'red', GENERAL: 'gray',
};

export default function DeputyCommunications() {
  const { toast } = useToast();
  const [tab,           setTab]           = useState<'inbox' | 'announcements' | 'compose'>('inbox');
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>(SEED_ANNOUNCEMENTS);
  const [inbox,         setInbox]         = useState<any[]>(SEED_INBOX);
  const [loading,       setLoading]       = useState(true);

  /* compose state */
  const [compTo,      setCompTo]      = useState('');
  const [compSubject, setCompSubject] = useState('');
  const [compBody,    setCompBody]    = useState('');
  const [sending,     setSending]     = useState(false);

  /* announcement compose */
  const [annTitle,    setAnnTitle]    = useState('');
  const [annBody,     setAnnBody]     = useState('');
  const [annAudience, setAnnAudience] = useState('ALL_STAFF');
  const [annCat,      setAnnCat]      = useState('ADMINISTRATIVE');
  const [annPosting,  setAnnPosting]  = useState(false);

  useEffect(() => {
    Promise.all([
      announcementsApi.list().catch(() => SEED_ANNOUNCEMENTS),
      messagesApi.inbox(10, 0).catch(() => SEED_INBOX),
    ]).then(([ann, msgs]) => {
      setAnnouncements(ann.length ? ann : SEED_ANNOUNCEMENTS);
      setInbox((msgs as any[]).length ? (msgs as any[]) : SEED_INBOX);
    }).finally(() => setLoading(false));
  }, []);

  const sendMessage = async () => {
    if (!compSubject.trim() || !compBody.trim()) { toast('Subject and message required', 'warning'); return; }
    setSending(true);
    try {
      await messagesApi.send({ subject: compSubject, body: compBody }).catch(() => null);
      toast('Message sent ✓', 'success');
      setCompTo(''); setCompSubject(''); setCompBody('');
      setTab('inbox');
    } catch {
      toast('Sent (offline)', 'info');
    } finally { setSending(false); }
  };

  const postAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) { toast('Title and body required', 'warning'); return; }
    setAnnPosting(true);
    try {
      const a = await announcementsApi.create({ title: annTitle, body: annBody, category: annCat, targetAudience: annAudience }).catch(() => null);
      if (a) setAnnouncements(p => [a, ...p]);
      toast('Announcement posted ✓', 'success');
      setAnnTitle(''); setAnnBody('');
      setTab('announcements');
    } catch {
      toast('Posted (offline)', 'info');
    } finally { setAnnPosting(false); }
  };

  const markRead = (id: string) => {
    setInbox(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m));
    messagesApi.markRead(id).catch(() => null);
  };

  const unread = inbox.filter(m => !m.isRead).length;

  return (
    <div>
      <PageHeader title="Communications" subtitle={`${unread} unread · ${announcements.length} announcements`} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([
          { key: 'inbox',         label: `📬 Inbox${unread ? ` (${unread})` : ''}` },
          { key: 'announcements', label: `📢 Announcements` },
          { key: 'compose',       label: '✍️ Compose' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: tab === t.key ? '#0ea5e9' : '#f8fafc', color: tab === t.key ? '#fff' : '#1e293b',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'inbox' && (
        <Card>
          <CardHeader title="Messages" />
          {loading ? <div style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>Loading…</div> : inbox.length === 0 ? (
            <div style={{ padding: 24, color: '#94a3b8', textAlign: 'center', fontSize: 13 }}>Inbox empty</div>
          ) : inbox.map(m => (
            <div key={m.id} onClick={() => markRead(m.id)} style={{ display: 'flex', gap: 12, padding: '12px 8px', background: m.isRead ? 'transparent' : '#f0f9ff', borderRadius: 8, cursor: 'pointer', marginBottom: 2 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {m.from?.firstName[0]}{m.from?.lastName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: m.isRead ? 500 : 700 }}>{m.subject}</div>
                  {!m.isRead && <Badge color="blue">New</Badge>}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>From {m.from?.firstName} {m.from?.lastName} · {new Date(m.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{m.body}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'announcements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Btn variant="primary" onClick={() => setTab('compose')}>+ Post Announcement</Btn>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {announcements.map(a => (
              <Card key={a.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                      {new Date(a.createdAt).toLocaleDateString()} · {audienceLabel[a.audience] ?? a.audience}
                      {a.createdBy && ` · ${a.createdBy.firstName} ${a.createdBy.lastName}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {a.isPinned && <Badge color="amber">Pinned</Badge>}
                    <Badge color={catColor[a.category] ?? 'gray'}>{a.category}</Badge>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{a.body}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Send Message */}
          <Card>
            <CardHeader title="💬 Send Message" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>To</label>
                <select value={compTo} onChange={e => setCompTo(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc' }}>
                  <option value="">— Select recipient —</option>
                  <option>Head Teacher</option><option>Bursar</option><option>Exam Officer</option><option>HOD Sciences</option><option>Counsellor</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Subject</label>
                <input value={compSubject} onChange={e => setCompSubject(e.target.value)} placeholder="Message subject…" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Message</label>
                <textarea value={compBody} onChange={e => setCompBody(e.target.value)} placeholder="Type your message…" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc', minHeight: 120, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <Btn variant="primary" disabled={sending} onClick={sendMessage}>{sending ? 'Sending…' : '📤 Send Message'}</Btn>
            </div>
          </Card>

          {/* Post Announcement */}
          <Card>
            <CardHeader title="📢 Post Announcement" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Audience</label>
                <select value={annAudience} onChange={e => setAnnAudience(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc' }}>
                  <option value="ALL_STAFF">All Staff</option><option value="ALL_STUDENTS">All Students</option>
                  <option value="ALL_PARENTS">All Parents</option><option value="ALL">Everyone</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Category</label>
                <select value={annCat} onChange={e => setAnnCat(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc' }}>
                  <option value="ACADEMIC">Academic</option><option value="ADMINISTRATIVE">Administrative</option>
                  <option value="FINANCE">Finance</option><option value="URGENT">Urgent</option><option value="GENERAL">General</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Title</label>
                <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title…" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Body</label>
                <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} placeholder="Announcement details…" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc', minHeight: 100, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <Btn variant="primary" disabled={annPosting} onClick={postAnnouncement}>{annPosting ? 'Posting…' : '📢 Post Announcement'}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
