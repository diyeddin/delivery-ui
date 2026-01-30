import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, MapPin, Upload, Image as ImageIcon, Store as StoreIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function StoreSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Store ID (We fetch 'me' so we don't strictly need ID from params, but it's good practice)
  const [storeId, setStoreId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    latitude: 50,
    longitude: 50,
    image_url: '',  // Logo
    banner_url: ''  // Banner
  });

  // Load Data
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await client.get('/stores/me');
        if (res.data.length > 0) {
          const s = res.data[0];
          setStoreId(s.id);
          setFormData({
            name: s.name,
            description: s.description || '',
            category: s.category || '',
            latitude: s.latitude,
            longitude: s.longitude,
            image_url: s.image_url || '',
            banner_url: s.banner_url || ''
          });
        }
      } catch (err) {
        toast.error("Failed to load store profile");
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  // Generic Image Upload Handler
  const handleUpload = async (file: File, uploadType: 'logo' | 'banner') => {
    // 1. Compression Config
    const options = {
      maxSizeMB: uploadType === 'logo' ? 0.5 : 1, // Logo smaller, Banner larger
      maxWidthOrHeight: uploadType === 'logo' ? 500 : 1920,
      useWebWorker: true,
      fileType: "image/jpeg"
    };

    try {
      if (uploadType === 'logo') setUploadingLogo(true);
      else setUploadingBanner(true);

      // 2. Compress the image (Client-side optimization)
      const compressedFile = await imageCompression(file, options);

      // 3. Prepare Form Data
      const data = new FormData();
      data.append('file', compressedFile);

      // 4. Upload to API
      // 👇 CHANGE: Added "?type=store" to target the correct cloud folder
      const res = await client.post('/upload/?type=store', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // Increased timeout for larger banner files
      });

      // 5. Update State with new URL
      const url = res.data.url;
      setFormData(prev => ({
        ...prev,
        // Dynamically update the correct field based on upload type
        [uploadType === 'logo' ? 'image_url' : 'banner_url']: url
      }));
      
      toast.success(`${uploadType === 'logo' ? 'Logo' : 'Banner'} uploaded!`);

    } catch (err) {
      console.error("Upload Error:", err);
      toast.error("Upload failed. Please try a smaller image.");
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setSubmitting(true);

    try {
      await client.put(`/stores/${storeId}`, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image_url: formData.image_url,
        banner_url: formData.banner_url,
        // Note: Coordinates might need a separate endpoint if you lock them, 
        // but for now we send them if your backend allows it.
      });
      toast.success("Store profile updated!");
      navigate('/owner');
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <button onClick={() => navigate('/owner')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-500 mt-1">Manage your brand appearance and details.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- BRANDING SECTION --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600"/> Branding
            </h2>
            
            {/* Banner Upload */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Store Banner (Cover)</label>
              <div className="relative group w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                {formData.banner_url ? (
                  <img src={formData.banner_url} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm">No Banner Image</span>
                  </div>
                )}
                
                {/* Overlay Button */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4" /> {uploadingBanner ? 'Uploading...' : 'Change Banner'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')} />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">Recommended: 1920x500px.</p>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Store Logo</label>
              <div className="flex items-center gap-6">
                <div className="relative group w-24 h-24 bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
                  {formData.image_url ? (
                    <img src={formData.image_url} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <StoreIcon className="w-8 h-8 text-gray-300" />
                  )}
                  
                  {/* Small Overlay for Logo */}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                     <Upload className="w-4 h-4 text-white" />
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')} />
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-900">Upload a square logo.</p>
                  <p>Will be displayed in store lists.</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- DETAILS SECTION --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Info</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                <input 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <input 
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Tell customers about your store..."
              />
            </div>
          </div>

          {/* --- LOCATION SECTION --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400"/> Location
            </h2>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Map X</label>
                 <div className="text-lg font-mono font-bold text-gray-900">{formData.latitude}</div>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Map Y</label>
                 <div className="text-lg font-mono font-bold text-gray-900">{formData.longitude}</div>
               </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Location is currently managed by the mall admin.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
             <button 
               type="button" 
               onClick={() => navigate('/owner')}
               className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
             >
               Cancel
             </button>
             <button 
               type="submit"
               disabled={submitting || uploadingLogo || uploadingBanner}
               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
             >
               {submitting ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}