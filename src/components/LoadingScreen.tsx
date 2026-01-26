import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({ text = "Loading...", fullScreen = true }: LoadingScreenProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 min-h-screen z-[9999]" 
    : "w-full h-full min-h-[400px]";

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center bg-creme transition-all duration-500`}>
      {/* Decorative Blur Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Brand Name (Optional - gives it a splash screen feel) */}
        <div className="text-center mb-2">
           <h1 className="font-serif text-3xl text-onyx tracking-wide">Golden Rose</h1>
           <div className="h-0.5 w-12 bg-gold-500 mx-auto mt-2"></div>
        </div>

        {/* Custom Gold Spinner */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-12 h-12 rounded-full border-4 border-gold-200"></div>
          {/* Inner Spinning Arc */}
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-t-gold-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gold-700 font-serif italic animate-pulse text-sm tracking-wider">
          {text}
        </p>
      </div>
    </div>
  );
}