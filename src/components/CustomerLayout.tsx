import { Outlet } from 'react-router-dom';
import CustomerNavbar from './CustomerNavbar';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      {/* Outlet renders the child route (Explore, Orders, etc.) */}
      <Outlet />
    </div>
  );
}