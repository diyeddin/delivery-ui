import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at?: string; // Mark as optional to be safe
  store_id: number;
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/orders/me')
      .then(res => setOrders(res.data.reverse()))
      .catch(console.error);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Safe Date Formatter
  const formatTime = (dateString?: string) => {
    if (!dateString) return "Date unknown";
    const date = new Date(dateString);
    // Check if date is valid before using library
    return isNaN(date.getTime()) 
      ? "Date unknown" 
      : `Placed ${formatDistanceToNow(date)} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Back to Shop</button>
        </div>

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-lg text-gray-900">Order #{order.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                {/* USE THE SAFE FUNCTION HERE */}
                <p className="text-gray-500 text-sm">
                  {formatTime(order.created_at)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">${order.total_price.toFixed(2)}</p>
                <button 
                  className="text-sm text-gray-400 hover:text-gray-600 mt-1"
                  onClick={() => alert("Details view coming next!")}
                >
                  View Receipt
                </button>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              You haven't placed any orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}