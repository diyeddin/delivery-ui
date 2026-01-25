import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User } from 'lucide-react';

export default function PublicNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user?.role === 'driver') navigate('/driver');
    else if (user?.role === 'store_owner') navigate('/owner');
    else navigate('/explore');
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-500 bg-cream-50/80 backdrop-blur-md border-b border-cream-200/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo - Minimalist & Chic */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-charcoal-900 text-cream-50 p-2 rounded-sm group-hover:bg-gold-500 transition-colors duration-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-charcoal-900 tracking-widest uppercase leading-none">
                Golden Rose
              </span>
            </div>
          </Link>

          {/* Center Links - Uppercase & Spaced */}
          <div className="hidden md:flex items-center gap-10">
            {['Maison', 'Boutiques', 'Gastronomy', 'Map'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-xs font-bold text-charcoal-600 hover:text-gold-500 transition-colors uppercase tracking-[0.2em]"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-6">
            {user ? (
              <button 
                onClick={handleDashboardClick}
                className="flex items-center gap-2 text-charcoal-900 hover:text-gold-600 transition"
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-gold-500">{user.sub}</span>
              </button>
            ) : (
              <div className="flex items-center gap-6">
                 <Link 
                  to="/login" 
                  className="hidden md:block text-xs font-bold text-charcoal-600 hover:text-charcoal-900 uppercase tracking-widest transition"
                >
                  Sign In
                </Link>
                <Link 
                  to="/login" 
                  className="bg-charcoal-900 text-cream-50 px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-gold-500 transition duration-300"
                >
                  Visit
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}