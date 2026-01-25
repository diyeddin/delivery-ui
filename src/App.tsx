import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Layouts & Components
import CustomerLayout from './components/CustomerLayout'; 
import CartDrawer from './components/CartDrawer'; // <--- IMPORT THIS

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PublicHome from './pages/PublicHome';
import DriverDashboard from './pages/driver/Dashboard';
import OwnerDashboard from './pages/owner/Dashboard';
import Fulfillment from './pages/owner/Fulfillment';
import StoreManager from './pages/owner/StoreManager';
import AdminDashboard from './pages/admin/AdminDashboard';
import Explore from './pages/customer/Explore';
import CustomerOrders from './pages/customer/Orders';
import Profile from './pages/customer/Profile';
import StorePage from './pages/customer/Store';
import type { JSX } from 'react';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { user} = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     // Fallback redirect if role doesn't match
     return <Navigate to="/" replace />; 
  }

  return children;
};

// // Root Redirector (Smart Home)
// const RootRedirect = () => {
//   const { user } = useAuth();
//   if (!user) return <PublicHome />; // Not logged in? Show Landing Page

//   // Logged in? Send them to their specific dashboard
//   switch (user.role) {
//     case 'admin': return <Navigate to="/admin" replace />;
//     case 'store_owner': return <Navigate to="/owner" replace />;
//     case 'driver': return <Navigate to="/driver" replace />;
//     default: return <Navigate to="/explore" replace />; // Customer home
//   }
// };

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          
          {/* Global UI Elements */}
          <CartDrawer /> {/* <--- PLACED HERE to overlay everything */}

          <Routes>
            {/* Intelligent Root Route */}
            <Route path="/" element={<PublicHome />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />

            {/* --- CUSTOMER ROUTES --- */}
            <Route element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
               <Route path="/explore" element={<Explore />} />
               <Route path="/my-orders" element={<CustomerOrders />} />
               <Route path="/profile" element={<Profile />} />
               <Route path="/store/:id" element={<StorePage />} />
               {/* Note: 'Checkout' is likely replaced by CartDrawer, but keeping if you have a full page */}
            </Route>

            {/* --- OWNER ROUTES --- */}
            <Route path="/owner" element={<ProtectedRoute allowedRoles={['store_owner']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/owner/store/:id" element={<ProtectedRoute allowedRoles={['store_owner']}><StoreManager /></ProtectedRoute>} />
            <Route path="/owner/fulfillment" element={<ProtectedRoute allowedRoles={['store_owner']}><Fulfillment /></ProtectedRoute>} />

            {/* --- DRIVER ROUTES --- */}
            <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />

            {/* --- ADMIN ROUTE --- */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}