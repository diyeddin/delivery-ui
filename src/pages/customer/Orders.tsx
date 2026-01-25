import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Package, Truck, CheckCircle, Clock, 
  MapPin, ChevronRight, ShoppingBag, ArrowLeft 
} from 'lucide-react';

interface OrderItem {
  product_id: number;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at?: string;
  items: OrderItem[];
  store_id: number;
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/me');
      // Sort: Newest first
      setOrders(res.data.sort((a: Order, b: Order) => b.id - a.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 10 seconds to update tracking status
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- HELPER: Status Colors & Icons ---
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4"/>, label: 'Order Placed' };
      case 'confirmed': return { color: 'bg-blue-100 text-blue-700', icon: <Package className="w-4 h-4"/>, label: 'Packing' };
      case 'assigned': 
      case 'picked_up': 
      case 'in_transit': return { color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-4 h-4"/>, label: 'On the Way' };
      case 'delivered': return { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4"/>, label: 'Delivered' };
      case 'cancelled': return { color: 'bg-red-100 text-red-700', icon: <Clock className="w-4 h-4"/>, label: 'Cancelled' };
      default: return { color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4"/>, label: status };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date unknown";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Date unknown" : format(date, 'MMM d, h:mm a');
  };

  // --- FILTERING ---
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  if (loading) return <div className="p-12 text-center text-gray-500">Loading your orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm">Track active deliveries and view history.</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>
        </div>

        {/* --- ACTIVE ORDERS SECTION --- */}
        {activeOrders.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> In Progress
            </h2>
            
            {activeOrders.map(order => {
              const status = getStatusConfig(order.status);
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden relative">
                  {/* Progress Bar Animation for Transit */}
                  {['assigned', 'picked_up', 'in_transit'].includes(order.status) && (
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 w-full animate-progress-loading"></div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 uppercase tracking-wide ${status.color}`}>
                             {status.icon} {status.label}
                           </span>
                           <span className="text-xs text-gray-400 font-mono">#{order.id}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${order.total_price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                      </div>
                    </div>

                    {/* VISUAL TRACKER */}
                    <div className="relative pt-4 pb-2 px-2">
                      {/* Grey Line */}
                      <div className="h-1 bg-gray-100 rounded-full w-full absolute top-1/2 -translate-y-1/2 z-0"></div>
                      
                      {/* Active Line (Calculated Width) */}
                      <div 
                        className="h-1 bg-blue-600 rounded-full absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-1000"
                        style={{ width: 
                          order.status === 'pending' ? '5%' :
                          order.status === 'confirmed' ? '35%' :
                          ['assigned', 'picked_up', 'in_transit'].includes(order.status) ? '65%' :
                          '100%'
                        }}
                      ></div>

                      <div className="flex justify-between relative translate-y-1.5 z-10 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {/* Step 1 */}
                        <div className={`flex flex-col items-center gap-2 ${['pending', 'confirmed', 'assigned', 'picked_up', 'delivered'].includes(order.status) ? 'text-blue-600' : ''}`}>
                          <div className={`w-4 h-4 rounded-full border-2 ${['pending', 'confirmed', 'assigned', 'picked_up', 'delivered'].includes(order.status) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}></div>
                          Ordered
                        </div>
                        {/* Step 2 */}
                        <div className={`flex flex-col items-center gap-2 ${['confirmed', 'assigned', 'picked_up', 'delivered'].includes(order.status) ? 'text-blue-600' : ''}`}>
                          <div className={`w-4 h-4 rounded-full border-2 ${['confirmed', 'assigned', 'picked_up', 'delivered'].includes(order.status) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}></div>
                          Packing
                        </div>
                        {/* Step 3 */}
                        <div className={`flex flex-col items-center gap-2 ${['assigned', 'picked_up', 'in_transit', 'delivered'].includes(order.status) ? 'text-purple-600' : ''}`}>
                          <div className={`w-4 h-4 rounded-full border-2 ${['assigned', 'picked_up', 'in_transit', 'delivered'].includes(order.status) ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}></div>
                          Driver
                        </div>
                        {/* Step 4 */}
                        <div className={`flex flex-col items-center gap-2`}>
                          <div className="w-4 h-4 rounded-full border-2 bg-white border-gray-300"></div>
                          Delivered
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* --- PAST ORDERS SECTION --- */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order History</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {pastOrders.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {order.status === 'delivered' ? <ShoppingBag className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-gray-900">Order #{order.id}</p>
                       {order.status === 'cancelled' && <span className="text-[10px] bg-red-100 text-red-600 px-2 rounded-full font-bold uppercase">Cancelled</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(order.created_at)} • {order.items?.length || 0} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">${order.total_price.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
                </div>
              </div>
            ))}
            
            {pastOrders.length === 0 && activeOrders.length === 0 && (
               <div className="p-12 text-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <ShoppingBag className="w-8 h-8 text-gray-400" />
                 </div>
                 <h3 className="text-gray-900 font-bold">No orders yet</h3>
                 <p className="text-gray-500 text-sm mt-1">Start shopping to see your orders here.</p>
                 <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold hover:underline">Browse Products</button>
               </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}