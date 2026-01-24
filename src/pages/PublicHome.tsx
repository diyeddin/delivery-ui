import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

interface Store {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
}

export default function PublicHome() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    // This endpoint is public!
    client.get('/stores/')
      .then(res => setStores(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-24 px-6 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          The Mall, <span className="text-blue-400">Delivered.</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Shop from your favorite local stores and get it delivered in minutes.
          Electronics, Food, Fashion - all in one app.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition"
          >
            Sign In
          </button>
          <button 
            className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-3 rounded-full font-bold transition"
          >
            Become a Partner
          </button>
        </div>
      </div>

      {/* Store Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Stores</h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stores.map(store => (
            <div 
              key={store.id} 
              className="group cursor-pointer"
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-xl mb-4 overflow-hidden">
                {/* Placeholder Image Generator based on Store Name */}
                <img 
                  src={`https://placehold.co/600x400?text=${encodeURIComponent(store.name)}`} 
                  alt={store.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                {store.name}
              </h3>
              <p className="text-sm text-gray-500">{store.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2026 Mall Delivery Inc. Built with FastAPI & React.</p>
        </div>
      </footer>
    </div>
  );
}