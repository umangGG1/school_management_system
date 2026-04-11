import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';
import { activityApi, type ApiActivity } from '../../lib/api';

const SEV_COLOR: Record<string, string> = { info: 'blue', success: 'success', danger: 'red', warn: 'amber' };
const SEV_LABEL: Record<string, string> = { danger: '⚠️ Alert', success: '✓ OK', warn: '⚠️ Warn', info: 'ℹ️ Info' };

const PAGE_SIZE = 50;

export default function AdminActivity() {
  const [rows,    setRows]    = useState<ApiActivity[]>([]);
  const [total,   setTotal]   = useState(0);
  const [skip,    setSkip]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [search,  setSearch]  = useState('');
  const [sevFilter, setSevFilter] = useState('');

  const loadPage = useCallback(async (s: number, q: string, sev: string) => {
    setLoading(true);
    try {
      const res = await activityApi.list({
        limit: PAGE_SIZE,
        skip:  s,
        search: q || undefined,
        severity: sev as any || undefined,
      });
      setRows(prev => s === 0 ? res.data : [...prev, ...res.data]);
      setTotal(res.total);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSkip(0);
    loadPage(0, search, sevFilter);
  }, [search, sevFilter, loadPage]);

  const loadMore = () => {
    const next = skip + PAGE_SIZE;
    setSkip(next);
    loadPage(next, search, sevFilter);
  };

  const handleExport = () => {
    const csv = [
      ['Time', 'User', 'Role', 'Action', 'IP', 'Level'].join(','),
      ...rows.map(r => [
        new Date(r.createdAt).toLocaleString(),
        r.userName || '—',
        r.userRole || '—',
        `"${r.description}"`,
        r.ipAddress || '—',
        r.severity,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `activity_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handlePurge = async () => {
    if (!confirm('Purge all activity records older than 90 days?')) return;
    try {
      const res = await activityApi.purgeOld();
      alert(res.message);
      setSkip(0);
      loadPage(0, search, sevFilter);
    } catch {
      alert('Purge failed — backend may not be connected.');
    }
  };

  const danger  = rows.filter(r => r.severity === 'danger').length;
  const success = rows.filter(r => r.severity === 'success').length;
  const info    = rows.filter(r => r.severity === 'info' || r.severity === 'warn').length;

  return (
    <div>
      <PageHeader
        title="Activity Log"
        subtitle="Full audit trail — all user actions and system events"
        actions={[
          { label: '📤 Export CSV', onClick: handleExport, variant: 'secondary' },
          { label: '🗑️ Clear Old',  onClick: handlePurge,  variant: 'danger'    },
        ]}
      />

      {offline && (
        <div style={{ padding: '9px 14px', marginBottom: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 11, color: '#92400e' }}>
          ⚠️ Backend not connected — no live data available.
        </div>
      )}

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Events',   value: String(total),   color: '#6366f1' },
          { label: 'Alerts',         value: String(danger),  color: '#ef4444' },
          { label: 'Success Events', value: String(success), color: '#10b981' },
          { label: 'Info Events',    value: String(info),    color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', minWidth: 140 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="🕐 Events" />

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search description or user…"
            style={{ flex: 1, minWidth: 200, padding: '7px 11px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            {['', 'info', 'success', 'warn', 'danger'].map(f => (
              <button key={f} onClick={() => setSevFilter(f)} style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: sevFilter === f ? '#6366f1' : '#fff',
                color: sevFilter === f ? '#fff' : '#64748b',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
              }}>{f || 'All'}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Time', 'User', 'Role', 'Action', 'IP Address', 'Level'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>No events found.</td></tr>
              ) : rows.map((l, i) => (
                <tr key={l.id + i} style={{ borderBottom: '1px solid #f8fafc', background: l.severity === 'danger' ? '#fff5f5' : '' }}>
                  <td style={{ padding: '9px 10px', color: '#64748b', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 11 }}>
                    {new Date(l.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: '#1e293b' }}>{l.userName || '—'}</td>
                  <td style={{ padding: '9px 10px', color: '#94a3b8' }}>{l.userRole || '—'}</td>
                  <td style={{ padding: '9px 10px', color: '#475569', maxWidth: 320 }}>{l.description}</td>
                  <td style={{ padding: '9px 10px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{l.ipAddress || '—'}</td>
                  <td style={{ padding: '9px 10px' }}>
                    <Badge variant={SEV_COLOR[l.severity] as any} size="sm">{SEV_LABEL[l.severity] ?? l.severity}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            Showing {rows.length} of {total} events{offline ? ' (offline — no data)' : ''}
          </span>
          {rows.length < total && (
            <Btn variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
              {loading ? 'Loading…' : 'Load more →'}
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}
