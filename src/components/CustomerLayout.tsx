import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* The Single Source of Truth Navbar */}
      <PublicNavbar />
      
      {/* Content Area */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}