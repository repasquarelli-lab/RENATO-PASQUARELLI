import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function TemplateSelector() {
  const [template, setTemplate] = useState<'rodovias' | 'drenagem'>('rodovias');
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    'C3D-ROD-EIXO': true,
    'C3D-ROD-BORDO': true,
    'C3D-ROD-ACOST': true,
    'C3D-ROD-ESTACAS': true,
    'C3D-ROD-CURVAS': true,
    'C3D-DREN-REDE': true,
    'C3D-DREN-PV': true,
    'C3D-DREN-BOCAL': true,
  });

  const toggleLayer = (layerName: string) => {
    setVisibleLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const templates = {
    rodovias: {
      title: 'Template: Rodovias e Topografia',
      layers: [
        { name: 'C3D-ROD-EIXO', color: '#ef4444', type: 'Tracejada (Dash-Dot)', label: 'Eixo da Rodovia' },
        { name: 'C3D-ROD-BORDO', color: '#eab308', type: 'Sólida (Continuous)', label: 'Bordo da Pista' },
        { name: 'C3D-ROD-ACOST', color: '#f97316', type: 'Tracejada (Dashed)', label: 'Acostamento' },
        { name: 'C3D-ROD-ESTACAS', color: '#64748b', type: 'Texto (Arial)', label: 'Rótulo de Estacas' },
        { name: 'C3D-ROD-CURVAS', color: '#a8a29e', type: 'Sólida/Suave', label: 'Curvas de Nível' },
      ]
    },
    drenagem: {
      title: 'Template: Redes de Drenagem',
      layers: [
        { name: 'C3D-DREN-REDE', color: '#3b82f6', type: 'Sólida (Continuous)', label: 'Tubo de Drenagem' },
        { name: 'C3D-DREN-PV', color: '#06b6d4', type: 'Símbolo (Circle)', label: 'Poço de Visita (PV)' },
        { name: 'C3D-DREN-BOCAL', color: '#6366f1', type: 'Símbolo (Square)', label: 'Boca de Lobo' },
        { name: 'C3D-ROD-BORDO', color: '#eab308', type: 'Sólida (Referência)', label: 'Bordo da Pista (Ref)' },
      ]
    }
  };

  const activeTemplate = templates[template];

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm my-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Visualizador Interativo de Camadas (Layers & Styles)</h3>
      <p className="text-slate-500 mb-8 text-sm max-w-3xl">
        No Civil 3D, praticamente tudo é controlado por "Estilos". Ative ou desative as layers abaixo para compreender como a configuração do template (DWT) afeta a exibição do projeto.
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTemplate('rodovias')}
          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
            template === 'rodovias' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-200 hover:border-indigo-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="font-bold text-lg mb-1">Via & Topografia</span>
          <span className="text-xs font-medium opacity-80">Estradas, Estacas e Curvas de Nível</span>
        </button>
        <button
          onClick={() => setTemplate('drenagem')}
          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
            template === 'drenagem' ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-md' : 'border-slate-200 hover:border-sky-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="font-bold text-lg mb-1">Redes de Drenagem</span>
          <span className="text-xs font-medium opacity-80">Tubulações, PVs e Bocas de Lobo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-200 bg-slate-50 rounded-xl overflow-hidden flex flex-col">
           <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-sm">
             Painel de Layers (Style Manager)
           </div>
           <div className="flex-1 p-2 space-y-1">
             {activeTemplate.layers.map((layer) => {
               const isVisible = visibleLayers[layer.name];
               return (
                 <button 
                   key={layer.name}
                   onClick={() => toggleLayer(layer.name)}
                   className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors border ${isVisible ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-transparent opacity-60 hover:bg-slate-200'}`}
                 >
                   <div 
                     className="w-4 h-4 shrink-0 rounded-sm"
                     style={{ backgroundColor: layer.color }}
                   />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs font-bold text-slate-800 truncate">{layer.name}</div>
                     <div className="text-[10px] text-slate-500 truncate">{layer.label}</div>
                   </div>
                   <div className="text-slate-400">
                     {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                   </div>
                 </button>
               );
             })}
           </div>
        </div>
        
        <div className="lg:col-span-2 relative bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-300 min-h-[300px]">
           {/* Top bar describing mockup viewport */}
           <div className="absolute top-0 left-0 w-full bg-slate-800/80 backdrop-blur-sm p-2 flex justify-between items-center text-[10px] font-mono text-slate-300 z-10 border-b border-white/10">
             <span>[-] [Top] [2D Wireframe]</span>
             <span>Model Space</span>
           </div>

           {/* The actual Model Preview SVG */}
           <div className="w-full h-full p-4 pt-12 flex items-center justify-center overflow-hidden">
             <svg width="100%" height="100%" viewBox="0 0 600 400" className="opacity-90">
               {/* Background Grid */}
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
               </pattern>
               <rect width="100%" height="100%" fill="url(#grid)" />

               {/* Rodovia Layers */}
               {template === 'rodovias' && (
                 <g>
                   {/* Curvas de Nível */}
                   {visibleLayers['C3D-ROD-CURVAS'] && (
                     <g fill="none" stroke="#a8a29e" strokeWidth="1" className="opacity-30">
                       <path d="M -50 50 Q 150 150, 400 30 T 650 100" />
                       <path d="M -50 100 Q 150 200, 400 80 T 650 150" strokeWidth="2" /> {/* Curva Mestre */}
                       <path d="M -50 150 Q 150 250, 400 130 T 650 200" />
                       <path d="M -50 350 Q 150 200, 400 380 T 650 300" />
                       <path d="M -50 400 Q 150 250, 400 430 T 650 350" />
                     </g>
                   )}

                   {/* Acostamento */}
                   {visibleLayers['C3D-ROD-ACOST'] && (
                     <g fill="none" stroke="#f97316" strokeDasharray="10,5" strokeWidth="2" className="opacity-80">
                       <path d="M -10 130 Q 300 280, 610 130" />
                       <path d="M -10 270 Q 300 420, 610 270" />
                     </g>
                   )}

                   {/* Bordo da Pista */}
                   {visibleLayers['C3D-ROD-BORDO'] && (
                     <g fill="none" stroke="#eab308" strokeWidth="3">
                       <path d="M -10 150 Q 300 300, 610 150" />
                       <path d="M -10 250 Q 300 400, 610 250" />
                     </g>
                   )}

                   {/* Eixo da Rodovia */}
                   {visibleLayers['C3D-ROD-EIXO'] && (
                     <path d="M -10 200 Q 300 350, 610 200" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="20,10,5,10" />
                   )}

                   {/* Rótulo de Estacas */}
                   {visibleLayers['C3D-ROD-ESTACAS'] && visibleLayers['C3D-ROD-EIXO'] && (
                     <g className="font-mono text-[10px]" fill="#cbd5e1" dominantBaseline="middle" textAnchor="middle">
                       <g transform="translate(100, 248) rotate(35)"><line x1="0" y1="-10" x2="0" y2="10" stroke="#cbd5e1"/><text y="-18">0+020</text></g>
                       <g transform="translate(300, 313) rotate(0)"><line x1="0" y1="-10" x2="0" y2="10" stroke="#cbd5e1"/><text y="-18">0+040</text></g>
                       <g transform="translate(500, 248) rotate(-35)"><line x1="0" y1="-10" x2="0" y2="10" stroke="#cbd5e1"/><text y="-18">0+060</text></g>
                     </g>
                   )}
                 </g>
               )}

               {/* Drenagem Layers */}
               {template === 'drenagem' && (
                 <g>
                   {/* Bordo da Pista (Ref) */}
                   {visibleLayers['C3D-ROD-BORDO'] && (
                     <g fill="none" stroke="#eab308" strokeWidth="2" className="opacity-40">
                       <path d="M -10 150 Q 300 300, 610 150" />
                       <path d="M -10 250 Q 300 400, 610 250" />
                     </g>
                   )}

                   {/* Tubos de Drenagem */}
                   {visibleLayers['C3D-DREN-REDE'] && (
                     <g fill="none" stroke="#3b82f6" strokeWidth="6" className="opacity-80">
                       <path d="M 120 180 L 300 240 L 480 180" />
                       <path d="M 120 180 L 120 145" strokeWidth="4" />
                       <path d="M 300 240 L 300 295" strokeWidth="4" />
                       <path d="M 480 180 L 480 145" strokeWidth="4" />
                     </g>
                   )}

                   {/* Bocas de Lobo */}
                   {visibleLayers['C3D-DREN-BOCAL'] && (
                     <g fill="#6366f1" stroke="#312e81" strokeWidth="2">
                       <rect x="110" y="130" width="20" height="15" rx="3" transform="rotate(27 120 137)" />
                       <rect x="290" y="285" width="20" height="15" rx="3" transform="rotate(0 300 292)" />
                       <rect x="470" y="130" width="20" height="15" rx="3" transform="rotate(-27 480 137)" />
                     </g>
                   )}

                   {/* PVs */}
                   {visibleLayers['C3D-DREN-PV'] && (
                     <g fill="#06b6d4" stroke="#ffffff" strokeWidth="2">
                       <circle cx="120" cy="180" r="12" />
                       <circle cx="300" cy="240" r="14" />
                       <circle cx="480" cy="180" r="12" />
                     </g>
                   )}
                 </g>
               )}
             </svg>
           </div>
        </div>
      </div>
    </div>
  );
}
