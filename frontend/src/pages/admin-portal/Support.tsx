import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { Modal }      from '../../components/ui/Modal';
import { useToast }   from '../../contexts/ToastContext';
import { supportApi, type ApiTicket } from '../../lib/api';

const SEED: ApiTicket[] = [
  { id: 'TKT-001', title: 'Login not working for new teacher account', reporterName: 'Ms. Nakagolo Patricia', reporterRole: 'Teacher',  priority: 'high',   status: 'open',        category: 'account', createdAt: new Date().toISOString() },
  { id: 'TKT-002', title: 'Fee receipt not generating after payment',  reporterName: 'Mr. Ochieng David',    reporterRole: 'Parent',   priority: 'medium', status: 'in_progress', category: 'billing', createdAt: new Date().toISOString() },
  { id: 'TKT-003', title: 'Attendance report showing wrong dates',     reporterName: 'Mr. Kato Emmanuel',    reporterRole: 'Bursar',   priority: 'low',    status: 'resolved',    category: 'bug',     createdAt: new Date().toISOString() },
];

const PRI_COLOR: Record<string, 'red' | 'amber' | 'blue'> = { high: 'red', medium: 'amber', low: 'blue' };
const STA_COLOR: Record<string, 'amber' | 'blue' | 'green'> = { open: 'amber', in_progress: 'blue', resolved: 'green' };
const STA_LABEL: Record<string, string> = { open: '🔴 Open', in_progress: '🔵 In Progress', resolved: '✅ Resolved' };

const EMPTY_TICKET = { title: '', category: 'account', priority: 'medium', reporterName: '', reporterRole: '' };

export default function AdminSupport() {
  const { toast } = useToast();
  const [tickets,  setTickets]  = useState<ApiTicket[]>(SEED);
  const [selected, setSelected] = useState<string | null>('TKT-001');
  const [reply,    setReply]    = useState('');
  const [acting,   setActing]   = useState(false);
  const [offline,  setOffline]  = useState(false);
  const [newOpen,  setNewOpen]  = useState(false);
  const [newForm,  setNewForm]  = useState(EMPTY_TICKET);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supportApi.list()
      .then(t => { if (t.length) setTickets(t); setOffline(false); })
      .catch(() => setOffline(true));
  }, []);

  const ticket = tickets.find(t => t.id === selected);

  const handleResolve = async (id: string) => {
    setActing(true);
    try {
      await supportApi.update(id, { status: 'resolved' });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
      toast('Ticket marked as resolved', 'success');
    } catch {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
      toast('Ticket resolved (offline)', 'info');
    } finally { setActing(false); }
  };

  const handleAssign = async (id: string) => {
    try {
      await supportApi.update(id, { status: 'in_progress' });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress' } : t));
      toast('Ticket assigned to IT team', 'success');
    } catch {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress' } : t));
      toast('Assigned (offline)', 'info');
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !ticket) return;
    try {
      await supportApi.update(ticket.id, { reply });
      toast('Reply sent', 'success');
    } catch {
      toast('Reply saved (offline)', 'info');
    }
    setReply('');
  };

  const handleCreate = async () => {
    if (!newForm.title.trim()) return;
    setCreating(true);
    try {
      const created = await supportApi.create({
        title: newForm.title,
        category: newForm.category,
        priority: newForm.priority as any,
        reporterName: newForm.reporterName || 'Admin',
        reporterRole: newForm.reporterRole || 'Admin',
      });
      setTickets(prev => [created, ...prev]);
      toast('Ticket created', 'success');
    } catch {
      const fake: ApiTicket = {
        id: `TKT-${Date.now()}`, title: newForm.title, category: newForm.category,
        priority: newForm.priority as any, status: 'open',
        reporterName: newForm.reporterName || 'Admin', reporterRole: newForm.reporterRole || 'Admin',
        createdAt: new Date().toISOString(),
      };
      setTickets(prev => [fake, ...prev]);
      toast('Ticket created (offline)', 'info');
    } finally {
      setCreating(false); setNewOpen(false); setNewForm(EMPTY_TICKET);
    }
  };

  const openCount     = tickets.filter(t => t.status === 'open').length;
  const progressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  const inp = (label: string, key: keyof typeof newForm, type = 'text') => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={type} value={newForm[key]} onChange={e => setNewForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle={`${openCount} open · ${progressCount} in progress · ${resolvedCount} resolved`}
        actions={[{ label: '+ New Ticket', onClick: () => setNewOpen(true), variant: 'primary' }]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — showing demo data.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18 }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tickets.map(t => (
              <div key={t.id} onClick={() => setSelected(t.id)} style={{
                padding: '11px 13px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${selected === t.id ? '#6366f1' : '#e2e8f0'}`,
                background: selected === t.id ? '#eef2ff' : '#fff', transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{t.id}</span>
                  <Badge color={PRI_COLOR[t.priority]}>{t.priority}</Badge>
                  <Badge color={STA_COLOR[t.status]}>{STA_LABEL[t.status]}</Badge>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>
                    {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{t.reporterName} · {t.reporterRole}</div>
              </div>
            ))}
          </div>
        </Card>

        {ticket ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', marginBottom: 10 }}>{ticket.title}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <Badge color={PRI_COLOR[ticket.priority]}>{ticket.priority} priority</Badge>
                <Badge color={STA_COLOR[ticket.status]}>{STA_LABEL[ticket.status]}</Badge>
                <Badge color="indigo">{ticket.category}</Badge>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                <strong>Reporter:</strong> {ticket.reporterName} ({ticket.reporterRole})
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString('en-GB')}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ticket.status !== 'resolved' && (
                  <Btn variant="primary" size="sm" disabled={acting} onClick={() => handleResolve(ticket.id)}>
                    {acting ? '…' : 'Mark Resolved'}
                  </Btn>
                )}
                {ticket.status === 'open' && (
                  <Btn variant="secondary" size="sm" onClick={() => handleAssign(ticket.id)}>Assign to IT</Btn>
                )}
              </div>
            </Card>

            <Card>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 10 }}>💬 Reply</div>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply…" rows={4}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              <div style={{ marginTop: 8 }}>
                <Btn variant="primary" size="sm" onClick={handleReply}>Send Reply</Btn>
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 32 }}>🎫</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>Select a ticket to view details</div>
            </div>
          </Card>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal id="new-ticket" open={newOpen} onClose={() => setNewOpen(false)} title="🎫 New Support Ticket" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inp('Title', 'title')}
          {inp('Reporter Name', 'reporterName')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Category</label>
              <select value={newForm.category} onChange={e => setNewForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit' }}>
                {['account','billing','bug','upload','access','other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Priority</label>
              <select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit' }}>
                {['low','medium','high'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="ghost" size="sm" onClick={() => setNewOpen(false)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating…' : 'Create Ticket'}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
