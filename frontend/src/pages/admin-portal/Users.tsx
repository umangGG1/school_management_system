import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card }       from '../../components/ui/Card';
import { Badge }      from '../../components/ui/Badge';
import { Btn }        from '../../components/ui/Btn';

/* ─── Types ─────────────────────────────────────────────────────── */
interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  staffNo: string;
  status: 'active' | 'inactive';
  last: string;
}

/* ─── Constants ──────────────────────────────────────────────────── */
const ROLES = [
  'Head Teacher','Deputy HM','HOD','Exam Officer',
  'Teacher','Bursar','Payroll Officer','ECA Officer',
  'School Counsellor','Nurse','Dorm Master',
  'Gate Guard','Head of Security','Uniform Officer',
  'Parent','Student','Super Admin',
];

const ROLE_COLOR: Record<string,'indigo'|'green'|'blue'|'amber'|'red'|'teal'|'purple'> = {
  'Head Teacher':'indigo','Deputy HM':'blue','HOD':'indigo',
  'Exam Officer':'purple','Teacher':'blue','Bursar':'green',
  'Payroll Officer':'amber','ECA Officer':'green','School Counsellor':'teal',
  'Nurse':'red','Dorm Master':'teal','Gate Guard':'amber',
  'Head of Security':'red','Uniform Officer':'amber',
  'Parent':'green','Student':'blue','Super Admin':'purple',
};

const ROLE_PORTAL: Record<string, string> = {
  'Head Teacher':'/ht','Deputy HM':'/deputy-hm','HOD':'/hod',
  'Exam Officer':'/exam-officer','Teacher':'/teacher','Bursar':'/bursar',
  'Payroll Officer':'/bursar','ECA Officer':'/eca','School Counsellor':'/counsellor',
  'Nurse':'/nurse','Dorm Master':'/dorm-master','Gate Guard':'/security',
  'Head of Security':'/security','Parent':'/parent','Student':'/student',
  'Super Admin':'/admin',
};

const SEED_USERS: User[] = [
  { id:'USR-001', name:'Mr. Ssemanda Julius',    role:'Head Teacher',     email:'j.ssemanda@smissi.ac.ug',   phone:'+256 772 123 456', staffNo:'STF-001', status:'active',   last:'5 min ago'  },
  { id:'USR-002', name:'Mr. Kato Emmanuel',      role:'Bursar',           email:'e.kato@smissi.ac.ug',       phone:'+256 772 234 567', staffNo:'STF-002', status:'active',   last:'18 min ago' },
  { id:'USR-003', name:'Ms. Nakakande Mary',     role:'Teacher',          email:'m.nakakande@smissi.ac.ug',  phone:'+256 772 345 678', staffNo:'STF-003', status:'active',   last:'2 min ago'  },
  { id:'USR-004', name:'Mr. Opolot Fred',        role:'Dorm Master',      email:'f.opolot@smissi.ac.ug',     phone:'+256 772 456 789', staffNo:'STF-004', status:'active',   last:'1 hr ago'   },
  { id:'USR-005', name:'Mr. Okello Moses',       role:'Gate Guard',       email:'o.moses@smissi.ac.ug',      phone:'+256 772 567 890', staffNo:'STF-005', status:'active',   last:'30 min ago' },
  { id:'USR-006', name:'Sr. Nakamya Rose',       role:'Nurse',            email:'r.nakamya@smissi.ac.ug',    phone:'+256 772 678 901', staffNo:'STF-006', status:'active',   last:'45 min ago' },
  { id:'USR-007', name:'Ms. Akello Grace',       role:'Payroll Officer',  email:'g.akello@smissi.ac.ug',     phone:'+256 772 789 012', staffNo:'STF-007', status:'active',   last:'2 hrs ago'  },
  { id:'USR-008', name:'Mr. Ssali Brian',        role:'ECA Officer',      email:'b.ssali@smissi.ac.ug',      phone:'+256 772 890 123', staffNo:'STF-008', status:'active',   last:'2 hrs ago'  },
  { id:'USR-009', name:'Mrs. Namukasa Joyce',    role:'School Counsellor',email:'j.namukasa@smissi.ac.ug',   phone:'+256 772 901 234', staffNo:'STF-009', status:'active',   last:'3 hrs ago'  },
  { id:'USR-010', name:'Mr. Byamugisha Kenneth', role:'Exam Officer',     email:'k.byamugisha@smissi.ac.ug', phone:'+256 772 012 345', staffNo:'STF-010', status:'active',   last:'3 hrs ago'  },
  { id:'USR-011', name:'Ms. Achieng Prossy',     role:'Deputy HM',        email:'p.achieng@smissi.ac.ug',    phone:'+256 772 111 222', staffNo:'STF-011', status:'active',   last:'Yesterday'  },
  { id:'USR-012', name:'Mrs. Atim Norah',        role:'HOD',              email:'n.atim@smissi.ac.ug',       phone:'+256 772 222 333', staffNo:'STF-012', status:'active',   last:'Yesterday'  },
  { id:'USR-013', name:'Mr. Mugisha Paul',       role:'Uniform Officer',  email:'p.mugisha@smissi.ac.ug',    phone:'+256 772 333 444', staffNo:'STF-013', status:'inactive', last:'1 week ago' },
  { id:'USR-014', name:'Sgt. Byaruhanga Peter',  role:'Head of Security', email:'p.byaruhanga@smissi.ac.ug', phone:'+256 772 444 555', staffNo:'STF-014', status:'active',   last:'1 hr ago'   },
  { id:'USR-015', name:'Mr. Ochieng David',      role:'Parent',           email:'d.ochieng@gmail.com',       phone:'+256 772 555 666', staffNo:'—',       status:'active',   last:'4 min ago'  },
  { id:'USR-016', name:'Nakato Sarah',           role:'Student',          email:'sarah.nakato@smissi.ac.ug', phone:'+256 772 666 777', staffNo:'STU-2301', status:'active',  last:'1 min ago'  },
];

