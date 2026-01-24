import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Store {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
}

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const fetchStores = () => {
    client.get('/stores/me')
      .then(res => setStores(res.data))
      .catch(console.error);
  };

  // useEffect(() => {
  //   client.get('/stores/me')
  //     .then(res => {
  //       const stores = res.data;
  //       if (stores.length > 0) {
  //         // AUTO-REDIRECT to the single store manager
  //         navigate(`/owner/store/${stores[0].id}`);
  //       } else {
  //         // Stay here and show create form
  //         setShowCreate(true); 
  //       }
  //     })
  //     .catch(console.error);
  // }, []);

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/stores/', {
        name: newName,
        category: newCategory,
        // Hardcoded location for demo
        latitude: 40.7128,
        longitude: -74.0060
      });
      setShowCreate(false);
      setNewName('');
      setNewCategory('');
      fetchStores();
    } catch (err: any) {
      alert("Error creating store: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Store Manager 🏪</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">{user?.sub}</span>
            <button onClick={logout} className="text-red-600 hover:text-red-800">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Stores</h2>
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Create Store
          </button>
        </div>

        {/* Store List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map(store => (
            <div 
              key={store.id} 
              onClick={() => navigate(`/owner/store/${store.id}`)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">{store.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${store.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-500">{store.category}</p>
              <div className="mt-4 text-blue-600 text-sm font-medium">Manage Products →</div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Create New Store</h3>
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Name</label>
                  <input 
                    className="w-full border rounded p-2"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input 
                    className="w-full border rounded p-2"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="e.g. Electronics, Food"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}