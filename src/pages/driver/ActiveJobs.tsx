import { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Package, MapPin, CheckCircle, Navigation, Truck, Store } from 'lucide-react';

interface Order {
  id: number;
  status: string;
  total_price: number;
  delivery_address: string;
  store_id: number;
  items: any[];
}

export default function ActiveJobs() {
  // Changed from activeOrder (single) to activeJobs (array)
  const [activeJobs, setActiveJobs] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveJobs = async () => {
    try {
      const res = await client.get('/orders/assigned-to-me');
      
      // Filter for ALL active jobs
      const ongoing = res.data.filter((o: Order) => 
        ['assigned', 'picked_up', 'in_transit'].includes(o.status)
      );
      setActiveJobs(ongoing);
    } catch (err) {
      console.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      await client.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId} updated!`);
      fetchActiveJobs();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Syncing manifest...</div>;

  if (activeJobs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
        <p className="text-gray-500 mt-2">Check the list below to accept new opportunities.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Navigation className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Current Manifest ({activeJobs.length})</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {activeJobs.map((job) => {
          const isAssigned = job.status === 'assigned';
          const isPickedUp = job.status === 'picked_up';

          return (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative group">
              
              {/* Status Header */}
              <div className={`p-4 text-white font-bold flex justify-between items-center ${isAssigned ? 'bg-indigo-600' : 'bg-green-600'}`}>
                <span className="flex items-center gap-2">
                   {isAssigned ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                   {isAssigned ? 'Go to Store' : 'Go to Customer'}
                </span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded uppercase tracking-wider">
                  #{job.id}
                </span>
              </div>

              <div className="p-6 flex-1 space-y-4">
                {/* Address Info */}
                <div className="flex gap-3">
                  <MapPin className={`w-5 h-5 flex-shrink-0 mt-1 ${isAssigned ? 'text-indigo-600' : 'text-green-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {isAssigned ? 'Pickup Location' : 'Dropoff Location'}
                    </p>
                    <p className="font-semibold text-gray-900 text-lg leading-tight">
                      {isAssigned ? `Store #${job.store_id}` : (job.delivery_address || "Standard Delivery")}
                    </p>
                  </div>
                </div>

                {/* Items Info */}
                <div className="flex gap-3">
                  <Package className="w-5 h-5 flex-shrink-0 mt-1 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cargo</p>
                    <p className="text-gray-600">{job.items.length} items • Total: ${job.total_price}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                {isAssigned && (
                  <button 
                    onClick={() => updateStatus(job.id, 'picked_up')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    Confirm Pickup
                  </button>
                )}

                {isPickedUp && (
                  <button 
                    onClick={() => updateStatus(job.id, 'delivered')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Complete Delivery
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}