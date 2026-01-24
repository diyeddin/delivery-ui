import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Store {
  id: number;
  name: string;
  category: string;
  description: string;
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    client.get('/stores/')
      .then(res => setStores(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Mall Delivery 🛍️</h1>
          <div className="flex gap-4 items-center">
            <span>Hello, {user?.sub}</span>
            <button onClick={logout} className="text-red-600">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-6">Browse Stores</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map(store => (
            <div key={store.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-100"
                 onClick={() => navigate(`/store/${store.id}`)}>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{store.category}</span>
              </div>
              <p className="text-gray-500 mt-2">{store.description || "No description available."}</p>
              <button className="mt-4 text-blue-600 font-medium hover:underline">
                Visit Store →
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}