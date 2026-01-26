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
  
  // Scroll State
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Changed threshold to 20px for quicker response
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-onyx/95 backdrop-blur-md shadow-xl py-3' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-white">
        
        {/* LEFT: Logo & Main Navigation */}
        <div className="flex items-center gap-12">
          <Link to={user ? "/explore" : "/"} className="group flex flex-col items-start leading-none">
            <span className={`font-serif text-2xl tracking-wide transition-colors duration-300 ${isScrolled ? 'text-gold-500' : 'text-white'}`}>
              Golden Rose
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-80 group-hover:text-gold-400 transition">
              Luxury Mall
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/explore" 
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full border ${
                isScrolled 
                  ? 'border-white/10 hover:border-gold-500/50 text-gray-200 hover:text-gold-400' 
                  : 'border-white/20 hover:bg-white/10 text-white'
              }`}
            >
              <Store className="w-4 h-4" /> Marketplace
            </Link>
          </div>
        </div>

        {/* RIGHT: Icons */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:text-gold-400 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 pl-6 border-l border-white/20 hover:opacity-80 transition"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-serif italic text-gold-100">{user.name || "Guest"}</p>
                </div>
                <div className="w-9 h-9 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-400 border border-gold-500/50">
                  <User className="w-4 h-4" />
                </div>
                <ChevronDown className={`w-3 h-3 text-gold-400/70 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-14 w-60 bg-onyx border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in-up overflow-hidden">
                  {dashboard && (
                    <div className="px-2 pb-2 mb-2 border-b border-white/10">
                      <Link 
                        to={dashboard.path}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 bg-white/5 text-gold-400 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-white/10 transition"
                      >
                        {dashboard.icon} {dashboard.label}
                      </Link>
                    </div>
                  )}
                  <Link 
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition"
                  >
                    <User className="w-4 h-4" /> Profile & Settings
                  </Link>
                  <Link 
                    to="/my-orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold-400 transition"
                  >
                    <Truck className="w-4 h-4" /> Order History
                  </Link>
                  <div className="border-t border-white/10 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 text-left transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-6 border-l border-white/20">
              <Link to="/login" className="text-sm font-medium hover:text-gold-400 transition">Log In</Link>
              <Link 
                to="/signup" 
                className="bg-gold-500 hover:bg-gold-600 text-onyx px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-gold-500/20 transition transform hover:scale-105"
              >
                Join Us
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-onyx border-b border-white/10 shadow-2xl p-6 flex flex-col gap-4 animate-fade-in-down">
           <Link to="/explore" className="text-white py-2">Marketplace</Link>
           <button onClick={handleLogout} className="text-red-400 py-2">Sign Out</button>
        </div>
      )}
    </nav>
  );
}