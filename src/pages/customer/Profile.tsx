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
      await client.put('/users/me', { name });
      toast.success("Profile updated successfully");
      setActiveModal(null);
      window.location.reload(); 
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mall_default_address', address);
    toast.success("Default address saved");
    setActiveModal(null);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password update email sent! (Demo)");
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-creme pt-28 pb-10 px-4 selection:bg-gold-500 selection:text-white">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gold-100 overflow-hidden animate-fade-in-up">
        
        {/* Luxury Header */}
        <div className="bg-onyx p-10 text-white text-center relative overflow-hidden">
          {/* Abstract Gold Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-onyx border-2 border-gold-500 rounded-full mx-auto flex items-center justify-center mb-4 text-4xl font-serif font-bold text-gold-400 shadow-2xl">
              {user?.name?.[0].toUpperCase() || user?.sub?.[0].toUpperCase()}
            </div>
            <h1 className="text-3xl font-serif font-bold text-gold-50">{user?.name || user?.sub}</h1>
            <p className="opacity-80 font-medium tracking-[0.2em] mt-2 text-gold-400/80 uppercase text-[10px]">
              {user?.role?.replace('_', ' ') || 'Customer'} Member
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <h3 className="text-gray-400 uppercase text-xs font-bold tracking-[0.2em] ml-1">Concierge Settings</h3>
          
          {/* 1. ADDRESSES */}
          <button 
            onClick={() => setActiveModal('address')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold-400 hover:bg-creme/30 transition-all duration-300 text-left group bg-white shadow-sm"
          >
            <div className="p-3 bg-gold-50 text-gold-600 rounded-lg group-hover:bg-gold-500 group-hover:text-onyx transition-colors"><MapPin className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="font-bold font-serif text-onyx text-lg">Delivery Address</div>
              <div className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-sm font-light">
                {address || "Set a default delivery address"}
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-gold-500 transition-colors">→</span>
          </button>

          {/* 2. PERSONAL INFO */}
          <button 
            onClick={() => setActiveModal('info')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold-400 hover:bg-creme/30 transition-all duration-300 text-left group bg-white shadow-sm"
          >
            <div className="p-3 bg-gray-100 text-onyx rounded-lg group-hover:bg-onyx group-hover:text-gold-400 transition-colors"><User className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="font-bold font-serif text-onyx text-lg">Personal Info</div>
              <div className="text-sm text-gray-500 font-light">Update your display name</div>
            </div>
            <span className="text-gray-300 group-hover:text-gold-500 transition-colors">→</span>
          </button>

          {/* 3. SECURITY */}
          <button 
            onClick={() => setActiveModal('security')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold-400 hover:bg-creme/30 transition-all duration-300 text-left group bg-white shadow-sm"
          >
            <div className="p-3 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-gray-200 group-hover:text-onyx transition-colors"><Lock className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="font-bold font-serif text-onyx text-lg">Security</div>
              <div className="text-sm text-gray-500 font-light">Change password</div>
            </div>
            <span className="text-gray-300 group-hover:text-gold-500 transition-colors">→</span>
          </button>

          <div className="pt-6 border-t border-gray-100">
             <button onClick={logout} className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 transition tracking-wide text-sm uppercase">
               <LogOut className="w-4 h-4" /> Sign Out
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Default Address</label>
              <textarea 
                className="w-full border border-gray-200 rounded-lg p-3 h-28 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-none bg-gray-50 text-onyx"
                placeholder="123 Main St, Apt 4B..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <p className="text-xs text-gold-600 mt-2 italic">This will be used as your default for checkout.</p>
            </div>
            <button type="submit" className="w-full bg-onyx hover:bg-gray-800 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all">
              <Save className="w-4 h-4 text-gold-500" /> Save Address
            </button>
          </form>
        </Modal>
      )}

      {/* 2. Personal Info Modal */}
      {activeModal === 'info' && (
        <Modal title="Personal Info" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
              <input 
                type="text"
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none bg-gray-50 text-onyx"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
              <input 
                type="email" 
                value={user?.sub} 
                disabled 
                className="w-full border border-gray-200 bg-gray-100 text-gray-400 rounded-lg p-3 cursor-not-allowed"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-onyx font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Profile
            </button>
          </form>
        </Modal>
      )}

      {/* 3. Security Modal */}
      {activeModal === 'security' && (
        <Modal title="Security" onClose={() => setActiveModal(null)}>
          <form onSubmit={handlePasswordChange} className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-lg p-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Confirm Password</label>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-lg p-3 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none bg-gray-50" />
            </div>
            <button type="submit" className="w-full bg-onyx hover:bg-gray-800 text-white font-bold py-3.5 rounded-lg transition-all">
              Update Password
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}

// Reusable Modal Component
function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-onyx/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up border border-gold-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-creme">
          <h3 className="font-serif font-bold text-xl text-onyx">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gold-100 rounded-full transition text-gray-500 hover:text-onyx"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}