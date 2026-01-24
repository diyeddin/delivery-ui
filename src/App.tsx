import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import DriverDashboard from './pages/driver/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import StorePage from './pages/customer/Store';
import type { JSX } from 'react';

// Main Router based on Role
const DashboardDispatcher = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'driver') return <DriverDashboard />;
  if (user.role === 'customer') return <CustomerDashboard />;
  if (user.role === 'store_owner') return <div className="p-8">Store Owner Dashboard (Coming Soon)</div>;
  
  return <div>Unknown Role</div>;
};

// Wrapper to protect routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Main Dashboard (Router) */}
          <Route path="/" element={<DashboardDispatcher />} />
          
          {/* Specific Routes */}
          <Route path="/store/:id" element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}