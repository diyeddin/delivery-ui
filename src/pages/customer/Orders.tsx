import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Package, Truck, CheckCircle, Clock, 
  ChevronDown, ShoppingBag, ArrowLeft 
} from 'lucide-react';

interface OrderItem {
  product_id: number;
  quantity: number;
  product_name?: string; 
  price?: number;
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
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/me');
      setOrders(res.data.sort((a: Order, b: Order) => b.id - a.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); 
    return () => clearInterval(interval);
  }, []);

  const toggleOrder = (id: number) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // --- REFINED COLOR PALETTE (Distinct but Luxury) ---
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': 
        return { 
          color: 'text-amber-700 bg-amber-50 border-amber-200', 
          barColor: 'bg-amber-500',
          icon: <Clock className="w-4 h-4"/>, 
          label: 'Order Placed', 
          progress: 5 
        };
      case 'confirmed': 
        return { 
          color: 'text-slate-700 bg-slate-100 border-slate-200', 
          barColor: 'bg-slate-600',
          icon: <Package className="w-4 h-4"/>, 
          label: 'Packing', 
          progress: 35 
        };
      case 'assigned': 
      case 'picked_up': 
      case 'in_transit': 
        return { 
          color: 'text-indigo-700 bg-indigo-50 border-indigo-100', 
          barColor: 'bg-indigo-600',
          icon: <Truck className="w-4 h-4"/>, 
          label: 'En Route', 
          progress: 65 
        };
      case 'delivered': 
        return { 
          color: 'text-emerald-800 bg-emerald-50 border-emerald-100', 
          barColor: 'bg-emerald-600',
          icon: <CheckCircle className="w-4 h-4"/>, 
          label: 'Delivered', 
          progress: 100 
        };
      case 'cancelled': 
        return { 
          color: 'text-red-800 bg-red-50 border-red-100', 
          barColor: 'bg-red-600',
          icon: <Clock className="w-4 h-4"/>, 
          label: 'Cancelled', 
          progress: 0 
        };
      default: 
        return { 
          color: 'text-gray-500 bg-gray-50 border-gray-100', 
          barColor: 'bg-gray-400',
          icon: <Clock className="w-4 h-4"/>, 
          label: status, 
          progress: 0 
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Unknown Date" : format(date, 'MMM d, h:mm a');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-creme pt-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
        <p className="text-gold-600 font-serif italic">Retrieving your collection...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-creme pt-28 pb-10 px-4 selection:bg-gold-500 selection:text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif text-onyx">My Orders</h1>
            <p className="text-gray-500 mt-1 font-light">Track your active deliveries and purchase history.</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-gray-500 hover:text-gold-600 font-medium transition px-4 py-2 hover:bg-white rounded-lg group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Shop
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gold-100 p-16 text-center">
            <div className="w-20 h-20 bg-creme rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-100">
              <ShoppingBag className="w-10 h-10 text-gold-300" />
            </div>
            <h3 className="text-2xl font-serif text-onyx mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto font-light">Your collection is empty. Explore our shops to start your journey.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-onyx text-white px-8 py-3 rounded-full font-bold hover:bg-gold-500 hover:text-onyx transition-all shadow-lg duration-300"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = getStatusConfig(order.status);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'shadow-xl border-gold-300 ring-1 ring-gold-100 scale-[1.01]' 
                      : 'shadow-sm border-gray-100 hover:border-gold-200'
                  }`}
                >
                  {/* --- COLLAPSED ROW --- */}
                  <div 
                    onClick={() => toggleOrder(order.id)}
                    className="p-6 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      {/* Icon Box (Color Coded) */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border ${status.color}`}>
                        {status.icon}
                      </div>
                      
                      {/* Info Text */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-serif font-bold text-onyx text-xl">Order #{order.id}</h3>
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                          {formatDate(order.created_at)} 
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          {order.items.length} items
                        </p>
                      </div>
                    </div>

                    {/* Price & Chevron */}
                    <div className="flex items-center gap-8">
                      <span className="font-serif text-xl text-onyx">${order.total_price.toFixed(2)}</span>
                      <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-onyx text-gold-400 rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gold-50 group-hover:text-gold-600'}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* --- EXPANDED DETAILS --- */}
                  <div 
                    className={`border-t border-gray-50 bg-creme/30 transition-all duration-500 ease-in-out ${
                      isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <div className="p-8">
                      
                      {/* 1. PROGRESS BAR (Color Coded) */}
                      {!['delivered', 'cancelled'].includes(order.status) && (
                        <div className="mb-10">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Order Status</h4>
                          <div className="relative mx-4">
                            {/* Gray Background Line */}
                            <div className="h-1 bg-gray-200 w-full absolute top-1/2 -translate-y-1/2 z-0"></div>
                            
                            {/* Active Progress Line (Dynamic Color) */}
                            <div 
                              className={`h-1 absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-1000 ease-out shadow-sm ${status.barColor}`}
                              style={{ width: `${status.progress}%` }}
                            ></div>

                            {/* Steps */}
                            <div className="flex justify-between relative z-10 translate-y-3">
                              <Step label="Ordered" active={status.progress >= 5} activeColor={status.barColor} />
                              <Step label="Packing" active={status.progress >= 35} activeColor={status.barColor} />
                              <Step label="En Route" active={status.progress >= 65} activeColor={status.barColor} />
                              <Step label="Delivered" active={status.progress >= 100} activeColor={status.barColor} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. ITEMS LIST */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Purchased Items</h4>
                        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center text-sm group hover:bg-creme/50 transition">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-onyx text-white rounded-lg flex items-center justify-center font-serif font-bold text-sm shadow-md">
                                  {item.quantity}x
                                </div>
                                <span className="text-onyx font-medium font-serif text-lg">
                                  {item.product_name || `Product #${item.product_id}`}
                                </span>
                              </div>
                              <span className="text-gray-500 font-bold">
                                {item.price ? `$${(item.price * item.quantity).toFixed(2)}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT FOR STEPS ---
function Step({ label, active, activeColor }: { label: string, active: boolean, activeColor: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* The Dot */}
      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
        active ? `${activeColor} border-white shadow-md scale-125` : 'bg-creme border-gray-300'
      }`}></div>
      
      {/* The Label */}
      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
        active ? 'text-onyx' : 'text-gray-300'
      }`}>
        {label}
      </span>
    </div>
  );
}