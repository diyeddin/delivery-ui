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
        const [storeRes, productsRes] = await Promise.all([
          client.get(`/stores/`).then(res => res.data.find((s: any) => s.id === Number(id))),
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
    setIsCartOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-creme pt-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
        <p className="text-gold-600 font-serif italic">Entering Boutique...</p>
      </div>
    </div>
  );

  if (!store) return <div className="min-h-screen bg-creme pt-32 text-center text-onyx font-serif text-xl">Store not found</div>;

  return (
    // FIX 1: Removed 'pt-20' here so banner hits the top
    <div className="min-h-screen bg-creme pb-20 selection:bg-gold-500 selection:text-white">
      
      {/* 1. STORE HERO HEADER (Luxury Banner) */}
      <div className="bg-onyx border-b border-gold-600/30 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* FIX 2: Added 'pt-28' here to push content down below fixed navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
          <button 
            onClick={() => navigate('/explore')} 
            className="text-gray-400 hover:text-gold-400 font-medium flex items-center gap-2 mb-8 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Market
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-8">
              {/* Store Avatar */}
              <div className="w-28 h-28 bg-creme rounded-full border-4 border-gold-500 flex items-center justify-center shadow-2xl text-onyx font-serif font-bold text-4xl">
                {store.name.charAt(0)}
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-wide">{store.name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mt-4">
                  <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <ShoppingBag className="w-3 h-3 text-gold-400" /> 
                    <span className="uppercase tracking-widest text-xs font-bold">{store.category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gold-500 fill-gold-500" /> 
                    <span className="text-white">4.9</span> (Elite Partner)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" /> 
                    Suite 104 • Level 1
                  </span>
                </div>
              </div>
            </div>

            {/* Search within Store */}
            <div className="relative w-full md:w-80">
              {/* <Search className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" /> */}
              <input 
                type="text" 
                placeholder={`Search ${store.name}...`}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:bg-white/20 focus:border-gold-500 rounded-full outline-none transition backdrop-blur-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gold-100 shadow-sm">
            <div className="w-16 h-16 bg-creme rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-200">
              <Search className="w-6 h-6 text-gold-500" />
            </div>
            <h3 className="text-xl font-serif text-onyx">No items found</h3>
            <p className="text-gray-500 font-light mt-2">This collection is currently being updated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-transparent hover:border-gold-200 overflow-hidden flex flex-col">
                
                {/* Product Image Placeholder */}
                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                   <img 
                      src={`https://placehold.co/400x500/f3f4f6/1a1a1a?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700"
                   />
                   
                   {/* Quick Add Overlay */}
                   <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition duration-300 bg-gradient-to-t from-black/80 to-transparent">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-white text-onyx py-3 rounded-lg font-bold hover:bg-gold-400 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {product.stock > 0 ? (
                           <><ShoppingBag className="w-4 h-4" /> Add to Cart</>
                         ) : 'Sold Out'}
                      </button>
                   </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg text-onyx leading-tight group-hover:text-gold-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 font-light leading-relaxed">
                    {product.description || "Exclusive item from our collection."}
                  </p>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="font-serif text-xl text-onyx">
                      ${product.price}
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
      </div>
      
      {/* Floating Cart Button (Mobile Only) */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="md:hidden fixed bottom-6 right-6 bg-onyx text-gold-400 p-4 rounded-full shadow-2xl shadow-onyx/40 z-30 border border-gold-500"
      >
        <ShoppingBag className="w-6 h-6" />
      </button>

    </div>
  );
}