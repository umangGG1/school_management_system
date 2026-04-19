import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { htSettingsApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function HTSettings() {
  const { toast } = useToast();
  const { user }  = useAuth();

  /* ── School form ── */
  const [schoolName,    setSchoolName]    = useState('');
  const [term,          setTerm]          = useState('Term 1');
  const [academicYear,  setAcademicYear]  = useState('2026');
  const [currentWeek,   setCurrentWeek]  = useState<number>(1);
  const [address,       setAddress]      = useState('');
  const [savingSchool,  setSavingSchool]  = useState(false);

  /* ── Profile form ── */
  const [firstName,     setFirstName]    = useState('');
  const [lastName,      setLastName]     = useState('');
  const [email,         setEmail]        = useState('');
  const [phone,         setPhone]        = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      htSettingsApi.getSchool().catch(() => null),
      htSettingsApi.getProfile().catch(() => null),
    ]).then(([school, profile]) => {
      if (school) {
        setSchoolName(school.name ?? '');
        setAddress(school.address ?? '');
        if ((school as any).currentTerm)  setTerm((school as any).currentTerm);
        if ((school as any).academicYear) setAcademicYear((school as any).academicYear);
        if ((school as any).currentWeek)  setCurrentWeek(Number((school as any).currentWeek));
      }
      if (profile) {
        setFirstName(profile.firstName ?? '');
        setLastName(profile.lastName  ?? '');
        setEmail(profile.email        ?? '');
        setPhone(profile.phone        ?? '');
      } else if (user) {
        // fallback to auth context
        const parts = (user.name ?? '').split(' ');
        setFirstName(parts[0] ?? '');
        setLastName(parts.slice(1).join(' '));
        setEmail(user.email ?? '');
      }
    }).finally(() => setLoading(false));
  }, []);

  const saveSchool = async () => {
    setSavingSchool(true);
    try {
      await htSettingsApi.updateSchool({
        name: schoolName,
        address,
        currentTerm: term,
        academicYear,
        currentWeek,
      });
      toast('School settings saved ✓', 'success');
    } catch {
      toast('Could not save — backend offline', 'warning');
    } finally { setSavingSchool(false); }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await htSettingsApi.updateProfile({ firstName, lastName, email, phone });
      toast('Profile updated ✓', 'success');
    } catch {
      toast('Could not update profile — backend offline', 'warning');
    } finally { setSavingProfile(false); }
  };

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'HT';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Settings &amp; Preferences</h2>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* School Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-5">School Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">School Name</label>
                <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Term</label>
                  <select value={term} onChange={e => setTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Academic Year</label>
                  <input value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Week</label>
                <input type="number" value={currentWeek} onChange={e => setCurrentWeek(Number(e.target.value))} min={1} max={14} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">School Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none focus:border-indigo-400 focus:bg-white" />
              </div>
              <button onClick={saveSchool} disabled={savingSchool} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors">
                {savingSchool ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-[15px] font-bold text-gray-900 mb-5">Head Teacher Profile</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
                <div>
                  <div className="text-[14px] font-bold text-gray-900">{firstName} {lastName}</div>
                  <div className="text-[12px] text-gray-400">Head Teacher · {schoolName || 'SMISSI'}</div>
                  <button onClick={() => toast('Photo upload coming soon', 'info')} className="text-[12px] font-semibold text-indigo-600 hover:underline mt-1">Change photo</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
              </div>
              <button onClick={saveProfile} disabled={savingProfile} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors">
                {savingProfile ? 'Updating…' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
