import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Users, BarChart3, LogOut } from 'lucide-react';
import UserManagement from './UserManagement';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-lg tracking-wide">Admin Control</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-400">{user?.sub}</span>
             <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="col-span-12 md:col-span-3">
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <nav className="p-2 space-y-1">
                   <button 
                     onClick={() => setActiveTab('users')}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'users' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                   >
                     <Users className="w-5 h-5" /> User Roles
                   </button>
                   <button 
                     onClick={() => setActiveTab('stats')}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'stats' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                   >
                     <BarChart3 className="w-5 h-5" /> System Stats
                   </button>
                </nav>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9">
             {activeTab === 'users' && <UserManagement />}
             
             {activeTab === 'stats' && (
               <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
                 <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                 <h3 className="text-lg font-bold text-gray-900">System Analytics</h3>
                 <p>Global sales and traffic data coming soon.</p>
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}