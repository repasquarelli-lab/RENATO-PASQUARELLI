import React, { useState, useEffect } from 'react';
import { MousePointer2, FolderTree, Settings, Map, FileStack, LayoutDashboard } from 'lucide-react';

export function Civil3DInterfaceDemo() {
  const [activeTab, setActiveTab] = useState('Home');
  const [activeToolspace, setActiveToolspace] = useState('Prospector');
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    let step = 0;
    const sequence = [
      // Move to Home tab
      { x: 30, y: 15, delay: 1000 },
      { action: () => setActiveTab('Home'), click: true, delay: 500 },
      // Move to Prospector
      { x: 50, y: 120, delay: 1500 },
      { action: () => setActiveToolspace('Prospector'), click: true, delay: 500 },
      // Move to Analyze tab
      { x: 180, y: 15, delay: 1500 },
      { action: () => setActiveTab('Analyze'), click: true, delay: 500 },
      // Move to Settings
      { x: 120, y: 120, delay: 1500 },
      { action: () => setActiveToolspace('Settings'), click: true, delay: 500 },
      // Wait before repeat
      { x: 300, y: 150, delay: 2000 }
    ];

    let timeoutId: NodeJS.Timeout;

    const runSequence = () => {
      const currentStep = sequence[step % sequence.length];
      
      if (currentStep.x !== undefined && currentStep.y !== undefined) {
        setCursorPos({ x: currentStep.x, y: currentStep.y });
      }
      
      if (currentStep.action) {
        setIsClicking(true);
        setTimeout(() => {
          setIsClicking(false);
          currentStep.action!();
        }, 200);
      }

      timeoutId = setTimeout(() => {
        step++;
        runSequence();
      }, currentStep.delay);
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-inner h-64 font-sans select-none my-6">
      {/* Ribbon Header Simulation */}
      <div className="bg-slate-800 text-slate-300 p-1 flex gap-4 text-xs font-medium pl-4 border-b border-slate-700">
        Autodesk Civil 3D 2027
      </div>
      
      {/* Ribbon Tabs */}
      <div className="bg-slate-100 border-b border-slate-300 flex text-xs">
        {['Home', 'Insert', 'Annotate', 'Analyze'].map(tab => (
          <div 
            key={tab} 
            className={`px-4 py-1.5 cursor-default transition-colors ${activeTab === tab ? 'bg-white text-indigo-700 border-b-2 border-indigo-500 font-semibold' : 'hover:bg-slate-200 text-slate-600'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Ribbon Content Panel */}
      <div className="bg-white border-b border-slate-200 h-16 flex items-center px-4 gap-6">
        {activeTab === 'Home' && (
          <>
            <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
              <FolderTree size={20} className="text-amber-500" />
              <span>Toolspace</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
              <FileStack size={20} className="text-blue-500" />
              <span>Alignments</span>
            </div>
          </>
        )}
        {activeTab === 'Analyze' && (
          <>
            <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
              <Map size={20} className="text-emerald-500" />
              <span>Catchments</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600">
              <LayoutDashboard size={20} className="text-indigo-500" />
              <span>InfoDrainage</span>
            </div>
          </>
        )}
        {activeTab !== 'Home' && activeTab !== 'Analyze' && (
          <div className="text-xs text-slate-400 italic">Ferramentas de {activeTab}</div>
        )}
      </div>

      <div className="flex h-[calc(100%-80px)]">
        {/* Toolspace Palettes */}
        <div className="w-48 bg-white border-r border-slate-200 h-full flex flex-col">
          <div className="bg-slate-200 text-[10px] font-bold text-slate-700 p-1 px-2 border-b border-slate-300">
            TOOLSPACE
          </div>
          <div className="flex text-[10px] bg-slate-100 border-b border-slate-300">
            {['Prospector', 'Settings', 'Survey'].map(tab => (
              <div 
                key={tab}
                className={`flex-1 text-center py-1 cursor-default ${activeToolspace === tab ? 'bg-white border-t-2 border-amber-500 text-slate-800 font-semibold' : 'text-slate-500'}`}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="flex-1 p-2 text-xs overflow-hidden">
            {activeToolspace === 'Prospector' && (
              <ul className="text-slate-600 space-y-1">
                <li className="flex items-center gap-1"><FolderTree size={12} className="text-amber-500" /> Data Shortcuts</li>
                <li className="flex items-center gap-1"><FileStack size={12} className="text-slate-400" /> Surfaces</li>
                <li className="flex items-center gap-1"><Map size={12} className="text-blue-400" /> Alignments</li>
              </ul>
            )}
            {activeToolspace === 'Settings' && (
              <ul className="text-slate-600 space-y-1">
                <li className="flex items-center gap-1"><Settings size={12} className="text-slate-500" /> General</li>
                <li className="flex items-center gap-1"><Settings size={12} className="text-slate-500" /> Point</li>
                <li className="flex items-center gap-1"><Settings size={12} className="text-slate-500" /> Surface</li>
              </ul>
            )}
            {activeToolspace === 'Survey' && (
              <ul className="text-slate-600 space-y-1">
                <li className="flex items-center gap-1"><Map size={12} className="text-indigo-400" /> Survey Databases</li>
                <li className="flex items-center gap-1"><Settings size={12} className="text-slate-500" /> Equipment Databases</li>
              </ul>
            )}
          </div>
        </div>

        {/* Drawing Area Mock */}
        <div className="flex-1 bg-slate-900 overflow-hidden relative" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <div className="absolute top-4 left-4 text-slate-500 text-[10px] font-mono">
               [-] [Top] [2D Wireframe]
            </div>
            {/* Draw a fake alignment */}
            <svg className="w-full h-full opacity-50">
               <path d="M 50 150 C 150 120, 200 40, 300 80" stroke="#f43f5e" strokeWidth="2" fill="none" strokeDasharray="5,5" />
               <path d="M 50 150 C 150 120, 200 40, 300 80" stroke="#f43f5e" strokeWidth="1" fill="none" />
            </svg>
        </div>
      </div>

      {/* Animated Cursor */}
      <div 
        className={`absolute z-50 pointer-events-none transition-all duration-700 ease-out ${isClicking ? 'scale-75' : 'scale-100'}`}
        style={{ top: cursorPos.y, left: cursorPos.x }}
      >
        <MousePointer2 size={24} className="text-slate-800 drop-shadow-md fill-white" />
        {isClicking && (
           <div className="absolute -top-1 -left-1 w-6 h-6 border-2 border-indigo-400 rounded-full animate-ping opacity-75" />
        )}
      </div>

      <div className="absolute bottom-2 right-2 bg-black/60 text-white/90 text-[10px] px-2 py-0.5 rounded backdrop-blur font-medium">
        Demonstração de Interface
      </div>
    </div>
  );
}
