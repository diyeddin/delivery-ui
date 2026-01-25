import { useNavigate } from 'react-router-dom';

interface Store {
  id: number;
  name: string;
  category: string;
  // We will interpret these as X/Y percentages (0-100)
  latitude?: number; 
  longitude?: number;
}

interface MallMapProps {
  stores: Store[];
}

export default function MallMap({ stores }: MallMapProps) {
  const navigate = useNavigate();

  // Helper to find if a store exists at a specific "Unit" location
  // In a real app, you'd match by 'unit_number', but here we'll just grab by index or coord
  const getStoreStyle = (x: number, y: number) => {
    // Find a store close to these coords (simple hit detection for demo)
    const store = stores.find(s => 
      Math.abs((s.latitude || 0) - x) < 10 && 
      Math.abs((s.longitude || 0) - y) < 10
    );
    
    return {
      fill: store ? '#bfdbfe' : '#e5e7eb', // Blue if occupied, Gray if empty
      cursor: store ? 'pointer' : 'default',
      store
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-center text-gray-700">Level 1 Floor Plan</h3>
      
      {/* This SVG represents a top-down view of a Mall Atrium.
        Units are rectangles. The central area is the walkway.
      */}
      <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-800">
        <svg viewBox="0 0 800 450" className="w-full h-full">
          {/* Background / Floor */}
          <rect x="0" y="0" width="800" height="450" fill="#f9fafb" />
          
          {/* Central Atrium / Walkway */}
          <path d="M 50,225 L 750,225" stroke="#e5e7eb" strokeWidth="150" strokeLinecap="round" />
          
          {/* --- TOP ROW STORES --- */}
          {/* Unit 101 (Top Left) */}
          <g onClick={() => getStoreStyle(20, 20).store && navigate(`/store/${getStoreStyle(20, 20).store!.id}`)}>
             <rect x="50" y="50" width="150" height="100" 
                   fill={getStoreStyle(20, 20).fill} stroke="#374151" strokeWidth="2" 
                   className="transition hover:opacity-80" />
             <text x="125" y="100" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
               {getStoreStyle(20, 20).store?.name || "Unit 101"}
             </text>
          </g>

          {/* Unit 102 (Top Center) */}
          <g onClick={() => getStoreStyle(50, 20).store && navigate(`/store/${getStoreStyle(50, 20).store!.id}`)}>
             <rect x="325" y="50" width="150" height="100" 
                   fill={getStoreStyle(50, 20).fill} stroke="#374151" strokeWidth="2" 
                   className="transition hover:opacity-80" />
             <text x="400" y="100" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                {getStoreStyle(50, 20).store?.name || "Unit 102"}
             </text>
          </g>

          {/* Unit 103 (Top Right) */}
          <g onClick={() => getStoreStyle(80, 20).store && navigate(`/store/${getStoreStyle(80, 20).store!.id}`)}>
             <rect x="600" y="50" width="150" height="100" 
                   fill={getStoreStyle(80, 20).fill} stroke="#374151" strokeWidth="2" 
                   className="transition hover:opacity-80" />
             <text x="675" y="100" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                {getStoreStyle(80, 20).store?.name || "Unit 103"}
             </text>
          </g>

          {/* --- BOTTOM ROW STORES --- */}
          {/* Unit 104 (Bottom Left) */}
          <g onClick={() => getStoreStyle(20, 80).store && navigate(`/store/${getStoreStyle(20, 80).store!.id}`)}>
             <rect x="50" y="300" width="150" height="100" 
                   fill={getStoreStyle(20, 80).fill} stroke="#374151" strokeWidth="2" 
                   className="transition hover:opacity-80" />
             <text x="125" y="350" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                {getStoreStyle(20, 80).store?.name || "Unit 104"}
             </text>
          </g>
          
          {/* Unit 105 (Bottom Center) */}
          <g onClick={() => getStoreStyle(50, 80).store && navigate(`/store/${getStoreStyle(50, 80).store!.id}`)}>
             <rect x="325" y="300" width="150" height="100" 
                   fill={getStoreStyle(50, 80).fill} stroke="#374151" strokeWidth="2" 
                   className="transition hover:opacity-80" />
             <text x="400" y="350" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                {getStoreStyle(50, 80).store?.name || "Unit 105"}
             </text>
          </g>

          {/* Unit 106 (Bottom Right) */}
          <g onClick={() => getStoreStyle(80, 80).store && navigate(`/store/${getStoreStyle(80, 80).store!.id}`)}>
             <rect x="600" y="300" width="150" height="100" 
                   fill={getStoreStyle(80, 80).fill} stroke="#374151" strokeWidth="2" 
                   className="transition hover:opacity-80" />
             <text x="675" y="350" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                {getStoreStyle(80, 80).store?.name || "Unit 106"}
             </text>
          </g>

          {/* Entrance Label */}
          <text x="400" y="440" textAnchor="middle" fontSize="12" fill="#9ca3af" letterSpacing="2">MAIN ENTRANCE</text>
        </svg>
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Click on an occupied unit (Blue) to visit the store page.
      </p>
    </div>
  );
}