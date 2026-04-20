import { useState, useEffect } from 'react';
import { useToast }    from '../../contexts/ToastContext';
import { PageHeader }  from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Btn }         from '../../components/ui/Btn';
import { Badge }       from '../../components/ui/Badge';
import { messagesApi, colleaguesApi, type ApiMessage } from '../../lib/api';


function initials(m: ApiMessage) {
  const f = m.from;
  if (f) return `${f.firstName[0] ?? ''}${f.lastName[0] ?? ''}`.toUpperCase();
  return '??';
}
function avatarColor(id: string) {
  const colors = ['#1e293b','#2563eb','#8b5cf6','#7c3aed','#0891b2','#16a34a','#dc2626'];
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600000)  return `${Math.round(diff/60000)} min ago`;
  if (diff < 86400000) return `${Math.round(diff/3600000)} hrs ago`;
  if (diff < 172800000) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function CommunicationsPage() {
  const { toast } = useToast();
  const [inbox,     setInbox]     = useState<ApiMessage[] | null>(null);
  const [selected,  setSelected]  = useState<ApiMessage | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [sending,     setSending]     = useState(false);
  const [staffUsers,  setStaffUsers]  = useState<any[]>([]);

  const [recipientId, setRecipientId] = useState('');
  const [subject,     setSubject]     = useState('');
  const [body,        setBody]        = useState('');

  const load = () => {
    messagesApi.inbox(20, 0)
      .then(msgs => setInbox(Array.isArray(msgs) ? msgs : []))
      .catch(() => setInbox([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    colleaguesApi.list().then(users => {
      if (Array.isArray(users)) setStaffUsers(users);
    }).catch(() => {});
  }, []);

  const handleSelect = async (msg: ApiMessage) => {
    setSelected(msg);
    if (!msg.isRead) {
      await messagesApi.markRead(msg.id).catch(() => {});
      setInbox(prev => prev ? prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m) : prev);
    }
  };

  const handleSend = async () => {
    if (!recipientId)    { toast('Select a recipient', 'warning'); return; }
    if (!subject.trim()) { toast('Enter a subject', 'warning'); return; }
    if (!body.trim())    { toast('Enter a message', 'warning'); return; }
    setSending(true);
    try {
      await messagesApi.send({ recipientId, subject, body, category: 'GENERAL' });
      toast('Message sent ✓', 'success');
      setSubject(''); setBody(''); setRecipientId('');
      load();
    } catch { toast('Could not send — backend offline', 'warning'); }
    finally { setSending(false); }
  };

  const handleDraft = () => {
    if (!subject.trim() && !body.trim()) { toast('Nothing to draft', 'warning'); return; }
    toast('Draft saved', 'info');
  };

  const handleMarkAllRead = async () => {
    await messagesApi.markAllRead().catch(() => {});
    setInbox(prev => prev ? prev.map(m => ({ ...m, isRead: true })) : prev);
    toast('All messages marked as read', 'info');
  };

  const unread = inbox ? inbox.filter(m => !m.isRead).length : 0;

  return (
    <div>
      <PageHeader title="Communications" subtitle="Inbox · Compose messages to students, parents, and staff" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Inbox */}
        <Card>
          <CardHeader
            title={`📬 Inbox (${unread} unread)`}
            action={unread > 0
              ? <Btn size="sm" onClick={handleMarkAllRead}>Mark all read</Btn>
              : undefined
            }
          />

          {loading && <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>Loading…</div>}

          {!loading && inbox !== null && inbox.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>No messages yet</div>
            </div>
          )}

          {!loading && inbox && inbox.map(m => (
            <div key={m.id} onClick={() => handleSelect(m)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 8px',
              background: selected?.id === m.id ? '#eff6ff' : !m.isRead ? '#f0f9ff' : 'transparent',
              borderRadius: 8, marginBottom: 4, cursor: 'pointer',
              border: selected?.id === m.id ? '1px solid #bfdbfe' : '1px solid transparent',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: avatarColor(m.fromUserId),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff',
              }}>{initials(m)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: !m.isRead ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.subject}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                  {m.from ? `${m.from.firstName} ${m.from.lastName}` : 'System'} · {timeAgo(m.createdAt)}
                </div>
              </div>
              {!m.isRead && <Badge color="blue">New</Badge>}
            </div>
          ))}

          {/* Selected message body */}
          {selected && (
            <div style={{ marginTop: 12, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{selected.subject}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                From: {selected.from ? `${selected.from.firstName} ${selected.from.lastName}` : 'System'} · {timeAgo(selected.createdAt)}
              </div>
              <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.body}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <Btn size="sm" onClick={() => {
                  if (selected.fromUserId) setRecipientId(selected.fromUserId);
                  setSubject(`Re: ${selected.subject}`);
                  setBody('');
                }}>↩ Reply</Btn>
                <Btn size="sm" variant="danger" onClick={async () => {
                  await messagesApi.delete(selected.id).catch(() => {});
                  setInbox(prev => prev ? prev.filter(m => m.id !== selected.id) : prev);
                  setSelected(null);
                  toast('Message deleted', 'info');
                }}>🗑 Delete</Btn>
              </div>
            </div>
          )}
        </Card>

        {/* Compose */}
        <Card>
          <CardHeader title="✍️ Compose Message" />

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Send To</div>
            <select value={recipientId} onChange={e => setRecipientId(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, background: '#f8fafc' }}>
              <option value="">— Select recipient —</option>
              {staffUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({(u.roles?.[0] ?? u.role ?? '').replace(/_/g,' ')})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Subject</div>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Assignment feedback for…"
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Message</div>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Type your message…" rows={6}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn onClick={handleDraft}>💾 Draft</Btn>
            <Btn variant="primary" onClick={handleSend}>{sending ? 'Sending…' : '📤 Send'}</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
