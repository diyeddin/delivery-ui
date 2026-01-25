import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, Menu, X, LogOut, Shield, Briefcase, Truck, 
  Store, User, ChevronDown 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return { path: '/admin', label: 'Admin Panel', icon: <Shield className="w-4 h-4"/> };
      case 'store_owner': return { path: '/owner', label: 'Store Manager', icon: <Briefcase className="w-4 h-4"/> };
      case 'driver': return { path: '/driver', label: 'Driver App', icon: <Truck className="w-4 h-4"/> };
      default: return null;
    }
  };

  const dashboard = getDashboardLink();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* LEFT: Logo & Main Navigation */}
        <div className="flex items-center gap-8">
          {/* Smart Logo: Goes to Explore if logged in, Home if not */}
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 flex items-center gap-1">
            Mall<span className="text-gray-900">App</span>
          </Link>

          {/* PRIMARY NAV: "Explore" button lives here now (Outside User Menu) */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/explore" 
              className="flex items-center gap-2 font-bold text-gray-700 hover:text-blue-600 transition bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-full text-sm"
            >
              <Store className="w-4 h-4" /> Marketplace
            </Link>
          </div>
        </div>

        {/* RIGHT: Cart & User Account */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Cart Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:text-blue-600 transition mr-2"
          >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* User Dropdown Trigger */}
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user.sub}</p> {/* user.name doesnt exist */}
                  <p className="text-xs text-gray-500 mt-1 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* The Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in-up">
                  
                  {/* Dashboard Link (if applicable) */}
                  {dashboard && (
                    <div className="px-2 pb-2 mb-2 border-b border-gray-50">
                      <Link 
                        to={dashboard.path}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-100 transition"
                      >
                        {dashboard.icon} {dashboard.label}
                      </Link>
                    </div>
                  )}

                  {/* Strictly User Links */}
                  <Link 
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link 
                    to="/my-orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    <Truck className="w-4 h-4" /> My Orders
                  </Link>
                  
                  <div className="border-t border-gray-50 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-black">Log In</Link>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-2 animate-fade-in-down">
          <Link to="/explore" className="font-bold text-gray-800 py-3 px-4 bg-gray-50 rounded-lg flex items-center gap-2">
            <Store className="w-4 h-4" /> Marketplace
          </Link>
          
          <button 
             onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }} 
             className="font-bold text-gray-800 py-3 px-4 hover:bg-gray-50 rounded-lg text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> My Cart</div>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{itemCount} items</span>
          </button>
          
          {user ? (
            <>
              <div className="border-t border-gray-100 my-2"></div>
              {dashboard && (
                <Link to={dashboard.path} className="font-bold text-blue-600 py-3 px-4 flex items-center gap-2">
                  {dashboard.icon} Go to {dashboard.label}
                </Link>
              )}
              <Link to="/my-orders" className="font-medium text-gray-600 py-2 px-4">My Orders</Link>
              <Link to="/profile" className="font-medium text-gray-600 py-2 px-4">My Profile</Link>
              <button onClick={handleLogout} className="font-bold text-red-600 py-3 px-4 text-left flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Link to="/login" className="text-center py-3 font-bold border border-gray-200 rounded-lg text-gray-700">Log In</Link>
              <Link to="/signup" className="text-center py-3 font-bold bg-blue-600 text-white rounded-lg shadow-lg">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}