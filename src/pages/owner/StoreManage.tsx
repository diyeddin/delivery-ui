import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext'; // Import Auth

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export default function StoreManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user/logout
  const [products, setProducts] = useState<Product[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const fetchProducts = () => {
    client.get(`/stores/${id}/products`)
      .then(res => setProducts(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, [id]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post('/products/', {
        store_id: Number(id),
        name,
        description: desc,
        price: Number(price),
        stock: Number(stock)
      });
      setShowAdd(false);
      setName(''); setDesc(''); setPrice(''); setStock('');
      fetchProducts();
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* GLOBAL HEADER (Added) */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-gray-500 hover:text-black font-bold text-xl"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900">Manage Inventory</h1>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600 text-sm hidden sm:inline">{user?.sub}</span>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium shadow-sm"
          >
            + Add Product
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.stock > 0 ? 'In Stock' : 'Sold Out'}
                    </span>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <p>No products yet.</p>
                    <button onClick={() => setShowAdd(true)} className="text-blue-600 hover:underline mt-2 text-sm">Add your first product</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold mb-4">Add Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
                  <input className="w-full border rounded p-2 outline-none focus:border-blue-500" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                  <textarea className="w-full border rounded p-2 outline-none focus:border-blue-500" rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price</label>
                    <input type="number" step="0.01" className="w-full border rounded p-2 outline-none focus:border-blue-500" value={price} onChange={e => setPrice(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock</label>
                    <input type="number" className="w-full border rounded p-2 outline-none focus:border-blue-500" value={stock} onChange={e => setStock(e.target.value)} required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}