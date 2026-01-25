import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, MapPin, Store as StoreIcon, Utensils, Box } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [newLat, setNewLat] = useState('50'); // Default center
  const [newLong, setNewLong] = useState('50'); // Default center

  const fetchStores = async () => {
    try {
      const res = await client.get('/stores/me');
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/stores/', {
        name: newName,
        category: newCategory,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLong)
      });
      toast.success("Store created successfully!");
      setShowCreate(false);
      setNewName('');
      setNewCategory('');
      fetchStores();
    } catch (err: any) {
      toast.error("Error creating store: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Owner Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <StoreIcon className="w-6 h-6 text-blue-600" />
              Owner Portal
            </h1>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex gap-1">
              <Link 
                to="/owner" 
                className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
              >
                Overview
              </Link>
              {stores.length > 0 && (
                <Link 
                  to="/owner/fulfillment" 
                  className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center gap-2"
                >
                  <Box className="w-4 h-4" /> Fulfillment
                </Link>
              )}
            </nav>
          </div>

          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.sub}</span>
            <button 
              onClick={logout} 
              className="text-gray-400 hover:text-red-600 transition p-2"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Stores</h2>
            <p className="text-gray-500 text-sm mt-1">Manage inventory and settings.</p>
          </div>
          {stores.length === 0 && (
            <button 
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Store
            </button>
          )}
        </div>

        {/* Store List */}
        {stores.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map(store => (
              <div 
                key={store.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                      <StoreIcon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {store.is_active ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{store.name}</h3>
                  <p className="text-gray-500 text-sm">{store.category}</p>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={() => navigate(`/owner/store/${store.id}`)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    Manage Products
                  </button>
                  <button 
                    onClick={() => navigate('/owner/fulfillment')}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                  >
                    Order Fulfillment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <StoreIcon className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No stores yet</h3>
            <p className="text-gray-500 mb-6">Create your first store to start selling.</p>
            <button 
              onClick={() => setShowCreate(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              Create Store Now
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Launch New Store</h3>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <form onSubmit={handleCreateStore} className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g. Burger King"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="e.g. Fast Food"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Map X (0-100)
                    </label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                      value={newLat}
                      onChange={e => setNewLat(e.target.value)}
                      placeholder="50"
                      min="0" max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Map Y (0-100)
                    </label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                      value={newLong}
                      onChange={e => setNewLong(e.target.value)}
                      placeholder="50"
                      min="0" max="100"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                  >
                    Launch Store
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