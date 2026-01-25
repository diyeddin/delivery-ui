import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ActiveJobs from './ActiveJobs';
import toast from 'react-hot-toast'; // Import toast

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: number;
  store_id: number;
  status: string;
  total_price: number;
  delivery_address: string;
  created_at: string;
  items: OrderItem[];
}

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // We need a trigger to refresh active jobs when a new order is accepted
  const [refreshActiveTrigger, setRefreshActiveTrigger] = useState(0);

  // Fetch Available Orders
  const fetchOrders = async () => {
    try {
      // Don't set full page loading on background refresh
      // setLoading(true); 
      const res = await client.get('/orders/available');
      setOrders(res.data);
      setError('');
    } catch (err) {
      console.error("Failed to load orders", err);
      // specific error state management depending on if it's first load or polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // Initial load only
    fetchOrders();
    // Simple polling every 5 seconds to see new orders
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async (orderId: number) => {
    try {
      await client.put(`/orders/${orderId}/accept`);
      toast.success(`Order #${orderId} Accepted! 🚀`);
      
      // 1. Remove from available list immediately for snappy UI
      setOrders(prev => prev.filter(o => o.id !== orderId));
      
      // 2. Trigger ActiveJobs component to reload
      setRefreshActiveTrigger(prev => prev + 1);
      
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to accept order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard 🚛</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm hidden sm:inline">Welcome, {user?.sub}</span>
            <button 
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. ACTIVE JOB SECTION */}
        <section>
          <ActiveJobs key={refreshActiveTrigger} /> 
          {/* Key prop forces re-render when trigger changes */}
        </section>

        {/* 2. AVAILABLE ORDERS SECTION */}
        <section>
          <div className="mb-6 flex items-center justify-between border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-800">New Opportunities ({orders.length})</h2>
            <button 
              onClick={() => fetchOrders()}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Refresh List
            </button>
          </div>

          {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {loading && orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Loading available orders...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white overflow-hidden shadow-sm hover:shadow-md transition rounded-xl border border-gray-200 flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Earn ${order.total_price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{order.id}</span>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deliver To</h3>
                      <p className="mt-1 text-base font-semibold text-gray-900 line-clamp-2">
                        {order.delivery_address || "Standard Delivery"}
                      </p>
                    </div>

                    <div className="mb-2">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Manifest</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <span>Product #{item.product_id}</span>
                            <span className="text-gray-400">x{item.quantity}</span>
                          </li>
                        ))}
                        {order.items.length > 3 && (
                          <li className="text-xs text-gray-400 italic">+ {order.items.length - 3} more items</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <div className="text-gray-400 mb-2">No orders available right now</div>
                  <p className="text-sm text-gray-500">New orders will appear here automatically.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}