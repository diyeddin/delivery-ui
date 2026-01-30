import { useCart } from '../context/CartContext';
import client from '../api/client';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus, Store, Loader2 } from 'lucide-react';
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
      const itemsPayload = cart.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity
      }));

      // NOTE: You can insert the user's default address here if available
      const address = localStorage.getItem('mall_default_address') || "Concierge Pickup";

      await client.post('/orders/', {
        delivery_address: address, 
        items: itemsPayload
      });

      toast.success("Order placed successfully!");
      clearCart();
      setIsCartOpen(false);
      navigate('/my-orders');
      
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Group items by store for display
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.store_name]) acc[item.store_name] = [];
    acc[item.store_name].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-onyx/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right transform transition-transform duration-300 border-l border-gold-100">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-creme">
          <h2 className="text-2xl font-serif font-bold flex items-center gap-3 text-onyx">
            <ShoppingBag className="w-5 h-5 text-gold-600" /> Your Collection
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)} 
            className="p-2 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gold-200 text-gray-500 hover:text-onyx"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6">
              <div className="w-24 h-24 bg-creme rounded-full flex items-center justify-center border border-gold-100">
                 <ShoppingBag className="w-10 h-10 text-gold-300" />
              </div>
              <p className="text-xl font-serif text-onyx">Your bag is empty.</p>
              <button 
                onClick={() => { setIsCartOpen(false); navigate('/explore'); }} 
                className="text-gold-600 font-bold hover:text-gold-700 uppercase tracking-widest text-xs border-b border-gold-200 pb-1"
              >
                Explore Shops
              </button>
            </div>
          ) : (
            // Render Groups
            Object.entries(groupedCart).map(([storeName, items]) => (
              <div key={storeName} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                   <Store className="w-4 h-4 text-gold-500" />
                   <span className="font-serif font-bold text-sm text-onyx uppercase tracking-wider">{storeName}</span>
                </div>
                
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product_id} className="flex gap-4 items-start group">
                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-100 h-fit">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 hover:bg-gold-50 text-gray-500 hover:text-onyx transition"><Plus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-full text-center py-0.5 text-onyx">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500 transition"><Minus className="w-3 h-3" /></button>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-onyx text-sm leading-tight group-hover:text-gold-700 transition">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 font-light">${item.price.toFixed(2)} each</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                         <span className="font-serif font-bold text-onyx">${(item.price * item.quantity).toFixed(2)}</span>
                         <button onClick={() => removeFromCart(item.product_id)} className="text-gray-300 hover:text-red-500 transition p-1">
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
          <div className="p-8 border-t border-gray-100 bg-creme shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-500 font-medium uppercase tracking-widest text-xs">Total</span>
              <span className="text-4xl font-serif text-onyx">${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-gold-500/20 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <span className="text-onyx">Secure Checkout</span> 
                  <ArrowRight className="w-5 h-5 text-onyx" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-wider">
              Powered by Golden Rose Concierge
            </p>
          </div>
        )}
      </div>
    </div>
  );
}