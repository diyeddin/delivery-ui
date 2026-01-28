import { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Search, User, Briefcase, Truck, Shield } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      // We need a backend endpoint for this. 
      // Ensure GET /users/ is implemented for Admins
      const res = await client.get('/users/'); 
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: number, newRole: string) => {
    if (!window.confirm(`Are you sure you want to promote this user to ${newRole}?`)) return;
    
    try {
      // Assuming you have a generic update endpoint or specific role endpoint
      // You might need to add PUT /users/{id}/role to your backend
      await client.put(`/users/${userId}/role`, { role: newRole });
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Update failed");
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'store_owner': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'driver': return <Truck className="w-4 h-4 text-orange-600" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by email..." 
            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Current Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Created At</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-400">ID: {user.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 bg-gray-100 w-fit px-3 py-1 rounded-full text-sm capitalize">
                    {getRoleIcon(user.role)}
                    {user.role.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role === 'customer' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => updateUserRole(user.id, 'store_owner')}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition"
                      >
                        Make Owner
                      </button>
                      <button 
                        onClick={() => updateUserRole(user.id, 'driver')}
                        className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded hover:bg-orange-100 transition"
                      >
                        Make Driver
                      </button>
                    </div>
                  )}
                  {user.role !== 'customer' && user.role !== 'admin' && (
                     <button 
                        onClick={() => updateUserRole(user.id, 'customer')}
                        className="text-xs font-bold text-gray-500 hover:text-red-600 hover:underline"
                      >
                        Demote to Customer
                      </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}