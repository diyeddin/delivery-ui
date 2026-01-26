import { useNavigate } from 'react-router-dom';

interface Store {
  id: number;
  name: string;
  category: string;
}

interface MallMapProps {
  stores: Store[];
}

export default function MallMap({ stores }: MallMapProps) {
  const navigate = useNavigate();

  // "Smart Auto-Fill": Simply grab stores from the list to fill the slots.
  // This ensures the map works immediately without needing complex DB coordinates.
  const getUnitConfig = (index: number) => {
    const store = stores[index]; // Grab the store at this index (0, 1, 2...)
    
    return {
      fill: store ? '#FFFFFF' : '#F3E5AB', // White vs Champagne
      stroke: store ? '#D4AF37' : '#D1D5DB', // Gold vs Gray
      cursor: store ? 'pointer' : 'default',
      store // Pass the actual store object if it exists
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-serif text-2xl text-onyx">Level 1 Floor Plan</h3>
        <p className="text-xs text-gold-600 uppercase tracking-widest mt-1">Luxury Wing</p>
      </div>
      
      {/* Container with Shadow & Border */}
      <div className="relative aspect-video bg-creme rounded-xl overflow-hidden border-4 border-double border-gold-200 shadow-2xl">
        
        {/* SVG Map */}
        <svg viewBox="0 0 800 450" className="w-full h-full">
          
          {/* Floor Texture Pattern */}
          <defs>
            <pattern id="marble" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
               <rect x="0" y="0" width="100" height="100" fill="#FDFBF7"/>
               <path d="M10,10 Q30,40 50,10 T90,20" stroke="#F3E5AB" strokeWidth="2" fill="none" opacity="0.5"/>
               <path d="M0,80 Q40,60 80,90" stroke="#F3E5AB" strokeWidth="2" fill="none" opacity="0.5"/>
            </pattern>
          </defs>
          
          <rect x="0" y="0" width="800" height="450" fill="url(#marble)" />
          
          {/* Central Walkway */}
          <path d="M 50,225 L 750,225" stroke="#FFF" strokeWidth="160" strokeLinecap="round" opacity="0.8" />
          
          {/* --- TOP ROW STORES --- */}
          {/* We just pass the INDEX: 0, 1, 2... to fill slots sequentially */}
          <UnitBlock x={50} y={50} w={150} h={100} config={getUnitConfig(0)} navigate={navigate} label="101" />
          <UnitBlock x={325} y={50} w={150} h={100} config={getUnitConfig(1)} navigate={navigate} label="102" />
          <UnitBlock x={600} y={50} w={150} h={100} config={getUnitConfig(2)} navigate={navigate} label="103" />

          {/* --- BOTTOM ROW STORES --- */}
          <UnitBlock x={50} y={300} w={150} h={100} config={getUnitConfig(3)} navigate={navigate} label="104" />
          <UnitBlock x={325} y={300} w={150} h={100} config={getUnitConfig(4)} navigate={navigate} label="105" />
          <UnitBlock x={600} y={300} w={150} h={100} config={getUnitConfig(5)} navigate={navigate} label="106" />

          {/* Entrance Label */}
          <text x="400" y="435" textAnchor="middle" fontSize="10" fill="#B8860B" letterSpacing="4" fontWeight="bold" fontFamily="serif">
            MAIN ENTRANCE
          </text>
        </svg>

        {/* Legend */}
        {/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-gold-200 p-2 rounded-lg shadow-sm text-xs text-onyx flex flex-col gap-2"> */}
           {/* <div className="flex items-center gap-2"> */}
             {/* <div className="w-3 h-3 bg-white border border-gold-500"></div> */}
             {/* <span>Occupied Boutique</span> */}
           {/* </div> */}
           {/* <div className="flex items-center gap-2"> */}
             {/* <div className="w-3 h-3 bg-gold-200/50 border border-dashed border-gray-400"></div> */}
             {/* <span>Available for Lease</span> */}
           {/* </div> */}
        {/* </div> */}

      </div>
    </div>
  );
}

// --- SUB-COMPONENT ---
function UnitBlock({ x, y, w, h, config, navigate, label }: any) {
  const isOccupied = !!config.store;
  
  return (
    <g 
      onClick={() => isOccupied && navigate(`/store/${config.store.id}`)}
      style={{ cursor: config.cursor }}
      className={isOccupied ? "group transition-all duration-300" : ""}
    >
      {/* The Unit Box */}
      <rect 
        x={x} y={y} width={w} height={h} 
        fill={config.fill} 
        stroke={config.stroke} 
        strokeWidth={isOccupied ? "2" : "1"}
        strokeDasharray={isOccupied ? "" : "5,5"} 
        className={`transition-all duration-300 ${isOccupied ? 'group-hover:fill-gold-50 group-hover:stroke-gold-600 shadow-lg' : ''}`}
      />
      
      {isOccupied && (
        <rect 
          x={x + 5} y={y + 5} width={w - 10} height={h - 10} 
          fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5"
        />
      )}

      {/* Store Name Text */}
      <switch>
        <foreignObject x={x} y={y} width={w} height={h}>
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center pointer-events-none">
            {isOccupied ? (
              <>
                <span className="font-serif text-onyx font-bold text-sm leading-tight group-hover:text-gold-700 transition-colors">
                  {config.store.name}
                </span>
                <span className="text-[8px] text-gray-400 uppercase tracking-wider mt-1 font-sans">
                  Suite {label}
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-xs font-serif italic opacity-70">
                Available
              </span>
            )}
          </div>
        </foreignObject>
      </switch>
    </g>
  );
}