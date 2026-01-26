import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import background from '../../assets/background.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await client.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      login(res.data.access_token);
      
      const tokenData = JSON.parse(atob(res.data.access_token.split('.')[1]));
      const role = tokenData.role;
      
      toast.success("Welcome back!");

      if (role === 'driver') {
        navigate('/driver');
      } else if (role === 'store_owner') {
        navigate('/owner');
      } else if(role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/explore'); 
      }
    } catch (err) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-onyx relative overflow-hidden">
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 z-0"
        style={{ backgroundImage: `url(${background})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-onyx/90 via-onyx/70 to-onyx/90 z-10"></div>

      <div className="relative z-20 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in-up">
        {/* BACK BUTTON */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition flex items-center gap-2 text-xs font-bold uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Home
        </Link>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-white mb-2">Golden Rose</h2>
          <p className="text-gold-400 text-xs uppercase tracking-[0.3em] font-bold">Customer Login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-gold-400 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white placeholder:text-gray-500 outline-none transition"
                placeholder="you@example.com"
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-gold-400 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white placeholder:text-gray-500 outline-none transition"
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-onyx font-bold py-3.5 rounded-xl shadow-lg shadow-gold-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400 font-light">
          Don't have an account?{' '}
          <Link to="/signup" className="text-gold-400 font-bold hover:text-gold-300 transition border-b border-transparent hover:border-gold-300">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}