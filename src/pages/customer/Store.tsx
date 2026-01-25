import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { ArrowLeft, ShoppingBag, Star, MapPin, Search } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
}

interface StoreDetails {
  id: number;
  name: string;
  category: string;
  // Add these if your backend supports them, otherwise we use placeholders
  rating?: number;
  address?: string; 
}

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel Fetch: Get Store Info AND Products
        const [storeRes, productsRes] = await Promise.all([
          client.get(`/stores/`).then(res => res.data.find((s: any) => s.id === Number(id))), // Temporary fix until /stores/{id} exists
          client.get(`/stores/${id}/products`)
        ]);

        setStore(storeRes);
        setProducts(productsRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load store");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      store_id: Number(id),
      store_name: store?.name || `Store #${id}`,
      name: product.name,
      price: product.price,
      quantity: 1
    });
    toast.success(`Added ${product.name}`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Store...</div>;

  if (!store) return <div className="p-10 text-center">Store not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. STORE HERO HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={() => navigate('/explore')} 
            className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-2 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Market
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Store Avatar Placeholder */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-3xl">
                {store.name.charAt(0)}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                    <ShoppingBag className="w-3 h-3" /> {store.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 4.8 (120 reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> 1.2 miles away
                  </span>
                </div>
              </div>
            </div>

            {/* Search within Store */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder={`Search ${store.name}...`}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg outline-none transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col group">
                
                {/* Product Image Placeholder */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-12 h-12" />
                   </div>
                   {/* Quick Add Overlay */}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-white text-gray-900 font-bold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition duration-300 hover:scale-105"
                      >
                         {product.stock > 0 ? '+ Add to Cart' : 'Sold Out'}
                      </button>
                   </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition">{product.name}</h3>
                    <span className="font-bold text-blue-600">
                      ${product.price}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {product.description}
                  </p>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-medium">
                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-400">ID: {product.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Cart Button (Mobile Only) */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-600/40 z-30"
      >
        <ShoppingBag className="w-6 h-6" />
      </button>

    </div>
  );
}