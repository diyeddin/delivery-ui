import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { Search, Filter, ShoppingBag, Store } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  store_id: number; 
}

export default function Explore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        
        // Filter for in-stock items by default for a better UX
        params.append('in_stock', 'true');
        
        const res = await client.get(`/products/?${params.toString()}`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      store_id: product.store_id,
      store_name: `Store #${product.store_id}`, 
      name: product.name,
      price: product.price,
      quantity: 1
    });
    toast.success(`Added ${product.name}`);
    setIsCartOpen(true); // Open drawer on add
  };

  return (
    <div className="min-h-screen bg-creme pt-24 pb-20 selection:bg-gold-500 selection:text-white">
      
      {/* 1. HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-onyx mb-4 animate-fade-in-up">
          The Collection
        </h1>
        <p className="text-gray-500 font-light max-w-2xl animate-fade-in-up delay-100">
          Browse exclusive items from our premium boutiques, curated just for you.
        </p>

        {/* Luxury Search Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 animate-fade-in-up delay-200">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-3.5 text-gold-500 w-5 h-5 group-focus-within:text-gold-600 transition" />
            <input 
              type="text"
              placeholder="Search for designer bags, watches, essentials..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition shadow-sm text-onyx placeholder:text-gray-400"
              value={query}
              onChange={(e) => setSearchParams({ q: e.target.value })}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-gold-500 hover:text-gold-600 transition shadow-sm font-medium">
            <Filter className="w-5 h-5" /> <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* 2. RESULTS & GRID */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-serif text-onyx">
            {query ? `Results for "${query}"` : "Trending Arrivals"}
          </h2>
          <span className="text-gray-400 text-sm font-serif italic">{products.length} items</span>
        </div>

        {loading ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-white rounded-xl h-[400px] border border-gray-100 animate-pulse flex flex-col p-4 gap-4">
                <div className="flex-1 bg-gray-100 rounded-lg"></div>
                <div className="h-4 bg-gray-100 w-2/3 rounded"></div>
                <div className="h-4 bg-gray-100 w-1/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {products.length === 0 ? (
               <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                 <p className="text-gray-400 text-lg font-serif italic">No items found matching your search.</p>
                 <button onClick={() => setSearchParams({})} className="mt-4 text-gold-600 font-bold hover:underline">Clear Search</button>
               </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {products.map(product => (
                  <div key={product.id} className="group bg-white rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-transparent hover:border-gold-200 flex flex-col">
                    
                    {/* Image Placeholder */}
                    <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                      <img 
                        src={`https://placehold.co/400x500/f3f4f6/1a1a1a?text=${encodeURIComponent(product.name)}`} 
                        alt={product.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700"
                      />
                      
                      {/* Store Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider flex items-center gap-1 text-onyx">
                        <Store className="w-3 h-3 text-gold-500" />
                        Store {product.store_id}
                      </div>

                      {/* Quick Add Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition duration-300 bg-gradient-to-t from-black/80 to-transparent">
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-white text-onyx py-3 rounded-lg font-bold hover:bg-gold-400 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg"
                          >
                            <ShoppingBag className="w-4 h-4" /> Add to Cart
                          </button>
                       </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif text-lg text-onyx leading-tight group-hover:text-gold-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 font-light leading-relaxed flex-1">
                        {product.description || "No description available."}
                      </p>
                      
                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="font-serif text-xl text-onyx">
                           ${product.price.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                           {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}