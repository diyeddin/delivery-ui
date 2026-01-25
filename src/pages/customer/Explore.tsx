import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { Search, Filter, ShoppingBag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  store_id: number; // API needs to return this!
}

export default function Explore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        
        const res = await client.get(`/products/?${params.toString()}`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search for anything (burgers, tech, clothes)..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={query}
              onChange={(e) => setSearchParams({ q: e.target.value })}
            />
          </div>
          <button className="p-2.5 border rounded-full hover:bg-gray-100">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Results for "${query}"` : "Trending Now"}
          </h1>
          <span className="text-gray-500 text-sm">{products.length} items found</span>
        </div>

        {loading ? (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            {[1,2,3,4].map(n => <div key={n} className="h-64 bg-gray-200 rounded-xl animate-pulse"/>)}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {products.map(product => (
              <div key={product.id} className="bg-white group rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                {/* Image Placeholder */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <img 
                    src={`https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    Store #{product.store_id}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                    <span className="font-bold text-blue-600">${product.price}</span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-black flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}