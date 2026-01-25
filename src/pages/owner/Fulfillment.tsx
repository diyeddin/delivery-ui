import { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { RefreshCw, Package, CheckCircle, Truck } from 'lucide-react';

interface Order {
  id: number;
  status: string;
  total_price: number;
  items: any[];
  created_at: string;
}

export default function Fulfillment() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/store/all');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); 
    return () => clearInterval(interval);
  }, []);

  const confirmOrder = async (id: number) => {
    try {
      // SENDING 'confirmed' INSTEAD OF 'preparing'
      await client.put(`/orders/${id}/move-status`, null, { params: { status: 'confirmed' } });
      toast.success("Order confirmed and marked ready for pickup.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Update failed");
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  // 'confirmed' means the store is done, waiting for driver
  const readyOrders = orders.filter(o => o.status === 'confirmed');
  // 'assigned' or later means the driver has it
  const historyOrders = orders.filter(o => ['assigned', 'picked_up', 'in_transit', 'delivered'].includes(o.status));

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Fulfillment Terminal</h1>
            <p className="text-gray-500">Processing orders for Driver Pickup</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: PENDING (New) */}
        <div className="flex flex-col h-full">
          <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0">
             <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Incoming ({pendingOrders.length})
             </h2>
          </div>
          <div className="bg-gray-100 p-4 rounded-b-xl border border-gray-200 flex-1 space-y-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-sm text-gray-500">#{order.id}</span>
                  <span className="font-bold text-gray-900">${order.total_price}</span>
                </div>
                
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">{order.items.length} Items:</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                        {order.items.map((item: any, idx: number) => (
                            <li key={idx} className="flex gap-2">
                                <span className="font-bold text-gray-800">x{item.quantity}</span> 
                                <span className="truncate">Product #{item.product_id}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <button 
                  onClick={() => confirmOrder(order.id)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" /> Pack & Confirm
                </button>
              </div>
            ))}
            {pendingOrders.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No new orders</div>}
          </div>
        </div>

        {/* COLUMN 2: CONFIRMED (Ready for Driver) */}
        <div className="flex flex-col h-full">
          <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0">
             <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Ready for Pickup ({readyOrders.length})
             </h2>
          </div>
          <div className="bg-gray-100 p-4 rounded-b-xl border border-gray-200 flex-1 space-y-4">
            {readyOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500 opacity-90">
                <div className="flex justify-between font-bold text-lg mb-2">
                  <span>#{order.id}</span>
                  <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Confirmed
                  </span>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs text-center text-gray-500 mt-4">
                    Waiting for Driver assignment...
                </div>
              </div>
            ))}
            {readyOrders.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No confirmed orders</div>}
          </div>
        </div>

        {/* COLUMN 3: HANDED OFF */}
        <div className="flex flex-col h-full">
          <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0">
             <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                Handed Off ({historyOrders.length})
             </h2>
          </div>
          <div className="bg-gray-100 p-4 rounded-b-xl border border-gray-200 flex-1 space-y-4">
            {historyOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-60 hover:opacity-100 transition">
                 <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">#{order.id}</span>
                  <Truck className="w-5 h-5 text-gray-500" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500 bg-gray-50 p-2 rounded text-center">
                    {order.status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}