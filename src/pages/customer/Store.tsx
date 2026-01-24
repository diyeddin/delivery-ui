import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
}

interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  price: number;
}

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get(`/stores/${id}/products`)
      .then(res => setProducts(res.data))
      .catch(console.error);
  }, [id]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product_id: product.id, quantity: 1, name: product.name, price: product.price }];
    });
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await client.post('/orders/', {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        delivery_address: "123 Main St, React City" // Hardcoded for demo
      });
      alert("Order Placed Successfully! 🎉");
      setCart([]);
      navigate('/');
    } catch (err: any) {
      alert("Failed to place order: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Product List */}
      <div className="flex-1 p-8">
        <button onClick={() => navigate('/')} className="mb-6 text-gray-600 hover:text-black">← Back to Dashboard</button>
        <h2 className="text-3xl font-bold mb-6">Products</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {products.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <span className="font-bold text-green-600">${product.price}</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">{product.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">{product.stock} in stock</span>
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full md:w-96 bg-white border-l border-gray-200 p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Your Cart 🛒</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.product_id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button 
                onClick={placeOrder}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}