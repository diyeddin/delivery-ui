import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, MapPin, Store as StoreIcon, Package, TrendingUp, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Settings } from 'lucide-react';

interface Store {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
}

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data State
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    lowStock: 0,
    totalProducts: 0
  });

  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newLat, setNewLat] = useState('50');
  const [newLong, setNewLong] = useState('50');

  // FETCH EVERYTHING
  const loadDashboardData = async () => {
    try {
      // 1. Get Store
      const storeRes = await client.get('/stores/me');
      if (storeRes.data.length === 0) {
        setLoading(false);
        return; // No store yet
      }
      const myStore = storeRes.data[0];
      setStore(myStore);

      // 2. Get Orders (For Revenue & Activity)
      const orderRes = await client.get('/orders/store/all');
      const allOrders = orderRes.data;
      
      // Calculate Revenue (Simple sum of all delivered orders)
      const revenue = allOrders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + o.total_price, 0);

      // Calculate Active Orders
      const active = allOrders.filter((o: any) => ['pending', 'confirmed', 'assigned', 'picked_up'].includes(o.status)).length;

      // 3. Get Products (For Inventory Health)
      const prodRes = await client.get(`/stores/${myStore.id}/products`);
      const products = prodRes.data;
      const lowStockCount = products.filter((p: any) => p.stock < 5).length;

      setStats({
        revenue,
        activeOrders: active,
        lowStock: lowStockCount,
        totalProducts: products.length
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
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
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Creation failed");
    }
  };

  // --- VIEW: LOADING ---
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading Dashboard...</div>;

  // --- VIEW: NO STORE (Empty State) ---
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MallApp!</h1>
          <p className="text-gray-500 mb-8">You haven't set up your store yet. Create one to start selling products.</p>
          <button 
            onClick={() => setShowCreate(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Launch My Store
          </button>
        </div>
        {/* Render Modal if needed */}
        {renderCreateModal()}
      </div>
    );
  }

  // --- VIEW: DASHBOARD (Main) ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <StoreIcon className="w-6 h-6 text-blue-600" />
            <span>{store.name}</span>
            <span className="text-xs font-normal text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full ml-2">
              {store.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/owner/settings')} // <--- Link to new page
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Store Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button onClick={logout} className="text-gray-400 hover:text-red-600 p-2"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* 1. Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <h2 className="text-3xl font-bold text-gray-900">${stats.revenue.toFixed(2)}</h2>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Active Orders</p>
              <h2 className="text-3xl font-bold text-blue-600">{stats.activeOrders}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Inventory Alert Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Low Stock Items</p>
              <h2 className={`text-3xl font-bold ${stats.lowStock > 0 ? 'text-orange-500' : 'text-gray-900'}`}>{stats.lowStock}</h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.lowStock > 0 ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2. Main Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Action 1: Fulfillment Terminal */}
          <div 
            onClick={() => navigate('/owner/fulfillment')}
            className="group cursor-pointer bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Fulfillment Terminal</h3>
              <p className="text-blue-100 mb-6 max-w-sm">Manage incoming orders, pack items, and hand off to drivers.</p>
              <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg font-bold hover:bg-white/20 transition">
                Open Terminal <ArrowRight className="w-4 h-4" />
              </span>
            </div>
            {/* Decorative Icon */}
            <Package className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 group-hover:scale-110 transition duration-500" />
          </div>

          {/* Action 2: Store Manager */}
          <div 
            onClick={() => navigate(`/owner/store/${store.id}`)}
            className="group cursor-pointer bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-md transition relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Inventory Manager</h3>
              <p className="text-gray-500 mb-6 max-w-sm">Add products, update prices, and manage stock levels.</p>
              <span className="inline-flex items-center gap-2 text-blue-600 font-bold group-hover:translate-x-1 transition">
                Manage Catalog <ArrowRight className="w-4 h-4" />
              </span>
            </div>
             {/* Decorative Icon */}
            <StoreIcon className="absolute -right-6 -bottom-6 w-40 h-40 text-gray-50 group-hover:text-blue-50 transition duration-500" />
          </div>
        </div>
      </main>

      {/* Helper function to keep JSX clean */}
      {renderCreateModal()} 
    </div>
  );

  function renderCreateModal() {
    if (!showCreate) return null;
    return (
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
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 transition"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Burger King"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 transition"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="e.g. Fast Food"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Map X</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5" value={newLat} onChange={e => setNewLat(e.target.value)} min="0" max="100"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Map Y</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5" value={newLong} onChange={e => setNewLong(e.target.value)} min="0" max="100"/>
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">Launch Store</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}