const EMPTY_FORM = { name:'', role:'Teacher', email:'', phone:'', staffNo:'', password:'', confirmPassword:'', sendWelcome: true };
type FormData = typeof EMPTY_FORM;

/* ─── Slide-over Panel ───────────────────────────────────────────── */
function UserPanel({
  open, onClose, editUser, onSave,
}: {
  open: boolean;
  onClose: () => void;
  editUser: User | null;
  onSave: (u: User) => void;
}) {
  const [form, setForm]     = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  /* populate form when editing */
  useEffect(() => {
    if (editUser) {
      setForm({ name: editUser.name, role: editUser.role, email: editUser.email,
                phone: editUser.phone, staffNo: editUser.staffNo,
                password: '', confirmPassword: '', sendWelcome: false });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editUser, open]);

  useEffect(() => {
    if (open) setTimeout(() => firstRef.current?.focus(), 60);
  }, [open]);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim())                          errs.name             = 'Full name is required';
    if (!form.email.trim())                         errs.email            = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email  = 'Enter a valid email';
    if (!editUser && !form.password)                errs.password         = 'Password is required';
    if (!editUser && form.password.length < 8)      errs.password         = 'Minimum 8 characters';
    if (!editUser && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    const nextId = editUser ? editUser.id : `USR-${String(Math.floor(Math.random() * 900) + 100)}`;
    onSave({
      id:      nextId,
      name:    form.name.trim(),
      role:    form.role,
      email:   form.email.trim(),
      phone:   form.phone.trim() || '—',
      staffNo: form.staffNo.trim() || '—',
      status:  'active',
      last:    'Just now',
    });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  const field = (
    label: string, key: keyof FormData, type = 'text',
    placeholder = '', hint?: string, required = false,
  ) => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input
        ref={key === 'name' ? firstRef : undefined}
        type={type}
        value={String(form[key])}
        onChange={set(key)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '9px 11px', borderRadius: 8,
          border: `1px solid ${errors[key] ? '#fca5a5' : '#e2e8f0'}`,
          fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box',
          background: errors[key] ? '#fff5f5' : '#fff', outline: 'none',
        }}
      />
      {errors[key] && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3 }}>⚠ {errors[key]}</div>}
      {hint && !errors[key] && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{hint}</div>}
    </div>
  );

  const portal = ROLE_PORTAL[form.role] ?? '/';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 300, backdropFilter: 'blur(2px)' }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 440,
        background: '#fff', zIndex: 301, boxShadow: '-4px 0 32px rgba(0,0,0,.14)',
        display: 'flex', flexDirection: 'column', overflowY: 'hidden',
        animation: 'slideInRight .2s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: '#eef2ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>👤</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>
              {editUser ? 'Edit User' : 'Create New User'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {editUser ? `Editing ${editUser.id}` : 'Fill in details and assign a role'}
            </div>
          </div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', width: 30, height: 30, borderRadius: 8,
            border: '1px solid #e2e8f0', background: '#f8fafc',
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {/* Section: Basic info */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Basic Information
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {field('Full Name', 'name', 'text', 'e.g. Ms. Nakakande Mary', undefined, true)}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('Phone Number', 'phone', 'tel', '+256 7XX XXX XXX')}
              {field('Staff / Student No.', 'staffNo', 'text', 'e.g. STF-017', 'Leave blank to auto-generate')}
            </div>
          </div>

          {/* Section: Role */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Portal Role
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
              Role <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select value={form.role} onChange={set('role')} style={{
              width: '100%', padding: '9px 11px', borderRadius: 8,
              border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit',
              background: '#fff', boxSizing: 'border-box', cursor: 'pointer',
            }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            {/* Role info card */}
            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 10,
              background: '#eef2ff', border: '1px solid #c7d2fe',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4338ca' }}>
                🔗 Portal: <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>{portal}/dashboard</span>
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>
                This user will log in through the <strong>{form.role}</strong> portal and see only the pages relevant to their role.
              </div>
            </div>
          </div>

          {/* Section: Login credentials */}
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Login Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {field('Email Address', 'email', 'email', 'user@smissi.ac.ug', 'Used to log in and receive notifications', true)}

            {!editUser && (
              <>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Temporary Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Minimum 8 characters"
                      style={{
                        width: '100%', padding: '9px 36px 9px 11px', borderRadius: 8,
                        border: `1px solid ${errors.password ? '#fca5a5' : '#e2e8f0'}`,
                        fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box',
                        background: errors.password ? '#fff5f5' : '#fff', outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8' }}
                    >{showPwd ? '🙈' : '👁️'}</button>
                  </div>
                  {errors.password && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3 }}>⚠ {errors.password}</div>}
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    placeholder="Re-enter password"
                    style={{
                      width: '100%', padding: '9px 11px', borderRadius: 8,
                      border: `1px solid ${errors.confirmPassword ? '#fca5a5' : '#e2e8f0'}`,
                      fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box',
                      background: errors.confirmPassword ? '#fff5f5' : '#fff', outline: 'none',
                    }}
                  />
                  {errors.confirmPassword && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3 }}>⚠ {errors.confirmPassword}</div>}
                </div>
              </>
            )}

            {/* Send welcome email toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 22, flexShrink: 0 }}>
                <input type="checkbox" checked={Boolean(form.sendWelcome)} onChange={set('sendWelcome')} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 20,
                  background: form.sendWelcome ? '#6366f1' : '#cbd5e1', transition: '.2s',
                }} />
                <span style={{
                  position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  top: 3, left: form.sendWelcome ? 19 : 3, transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }} />
              </label>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Send welcome email</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>User will receive login link and credentials via email</div>
              </div>
            </div>
          </div>

          {/* Permissions summary */}
          <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>✅ Access Summary</div>
            <div style={{ fontSize: 11, color: '#064e3b', lineHeight: 1.6 }}>
              This <strong>{form.role}</strong> account will have access to the portal at
              <strong style={{ color: '#6366f1' }}> {portal}/dashboard</strong>.<br />
              Permissions are preset for this role and can be customised in the Roles & Permissions page.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px', borderTop: '1px solid #e2e8f0',
          display: 'flex', gap: 10, flexShrink: 0,
          background: '#f8fafc',
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 9,
              background: saving ? '#a5b4fc' : '#6366f1', color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              transition: 'background .15s',
            }}
          >
            {saving ? '⏳ Saving…' : editUser ? '💾 Save Changes' : '✅ Create User'}
          </button>
          <button onClick={onClose} style={{
            padding: '10px 18px', borderRadius: 9, background: '#fff',
            border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          }}>Cancel</button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function AdminUsers() {
  const [users,    setUsers]    = useState<User[]>(SEED_USERS);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editUser,  setEditUser]  = useState<User | null>(null);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) ||
                        u.role.toLowerCase().includes(q)  ||
                        u.email.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || u.status === filter;
    return matchSearch && matchFilter;
  });

  const toggle       = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const openNew      = () => { setEditUser(null); setPanelOpen(true); };
  const openEdit     = (u: User) => { setEditUser(u); setPanelOpen(true); };
  const handleClose  = () => { setPanelOpen(false); setEditUser(null); };

  const handleSave   = (u: User) => {
    setUsers(prev =>
      prev.some(x => x.id === u.id)
        ? prev.map(x => x.id === u.id ? u : x)
        : [u, ...prev]
    );
  };

  const toggleStatus = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));

  const bulkDeactivate = () => {
    setUsers(prev => prev.map(u => selected.includes(u.id) ? { ...u, status: 'inactive' } : u));
    setSelected([]);
  };

  const active  = users.filter(u => u.status === 'active').length;

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${users.length} total · ${active} active`}
        actions={[
          { label: '+ Add User', onClick: openNew,      variant: 'primary'   },
          { label: '📤 Export',  onClick: () => {},     variant: 'secondary' },
        ]}
      />

      <Card>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search name, role or email…"
            style={{
              flex: 1, minWidth: 220, padding: '8px 12px', borderRadius: 8,
              border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            {['all','active','inactive'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: filter === f ? '#6366f1' : '#fff',
                color: filter === f ? '#fff' : '#64748b',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}>{f}</button>
            ))}
          </div>
          {selected.length > 0 && (
            <Btn variant="danger" size="sm" onClick={bulkDeactivate}>
              Deactivate {selected.length}
            </Btn>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#fafbfc' }}>
                <th style={{ padding: '9px 10px', width: 36 }}>
                  <input
                    type="checkbox"
                    onChange={e => setSelected(e.target.checked ? filtered.map(u => u.id) : [])}
                    checked={filtered.length > 0 && filtered.every(u => selected.includes(u.id))}
                  />
                </th>
                {['User','Role','Email','Phone','Status','Last Login','Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                  No users match your search.
                </td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}
                  style={{ borderBottom: '1px solid #f8fafc', transition: 'background .1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafbfd'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <td style={{ padding: '10px 10px' }}>
                    <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: '#eef2ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: '#6366f1', flexShrink: 0,
                      }}>
                        {u.name.replace(/^(Mr\.|Ms\.|Mrs\.|Sr\.|Sgt\.)\s*/i,'').trim()[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{u.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>{u.id} · {u.staffNo}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <Badge variant={ROLE_COLOR[u.role] ?? 'indigo'} size="sm">{u.role}</Badge>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '10px 10px', color: '#64748b' }}>{u.phone}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <Badge variant={u.status === 'active' ? 'success' : 'secondary'} size="sm">
                      {u.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#94a3b8' }}>{u.last}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(u)}>Edit</Btn>
                      <Btn variant={u.status === 'active' ? 'danger' : 'secondary'} size="sm" onClick={() => toggleStatus(u.id)}>
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
          Showing {filtered.length} of {users.length} users
        </div>
      </Card>

      {/* Slide-over panel */}
      <UserPanel
        open={panelOpen}
        onClose={handleClose}
        editUser={editUser}
        onSave={handleSave}
      />

      {/* Keyframe for panel entrance */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
