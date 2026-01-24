import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import DriverDashboard from './pages/driver/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import StorePage from './pages/customer/Store';
import OwnerDashboard from './pages/owner/Dashboard';
import StoreManage from './pages/owner/StoreManage';
import PublicHome from './pages/PublicHome';
import type { JSX } from 'react';

// 1. Dispatcher: Decides which dashboard to show based on Role
const DashboardDispatcher = () => {
  const { user } = useAuth();
  
// If NOT logged in, show the Public Landing Page instead of redirecting
  if (!user) return <PublicHome />;

  if (user.role === 'driver') return <DriverDashboard />;
  // If logged in customer, they also see the CustomerDashboard (or you can reuse PublicHome with a different header)
  if (user.role === 'customer') return <CustomerDashboard />;
  if (user.role === 'store_owner') return <OwnerDashboard />;
  
  return <div className="p-8 text-center text-gray-500">Unknown Role or Admin Account</div>;
};

// 2. Protected Route Wrapper: Ensures user is logged in
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
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
          
          {/* Customer Routes */}
          <Route 
            path="/store/:id" 
            element={
              <ProtectedRoute>
                <StorePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Owner Routes */}
          <Route 
            path="/owner/store/:id" 
            element={
              <ProtectedRoute>
                <StoreManage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}