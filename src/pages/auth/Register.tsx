import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await client.post('/auth/signup', {
        email,
        password,
        name 
      });
      toast.success("Account created! Please sign in.");
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-creme flex items-center justify-center p-4 relative overflow-hidden">
       {/* Decorative Elements */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-200/20 blur-[120px] rounded-full pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-onyx/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gold-100 animate-fade-in-up relative z-10">
        
        {/* Header Section */}
        <div className="bg-onyx p-8 text-center relative overflow-hidden">
          {/* BACK BUTTON */}
          <Link 
            to="/" 
            className="absolute top-6 left-6 text-gray-500 hover:text-white transition flex items-center gap-2 text-xs font-bold uppercase tracking-widest group z-20"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Home
          </Link>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold-500/10 to-transparent pointer-events-none"></div>
          
          <div className="mx-auto w-16 h-16 rounded-full border border-gold-500/30 flex items-center justify-center mb-4 text-gold-400 bg-white/5 backdrop-blur-sm">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-serif text-white tracking-wide">Join Us</h2>
          <p className="text-gray-400 mt-2 text-xs uppercase tracking-widest">Create your customer account</p>
        </div>

        {/* Form Section */}
        <div className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-gold-500 transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition bg-gray-50/50 focus:bg-white text-onyx"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-gold-500 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition bg-gray-50/50 focus:bg-white text-onyx"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-gold-500 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition bg-gray-50/50 focus:bg-white text-onyx"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-onyx hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-onyx/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>Sign Up <ArrowRight className="w-5 h-5 text-gold-500" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500 font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-600 font-bold hover:text-gold-800 transition">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}