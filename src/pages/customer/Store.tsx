import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useCart } from '../../context/CartContext'; // Import Global Cart
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
}

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the global context
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get(`/stores/${id}/products`)
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      store_id: Number(id),
      store_name: `Store #${id}`, // Ideally fetch store name separately
      name: product.name,
      price: product.price,
      quantity: 1
    });
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-600 hover:text-black font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          
          <button 
             onClick={() => navigate('/cart')} 
             className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 transition transform hover:scale-105 flex items-center gap-2"
          >
            <span>View Global Cart</span>
            <span className="text-xl">🛒</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Store Products</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">This store hasn't added any products yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{product.name}</h3>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm">
                          ${product.price}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                        {product.description || "No description available."}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                      <span className={`text-xs font-medium ${product.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                      </span>
                      
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}