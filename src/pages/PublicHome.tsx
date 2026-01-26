import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import MallMap from '../components/MallMap';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import heroImage from '../assets/background.png';

interface Store {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
}

export default function PublicHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    client.get('/stores/')
      .then(res => setStores(res.data))
      .catch(console.error);
  }, []);

  const handleStartShopping = () => {
    navigate(user ? '/explore' : '/login');
  };

  return (
    <div className="min-h-screen bg-creme selection:bg-gold-500 selection:text-white">
      <PublicNavbar />

      {/* 1. LUXURY HERO SECTION */}
      {/* Used a high-quality Unsplash image of a mall atrium */}
      <div className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        
        {/* Background Image with Ken Burns Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 animate-ken-burns"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        
        {/* Elegant Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/90 via-onyx/40 to-creme z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 text-center max-w-4xl px-4 mt-20">
          <div className="inline-block border border-gold-500/50 px-4 py-1.5 rounded-full backdrop-blur-sm mb-6 animate-fade-in-up">
            <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em]">The Premier Destination</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 drop-shadow-lg leading-tight animate-fade-in-up delay-100">
            Golden Rose<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 italic">
               Mall
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Experience the finest selection of boutiques, dining, and lifestyle, delivered directly to your door.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-300">
            <button 
              onClick={handleStartShopping}
              className="bg-gold-500 hover:bg-gold-600 text-onyx px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl shadow-gold-500/30 flex items-center justify-center gap-2"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/explore')}
              className="px-10 py-4 rounded-full font-bold text-lg text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              Explore Map
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE MAP SECTION */}
      <div id="map" className="relative z-20 -mt-20 px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-onyx mb-4">The Interactive Layout</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Click on any boutique to visit instantly.</p>
          </div>
          
          {/* Map Component Container */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <MallMap stores={stores} />
          </div>
        </div>
      </div>

      {/* 3. FEATURED BOUTIQUES */}
      <div className="max-w-7xl mx-auto py-24 px-6">
        <div className="flex justify-between items-end mb-12">
           <div>
             <h2 className="text-4xl font-serif text-onyx">Featured Boutiques</h2>
             <p className="text-gray-500 mt-2 font-light">Curated selections from our top partners.</p>
           </div>
           <button onClick={handleStartShopping} className="hidden md:flex items-center gap-2 text-gold-600 font-bold hover:text-gold-700 transition">
             View All Stores <ArrowRight className="w-4 h-4" />
           </button>
        </div>
        
        {stores.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stores.slice(0, 4).map(store => (
              <div 
                key={store.id} 
                className="group cursor-pointer bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-gold-200"
                onClick={() => navigate(user ? `/store/${store.id}` : '/login')}
              >
                <div className="aspect-[4/3] bg-gray-100 rounded-xl mb-6 overflow-hidden relative">
                  <img 
                    src={`https://placehold.co/600x800/f3f4f6/1a1a1a?text=${encodeURIComponent(store.name)}`} 
                    alt={store.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition duration-700 grayscale group-hover:grayscale-0"
                  />
                  {!store.is_active && (
                    <div className="absolute inset-0 bg-onyx/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-white text-onyx px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">Closed</span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gold-900/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                </div>

                <div className="text-center px-2 pb-2">
                  <h3 className="text-xl font-serif text-onyx group-hover:text-gold-600 transition mb-2">
                    {store.name}
                  </h3>
                  <div className="flex justify-center items-center gap-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold-500" /> Premium</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{store.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
             <p className="text-gray-400 italic font-serif">Loading luxury selections...</p>
          </div>
        )}
      </div>

      {/* 4. FOOTER */}
      <footer className="bg-onyx text-white py-16 border-t border-gold-900/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h2 className="text-2xl font-serif text-gold-500 mb-6">Golden Rose Mall</h2>
            <p className="text-gray-400 max-w-sm leading-relaxed font-light">
              Redefining the shopping experience by blending physical luxury with digital convenience.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Concierge</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-gold-400 transition">Guest Services</a></li>
              <li><a href="#" className="hover:text-gold-400 transition">Delivery Info</a></li>
              <li><a href="#" className="hover:text-gold-400 transition">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-gold-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold-400 transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
          <p>&copy; 2026 Golden Rose Mall Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}