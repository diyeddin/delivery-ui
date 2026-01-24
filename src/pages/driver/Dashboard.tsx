import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

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

  // Fetch Available Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await client.get('/orders/available');
      setOrders(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Simple polling every 5 seconds to see new orders
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async (orderId: number) => {
    try {
      await client.put(`/orders/${orderId}/accept`);
      // Refresh list after accepting
      fetchOrders();
      alert(`Order #${orderId} Accepted! 🚀`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to accept order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.sub}</span>
            <button 
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Status Bar */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Available Orders ({orders.length})</h2>
          <button 
            onClick={fetchOrders}
            className="text-blue-600 hover:underline text-sm"
          >
            Refresh Now
          </button>
        </div>

        {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}

        {loading && orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Loading orders...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Total: ${order.total_price.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">#{order.id}</span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Delivery To:</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{order.delivery_address || "Standard Delivery"}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Items ({order.items.length}):</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id}>• Product #{item.product_id} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => acceptOrder(order.id)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Accept Order
                  </button>
                </div>
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No orders available right now.</p>
                <p className="text-sm text-gray-400 mt-1">New orders will appear here automatically.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}