import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import LoadingScreen from '../components/LoadingScreen';
import { storage } from '../utils/storage'; // <--- Import the adapter

interface User {
  email: string;
  role: 'admin' | 'store_owner' | 'driver' | 'customer';
  sub: string;
  name?: string;
  id?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>; // Login is now Async
  logout: () => Promise<void>;            // Logout is now Async
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. INITIAL LOAD (Runs once on mount)
  useEffect(() => {
    const loadTokenFromStorage = async () => {
      try {
        const storedToken = await storage.getToken(); // <--- Abstracted Call
        
        if (storedToken) {
          const decoded = jwtDecode<User>(storedToken);
          // Optional: Add expiration check here later
          setToken(storedToken);
          setUser(decoded);
        }
      } catch (e) {
        console.error("Failed to load auth token", e);
        await storage.removeToken();
      } finally {
        // Add artificial delay for "Premium App Feel" (and to ensure fonts load)
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    loadTokenFromStorage();
  }, []);

  // 2. LOGIN HANDLER
  const login = async (newToken: string) => {
    try {
      const decoded = jwtDecode<User>(newToken);
      
      // Update State
      setToken(newToken);
      setUser(decoded);
      
      // Persist to Storage (Async)
      await storage.setToken(newToken); 
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // 3. LOGOUT HANDLER
  const logout = async () => {
    // Clear State
    setToken(null);
    setUser(null);
    
    // Clear Storage (Async)
    await storage.removeToken();

    // NOTE: We removed window.location.href. 
    // In React Native, the Router observes the 'user' state 
    // and automatically switches stacks when it becomes null.
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!user, 
      isLoading 
    }}>
      {isLoading ? (
        <LoadingScreen text="Verifying Credentials..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};