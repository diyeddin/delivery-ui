import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import DriverDashboard from './pages/driver/Dashboard';
import StorePage from './pages/customer/Store';
import OwnerDashboard from './pages/owner/Dashboard';
import PublicHome from './pages/PublicHome';
import CustomerOrders from './pages/customer/Orders';
import type { JSX } from 'react';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Checkout from './pages/customer/Checkout';
import Explore from './pages/customer/Explore';
import CustomerLayout from './components/CustomerLayout'; // Import
import Profile from './pages/customer/Profile'; // Import
import Fulfillment from './pages/owner/Fulfillment';
import StoreManager from './pages/owner/StoreManager';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';


// 1. Dispatcher: Decides which dashboard to show based on Role

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
      <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            
            {/* PUBLIC HOME (Landing Page) */}
            <Route path="/" element={<PublicHome />} />

            {/* --- DRIVER ROUTES --- */}
            <Route path="/driver" element={
               <ProtectedRoute><DriverDashboard /></ProtectedRoute>
            } />

            {/* --- CUSTOMER ROUTES (Protected & Wrapped in Layout) --- */}
            <Route element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
               {/* We use specific paths now instead of a generic "/" dispatcher 
                   because "/" is taken by PublicHome.
                   Customers will go to /explore after login.
               */}
               <Route path="/explore" element={<Explore />} />
               <Route path="/my-orders" element={<CustomerOrders />} />
               <Route path="/cart" element={<Checkout />} />
               <Route path="/profile" element={<Profile />} />
               <Route path="/store/:id" element={<StorePage />} />
            </Route>

            {/* --- OWNER ROUTES --- */}
            <Route path="/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/owner/store/:id" element={<ProtectedRoute><StoreManager /></ProtectedRoute>} />
            <Route path="/owner/fulfillment" element={<ProtectedRoute><Fulfillment /></ProtectedRoute>} />

            {/* Admin Route */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}