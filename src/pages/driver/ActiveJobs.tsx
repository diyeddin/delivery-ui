import { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Package, MapPin, CheckCircle, Navigation } from 'lucide-react';

interface Order {
  id: number;
  status: string;
  total_price: number;
  delivery_address: string;
  store_id: number;
  items: any[];
}

export default function ActiveJobs() {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveJob = async () => {
    try {
      // Use the 'assigned-to-me' endpoint we fixed in the backend earlier
      const res = await client.get('/orders/assigned-to-me');
      
      // Filter for active jobs only (not delivered/cancelled)
      const ongoing = res.data.find((o: Order) => 
        ['assigned', 'picked_up', 'in_transit'].includes(o.status)
      );
      setActiveOrder(ongoing || null);
    } catch (err) {
      console.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJob();
  }, []);

  const updateStatus = async (newStatus: string) => {
    if (!activeOrder) return;
    try {
      await client.put(`/orders/${activeOrder.id}/status`, { status: newStatus });
      toast.success(`Status updated to: ${newStatus.replace('_', ' ')}`);
      fetchActiveJob();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading job data...</div>;

  if (!activeOrder) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center border border-gray-100">
        <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
        <p className="text-gray-500 mt-2">You have no active deliveries. Go to the dashboard to accept new ones.</p>
      </div>
    );
  }

  // Determine UI based on status
  const isAssigned = activeOrder.status === 'assigned';
  const isPickedUp = activeOrder.status === 'picked_up';
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6" /> 
            Current Delivery #{activeOrder.id}
          </h2>
          <p className="opacity-90 mt-1">Status: <span className="font-mono bg-blue-700 px-2 py-0.5 rounded uppercase">{activeOrder.status.replace('_', ' ')}</span></p>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-3">Delivery Details</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Destination</p>
                  <p className="text-gray-600">{activeOrder.delivery_address || "No address provided"}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Order Items</p>
                  <p className="text-gray-600">{activeOrder.items.length} items • ${activeOrder.total_price}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col justify-center">
            <h3 className="text-center font-bold text-gray-900 mb-4">Action Required</h3>
            
            {isAssigned && (
              <button 
                onClick={() => updateStatus('picked_up')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Confirm Pickup
              </button>
            )}

            {isPickedUp && (
              <button 
                onClick={() => updateStatus('delivered')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Delivery
              </button>
            )}
            
            {!isAssigned && !isPickedUp && (
               <div className="text-center text-gray-500 font-medium">Delivery in progress...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}