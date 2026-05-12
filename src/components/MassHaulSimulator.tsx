import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { SlidersHorizontal, Info, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGamification } from '../context/GamificationContext';

export function MassHaulSimulator() {
  const [gradeOffset, setGradeOffset] = useState(0); // Elevação
  const [gradeSlope, setGradeSlope] = useState(1.0); // Inclinação (%)
  const { addXp, unlockBadge } = useGamification();
  const [hasAwardedXp, setHasAwardedXp] = useState(false);

  useEffect(() => {
    if ((gradeOffset !== 0 || gradeSlope !== 1.0) && !hasAwardedXp) {
        addXp(20);
        unlockBadge('simulation_complete');
        setHasAwardedXp(true);
    }
  }, [gradeOffset, gradeSlope, hasAwardedXp, addXp, unlockBadge]);

  const { data, totals } = useMemo(() => {
    const stations = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    const natural = [100, 105, 102, 110, 115, 112, 108, 105, 107, 103, 100];
    
    let cumulativeVolume = 0;
    let totalCut = 0;
    let totalFill = 0;
    const records = [];

    for (let i = 0; i < stations.length; i++) {
        // Z equals base elevation + offset + slope * distance
        const currentGrade = 100 + gradeOffset + (stations[i] * gradeSlope / 100);
        const ground = natural[i];
        
        const diff = ground - currentGrade; 
        const crossSectionArea = diff * 10; 
        
        let volume = 0;
        let cutVolume = 0;
        let fillVolume = 0;
        
        if (i > 0) {
            const prevGrade = 100 + gradeOffset + (stations[i-1] * gradeSlope / 100);
            const prevDiff = natural[i-1] - prevGrade;
            const prevArea = prevDiff * 10;
            const distance = stations[i] - stations[i-1];
            
            // Average end area method
            volume = ((crossSectionArea + prevArea) / 2) * distance;
            
            if (volume > 0) {
                totalCut += volume;
                cutVolume = volume;
            } else {
                totalFill += Math.abs(volume);
                fillVolume = Math.abs(volume);
            }
        }

        cumulativeVolume += volume;

        records.push({
            station: `${stations[i]}m`,
            natural: ground,
            grade: currentGrade,
            mass: Math.round(cumulativeVolume),
            cut: cutVolume,
            fill: fillVolume,
        });
    }
    return { 
      data: records, 
      totals: { 
        cut: Math.round(totalCut), 
        fill: Math.round(totalFill), 
        net: Math.round(cumulativeVolume) 
      } 
    };
  }, [gradeOffset, gradeSlope]);

  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
        <Activity className="w-5 h-5 mr-2 text-rose-600"/> 
        Simulador de Curva de Massa (Diagrama de Brückner)
      </h3>
      <p className="text-sm text-slate-600 mb-6 font-medium">Ajuste a Linha do Greide (Profile) e observe como a movimentação de terra (Corte/Aterro) se comporta acumuladamente.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700">
                <SlidersHorizontal className="w-4 h-4" /> Controle do Greide
             </div>
             
             <div className="mb-4">
               <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                 <span>Elevação (Offset)</span>
                 <span>{gradeOffset > 0 ? `+${gradeOffset}m` : `${gradeOffset}m`}</span>
               </div>
               <input 
                 type="range" min="-5" max="5" step="0.5" 
                 value={gradeOffset} onChange={e => setGradeOffset(parseFloat(e.target.value))}
                 className="w-full accent-rose-600"
               />
             </div>

             <div>
               <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                 <span>Inclinação (Slope)</span>
                 <span>{gradeSlope > 0 ? `+${gradeSlope}%` : `${gradeSlope}%`}</span>
               </div>
               <input 
                 type="range" min="-2" max="5" step="0.5" 
                 value={gradeSlope} onChange={e => setGradeSlope(parseFloat(e.target.value))}
                 className="w-full accent-indigo-600"
               />
               <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>- Descer (Corte)</span>
                  <span>+ Subir (Aterro)</span>
               </div>
             </div>
          </div>
          
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
             <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center"><Info className="w-4 h-4 mr-1" /> Interpretação</h5>
             <ul className="text-xs text-rose-900 leading-relaxed list-disc pl-4 space-y-1">
               <li><strong>Linha subindo:</strong> Trecho em Corte (excesso natural).</li>
               <li><strong>Linha descendo:</strong> Trecho em Aterro (demanda material).</li>
               <li><strong>No Eixo Zero:</strong> Volume 100% compensado.</li>
             </ul>
          </div>
        </div>
        
        <div className="md:col-span-3 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 h-48 flex flex-col justify-center relative">
               <span className="absolute top-2 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil Longitudinal</span>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNatural" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="station" hide />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{fontSize: 10}} width={40} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="natural" stroke="#10b981" fill="url(#colorNatural)" name="Terreno Natural" isAnimationActive={false} />
                    <Line type="monotone" dataKey="grade" stroke="#ef4444" strokeWidth={3} dot={false} name="Greide (Projeto)" isAnimationActive={false} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="flex flex-col md:flex-row gap-4 h-auto md:h-56">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex-1 flex flex-col justify-center relative min-h-[224px]">
                 <span className="absolute top-3 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Curva de Massa (Volume Acumulado)</span>
                 <div className="w-full flex-1 mt-6">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorMass" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="station" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10}} width={40} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="mass" stroke="#6366f1" strokeWidth={3} fill="url(#colorMass)" dot={{ r: 3, fill: '#6366f1' }} name="Volume (m³)" isAnimationActive={false} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>
              
              <div className="w-full md:w-56 flex flex-col gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col justify-center flex-1 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-10 transform group-hover:scale-110 transition-transform">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider relative z-10">Corte Total</span>
                  <span className="text-2xl font-black text-emerald-600 relative z-10">{totals.cut.toLocaleString()} <span className="text-sm font-bold text-emerald-500">m³</span></span>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex flex-col justify-center flex-1 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-10 transform group-hover:scale-110 transition-transform">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                  </div>
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider relative z-10">Aterro Total</span>
                  <span className="text-2xl font-black text-rose-600 relative z-10">{totals.fill.toLocaleString()} <span className="text-sm font-bold text-rose-500">m³</span></span>
                </div>
                <div className={cn("border rounded-xl p-3 flex flex-col justify-center flex-1 shadow-sm relative overflow-hidden transition-colors", totals.net > 0 ? "bg-indigo-50 border-indigo-200" : totals.net < 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200")}>
                  <span className={cn("text-xs font-bold uppercase tracking-wider relative z-10", totals.net > 0 ? "text-indigo-800" : totals.net < 0 ? "text-amber-800" : "text-slate-600")}>Saldo (Net)</span>
                  <span className={cn("text-2xl font-black relative z-10", totals.net > 0 ? "text-indigo-600" : totals.net < 0 ? "text-amber-600" : "text-slate-600")}>
                    {Math.abs(totals.net).toLocaleString()} <span className={cn("text-sm font-bold", totals.net > 0 ? "text-indigo-500" : totals.net < 0 ? "text-amber-500" : "text-slate-400")}>m³ {totals.net > 0 ? '(Sobra)' : totals.net < 0 ? '(Falta)' : ''}</span>
                  </span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
