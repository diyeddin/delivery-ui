import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Package, Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function CustomerNavbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left: Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Mall<span className="text-blue-600">App</span></span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                to="/explore" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/') ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Explore
              </Link>
              <Link 
                to="/my-orders" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/my-orders') ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                My Orders
              </Link>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Cart Button */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200 ml-2">
              <Link to="/profile" className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.sub?.[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user?.sub}</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="pt-2 pb-3 space-y-1 px-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              <Compass className="w-5 h-5" /> Explore
            </Link>
            <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              <Package className="w-5 h-5" /> My Orders
            </Link>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              <User className="w-5 h-5" /> Profile
            </Link>
            <button 
              onClick={() => { logout(); setIsMenuOpen(false); }} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}