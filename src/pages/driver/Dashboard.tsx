import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ActiveJobs from './ActiveJobs';
import toast from 'react-hot-toast';
import { RefreshCw, LogOut, Truck, DollarSign, MapPin } from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
}

interface Order {
  id: number;
  store_id: number;
  status: string;
  total_price: number;
  delivery_address: string;
  items: OrderItem[];
}

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // This state forces ActiveJobs to reload when we accept a new order
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchOrders = async () => {
    try {
      // Fetch orders that stores have CONFIRMED (ready for pickup)
      const res = await client.get('/orders/available');
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new available orders every 5s
    const interval = setInterval(fetchOrders, 5000); 
    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async (orderId: number) => {
    try {
      await client.put(`/orders/${orderId}/accept`);
      toast.success("Order Accepted 🚀");
      
      // 1. Remove from 'Available' list instantly
      setOrders(prev => prev.filter(o => o.id !== orderId));
      
      // 2. Trigger 'ActiveJobs' to refresh so the new card appears at the top
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to accept order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile-Friendly Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-500/30 shadow-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Driver App</h1>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">{user?.sub}</span>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        
        {/* SECTION 1: MY ACTIVE MANIFEST */}
        {/* passing 'key' forces a re-render/re-fetch when refreshTrigger changes */}
        <ActiveJobs key={refreshTrigger} />

        {/* SECTION 2: AVAILABLE MARKETPLACE */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              New Opportunities
              {orders.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  {orders.length}
                </span>
              )}
            </h2>
            <button 
              onClick={() => fetchOrders()}
              className="text-gray-500 hover:text-blue-600 transition p-2 hover:bg-gray-100 rounded-full"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-bold bg-green-50 text-green-700 border border-green-100">
                      <DollarSign className="w-3 h-3" />
                      {order.total_price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">#{order.id}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                       <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 relative">
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
                       </div>
                       <div>
                         <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pickup</p>
                         <p className="text-sm font-bold text-gray-900">Store #{order.store_id}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                       <div>
                         <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Dropoff</p>
                         <p className="text-sm font-medium text-gray-900 line-clamp-1">
                           {order.delivery_address || "Standard Delivery"}
                         </p>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-medium">{order.items.length} Packages</span>
                    <span>Standard Route</span>
                  </div>

                  <button
                    onClick={() => acceptOrder(order.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    Accept Job
                  </button>
                </div>
              </div>
            ))}

            {orders.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium mb-1">No orders available</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">Waiting for stores to pack & confirm new orders.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}