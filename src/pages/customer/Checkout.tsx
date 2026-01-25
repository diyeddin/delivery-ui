import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("123 Main St (Default)"); // Later we fetch this from Profile
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group items by Store for visualization
  // (The backend does this automatically, but it helps the user understand)
  const itemsByStore = cart.reduce((acc, item) => {
    if (!acc[item.store_name]) acc[item.store_name] = [];
    acc[item.store_name].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      // We send all items. The Backend Service we wrote earlier handles the splitting!
      await client.post('/orders/', {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        delivery_address: address
      });
      
      toast.success("Orders placed successfully!");
      clearCart();
      navigate('/my-orders');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-400 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Items */}
          <div className="md:col-span-2 space-y-6">
            {Object.entries(itemsByStore).map(([storeName, items]) => (
              <div key={storeName} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg border-b pb-2 mb-4 text-gray-800">📦 Package from {storeName}</h3>
                {items.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">-</button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">+</button>
                      <button onClick={() => removeFromCart(item.product_id)} className="ml-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Right Column: Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-4">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.length} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <input 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              />
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}