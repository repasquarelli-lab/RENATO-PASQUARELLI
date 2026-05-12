import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Info, LayoutTemplate } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

export function Assembly2DViewer() {
  const [laneWidth, setLaneWidth] = useState(3.6);
  const [laneSlope, setLaneSlope] = useState(-2);
  const [daylightSlope, setDaylightSlope] = useState(2); // 2:1 or 3:1

  const { addXp, unlockBadge } = useGamification();
  const [hasAwardedXp, setHasAwardedXp] = useState(false);

  useEffect(() => {
    if ((laneWidth !== 3.6 || laneSlope !== -2 || daylightSlope !== 2) && !hasAwardedXp) {
        addXp(20);
        unlockBadge('simulation_complete');
        setHasAwardedXp(true);
    }
  }, [laneWidth, laneSlope, daylightSlope, hasAwardedXp, addXp, unlockBadge]);

  // Center is at 200, 100
  const cx = 200;
  const cy = 100;
  
  // Scale
  // standard width 3.6m -> ~ 80px -> 1m = 22.2px
  const scale = 22.2;

  // Calculate points
  const leftLaneX = cx - (laneWidth * scale);
  const rightLaneX = cx + (laneWidth * scale);
  
  // slope = -2% -> every 1m horizontal, goes down 0.02m
  const yDrop = (laneWidth * Math.abs(laneSlope) / 100) * scale;
  const yLaneOuter = cy + yDrop; // Assuming going "down" is positive Y in SVG

  // Daylight: slope 2:1 means horizontal:vertical = 2:1 => drop 1m every 2m horizontal.
  // We will just draw a generic daylight line 
  // Let's assume a drop of 1.5m
  const daylightDropModel = 1.5; // m
  const daylightY = yLaneOuter + (daylightDropModel * scale);
  const daylightXDist = daylightDropModel * daylightSlope * scale;
  
  const leftDaylightX = leftLaneX - daylightXDist;
  const rightDaylightX = rightLaneX + daylightXDist;

  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
        <LayoutTemplate className="w-5 h-5 mr-2 text-indigo-600"/> 
        Visualizador Analítico da Seção Tipo (Assembly)
      </h3>
      <p className="text-sm text-slate-600 mb-6 font-medium">Ajuste os parâmetros geométricos para visualizar o perfil transversal da Pista de Rolamento e os Taludes (Daylight).</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700">
                <SlidersHorizontal className="w-4 h-4" /> Parâmetros (Assembly)
             </div>
             
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                   <span>Largura da Faixa (Lane)</span>
                   <span>{laneWidth.toFixed(1)}m</span>
                 </div>
                 <input 
                   type="range" min="2.5" max="5.0" step="0.1" 
                   value={laneWidth} onChange={e => setLaneWidth(parseFloat(e.target.value))}
                   className="w-full accent-indigo-600"
                 />
               </div>
               
               <div>
                 <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                   <span>Caimento Transversal (%)</span>
                   <span>{laneSlope}%</span>
                 </div>
                 <input 
                   type="range" min="-5" max="5" step="0.5" 
                   value={laneSlope} onChange={e => setLaneSlope(parseFloat(e.target.value))}
                   className="w-full accent-indigo-600"
                 />
               </div>

               <div>
                 <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                   <span>Talude de Corte/Aterro (H:V)</span>
                   <span>{daylightSlope}:1</span>
                 </div>
                 <input 
                   type="range" min="1" max="4" step="0.5" 
                   value={daylightSlope} onChange={e => setDaylightSlope(parseFloat(e.target.value))}
                   className="w-full accent-indigo-600"
                 />
               </div>
             </div>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
             <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center"><Info className="w-4 h-4 mr-1" /> Funcionamento</h5>
             <p className="text-xs text-indigo-900 leading-relaxed">
               As <strong>Assemblies</strong> controlam as estruturas da rodovia. Os parâmetros ("Target Parameters") no subassembly como o <em>BasicLane</em> controlam fisicamente o modelo 3D.
             </p>
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center min-h-[300px] relative">
           <svg viewBox="0 0 400 200" className="w-full h-full max-w-lg">
              {/* Eixo central */}
              <line x1={cx} y1="20" x2={cx} y2="180" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Reference Grid */}
              <line x1="50" y1={cy} x2="350" y2={cy} stroke="#e2e8f0" strokeWidth="1" />
              
              {/* Left Daylight */}
              <line x1={leftLaneX} y1={yLaneOuter} x2={leftDaylightX} y2={daylightY} stroke="#10b981" strokeWidth="3" />
              {/* Right Daylight */}
              <line x1={rightLaneX} y1={yLaneOuter} x2={rightDaylightX} y2={daylightY} stroke="#10b981" strokeWidth="3" />
              
              {/* Left Pavement */}
              <line x1={cx} y1={cy} x2={leftLaneX} y2={yLaneOuter} stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              {/* Right Pavement */}
              <line x1={cx} y1={cy} x2={rightLaneX} y2={yLaneOuter} stroke="#475569" strokeWidth="6" strokeLinecap="round" />
              
              {/* Centro / Assembly Marker */}
              <circle cx={cx} cy={cy} r="5" fill="#ef4444" />
              <circle cx={cx} cy={cy} r="9" fill="none" stroke="#ef4444" strokeWidth="2" />
              
              {/* Texts */}
              <text x={cx} y={cy - 10} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">Centerline</text>
              <text x={(cx + rightLaneX)/2} y={yLaneOuter - 15} textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">Pista</text>
              <text x={(cx + rightLaneX)/2} y={yLaneOuter - 5} textAnchor="middle" fill="#64748b" fontSize="9">{laneWidth.toFixed(1)}m | {laneSlope}%</text>
              <text x={rightLaneX + 20} y={yLaneOuter + 10} fill="#10b981" fontSize="10" fontWeight="bold">Daylight</text>
              <text x={rightLaneX + 20} y={yLaneOuter + 20} fill="#059669" fontSize="9">{daylightSlope}:1</text>
           </svg>
        </div>
      </div>
    </div>
  );
}
