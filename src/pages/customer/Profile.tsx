import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { User, MapPin, Lock, LogOut, X, Save, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeModal, setActiveModal] = useState<'info' | 'address' | 'security' | null>(null);
  
  // Local State for Forms
  const [name, setName] = useState(user?.name || user?.sub || '');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved address from LocalStorage on mount
  useEffect(() => {
    const savedAddr = localStorage.getItem('mall_default_address');
    if (savedAddr) setAddress(savedAddr);
  }, []);

  // --- HANDLERS ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calls the new PUT /users/me endpoint
      await client.put('/users/me', { name });
      toast.success("Profile updated successfully");
      setActiveModal(null);
      // Optional: Trigger a reload of the Auth Context to refresh the displayed name
      window.location.reload(); 
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP, we save to LocalStorage. 
    // Ideally, this goes to a 'user_addresses' table in DB.
    localStorage.setItem('mall_default_address', address);
    toast.success("Default address saved");
    setActiveModal(null);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for password change logic
    toast.success("Password update email sent! (Demo)");
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-4 text-4xl font-bold border-4 border-white/10 shadow-xl">
            {user?.name?.[0].toUpperCase() || user?.sub?.[0].toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold">{user?.name || user?.sub}</h1>
          <p className="opacity-80 font-medium tracking-wide mt-1 text-blue-100 uppercase text-xs">
            {user?.role?.replace('_', ' ') || 'Customer'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider ml-1">Account Settings</h3>
          
          {/* 1. ADDRESSES */}
          <button 
            onClick={() => setActiveModal('address')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition text-left group bg-white shadow-sm"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition"><MapPin className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">Delivery Address</div>
              <div className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-sm">
                {address || "Set a default delivery address"}
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-blue-500">→</span>
          </button>

          {/* 2. PERSONAL INFO */}
          <button 
            onClick={() => setActiveModal('info')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition text-left group bg-white shadow-sm"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition"><User className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">Personal Info</div>
              <div className="text-sm text-gray-500">Update your display name</div>
            </div>
            <span className="text-gray-300 group-hover:text-blue-500">→</span>
          </button>

          {/* 3. SECURITY */}
          <button 
            onClick={() => setActiveModal('security')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition text-left group bg-white shadow-sm"
          >
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition"><Lock className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">Security</div>
              <div className="text-sm text-gray-500">Change password</div>
            </div>
            <span className="text-gray-300 group-hover:text-blue-500">→</span>
          </button>

          <div className="pt-6 border-t border-gray-100">
             <button onClick={logout} className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 transition">
               <LogOut className="w-5 h-5" /> Sign Out
             </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Address Modal */}
      {activeModal === 'address' && (
        <Modal title="Delivery Address" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Default Address</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="123 Main St, Apt 4B..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-2">This will be used as your default for checkout.</p>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Address
            </button>
          </form>
        </Modal>
      )}

      {/* 2. Personal Info Modal */}
      {activeModal === 'info' && (
        <Modal title="Personal Info" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={user?.sub} 
                disabled 
                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-3 cursor-not-allowed"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Profile
            </button>
          </form>
        </Modal>
      )}

      {/* 3. Security Modal (Placeholder) */}
      {activeModal === 'security' && (
        <Modal title="Security" onClose={() => setActiveModal(null)}>
          <form onSubmit={handlePasswordChange} className="space-y-4">
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg">
              Update Password
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}

// Simple Reusable Modal Component
function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}