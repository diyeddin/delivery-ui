import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit2, Trash2, Package, Save, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
}

interface Store {
  id: number;
  name: string;
  category: string;
  image_url?: string;
}

export default function StoreManager() {
  const { id } = useParams(); // Store ID
  const navigate = useNavigate();
  
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  });

  const fetchData = async () => {
    try {
      // 1. Fetch Store Details
      // We assume /stores/me returns list, we find ours locally or fetch specific if endpoint exists
      // For now, let's just fetch products directly
      const prodRes = await client.get(`/stores/${id}/products`);
      setProducts(prodRes.data);
      
      // Fetch store info (optional if you want to edit store name)
      // const storeRes = await client.get(`/stores/${id}`); 
      // setStore(storeRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load store data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', stock: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        store_id: Number(id)
      };

      if (editingProduct) {
        await client.put(`/products/${editingProduct.id}`, payload);
        toast.success("Product updated!");
      } else {
        await client.post('/products/', payload);
        toast.success("Product created!");
      }
      
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await client.delete(`/products/${productId}`);
      toast.success("Product deleted");
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Inventory...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <button onClick={() => navigate('/owner')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          <div className="flex justify-between items-end">
             <div>
               <h1 className="text-3xl font-bold text-gray-900">Store Inventory</h1>
               <p className="text-gray-500 mt-1">Manage your catalog, pricing, and stock levels.</p>
             </div>
             <button 
               onClick={() => handleOpenModal()}
               className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition"
             >
               <Plus className="w-5 h-5" /> Add Product
             </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Empty Catalog</h3>
              <p className="text-gray-500 mb-6">Start adding products to sell.</p>
              <button onClick={() => handleOpenModal()} className="text-blue-600 font-bold hover:underline">Add First Product</button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-700">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {product.stock} units
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Nike Air Max"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Qty</label>
                  <input 
                    required
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your product..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}