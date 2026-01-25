import { useCart } from '../context/CartContext';
import client from '../api/client';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, total, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      navigate('/login');
      toast.error("Please login to checkout");
      return;
    }

    setLoading(true);
    try {
      // The backend handles grouping, we just send the list
      const itemsPayload = cart.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity
      }));

      // NOTE: You can add an address selector here later
      await client.post('/orders/', {
        delivery_address: "Standard Delivery Address", 
        items: itemsPayload
      });

      toast.success("Order placed successfully! 🚀");
      clearCart();
      setIsCartOpen(false);
      navigate('/my-orders');
      
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Group items by store for display
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.store_name]) acc[item.store_name] = [];
    acc[item.store_name].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right transform transition-transform duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <ShoppingBag className="w-5 h-5 text-blue-600" /> Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)} 
            className="p-2 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                 <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-lg font-medium">Your cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="text-blue-600 font-bold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            // Render Groups
            Object.entries(groupedCart).map(([storeName, items]) => (
              <div key={storeName} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                   <Store className="w-4 h-4 text-gray-400" />
                   <span className="font-bold text-sm text-gray-700">{storeName}</span>
                </div>
                
                <div className="divide-y divide-gray-50">
                  {items.map(item => (
                    <div key={item.product_id} className="p-4 flex gap-4">
                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-lg p-1 h-fit">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1 hover:text-blue-600"><Plus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1 hover:text-red-600"><Minus className="w-3 h-3" /></button>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} / unit</p>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between">
                         <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                         <button onClick={() => removeFromCart(item.product_id)} className="text-gray-300 hover:text-red-500">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Checkout <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}