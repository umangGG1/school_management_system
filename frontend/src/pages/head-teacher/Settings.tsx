import { useToast } from '../../contexts/ToastContext';

export default function HTSettings() {
  const { toast } = useToast();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-gray-900">Settings & Preferences</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* School Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">School Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">School Name</label>
              <input defaultValue="SMISSI Secondary School" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Term</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400">
                <option>Term 1, 2026</option><option>Term 2, 2026</option><option>Term 3, 2025</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Week</label>
              <input type="number" defaultValue={8} min={1} max={14} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">School Address</label>
              <textarea defaultValue="P.O. Box 123, Kampala, Uganda" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 min-h-[70px] resize-y focus:outline-none focus:border-indigo-400" />
            </div>
            <button onClick={() => toast('Settings saved ✓', 'success')} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Save Changes</button>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">Head Teacher Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">JS</div>
              <div>
                <div className="text-[14px] font-bold text-gray-900">Mr. Ssemanda Julius</div>
                <div className="text-[12px] text-gray-400">Head Teacher · SMISSI</div>
                <button onClick={() => toast('Opening photo upload...', 'info')} className="text-[12px] font-semibold text-indigo-600 hover:underline mt-1">Change photo</button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input defaultValue="Mr. Ssemanda Julius" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" defaultValue="j.ssemanda@smissi.ac.ug" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
              <input defaultValue="+256 700 000 001" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
            </div>
            <button onClick={() => toast('Profile updated ✓', 'success')} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Update Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}
