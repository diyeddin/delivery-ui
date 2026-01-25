import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Lock, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-4 text-3xl font-bold">
            {user?.sub?.[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{user?.sub}</h1>
          <p className="opacity-80">Customer Account</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Account Settings</h3>
            
            <button className="w-full flex items-center gap-4 p-4 rounded-xl border hover:border-blue-500 hover:bg-blue-50 transition text-left group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white"><MapPin className="w-5 h-5 text-gray-600" /></div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">Delivery Addresses</div>
                <div className="text-sm text-gray-500">Manage your saved locations</div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center gap-4 p-4 rounded-xl border hover:border-blue-500 hover:bg-blue-50 transition text-left group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white"><User className="w-5 h-5 text-gray-600" /></div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">Personal Info</div>
                <div className="text-sm text-gray-500">Update name and phone</div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center gap-4 p-4 rounded-xl border hover:border-blue-500 hover:bg-blue-50 transition text-left group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white"><Lock className="w-5 h-5 text-gray-600" /></div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">Security</div>
                <div className="text-sm text-gray-500">Change password</div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          <div className="pt-6 border-t">
             <button onClick={logout} className="flex items-center gap-2 text-red-600 font-bold hover:text-red-700">
               <LogOut className="w-5 h-5" /> Sign Out
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}