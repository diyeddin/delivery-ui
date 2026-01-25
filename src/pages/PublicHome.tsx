import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import MallMap from '../components/MallMap';
import PublicNavbar from '../components/PublicNavbar'; // Import the new Navbar

interface Store {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
}

export default function PublicHome() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    client.get('/stores/')
      .then(res => setStores(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Global Public Navbar (Handles Auth State) */}
      <PublicNavbar />

      {/* 2. Modern Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-6 text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:max-w-2xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              The Mall, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Reimagined.
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Shop from your favorite local stores and get it delivered in minutes.
              Experience the future of retail with our interactive digital twin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-blue-900/50"
              >
                Start Shopping
              </button>
              <button 
                className="bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition"
              >
                Become a Partner
              </button>
            </div>
          </div>
          
          {/* Hero Illustration (Right side placeholder) */}
          <div className="hidden lg:block mt-10 lg:mt-0 relative">
             <div className="w-[450px] h-[350px] bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl flex items-center justify-center relative z-10 rotate-3 hover:rotate-0 transition duration-500 group">
                <span className="text-gray-500 font-mono text-lg group-hover:text-blue-400 transition">
                  Interactive Visualization
                </span>
             </div>
             <div className="absolute top-8 -right-8 w-[450px] h-[350px] bg-gray-800/50 rounded-2xl border border-gray-700 -z-0"></div>
          </div>
        </div>
      </div>

      {/* 3. Map Section */}
      <div id="map" className="bg-gray-50 py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Interactive Floor Plan 🗺️</h2>
            <p className="text-gray-500 mt-2">Tap on any store to visit instantly.</p>
          </div>
          
          <MallMap stores={stores} />
        </div>
      </div>

      {/* 4. Store Grid Section */}
      <div id="stores" className="max-w-7xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Stores</h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stores.map(store => (
            <div 
              key={store.id} 
              className="group cursor-pointer"
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <div className="aspect-[16/9] bg-gray-100 rounded-2xl mb-4 overflow-hidden shadow-sm group-hover:shadow-md transition border border-gray-100">
                <img 
                  src={`https://placehold.co/600x400/f3f4f6/a1a1aa?text=${encodeURIComponent(store.name)}`} 
                  alt={store.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                {store.name}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{store.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2026 MallApp Inc. Built with FastAPI & React.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}