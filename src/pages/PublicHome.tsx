import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import MallMap from '../components/MallMap';
import PublicNavbar from '../components/PublicNavbar';

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
    client.get('/stores/')
      .then(res => setStores(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 selection:bg-gold-200 selection:text-charcoal-900">
      <PublicNavbar />

      {/* 1. HERO: Light, Bright, Expensive */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background - A bright marble/atrium image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519567241046-7f570eee3d9f?q=80&w=2000&auto=format&fit=crop" 
            alt="White Marble Atrium" 
            className="w-full h-full object-cover opacity-90"
          />
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-cream-50/20 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20 animate-fade-in-up">
          <p className="text-charcoal-600 tracking-[0.3em] text-xs font-bold uppercase mb-6">
            Est. 2026 • Ankara
          </p>
          <h1 className="font-display text-7xl md:text-9xl text-charcoal-900 mb-8 leading-none">
            Golden <span className="italic font-normal text-gold-600">Rose</span>
          </h1>
          <p className="text-charcoal-800 font-sans text-lg md:text-xl max-w-xl mx-auto mb-12 font-light leading-relaxed">
            A sanctuary of style. Discover a curated collection of the world's most prestigious maisons.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <button 
              onClick={() => navigate('/login')}
              className="px-10 py-4 border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-cream-50 transition duration-500 uppercase tracking-[0.2em] text-xs font-bold"
            >
              Enter The Mall
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE BOUTIQUES - Clean White Cards */}
      <div id="boutiques" className="py-32 px-6 md:px-12 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-charcoal-900/10 pb-6">
            <div>
              <span className="text-gold-600 font-bold tracking-widest text-xs uppercase mb-2 block">Directory</span>
              <h2 className="font-display text-4xl md:text-5xl text-charcoal-900">The Atrium Collection</h2>
            </div>
            <a href="#" className="hidden md:block text-xs font-bold uppercase tracking-widest hover:text-gold-600 transition mt-4 md:mt-0">
              View All 42 Maisons →
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {stores.map((store) => (
              <div 
                key={store.id} 
                className="group cursor-pointer"
                onClick={() => navigate(`/store/${store.id}`)}
              >
                {/* Image Container - Clean, no borders, soft shadow on hover */}
                <div className="aspect-[3/4] overflow-hidden bg-cream-200 mb-8 relative">
                  <img 
                    src={`https://placehold.co/600x800/ebe5d5/1c1917?text=${encodeURIComponent(store.name)}`} 
                    alt={store.name}
                    className="w-full h-full object-cover transition duration-1000 ease-out group-hover:scale-105"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/5 transition duration-500"></div>
                </div>

                <div className="text-center">
                  <h3 className="font-display text-2xl text-charcoal-900 mb-2 group-hover:text-gold-600 transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-charcoal-400 text-xs font-bold tracking-[0.2em] uppercase">
                    {store.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DIGITAL MAP - Framed like art */}
      <div id="map" className="bg-cream-100 py-32 border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4">
             <h2 className="font-display text-4xl text-charcoal-900 mb-6">Navigating Elegance</h2>
             <div className="w-12 h-1 bg-gold-400 mb-8"></div>
             <p className="text-charcoal-600 leading-relaxed mb-8">
               Our digital concierge allows you to explore the architectural layout of Golden Rose Mall from the comfort of your device.
             </p>
             <ul className="space-y-4 text-sm text-charcoal-800 font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span> 8 Floors of Retail
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span> Rooftop Dining
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span> VIP Valet Services
                </li>
             </ul>
          </div>

          <div className="lg:col-span-8 relative">
             {/* Frame Effect */}
             <div className="bg-white p-4 shadow-2xl border border-cream-200">
                <MallMap stores={stores} />
             </div>
             {/* Background Decoration */}
             <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-200/50 -z-10"></div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER - Minimalist */}
      <footer className="bg-cream-50 pt-24 pb-12 border-t border-charcoal-900/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h3 className="font-display text-3xl text-charcoal-900 mb-8">GOLDEN ROSE</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-16 text-xs font-bold uppercase tracking-widest text-charcoal-500">
             <div className="space-y-4">
               <p className="text-charcoal-900">Contact</p>
               <a href="#" className="block hover:text-gold-600">Concierge</a>
               <a href="#" className="block hover:text-gold-600">Events</a>
             </div>
             <div className="space-y-4">
               <p className="text-charcoal-900">Legal</p>
               <a href="#" className="block hover:text-gold-600">Privacy Policy</a>
               <a href="#" className="block hover:text-gold-600">Terms of Use</a>
             </div>
             <div className="space-y-4">
               <p className="text-charcoal-900">Social</p>
               <a href="#" className="block hover:text-gold-600">Instagram</a>
               <a href="#" className="block hover:text-gold-600">Pinterest</a>
             </div>
           </div>

           <p className="text-charcoal-300 text-[10px] uppercase tracking-widest">
             © 2026 Golden Rose Mall. All Rights Reserved.
           </p>
        </div>
      </footer>
    </div>
  );
}