import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowRight, User } from 'lucide-react';

export default function PublicNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper to send logged-in users to their correct dashboard
  const handleDashboardClick = () => {
    if (user?.role === 'driver') navigate('/driver');
    else if (user?.role === 'store_owner') navigate('/owner');
    else navigate('/explore');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gray-900 text-white p-1.5 rounded-lg group-hover:bg-blue-600 transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Mall<span className="text-blue-600">App</span>
            </span>
          </Link>

          {/* Center Links (Optional - good for SEO/Navigation) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#stores" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Stores</a>
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">How it Works</a>
            <a href="#map" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Map</a>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={handleDashboardClick}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-full text-sm font-bold transition"
              >
                <User className="w-4 h-4" />
                <span>{user.sub}</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hidden md:block text-sm font-bold text-gray-600 hover:text-black transition"
                >
                  Log in
                </Link>
                <Link 
                  to="/login" 
                  className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}