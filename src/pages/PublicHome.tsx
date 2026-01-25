import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import MallMap from '../components/MallMap';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext'; // Import Auth Context

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
  const { user } = useAuth(); // Get current user state
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    client.get('/stores/')
      .then(res => setStores(res.data))
      .catch(console.error);
  }, []);

  // Smart Navigation Handler
  const handleStartShopping = () => {
    if (user) {
      // If logged in, go straight to the marketplace
      navigate('/explore');
    } else {
      // If guest, go to login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Global Public Navbar */}
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
                onClick={handleStartShopping}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-blue-900/50 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Shopping
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition"
              >
                Create Account
              </button>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="hidden lg:block mt-10 lg:mt-0 relative perspective-1000">
             <div className="w-[450px] h-[350px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex items-center justify-center relative z-10 rotate-3 hover:rotate-0 transition duration-500 group overflow-hidden">
                {/* Simulated UI inside the card */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519567241046-7f570eee3c9f?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-30 group-hover:opacity-50 transition duration-700"></div>
                <div className="relative z-10 bg-black/50 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
                  <span className="text-blue-300 font-mono text-lg font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Live Visualization
                  </span>
                </div>
             </div>
             <div className="absolute top-8 -right-8 w-[450px] h-[350px] bg-gray-800/30 rounded-2xl border border-gray-700/50 -z-0"></div>
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
        <div className="flex justify-between items-end mb-8">
           <h2 className="text-3xl font-bold text-gray-900">Featured Stores</h2>
           <button onClick={handleStartShopping} className="text-blue-600 font-bold hover:underline">View All</button>
        </div>
        
        {stores.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stores.slice(0, 4).map(store => (
              <div 
                key={store.id} 
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => navigate(user ? `/store/${store.id}` : '/login')}
              >
                <div className="aspect-[16/9] bg-gray-100 rounded-2xl mb-4 overflow-hidden shadow-sm group-hover:shadow-md transition border border-gray-100 relative">
                  <img 
                    src={`https://placehold.co/600x400/f3f4f6/3b82f6?text=${encodeURIComponent(store.name)}`} 
                    alt={store.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                  />
                  {!store.is_active && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Closed</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-500 font-medium">{store.category}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">Loading stores...</div>
        )}
      </div>

      {/* 5. Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2026 MallApp Inc. Built with FastAPI & React.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition">Privacy</a>
            <a href="#" className="hover:text-black transition">Terms</a>
            <a href="#" className="hover:text-black transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}