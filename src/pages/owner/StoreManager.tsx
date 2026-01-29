import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit2, Trash2, Package, Save, X, Tag, Upload } from 'lucide-react'; // <--- Added Upload
import imageCompression from 'browser-image-compression';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
  category_name?: string; 
  image_url?: string; // <--- Added image_url
}

export default function StoreManager() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false); 
  const [uploadingImage, setUploadingImage] = useState(false); // <--- New State
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    image_url: '' // <--- Added to form state
  });

  const fetchData = async () => {
    try {
      const prodRes = await client.get(`/stores/${id}/products?t=${Date.now()}`);
      setProducts(prodRes.data);
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
        description: product.description || '',
        category: product.category || product.category_name || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        image_url: product.image_url || '' // <--- Load existing image
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', category: '', price: '', stock: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  // --- UPDATED UPLOAD HANDLER (Client-Side Compression) ---
  const handleImageUpload = async (file: File) => {
    // 1. Configure Compression Options
    const options = {
      maxSizeMB: 1,           // Target file size (e.g., max 1MB)
      maxWidthOrHeight: 1920, // Resize if wider/taller than 1920px
      useWebWorker: true,     // Runs in background (doesn't freeze UI)
      fileType: "image/jpeg"  // Force convert PNGs to JPEG (optional, saves space)
    };

    try {
      console.log(`Original size: ${file.size / 1024 / 1024} MB`);
      
      // 2. Compress the file locally
      const compressedFile = await imageCompression(file, options);
      
      console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);

      // 3. Upload the smaller file
      const data = new FormData();
      data.append('file', compressedFile);

      const res = await client.post('/upload/', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000, // Give backend plenty of time
      });

      return res.data.url;
    } catch (error) {
      console.error("Compression/Upload Error:", error);
      throw error;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url, // <--- Include in payload
        store_id: Number(id)
      };

      if (editingProduct) {
        const res = await client.put(`/products/${editingProduct.id}`, payload);
        const updatedProduct = res.data;
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
        toast.success("Product updated!");
      } else {
        const res = await client.post('/products/', payload);
        const newProduct = res.data;
        setProducts(prev => [newProduct, ...prev]);
        toast.success("Product created!");
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Operation failed");
    } finally {
      setSubmitting(false);
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 max-w-sm flex gap-4">
                      {/* --- OPTIONAL: Thumbnail in Table --- */}
                      {product.image_url ? (
                        <img src={`${product.image_url}?t=${product.id}`} alt={product.name} className="w-12 h-12 rounded bg-gray-100 object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      
                      <div>
                        <div className="font-bold text-gray-900 mb-1">{product.name}</div>
                        
                        <div className="text-sm text-gray-500 line-clamp-2 mb-2" title={product.description}>
                          {product.description || 'No description provided'}
                        </div>
                        
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <Tag className="w-3 h-3" />
                          {product.category || product.category_name || 'Uncategorized'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-sm text-gray-700 align-top pt-4">
                        ${product.price.toFixed(2)}
                    </td>
                    
                    <td className="px-6 py-4 align-top pt-4">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {product.stock} units
                       </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right flex justify-end gap-2 align-top pt-3">
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
              
              {/* --- IMAGE UPLOAD SECTION --- */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`
                        flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50 transition
                        ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        {uploadingImage ? (
                            <span>Uploading...</span>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Upload Photo</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            disabled={uploadingImage}
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    setUploadingImage(true);
                                    try {
                                        const url = await handleImageUpload(e.target.files[0]);
                                        setFormData(prev => ({ ...prev, image_url: url }));
                                        toast.success("Image uploaded!");
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("Upload failed");
                                    } finally {
                                        setUploadingImage(false);
                                    }
                                }
                            }}
                        />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Recommended: 500x500px JPG/PNG.</p>
                  </div>
                </div>
              </div>

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
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <input 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g. Shoes, Electronics"
                />
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
                disabled={submitting || uploadingImage}
                className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2 ${
                    (submitting || uploadingImage) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                }`}
              >
                {submitting ? 'Saving...' : <><Save className="w-4 h-4" /> Save Product</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}