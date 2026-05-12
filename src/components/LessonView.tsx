import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Box, Cylinder, Html, Outlines, Detailed, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, SSAO } from '@react-three/postprocessing';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { courseModules, Lesson, Quiz } from '../data/course';
import { Check, ArrowRight, ArrowLeft, ArrowDown, Trophy, ChevronDown, Droplets, ExternalLink, PlayCircle, HelpCircle, Share2, Save, PenTool, Cuboid, Info, Lock, Lightbulb, Loader2, Subtitles, FileText, X, Video, Sparkles, Download, BookText, Search, Play, Pause, Volume2, VolumeX, Maximize, TrendingUp, MapPin, Home, TreePine, ChevronRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, ScatterChart, Scatter, ZAxis, LineChart, Line as RechartsLine } from 'recharts';
import { AIChatbot } from './AIChatbot';
import { VideoGeneratorModal } from './VideoGeneratorModal';
import { glossaryTerms } from './Glossary';
import { useGamification } from '../context/GamificationContext';
import { Assembly2DViewer } from './Assembly2DViewer';
import { MassHaulSimulator } from './MassHaulSimulator';
import { DynamicQuiz } from './DynamicQuiz';
import { AILispEditor } from './AILispEditor';
import { TemplateSelector } from './TemplateSelector';
import { Civil3DInterfaceDemo } from './Civil3DInterfaceDemo';

interface LessonViewProps {
  lessonId: string;
  completedLessons: string[];
  toggleLessonCompletion: (id: string) => void;
  navigateToLesson: (id: string) => void;
}

function QuizSection({ quiz, onComplete }: { quiz: Quiz, onComplete?: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { addXp, unlockBadge } = useGamification();
  const [hasAwardedXp, setHasAwardedXp] = useState(false);

  const handleSubmit = () => {
    if (selected !== null) {
      setShowResult(true);
      if (selected === quiz.correctAnswer && !hasAwardedXp) {
         addXp(50);
         unlockBadge('first_quiz');
         setHasAwardedXp(true);
      }
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Verificação de Conhecimento</h3>
      </div>
      <p className="text-slate-800 font-medium mb-6 text-lg leading-relaxed">
        {quiz.question}
      </p>
      <div className="space-y-3">
        {quiz.options.map((option, index) => {
          let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-start space-x-4 relative ";
          
          if (!showResult) {
            buttonClass += selected === index 
              ? "border-indigo-500 bg-indigo-50 shadow-sm" 
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";
          } else {
            if (index === quiz.correctAnswer) {
              buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500 font-bold scale-[1.01] z-10";
            } else if (selected === index) {
              buttonClass += "border-rose-500 bg-rose-50 text-rose-900 shadow-sm ring-1 ring-rose-500 font-bold";
            } else {
              buttonClass += "border-slate-200 bg-slate-50 opacity-50 text-slate-500";
            }
          }

          return (
            <button
              key={index}
              disabled={showResult}
              onClick={() => setSelected(index)}
              className={buttonClass}
            >
              <div className={cn("w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors duration-300", 
                showResult && index === quiz.correctAnswer ? "border-emerald-600 bg-emerald-600" : 
                showResult && selected === index && index !== quiz.correctAnswer ? "border-rose-500 bg-rose-500" :
                selected === index && !showResult ? "border-indigo-600 bg-indigo-600" : 
                "border-slate-300 bg-white")} 
              >
                  {showResult && index === quiz.correctAnswer && <Check className="w-4 h-4 text-white" />}
                  {showResult && selected === index && index !== quiz.correctAnswer && <X className="w-4 h-4 text-white" />}
              </div>
              <span className={cn("text-sm font-medium leading-relaxed flex-1", showResult && (index === quiz.correctAnswer || selected === index) && "pt-0.5")}>{option}</span>
              
              {showResult && index === quiz.correctAnswer && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 animate-in zoom-in duration-300">
                  Correto
                </div>
              )}
              {showResult && selected === index && index !== quiz.correctAnswer && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-rose-700 bg-rose-100 px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 animate-in zoom-in duration-300">
                  Incorreto
                </div>
              )}
            </button>
          );
        })}
      </div>
      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          aria-label="Confirmar Resposta"
          className={cn("mt-8 px-6 py-3 rounded-lg text-sm font-bold transition-colors tracking-wide", selected !== null ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-200 text-slate-400 cursor-not-allowed")}
        >
          Confirmar Resposta
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          aria-live="polite"
          className={cn("mt-6 p-5 rounded-lg border", selected === quiz.correctAnswer ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-sky-200")}
        >
          <h4 className={cn("font-bold mb-2 flex items-center space-x-2 text-base", selected === quiz.correctAnswer ? "text-emerald-800" : "text-sky-800")}>
            {selected === quiz.correctAnswer ? (
              <span className="flex items-center gap-2">
                <motion.span 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  ✨
                </motion.span>
                Parabéns, Resposta Correta!
              </span>
            ) : <span>💡 Boa tentativa, preste atenção!</span>}
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {quiz.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

type ModelType = 'corridor' | 'manhole' | 'intersection';

const CorridorSurface = React.memo(function CorridorSurface({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'surface';
  return (
    <group position={[0, 0, 0]}>
      <Detailed distances={[0, 20, 40]}>
        <mesh 
          position={[0, 0, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('surface'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('surface'); }}
        >
          <boxGeometry args={[10, 0.2, 20]} />
          <meshStandardMaterial color={isHovered ? '#64748b' : '#475569'} wireframe={wireframe} roughness={0.8} />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          position={[0, 0, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('surface'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('surface'); }}
        >
          <boxGeometry args={[10, 0.2, 20]} />
          <meshStandardMaterial color={isHovered ? '#64748b' : '#475569'} wireframe={wireframe} roughness={0.8} />
        </mesh>
        <mesh 
          position={[0, 0, 0]}
        >
          <boxGeometry args={[10, 0.2, 20]} />
          <meshBasicMaterial color={isHovered ? '#64748b' : '#475569'} wireframe={wireframe} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-sky-500 backdrop-blur pointer-events-none w-64 leading-relaxed group">
            <span className="font-bold text-sky-400 block text-base mb-1 tracking-tight">Pista (Road Surface)</span>
            <span className="text-slate-300 text-xs">Camada superior pavimentada por onde trafegam os veículos. No Civil 3D, definida pelos 'Lanes' na submontagem (Subassembly).</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const CorridorCenterline = React.memo(function CorridorCenterline({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'centerline';
  return (
    <group position={[0, 0, 0]}>
      <Detailed distances={[0, 20, 40]}>
        <mesh 
          position={[0, 0, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('centerline'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('centerline'); }}
        >
          <boxGeometry args={[0.2, 0.22, 20]} />
          <meshStandardMaterial color={isHovered ? '#fde047' : '#fcd34d'} wireframe={wireframe} />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          position={[0, 0, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('centerline'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('centerline'); }}
        >
          <boxGeometry args={[0.2, 0.22, 20]} />
          <meshStandardMaterial color={isHovered ? '#fde047' : '#fcd34d'} wireframe={wireframe} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.22, 20]} />
          <meshBasicMaterial color={isHovered ? '#fde047' : '#fcd34d'} wireframe={wireframe} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-yellow-400 backdrop-blur pointer-events-none w-64 leading-relaxed group">
            <span className="font-bold text-yellow-400 block text-base mb-1 tracking-tight">Eixo (Centerline)</span>
            <span className="text-slate-300 text-xs">Alinhamento horizontal base. Controla a estaca zero, progressão e diretriz do projeto viário.</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const CorridorLeftSlope = React.memo(function CorridorLeftSlope({ wireframe, activePart, setHoveredPart, cutHatchTexture, onPartClick, slope = 1 }: any) {
  const isHovered = activePart === 'leftSlope';
  const V = 2; // Fixed vertical height for visualization
  const H = slope;
  const length = V * Math.sqrt(H * H + 1);
  const rotZ = -Math.atan(1 / H);
  const posX = - (length / 2) * Math.cos(rotZ);
  const posY = - (length / 2) * Math.sin(rotZ);

  return (
    <group position={[-5, 0, 0]}>
      <Detailed distances={[0, 20, 40]}>
        <mesh 
          rotation={[0, 0, rotZ]} 
          position={[posX, posY, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('leftSlope'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('leftSlope'); }}
        >
          <boxGeometry args={[length, 0.2, 20]} />
          <meshStandardMaterial 
            map={cutHatchTexture} 
            color={'#ffffff'} 
            wireframe={false} 
            roughness={0.9} 
            transparent={true}
            opacity={wireframe ? 0.8 : 1}
            emissive={isHovered ? '#fca5a5' : '#000000'}
          />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          rotation={[0, 0, rotZ]} 
          position={[posX, posY, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('leftSlope'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('leftSlope'); }}
        >
          <boxGeometry args={[length, 0.2, 20]} />
          <meshStandardMaterial 
            color={'#fee2e2'} 
            wireframe={wireframe} 
            roughness={0.9} 
            emissive={isHovered ? '#fca5a5' : '#000000'}
          />
        </mesh>
        <mesh 
          rotation={[0, 0, rotZ]} 
          position={[posX, posY, 0]}
        >
          <boxGeometry args={[length, 0.2, 20]} />
          <meshBasicMaterial color={'#fee2e2'} wireframe={wireframe} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[-3, 4, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-red-500 backdrop-blur pointer-events-none w-64 leading-relaxed group">
            <span className="font-bold text-red-400 block text-base mb-1 tracking-tight">Talude Esquerdo (Cut)</span>
            <span className="text-slate-300 text-xs">Superfície de terraplenagem em corte. Conecta dinamicamente a borda da pista subindo até o terreno natural (Target Surface).</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const CorridorRightSlope = React.memo(function CorridorRightSlope({ wireframe, activePart, setHoveredPart, fillHatchTexture, onPartClick, slope = 1 }: any) {
  const isHovered = activePart === 'rightSlope';
  const V = 2; // Fixed vertical depth for visualization
  const H = slope;
  const length = V * Math.sqrt(H * H + 1);
  const rotZ = -Math.atan(1 / H);
  const posX = (length / 2) * Math.cos(rotZ);
  const posY = (length / 2) * Math.sin(rotZ);

  return (
    <group position={[5, 0, 0]}>
      <Detailed distances={[0, 20, 40]}>
        <mesh 
          rotation={[0, 0, rotZ]} 
          position={[posX, posY, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('rightSlope'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('rightSlope'); }}
        >
          <boxGeometry args={[length, 0.2, 20]} />
          <meshStandardMaterial 
            map={fillHatchTexture} 
            color={'#ffffff'} 
            wireframe={false} 
            roughness={0.9} 
            transparent={true}
            opacity={wireframe ? 0.8 : 1}
            emissive={isHovered ? '#86efac' : '#000000'}
          />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          rotation={[0, 0, rotZ]} 
          position={[posX, posY, 0]} 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('rightSlope'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('rightSlope'); }}
        >
          <boxGeometry args={[length, 0.2, 20]} />
          <meshStandardMaterial 
            color={'#d1fae5'} 
            wireframe={wireframe} 
            roughness={0.9} 
            emissive={isHovered ? '#86efac' : '#000000'}
          />
        </mesh>
        <mesh 
          rotation={[0, 0, rotZ]} 
          position={[posX, posY, 0]}
        >
          <boxGeometry args={[length, 0.2, 20]} />
          <meshBasicMaterial color={'#d1fae5'} wireframe={wireframe} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[3, 2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-emerald-500 backdrop-blur pointer-events-none w-64 leading-relaxed group">
            <span className="font-bold text-emerald-400 block text-base mb-1 tracking-tight">Talude Direito (Fill)</span>
            <span className="text-slate-300 text-xs">Superfície de terraplenagem em aterro. Conecta dinamicamente a borda da pista descendo até o terreno natural (Target Surface).</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const CorridorCurbReturn = React.memo(function CorridorCurbReturn({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'curbReturn';
  return (
    <group position={[5, 0, 8]}>
      <mesh 
        castShadow 
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('curbReturn'); }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => { e.stopPropagation(); onPartClick?.('curbReturn'); }}
      >
        <cylinderGeometry args={[2, 2, 0.4, 32, 1, false, 0, Math.PI / 2]} />
        <meshStandardMaterial color={isHovered ? '#f472b6' : '#db2777'} wireframe={wireframe} roughness={0.7} />
        {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color="white" />}
      </mesh>
    </group>
  );
});

const CorridorOffsetPivots = React.memo(function CorridorOffsetPivots({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'offsetPivot';
  return (
    <group position={[-5.2, 0.1, 0]}>
      <mesh 
        castShadow 
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('offsetPivot'); }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => { e.stopPropagation(); onPartClick?.('offsetPivot'); }}
      >
        <boxGeometry args={[0.4, 0.4, 20]} />
        <meshStandardMaterial color={isHovered ? '#38bdf8' : '#0284c7'} wireframe={wireframe} roughness={0.6} />
        {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color="white" />}
      </mesh>
      <mesh 
        position={[10.4, 0, 0]}
        castShadow 
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('offsetPivot'); }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => { e.stopPropagation(); onPartClick?.('offsetPivot'); }}
      >
        <boxGeometry args={[0.4, 0.4, 20]} />
        <meshStandardMaterial color={isHovered ? '#38bdf8' : '#0284c7'} wireframe={wireframe} roughness={0.6} />
      </mesh>
    </group>
  );
});

const CorridorModel = React.memo(function CorridorModel({ wireframe = false, externalHighlight = null, leftSlopeValue = 1, rightSlopeValue = 1, showCurbReturn = false, showOffsetPivots = false, lightIntensity = 1, onPartClick, onToggleCurbReturn, onToggleOffsetPivots }: { wireframe?: boolean, externalHighlight?: string | null, leftSlopeValue?: number, rightSlopeValue?: number, showCurbReturn?: boolean, showOffsetPivots?: boolean, lightIntensity?: number, onPartClick?: (part: string) => void, onToggleCurbReturn?: (v: boolean) => void, onToggleOffsetPivots?: (v: boolean) => void }) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [isDashed, setIsDashed] = useState(false);
  
  const activePart = externalHighlight || hoveredPart;

  const cutHatchTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = wireframe ? 'rgba(26, 5, 5, 0.4)' : '#fee2e2'; // Light red or dark transparent red
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = wireframe ? '#ef4444' : '#dc2626'; // Vivid red
      ctx.lineWidth = 12;
      if (isDashed) {
         ctx.setLineDash([15, 15]);
      } else {
         ctx.setLineDash([]);
      }
      ctx.beginPath();
      for(let i = -128; i < 256; i += 32) {
         ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128);
         ctx.moveTo(i + 128, 0); ctx.lineTo(i, 128);
      }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 6);
    tex.anisotropy = 16;
    return tex;
  }, [wireframe, isDashed]);

  const fillHatchTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = wireframe ? 'rgba(2, 44, 34, 0.4)' : '#d1fae5'; // Light green or dark transparent green
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = wireframe ? '#10b981' : '#059669'; // Vivid green
      ctx.lineWidth = 12;
      if (isDashed) {
         ctx.setLineDash([15, 15]);
      } else {
         ctx.setLineDash([]);
      }
      ctx.beginPath();
      for(let i = -128; i < 256; i += 32) {
         ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128);
      }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 6);
    tex.anisotropy = 16;
    return tex;
  }, [wireframe, isDashed]);

  return (
    <group>
      {/* Enhanced Soft Lighting for Corridor Model */}
      <directionalLight 
        position={[-20, 30, 20]} 
        castShadow 
        intensity={3 * lightIntensity} 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0005} 
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20, 0.1, 100]} />
      </directionalLight>
      <directionalLight position={[20, 20, -15]} intensity={1.2 * lightIntensity} color="#e0f2fe" />
      <directionalLight position={[0, -10, 10]} intensity={0.4 * lightIntensity} color="#f1f5f9" />
      <ambientLight intensity={0.6 * lightIntensity} color="#f8fafc" />

      <Html position={[0, 5, 0]} center zIndexRange={[100, 0]}>
        <div className="flex flex-col gap-2 3d-controls-container">
          <button 
            onClick={() => setIsDashed(d => !d)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg pointer-events-auto transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {isDashed ? 'Hachura: Sólida' : 'Hachura: Tracejada'}
          </button>
          <button 
            onClick={() => onToggleCurbReturn?.(!showCurbReturn)}
            className={`${showCurbReturn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'} text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg pointer-events-auto transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400`}
          >
            Curb Return: {showCurbReturn ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => onToggleOffsetPivots?.(!showOffsetPivots)}
            className={`${showOffsetPivots ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'} text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg pointer-events-auto transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400`}
          >
            Offset Pivots: {showOffsetPivots ? 'ON' : 'OFF'}
          </button>
        </div>
      </Html>

      <CorridorSurface wireframe={wireframe} isDashed={isDashed} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />
      <CorridorCenterline wireframe={wireframe} isDashed={isDashed} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />
      <CorridorLeftSlope wireframe={wireframe} isDashed={isDashed} activePart={activePart} setHoveredPart={setHoveredPart} cutHatchTexture={cutHatchTexture} onPartClick={onPartClick} slope={leftSlopeValue} />
      <CorridorRightSlope wireframe={wireframe} isDashed={isDashed} activePart={activePart} setHoveredPart={setHoveredPart} fillHatchTexture={fillHatchTexture} onPartClick={onPartClick} slope={rightSlopeValue} />
      {showCurbReturn && <CorridorCurbReturn wireframe={wireframe} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />}
      {showOffsetPivots && <CorridorOffsetPivots wireframe={wireframe} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />}
    </group>
  );
});

const ManholeBody = React.memo(function ManholeBody({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'body';
  const color = isHovered ? '#cbd5e1' : '#94a3b8';
  return (
    <group position={[0, 3, 0]}>
      <Detailed distances={[0, 15, 30]}>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('body'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('body'); }}
        >
          <cylinderGeometry args={[1.5, 1.5, 6, 32]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.7} />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('body'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('body'); }}
        >
          <cylinderGeometry args={[1.5, 1.5, 6, 16]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.7} />
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('body'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('body'); }}
        >
          <cylinderGeometry args={[1.5, 1.5, 6, 8]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.7} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-slate-400 backdrop-blur pointer-events-none w-64 leading-relaxed group">
            <span className="font-bold text-slate-300 block text-base mb-1 tracking-tight">Estrutura (Structure Body)</span>
            <span className="text-slate-400 text-xs">Câmara principal cilíndrica. Modela a cota de fundo de projeto e comporta conexões das tubulações.</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const ManholeCover = React.memo(function ManholeCover({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'cover';
  const color = isHovered ? '#475569' : '#334155';
  return (
    <group position={[0, 6.1, 0]}>
      <Detailed distances={[0, 15, 30]}>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('cover'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('cover'); }}
        >
          <cylinderGeometry args={[1.6, 1.6, 0.2, 32]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.8} />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('cover'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('cover'); }}
        >
          <cylinderGeometry args={[1.6, 1.6, 0.2, 16]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.8} />
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('cover'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('cover'); }}
        >
          <cylinderGeometry args={[1.6, 1.6, 0.2, 8]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.8} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[0, 0.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-slate-500 backdrop-blur pointer-events-none w-64 leading-relaxed group">
            <span className="font-bold text-slate-400 block text-base mb-1 tracking-tight">Tampão / Gola (Cover/Frame)</span>
            <span className="text-slate-400 text-xs">Fornece acesso à manutenção. Alinha-se automaticamente ao terreno (Surface) no Civil 3D.</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const ManholePipeIn = React.memo(function ManholePipeIn({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'pipeIn';
  const color = isHovered ? '#f1f5f9' : '#cbd5e1';
  return (
    <group position={[-4, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
      <Detailed distances={[0, 15, 30]}>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('pipeIn'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('pipeIn'); }}
        >
          <cylinderGeometry args={[0.8, 0.8, 8, 32]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.6} metalness={0.2} />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('pipeIn'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('pipeIn'); }}
        >
          <cylinderGeometry args={[0.8, 0.8, 8, 16]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('pipeIn'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('pipeIn'); }}
        >
          <cylinderGeometry args={[0.8, 0.8, 8, 8]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.6} metalness={0.2} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[0, -2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-sky-400 backdrop-blur pointer-events-none w-64 leading-relaxed group" style={{transform: "rotate(-90deg)"}}>
            <span className="font-bold text-sky-300 block text-base mb-1 tracking-tight">Tubo Contribuinte (Inlet Pipe)</span>
            <span className="text-slate-300 text-xs">Conduto condutor em direção a montante. Suas cotas de fundo determinam a queda de água no poço de visita.</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const ManholePipeOut = React.memo(function ManholePipeOut({ wireframe, activePart, setHoveredPart, onPartClick }: any) {
  const isHovered = activePart === 'pipeOut';
  const color = isHovered ? '#f1f5f9' : '#cbd5e1';
  return (
    <group position={[4, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
      <Detailed distances={[0, 15, 30]}>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('pipeOut'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('pipeOut'); }}
        >
          <cylinderGeometry args={[0.8, 0.8, 8, 32]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.6} metalness={0.2} />
          {isHovered && <Outlines thickness={wireframe ? 0.08 : 0.05} color={wireframe ? "yellow" : "white"} />}
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('pipeOut'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('pipeOut'); }}
        >
          <cylinderGeometry args={[0.8, 0.8, 8, 16]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh 
          castShadow 
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('pipeOut'); }}
          onPointerOut={() => setHoveredPart(null)}
          onClick={(e) => { e.stopPropagation(); onPartClick?.('pipeOut'); }}
        >
          <cylinderGeometry args={[0.8, 0.8, 8, 8]} />
          <meshStandardMaterial color={color} wireframe={wireframe} roughness={0.6} metalness={0.2} />
        </mesh>
      </Detailed>
      {isHovered && (
        <Html position={[0, -2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-slate-700 border-l-sky-600 backdrop-blur pointer-events-none w-64 leading-relaxed group" style={{transform: "rotate(-90deg)"}}>
            <span className="font-bold text-sky-400 block text-base mb-1 tracking-tight">Tubo Efluente (Outlet Pipe)</span>
            <span className="text-slate-300 text-xs">Conduto condutor em direção a jusante. Diâmetro dimensionado para a vazão acumulada total da rede.</span>
          </div>
        </Html>
      )}
    </group>
  );
});

const ManholeModel = React.memo(function ManholeModel({ wireframe = false, externalHighlight = null, lightIntensity = 1, onPartClick }: { wireframe?: boolean, externalHighlight?: string | null, lightIntensity?: number, onPartClick?: (part: string) => void }) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const activePart = externalHighlight || hoveredPart;

  return (
    <group>
      {/* Enhanced Soft Lighting for Manhole Model */}
      <directionalLight 
        position={[20, 25, -20]} 
        castShadow 
        intensity={3 * lightIntensity} 
        shadow-mapSize={[4096, 4096]} 
        shadow-bias={-0.0005} 
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15, 0.1, 100]} />
      </directionalLight>
      <directionalLight position={[-15, 15, 15]} intensity={1.5 * lightIntensity} color="#e0f2fe" />
      <directionalLight position={[0, -10, 5]} intensity={0.5 * lightIntensity} color="#f1f5f9" />
      <ambientLight intensity={0.6 * lightIntensity} color="#f8fafc" />

      <ManholeBody wireframe={wireframe} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />
      <ManholeCover wireframe={wireframe} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />
      <ManholePipeIn wireframe={wireframe} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />
      <ManholePipeOut wireframe={wireframe} activePart={activePart} setHoveredPart={setHoveredPart} onPartClick={onPartClick} />
    </group>
  );
});

const IntersectionModel = React.memo(function IntersectionModel({ wireframe = false, externalHighlight = null, lightIntensity = 1, onPartClick }: { wireframe?: boolean, externalHighlight?: string | null, lightIntensity?: number, onPartClick?: (part: string) => void }) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const activePart = externalHighlight || hoveredPart;

  return (
    <group>
      <directionalLight position={[20, 25, 20]} castShadow intensity={2.5 * lightIntensity} />
      <directionalLight position={[-15, 15, -15]} intensity={1.5 * lightIntensity} color="#e0f2fe" />
      <ambientLight intensity={0.6 * lightIntensity} color="#f8fafc" />

      {/* Main Roads (Cross) */}
      <Detailed distances={[0, 25, 50]}>
        <group>
          <mesh 
             position={[0, 0, 0]} 
             receiveShadow castShadow
             onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('mainRoad'); }}
             onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
             onClick={(e) => { e.stopPropagation(); onPartClick?.('mainRoad'); }}
          >
            <boxGeometry args={[40, 0.5, 10]} />
            <meshStandardMaterial 
               color={activePart === 'mainRoad' ? '#60a5fa' : '#64748b'} 
               wireframe={wireframe} 
               emissive={activePart === 'mainRoad' ? '#3b82f6' : '#000000'}
               emissiveIntensity={0.2}
            />
          </mesh>
          <mesh 
             position={[0, 0, 0]} 
             receiveShadow castShadow
             onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('mainRoad'); }}
             onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
             onClick={(e) => { e.stopPropagation(); onPartClick?.('mainRoad'); }}
          >
            <boxGeometry args={[10, 0.51, 40]} />
            <meshStandardMaterial 
               color={activePart === 'mainRoad' ? '#60a5fa' : '#64748b'} 
               wireframe={wireframe} 
               emissive={activePart === 'mainRoad' ? '#3b82f6' : '#000000'}
               emissiveIntensity={0.2}
            />
          </mesh>
        </group>
        <group>
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[40, 0.5, 10]} />
            <meshStandardMaterial color={activePart === 'mainRoad' ? '#60a5fa' : '#64748b'} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[10, 0.51, 40]} />
            <meshStandardMaterial color={activePart === 'mainRoad' ? '#60a5fa' : '#64748b'} wireframe={wireframe} />
          </mesh>
        </group>
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[40, 0.5, 10]} />
            <meshBasicMaterial color={activePart === 'mainRoad' ? '#60a5fa' : '#64748b'} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[10, 0.51, 40]} />
            <meshBasicMaterial color={activePart === 'mainRoad' ? '#60a5fa' : '#64748b'} wireframe={wireframe} />
          </mesh>
        </group>
      </Detailed>

      {/* Curb Returns (Corners) */}
      {/* 4 corners -> X, Z combinations */}
      {[
        [-1, -1], [1, -1], [-1, 1], [1, 1]
      ].map(([x, z], i) => (
        <Detailed key={i} distances={[0, 20, 40]}>
          <mesh 
            position={[x * 6, 0.25, z * 6]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            receiveShadow castShadow
            onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('curbReturn'); }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
            onClick={(e) => { e.stopPropagation(); onPartClick?.('curbReturn'); }}
          >
            <circleGeometry args={[2.5, 32, (x > 0 && z > 0) ? 0 : (x < 0 && z > 0) ? Math.PI/2 : (x < 0 && z < 0) ? Math.PI : Math.PI*1.5, Math.PI/2]} />
            <meshStandardMaterial 
               color={activePart === 'curbReturn' ? '#34d399' : '#94a3b8'} 
               wireframe={wireframe} 
               emissive={activePart === 'curbReturn' ? '#10b981' : '#000000'}
               emissiveIntensity={activePart === 'curbReturn' ? 0.4 : 0}
               side={THREE.DoubleSide}
            />
          </mesh>
          <mesh 
            position={[x * 6, 0.25, z * 6]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            receiveShadow castShadow
          >
            <circleGeometry args={[2.5, 16, (x > 0 && z > 0) ? 0 : (x < 0 && z > 0) ? Math.PI/2 : (x < 0 && z < 0) ? Math.PI : Math.PI*1.5, Math.PI/2]} />
            <meshStandardMaterial 
               color={activePart === 'curbReturn' ? '#34d399' : '#94a3b8'} 
               wireframe={wireframe} 
               side={THREE.DoubleSide}
            />
          </mesh>
          <mesh 
            position={[x * 6, 0.25, z * 6]} 
            rotation={[-Math.PI / 2, 0, 0]} 
          >
            <circleGeometry args={[2.5, 8, (x > 0 && z > 0) ? 0 : (x < 0 && z > 0) ? Math.PI/2 : (x < 0 && z < 0) ? Math.PI : Math.PI*1.5, Math.PI/2]} />
            <meshBasicMaterial 
               color={activePart === 'curbReturn' ? '#34d399' : '#94a3b8'} 
               wireframe={wireframe} 
               side={THREE.DoubleSide}
            />
          </mesh>
        </Detailed>
      ))}

      {/* Traffic Islands (Ilhas de Refúgio) - 2 on the main road ends */}
      <Detailed distances={[0, 20, 40]}>
        <group>
          <mesh 
             position={[15, 0.3, 0]} 
             receiveShadow castShadow
             onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('island'); }}
             onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
             onClick={(e) => { e.stopPropagation(); onPartClick?.('island'); }}
          >
            <boxGeometry args={[4, 0.6, 2]} />
            <meshStandardMaterial 
               color={activePart === 'island' ? '#fde047' : '#d1d5db'} 
               wireframe={wireframe} 
               emissive={activePart === 'island' ? '#eab308' : '#000000'}
               emissiveIntensity={activePart === 'island' ? 0.3 : 0}
            />
          </mesh>
          <mesh 
             position={[-15, 0.3, 0]} 
             receiveShadow castShadow
             onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('island'); }}
             onPointerOut={(e) => { e.stopPropagation(); setHoveredPart(null); }}
             onClick={(e) => { e.stopPropagation(); onPartClick?.('island'); }}
          >
            <boxGeometry args={[4, 0.6, 2]} />
            <meshStandardMaterial 
               color={activePart === 'island' ? '#fde047' : '#d1d5db'} 
               wireframe={wireframe} 
               emissive={activePart === 'island' ? '#eab308' : '#000000'}
               emissiveIntensity={activePart === 'island' ? 0.3 : 0}
            />
          </mesh>
        </group>
        <group>
          <mesh position={[15, 0.3, 0]} receiveShadow castShadow>
            <boxGeometry args={[4, 0.6, 2]} />
            <meshStandardMaterial color={activePart === 'island' ? '#fde047' : '#d1d5db'} wireframe={wireframe} />
          </mesh>
          <mesh position={[-15, 0.3, 0]} receiveShadow castShadow>
            <boxGeometry args={[4, 0.6, 2]} />
            <meshStandardMaterial color={activePart === 'island' ? '#fde047' : '#d1d5db'} wireframe={wireframe} />
          </mesh>
        </group>
        <group>
          <mesh position={[15, 0.3, 0]}>
            <boxGeometry args={[4, 0.6, 2]} />
            <meshBasicMaterial color={activePart === 'island' ? '#fde047' : '#d1d5db'} wireframe={wireframe} />
          </mesh>
          <mesh position={[-15, 0.3, 0]}>
            <boxGeometry args={[4, 0.6, 2]} />
            <meshBasicMaterial color={activePart === 'island' ? '#fde047' : '#d1d5db'} wireframe={wireframe} />
          </mesh>
        </group>
      </Detailed>
      
      {activePart === 'curbReturn' && (
        <Html position={[6, 3, 6]} center zIndexRange={[100, 0]}>
           <div className="bg-emerald-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-emerald-700 border-l-emerald-500 backdrop-blur pointer-events-none w-64 leading-relaxed transform -translate-y-8">
             <span className="font-bold text-emerald-400 block text-base mb-1 tracking-tight">Raios de Curva</span>
             <span className="text-emerald-100/80 text-xs">Conectam as vias nas esquinas, orientando o fluxo e escoamento.</span>
           </div>
        </Html>
      )}
      {activePart === 'island' && (
        <Html position={[15, 3, 0]} center zIndexRange={[100, 0]}>
           <div className="bg-yellow-900/95 text-left text-white px-4 py-3 rounded-xl text-sm shadow-2xl border-l-4 border border-yellow-700 border-l-yellow-500 backdrop-blur pointer-events-none w-64 leading-relaxed transform -translate-y-8">
             <span className="font-bold text-yellow-400 block text-base mb-1 tracking-tight">Ilha de Refúgio</span>
             <span className="text-yellow-100/80 text-xs">Proteção para travessia, canaliza tráfego usando Targets dinâmicos.</span>
           </div>
        </Html>
      )}
    </group>
  );
});

function IntroAnimation() {
  const { camera } = useThree();

  useEffect(() => {
    // Initial position, offset slightly higher and to the side
    camera.position.set(-25, 20, -25);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    // 3 second smooth pan animation
    if (state.clock.elapsedTime < 3) {
      const t = state.clock.elapsedTime / 3;
      // Quartic ease out for a smooth stop
      const ease = 1 - Math.pow(1 - t, 4);
      
      const targetPos = new THREE.Vector3(15, 10, 15);
      const startPos = new THREE.Vector3(-25, 20, -25);
      
      camera.position.lerpVectors(startPos, targetPos, ease);
      camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

function CanvasFallback() {
  return (
    <Html center>
       <div className="flex flex-col items-center justify-center p-4">
         <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-2" />
         <p className="text-white text-xs font-bold uppercase tracking-widest whitespace-nowrap">Carregando Modelo 3D...</p>
       </div>
    </Html>
  );
}

function AdaptiveEnvironment({ showGrid, wireframe }: { showGrid: boolean, wireframe: boolean }) {
  const { camera } = useThree();
  const [isClose, setIsClose] = useState(false);
  
  useFrame(() => {
    const dist = camera.position.length();
    const close = dist < 12;
    if (close !== isClose) {
      setIsClose(close);
    }
  });

  return (
    <>
      {!wireframe && (
        <EffectComposer enableNormalPass={true}>
          <SSAO
            blendFunction={2} // Multiply
            samples={isClose ? 11 : 31}
            radius={0.3}
            intensity={20}
            luminanceInfluence={0.6}
            color={"#000000" as any}
          />
        </EffectComposer>
      )}
      {showGrid && <Grid infiniteGrid fadeDistance={isClose ? 20 : 40} sectionColor={"#334155" as any} cellColor={"#1e293b" as any} />}
    </>
  );
}

const PART_DETAILS_MAP: Record<string, { title: string; description: string; detail: string; }> = {
  // Corridor
  surface: {
    title: 'Pista (Road Surface)',
    description: 'Camada superior pavimentada por onde trafegam os veículos.',
    detail: 'No Civil 3D, definidas pelos "Lanes" na submontagem. Elas recebem materiais específicos e cálculos de volume precisos para o asfalto.'
  },
  centerline: {
    title: 'Eixo (Centerline)',
    description: 'Alinhamento horizontal base que controla a diretriz do projeto.',
    detail: 'O alinhamento é a base de todo o corredor. Estacas começam aqui, e todas as larguras e transições são calculadas perpendicularmente ao eixo.'
  },
  leftSlope: {
    title: 'SideSlope Cut (Talude Esquerdo)',
    description: 'Superfície de terraplenagem do lado esquerdo da via.',
    detail: 'Criado pelo "Daylight", conecta a estrutura da pista dinamicamente ao terreno natural original. O Civil 3D decide cortar ou aterrar com base nas elevações.'
  },
  rightSlope: {
    title: 'SideSlope Fill (Talude Direito)',
    description: 'Superfície de terraplenagem do lado direito da via.',
    detail: 'Do lado correspondente, encontra o "Target Surface" mantendo a inclinação (ex: 2:1 ou 3:1) especificada nos critérios de projeto.'
  },
  offsetPivot: {
    title: 'Offset Pivots (Pivôs de Afastamento)',
    description: 'Controla a largura e superelevação independente das faixas do corredor.',
    detail: 'Permitem transições complexas conectando linhas offset e perfis secundários para controlar a largura dinâmica das faixas, canteiros ou acostamentos.'
  },
  // Manhole
  body: {
    title: 'Estrutura (Structure Body)',
    description: 'Câmara principal cilíndrica. Modela a cota de fundo de projeto e comporta conexões das tubulações.',
    detail: 'A estrutura é responsável por acomodar a queda d\'água entre as cotas de chegada e saída, permitindo acesso à manutenção.'
  },
  cover: {
    title: 'Tampão / Gola (Cover/Frame)',
    description: 'A principal função do tampão é fornecer acesso seguro de manutenção à rede enterrada, protegendo a câmara principal.',
    detail: 'No Civil 3D, o tampão possui regras de alinhamento com o terreno (Surface). Através das propriedades da estrutura ("Structure Properties" -> "Insert Rim Behavior"), o Civil 3D alinha automaticamente a elevação do topo do tampão com a superfície do terreno natural ou o projeto de terraplenagem (Corridor Surface), garantindo nivelamento perfeito.'
  },
  pipeIn: {
    title: 'Tubo Contribuinte (Inlet Pipe)',
    description: 'Conduto condutor em direção a montante. Suas cotas de fundo determinam a queda de água no poço de visita.',
    detail: 'No Civil 3D, a "Invert Elevation" e "Crown Elevation" do tubo de entrada informam o quanto este duto mergulha para dentro do PV, ajudando a calcular as perdas de carga.'
  },
  pipeOut: {
    title: 'Tubo Efluente (Outlet Pipe)',
    description: 'Conduto condutor em direção a jusante. Diâmetro dimensionado para a vazão acumulada total da rede.',
    detail: 'Este é o tubo final por onde o volume flui. Seu caimento/declividade deve obedecer normas de velocidade (evitando tanto a deposição de areia quanto desgaste do material).'
  },
  // Intersection
  mainRoad: {
    title: 'Vias Principais (Primary / Secondary Roads)',
    description: 'As faixas de rolamento que se cruzam na interseção.',
    detail: 'Na ferramenta Intersection do Civil 3D, você define qual é a via principal ("Primary Road") cujo greide domina e não recebe deformação, e a via secundária ("Secondary Road") que terá seu abaulamento ajustado para encaixar.'
  },
  curbReturn: {
    title: 'Raios de Curva (Curb Returns)',
    description: 'Os quadrantes arredondados da esquina.',
    detail: 'Um alinhamento de Curb Return e um perfil dinâmico são criados automaticamente unindo as bordas (Edges) da via principal com a secundária, garantindo caimento contínuo para sarjetas.'
  },
  island: {
    title: 'Ilha de Refúgio (Traffic Islands)',
    description: 'Área elevada e não pavimentada no centro ou nas esquinas para direcionamento de trânsito ou travessia de pedestres.',
    detail: 'Criadas através de "Assemblies" secundárias alocadas nas "Baseline Regions" dos Curb Returns, isolando porções de área usando alinhamentos de offset e target parameters limitantes.'
  }
};

export function Simple3DViewer({ model: initialModel = 'corridor', label: initialLabel, highlightedPart }: { model?: ModelType, label: string, highlightedPart?: string | null }) {
  const [currentModel, setCurrentModel] = useState<ModelType>(initialModel);
  const [currentLabel, setCurrentLabel] = useState(initialLabel);
  
  useEffect(() => {
    setCurrentModel(initialModel);
    setCurrentLabel(initialLabel);
  }, [initialModel, initialLabel]);

  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(0.5);
  const [internalHighlight, setInternalHighlight] = useState<string | null>(null);
  const [selectedPartInfo, setSelectedPartInfo] = useState<string | null>(null);
  const { addXp, unlockBadge } = useGamification();
  const [hasAwarded3DXp, setHasAwarded3DXp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [leftSlopeVal, setLeftSlopeVal] = useState(1);
  const [rightSlopeVal, setRightSlopeVal] = useState(1);
  const [showCurbReturn, setShowCurbReturn] = useState(false);
  const [showOffsetPivots, setShowOffsetPivots] = useState(false);

  const activeHighlight = internalHighlight || highlightedPart;

  const handlePartClick = useCallback((part: string) => {
    setSelectedPartInfo(part);
    setInternalHighlight(part);
    if (!hasAwarded3DXp) {
       addXp(20);
       unlockBadge('simulation_complete');
       setHasAwarded3DXp(true);
    }
  }, [hasAwarded3DXp, addXp, unlockBadge]);

  // Validate slope parameters and visibility combinations before rendering the model components
  const validLeftSlope = typeof leftSlopeVal === 'number' && !isNaN(leftSlopeVal) && leftSlopeVal > 0 ? leftSlopeVal : 1;
  const validRightSlope = typeof rightSlopeVal === 'number' && !isNaN(rightSlopeVal) && rightSlopeVal > 0 ? rightSlopeVal : 1;
  const validShowCurbReturn = Boolean(showCurbReturn);
  const validShowOffsetPivots = Boolean(showOffsetPivots);

  const CorridorModelMemo = useMemo(() => <CorridorModel wireframe={wireframe} externalHighlight={activeHighlight} leftSlopeValue={validLeftSlope} rightSlopeValue={validRightSlope} showCurbReturn={validShowCurbReturn} showOffsetPivots={validShowOffsetPivots} lightIntensity={lightIntensity} onPartClick={handlePartClick} onToggleCurbReturn={setShowCurbReturn} onToggleOffsetPivots={setShowOffsetPivots} />, [wireframe, activeHighlight, validLeftSlope, validRightSlope, validShowCurbReturn, validShowOffsetPivots, handlePartClick, lightIntensity, setShowCurbReturn, setShowOffsetPivots]);
  const ManholeModelMemo = useMemo(() => <ManholeModel wireframe={wireframe} externalHighlight={activeHighlight} lightIntensity={lightIntensity} onPartClick={handlePartClick} />, [wireframe, activeHighlight, handlePartClick, lightIntensity]);
  const IntersectionModelMemo = useMemo(() => <IntersectionModel wireframe={wireframe} externalHighlight={activeHighlight} lightIntensity={lightIntensity} onPartClick={handlePartClick} />, [wireframe, activeHighlight, handlePartClick, lightIntensity]);

  const getAvailableParts = () => {
    switch (currentModel) {
      case 'corridor': return ['centerline', 'surface', 'leftSlope', 'rightSlope', 'curbReturn', 'offsetPivot'];
      case 'manhole': return ['body', 'cover', 'pipeIn', 'pipeOut'];
      case 'intersection': return ['mainRoad', 'curbReturn', 'island'];
      default: return [];
    }
  };

  const filteredParts = getAvailableParts().filter(partId => {
    const part = PART_DETAILS_MAP[partId];
    if (!part) return false;
    return part.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           part.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mb-6 relative z-10 w-full overflow-visible">
      {selectedPartInfo && PART_DETAILS_MAP[selectedPartInfo] && (
        <div className="absolute bottom-6 right-6 z-[100] p-4 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-80 border border-slate-200 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-black text-slate-800">{PART_DETAILS_MAP[selectedPartInfo].title}</h4>
              <button onClick={() => {
                setSelectedPartInfo(null);
                if (internalHighlight === selectedPartInfo) {
                  setInternalHighlight(null);
                }
              }} className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 font-medium mb-3 text-sm">{PART_DETAILS_MAP[selectedPartInfo].description}</p>
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4">
              <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center"><Info className="w-4 h-4 mr-1" /> Detalhe Civil 3D</h5>
              <p className="text-xs text-indigo-900 leading-relaxed">{PART_DETAILS_MAP[selectedPartInfo].detail}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 relative z-50">
        <div className="space-y-4 w-full sm:w-auto flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center pr-2 border-slate-200 sm:border-r">
              <Cuboid className="w-5 h-5 mr-2 text-indigo-600"/> 
              Visualizador 3D
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-lg self-start">
              <button 
                onClick={() => {
                   setCurrentModel('corridor');
                   setCurrentLabel('Corredor Viário (Corridor)');
                   setInternalHighlight(null);
                   setSearchTerm('');
                   setSelectedPartInfo(null);
                }}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", currentModel === 'corridor' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Corridor
              </button>
              <button 
                onClick={() => {
                   setCurrentModel('intersection');
                   setCurrentLabel('Interseção (Intersection)');
                   setInternalHighlight(null);
                   setSearchTerm('');
                   setSelectedPartInfo(null);
                }}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", currentModel === 'intersection' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Intersection
              </button>
              <button 
                onClick={() => {
                   setCurrentModel('manhole');
                   setCurrentLabel('Rede / PV (Pipe Network)');
                   setInternalHighlight(null);
                   setSearchTerm('');
                   setSelectedPartInfo(null);
                }}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", currentModel === 'manhole' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Manhole
              </button>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">{currentLabel}</p>
          
          <div className="w-full max-w-sm relative mt-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-500 hidden sm:block" />
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar componente (ex: Eixo, Talude)..."
                value={isSearchOpen && !activeHighlight ? searchTerm : (activeHighlight ? PART_DETAILS_MAP[activeHighlight]?.title : searchTerm)}
                onFocus={() => {
                   setIsSearchOpen(true);
                   if (activeHighlight) {
                     setInternalHighlight(null);
                     setSearchTerm('');
                   }
                }}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                  if (activeHighlight) setInternalHighlight(null);
                }}
                className="w-full bg-white border border-slate-300 text-slate-800 font-medium text-sm rounded-lg pl-3 pr-8 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                 <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              
              {/* Dropdown Menu */}
              {isSearchOpen && (
                 <>
                   <div className="fixed inset-0 z-[60]" onClick={() => setIsSearchOpen(false)} />
                   <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 shadow-xl rounded-xl z-[70] max-h-64 overflow-y-auto py-1">
                      {filteredParts.length > 0 ? (
                        filteredParts.map(partId => {
                          const part = PART_DETAILS_MAP[partId];
                          const isSelected = activeHighlight === partId;
                          return (
                             <button
                               key={partId}
                               onClick={() => {
                                  setInternalHighlight(partId);
                                  setSearchTerm('');
                                  setIsSearchOpen(false);
                               }}
                               className={cn(
                                  "w-full text-left px-4 py-2.5 transition-colors flex flex-col gap-0.5",
                                  isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                               )}
                             >
                               <span className="text-sm font-bold text-slate-800 flex justify-between items-center">
                                  {part.title}
                                  {isSelected && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Ativo</span>}
                               </span>
                               <span className="text-xs text-slate-500 line-clamp-1">{part.description}</span>
                             </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 font-medium text-center">Nenhum componente encontrado.</div>
                      )}
                   </div>
                 </>
              )}
            </div>
            {activeHighlight && (
              <button 
                onClick={() => {
                  setInternalHighlight(null);
                  setSearchTerm('');
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Limpar seleção"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-3 sm:justify-end mt-2 sm:mt-0 relative z-30">
          <div className="relative group">
            <button 
              onClick={() => setWireframe(!wireframe)} 
              className={cn("px-3 py-1.5 text-xs font-bold rounded border transition-colors", wireframe ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
              title="Ajuste de Wireframe"
            >
              Wireframe
            </button>
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-all translate-y-1 group-hover:translate-y-0 duration-200">
              <strong className="block text-indigo-400 mb-1">Alterna Exibição Estrutural (Wireframe)</strong>
              Impacto visual: Muda a renderização de superfícies para malha de arame, permitindo ver a malha poligonal base que forma os triângulos da superfície.
              <div className="absolute bottom-full right-6 border-[6px] border-transparent border-b-slate-900" />
            </div>
          </div>

          <div className="relative group">
            <button 
              onClick={() => setShowGrid(!showGrid)} 
              className={cn("px-3 py-1.5 text-xs font-bold rounded border transition-colors", showGrid ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
              title="Ajuste do Grid"
            >
              Grid
            </button>
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-all translate-y-1 group-hover:translate-y-0 duration-200">
              <strong className="block text-indigo-400 mb-1">Ocultar/Mostrar Grid (Grade de Escala)</strong>
              Impacto visual: Exibe a grade métrica no piso referencial. Ela ajuda na compreensão da escala do modelo 3D de infraestrutura em relação ao espaço real.
              <div className="absolute bottom-full right-6 border-[6px] border-transparent border-b-slate-900" />
            </div>
          </div>

          <div className="relative group flex items-center bg-white border border-slate-200 rounded px-2 py-1 h-[30px] gap-2 hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Luz</span>
            <input 
              type="range" min="0.1" max="2.5" step="0.1" 
              value={lightIntensity} 
              onChange={e => setLightIntensity(Number(e.target.value))} 
              className="w-20 sm:w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              title="Ajuste de Iluminação"
            />
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-all translate-y-1 group-hover:translate-y-0 duration-200">
              <strong className="block text-indigo-400 mb-1">Ajustar Iluminação Ambiente (Render)</strong>
              Impacto visual: O contraste afeta diretamente como os detalhes dos taludes, rodovias e tubulações são percebidos através da luz e sombras.
              <div className="absolute bottom-full right-6 border-[6px] border-transparent border-b-slate-900" />
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Interaja com o modelo do Civil 3D no navegador. <span className="font-semibold text-slate-700">Clique e arraste</span> para orbitar, <span className="font-semibold text-slate-700">role (scroll)</span> para aplicar zoom.
      </p>

      <AnimatePresence>
        {currentModel === 'corridor' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4 mb-4 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-l-xl"></div>
                <label className="text-xs font-bold text-slate-700 block mb-3 pl-2">Inclinação Talude Esquerdo (Cut)</label>
                <div className="flex items-center gap-3 pl-2">
                  <span className="text-xs text-slate-400 font-mono w-6 text-right">1:1</span>
                  <input 
                    type="range" min="1" max="4" step="0.5" 
                    value={leftSlopeVal} 
                    onChange={e => setLeftSlopeVal(Number(e.target.value))} 
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" 
                  />
                  <span className="text-xs text-slate-400 font-mono w-6">4:1</span>
                  <div className="bg-red-50 text-red-700 font-mono font-bold text-xs px-2 py-1 rounded border border-red-100">{leftSlopeVal}:1</div>
                </div>
              </div>
              <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-l-xl"></div>
                <label className="text-xs font-bold text-slate-700 block mb-3 pl-2">Inclinação Talude Direito (Fill)</label>
                <div className="flex items-center gap-3 pl-2">
                  <span className="text-xs text-slate-400 font-mono w-6 text-right">1:1</span>
                  <input 
                    type="range" min="1" max="4" step="0.5" 
                    value={rightSlopeVal} 
                    onChange={e => setRightSlopeVal(Number(e.target.value))} 
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                  />
                  <span className="text-xs text-slate-400 font-mono w-6">4:1</span>
                  <div className="bg-emerald-50 text-emerald-700 font-mono font-bold text-xs px-2 py-1 rounded border border-emerald-100">{rightSlopeVal}:1</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors flex items-center justify-between">
                <div>
                   <span className="text-xs font-bold text-slate-700 block">Curb Return (Raio de Curva)</span>
                   <span className="text-[10px] text-slate-500">Adicionar sarjeta e meio-fio</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showCurbReturn}
                  onChange={e => setShowCurbReturn(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
              <label className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors flex items-center justify-between">
                <div>
                   <span className="text-xs font-bold text-slate-700 block">Offset Pivots (Afastamentos)</span>
                   <span className="text-[10px] text-slate-500">Visível no eixo secundário</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={showOffsetPivots}
                  onChange={e => setShowOffsetPivots(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-80 sm:h-96 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-700 shadow-inner">
        <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 px-3 py-1.5 rounded-lg text-[10px] text-white font-mono uppercase tracking-wider backdrop-blur-sm border border-slate-700/50">
          Powered by Three.js
        </div>
        <Canvas shadows camera={{ position: [15, 10, 15], fov: 40 }}>
          <color attach="background" args={["#0f172a"]} />
          <Suspense fallback={<CanvasFallback />}>
            <Stage environment="city" intensity={lightIntensity}>
               {currentModel === 'corridor' ? CorridorModelMemo : currentModel === 'manhole' ? ManholeModelMemo : IntersectionModelMemo}
            </Stage>
            <AdaptiveEnvironment showGrid={showGrid} wireframe={wireframe} />
            <IntroAnimation />
            <OrbitControls makeDefault enableZoom={true} enablePan={true} minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={5} maxDistance={100} enableDamping={true} dampingFactor={0.05} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

function CatchmentMap() {
  const [showFlow, setShowFlow] = useState(false);
  const [activeCatchment, setActiveCatchment] = useState<number | null>(null);
  const [area1, setArea1] = useState(0.85);
  const [area2, setArea2] = useState(1.25);

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-3">Modelagem de Bacias (Catchments)</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="col-span-1 space-y-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
           <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex justify-between items-center group">
                <span className="flex items-center gap-1">
                  Área Bacia 1
                  <span title="Define a área de contribuição da Bacia 1 (em hectares). Áreas maiores geram maior vazão (Q). Ex: Aumentar a área expande o polígono da bacia e aumenta a espessura das linhas de escoamento.">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-help" />
                  </span>
                </span>
                <span className="text-emerald-400 font-mono bg-slate-900 px-1.5 rounded">{area1.toFixed(2)}ha</span>
              </label>
              <input 
                type="range" min="0.1" max="3" step="0.05" value={area1} onChange={(e) => setArea1(Number(e.target.value))} 
                className="w-full accent-emerald-500 cursor-pointer"
                title={`Área 1: ${area1.toFixed(2)}ha. Função: Representa a área de captação. Impacto visual: Ao aumentar, o polígono verde expande, simulando mais contribuição para a rede.`}
              />
           </div>
           <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex justify-between items-center group">
                <span className="flex items-center gap-1">
                  Área Bacia 2
                  <span title="Define a área de contribuição da Bacia 2 (em hectares). Áreas maiores geram maior vazão (Q). Ex: Aumentar a área expande o polígono da bacia e aumenta a espessura das linhas de escoamento.">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-400 transition-colors cursor-help" />
                  </span>
                </span>
                <span className="text-blue-400 font-mono bg-slate-900 px-1.5 rounded">{area2.toFixed(2)}ha</span>
              </label>
              <input 
                type="range" min="0.1" max="5" step="0.05" value={area2} onChange={(e) => setArea2(Number(e.target.value))} 
                className="w-full accent-blue-500 cursor-pointer"
                title={`Área 2: ${area2.toFixed(2)}ha. Função: Representa a área de captação. Impacto visual: Ao aumentar, o polígono azul expande e o fluxo de água ganha intensidade.`}
              />
           </div>
        </div>
        <div className="col-span-1 md:col-span-2 bg-slate-800 rounded-lg border border-slate-700/50 p-1 relative overflow-hidden">
           <div className="flex justify-between items-center px-3 py-2 bg-slate-900 rounded-t border-b border-slate-700">
               <span className="text-xs font-semibold text-slate-300">Planta Civil 3D Simulada</span>
               <button 
                 onClick={() => setShowFlow(!showFlow)} 
                 className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 rounded transition-colors"
                 title={showFlow ? "Ação: Ocultar simulação. Remove a animação do escoamento superficial para limpar o desenho topográfico." : "Ação: Simular Fluxo de Chuva. Ativa a animação das linhas de fluxo pluvial para demonstrar a direção de caimento e o ponto de coleta das bacias em tempo real."}
                 aria-label={showFlow ? "Ocultar simulação de escoamento" : "Simular fluxo de chuva"}
                 aria-live="polite"
               >
                  {showFlow ? 'Ocultar Escoamento' : 'Simular Escoamento'}
               </button>
           </div>
           <div className="aspect-video relative bg-[#0A1626]">
              <svg viewBox="0 0 800 450" className="w-full h-full">
                  <defs>
                     <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 0 30 Q 15 10 30 30 T 60 30" fill="none" stroke="#1e293b" strokeWidth="1" />
                     </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#topo)" onClick={() => setActiveCatchment(null)} />
                  
                  {/* Roads */}
                  <path d="M -100 225 L 900 225" fill="none" stroke="#334155" strokeWidth="40" />
                  <path d="M 400 -100 L 400 550" fill="none" stroke="#334155" strokeWidth="30" />
                  
                  {/* Catchment 1 */}
                  <polygon 
                    points={`50,50 350,50 350,200 ${350 - area1 * 100},200`} 
                    fill="#10b981" 
                    fillOpacity={activeCatchment === 1 ? "0.5" : (showFlow ? "0.3" : "0.1")} 
                    stroke="#10b981" 
                    strokeWidth={activeCatchment === 1 ? "3" : "2"} 
                    strokeDasharray="5,5" 
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setActiveCatchment(1)}
                  />
                  <circle cx="350" cy="200" r="5" fill="#f59e0b" />
                  <text x={350 - area1 * 50} y="70" fill="#10b981" fontSize="12" fontWeight="bold" className="pointer-events-none">Bacia 1 ({area1.toFixed(2)}ha)</text>

                  {/* Catchment 2 */}
                  <polygon 
                    points={`450,50 ${450 + area2 * 100},50 ${450 + area2 * 100},200 450,200`} 
                    fill="#3b82f6" 
                    fillOpacity={activeCatchment === 2 ? "0.5" : (showFlow ? "0.3" : "0.1")} 
                    stroke="#3b82f6" 
                    strokeWidth={activeCatchment === 2 ? "3" : "2"} 
                    strokeDasharray="5,5" 
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setActiveCatchment(2)}
                  />
                  <circle cx="450" cy="200" r="5" fill="#f59e0b" />
                  <text x={450 + area2 * 20} y="70" fill="#3b82f6" fontSize="12" fontWeight="bold" className="pointer-events-none">Bacia 2 ({area2.toFixed(2)}ha)</text>

                  {/* Flow lines (animate if showFlow) */}
                  {showFlow && (
                     <>
                       {/* Bacia 1 Flow */}
                       <path d="M 120 90 Q 200 130 330 185" fill="none" stroke="#34d399" strokeWidth={Math.max(1, area1 * 3)} opacity="0.2" strokeLinecap="round" />
                       <path d="M 120 90 Q 200 130 330 185" fill="none" stroke="#a7f3d0" strokeWidth={Math.max(1, area1 * 1.5)} strokeDasharray="4 12" className="animate-[dash_1s_linear_infinite]" strokeLinecap="round" style={{animationDuration: `${2 / area1}s`}} />
                       
                       {/* Bacia 2 Flow */}
                       <path d="M 680 90 Q 550 130 470 185" fill="none" stroke="#3b82f6" strokeWidth={Math.max(2, area2 * 4)} opacity="0.2" strokeLinecap="round" />
                       <path d="M 680 90 Q 550 130 470 185" fill="none" stroke="#bfdbfe" strokeWidth={Math.max(1, area2 * 2)} strokeDasharray="6 16" className="animate-[dash_0.8s_linear_infinite]" strokeLinecap="round" style={{animationDuration: `${2 / area2}s`}} />
                       
                       {/* Subtle Particle Effects for realism */}
                       <path id="mainFlow1" d="M 120 90 Q 200 130 330 185" fill="none" />
                       <path id="mainFlow2" d="M 680 90 Q 550 130 470 185" fill="none" />
                       {Array.from({ length: 4 }).map((_, i) => (
                         <React.Fragment key={i}>
                           <circle r={Math.max(1.5, area1 * 2)} fill="#10b981">
                              <animateMotion dur={`${2 / area1}s`} repeatCount="indefinite" begin={`${i * (0.5 / area1)}s`}>
                                 <mpath href="#mainFlow1" />
                              </animateMotion>
                              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur={`${2 / area1}s`} repeatCount="indefinite" begin={`${i * (0.5 / area1)}s`} />
                           </circle>
                           <circle r={Math.max(2, area2 * 2.5)} fill="#3b82f6">
                              <animateMotion dur={`${2 / area2}s`} repeatCount="indefinite" begin={`${i * (0.5 / area2)}s`}>
                                 <mpath href="#mainFlow2" />
                              </animateMotion>
                              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur={`${2 / area2}s`} repeatCount="indefinite" begin={`${i * (0.5 / area2)}s`} />
                           </circle>
                         </React.Fragment>
                       ))}

                       <style>{`
                          @keyframes dash {
                            from {
                              stroke-dashoffset: 40;
                            }
                            to {
                              stroke-dashoffset: 0;
                            }
                          }
                       `}</style>
                     </>
                  )}

                  {/* Pipe Network */}
                  <line x1="350" y1="200" x2="350" y2="250" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="450" y1="200" x2="450" y2="250" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="350" y1="250" x2="400" y2="300" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="450" y1="250" x2="400" y2="300" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="400" y1="300" x2="400" y2="400" stroke="#f59e0b" strokeWidth={Math.max(4, (area1 + area2) * 2)} />
                  
                  {/* Outfall */}
                  <polygon points="380,400 420,400 440,430 360,430" fill="#0ea5e9" opacity="0.6" />
                  <text x="430" y="420" fill="#0ea5e9" fontSize="12" fontWeight="bold">Outfall / Reservatório</text>
              </svg>

              {/* Catchment Details Overlay */}
              <AnimatePresence>
                {activeCatchment && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-4 left-4 right-4 bg-slate-900 border border-slate-700/80 p-4 rounded-xl shadow-2xl flex justify-between items-start z-10 backdrop-blur-md bg-opacity-95"
                  >
                    <div className="w-full">
                      <h5 className={cn("text-xs font-bold mb-3 border-b pb-2", activeCatchment === 1 ? "text-[#10b981] border-[#10b981]/30" : "text-[#3b82f6] border-[#3b82f6]/30")}>
                        {activeCatchment === 1 ? 'Bacia 1 (Uso Residencial - Área Verde)' : 'Bacia 2 (Uso Comercial - Impermeabilizada)'}
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                           <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Área (A)</span>
                           <span className="text-sm font-mono text-slate-200">{activeCatchment === 1 ? area1.toFixed(2) : area2.toFixed(2)} ha</span>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                           <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Coef. Runoff (C)</span>
                           <span className="text-sm font-mono text-slate-200">{activeCatchment === 1 ? '0.45' : '0.85'} <span className="text-[10px] text-slate-400 ml-1">{activeCatchment === 1 ? '(Med)' : '(Alto)'}</span></span>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                           <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Tempo de Conc. (Tc)</span>
                           <span className="text-sm font-mono text-slate-200">{activeCatchment === 1 ? Math.max(10, Math.round(area1 * 12)) : Math.max(8, Math.round(area2 * 8))} min</span>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                           <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Vazão Pico Est. (Q)</span>
                           <span className="text-sm font-mono text-slate-200">{activeCatchment === 1 ? (0.45 * area1 * 1.5).toFixed(2) : (0.85 * area2 * 1.5).toFixed(2)} m³/s</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setActiveCatchment(null)} className="text-slate-400 hover:text-white p-1 ml-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  )
}

function InteractiveTips({ lessonId }: { lessonId: string }) {
  const defaultTips = [
    {
      title: "Uso do Toolspace",
      description: "O Toolspace é o centro de comando do Civil 3D.",
      detail: "Sempre o mantenha aberto (atalho de comando 'Showts'). Na aba Prospector, você gerencia dados (Superfícies, Alinhamentos); na aba Settings, você gerencia estilos e configurações."
    },
    {
      title: "Importância das Nomenclaturas",
      description: "Padronize os nomes dos objetos desde o início.",
      detail: "Crie um padrão para naming (ex: ALI_EixoPrincipal, SURF_TerrenoNatural). Isso evitará confusão no Data Shortcuts quando o projeto escalar."
    },
    {
      title: "Salvar Regularmente",
      description: "Habilite o AutoSave e não dependa só dele.",
      detail: "Arquivos com Corridors e Surfaces dinâmicos são pesados. Configure o autosave para a cada 10-15 minutos em OP(Options) -> Open and Save, e use Crtl+S sempre que finalizar uma etapa crítica."
    }
  ];

  const tipsMap: Record<string, {title: string, description: string, detail: string}[]> = {
    'm3-l2': [
      {
         title: "Frequência de Montagem",
         description: "Ajuste os 'Frequencies' para curvas suaves.",
         detail: "Em trechos retos, uma frequência de 20m é aceitável, mas em curvas (horizontais/verticais) e cruzamentos, dimensione para 2m a 5m para evitar um efeito facetado no modelo 3D."
      },
      {
         title: "Alvos (Targets)",
         description: "O poder do Corridor está nos Targets.",
         detail: "Lembre-se que subassemblies como 'Daylight' precisam ter a superfície alvo definida na janela 'Target Mapping' para que os taludes de corte e aterro sejam projetados."
      },
      {
         title: "Rebuild Automaticamente",
         description: "Cuidado com o 'Rebuild Automatic'.",
         detail: "Em projetos grandes, desabilite o 'Rebuild Automatic' do Corridor. Reconstrua manualmente apenas quando todas as alterações no alinhamento e greide estiverem prontas, otimizando o processamento."
      }
    ],
    'm4-l2': [
      {
         title: "Direção do Fluxo",
         description: "Desenhe a rede de montante para jusante.",
         detail: "Ao traçar tubos no Civil 3D, a direção do clique inicial para o final define o sentido do fluxo, importante para labels dinâmicos e regras de queda (rules)."
      },
      {
         title: "Regras de Projeto (Rules)",
         description: "Ajuste as regras de elevação.",
         detail: "Use o Pipe Network Rules para definir cobrimentos mínimos e declividades máximas, isso fará com que o Civil 3D já crie o greide do tubo bem perto do ideal inicial."
      },
      {
         title: "Interferências",
         description: "Cheque choques (Interference Check).",
         detail: "Use a ferramenta Interference Check entre redes de água pluvial e esgoto para achar clashing. O software cria marcadores em 3D apontando as colisões no modelo."
      }
    ]
  };

  const tips = tipsMap[lessonId] || defaultTips;

  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
       <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
         <Lightbulb className="w-4 h-4 text-amber-500" /> Dicas da Aula
       </h3>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {tips.map((tip, idx) => (
           <div key={idx} className="relative bg-white p-4 rounded-lg border border-slate-200 shadow-sm group">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{tip.description}</p>
                </div>
                <button
                  onClick={() => setExpandedTip(expandedTip === idx ? null : idx)}
                  className="mt-1 flex-shrink-0 text-sky-500 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-full p-1 transition-colors bg-sky-50"
                  aria-expanded={expandedTip === idx}
                  aria-label="Ver detalhes da dica"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence>
                {expandedTip === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-slate-100">
                      <div className="bg-sky-50/50 p-3 rounded text-xs text-slate-700 leading-relaxed border border-sky-100" aria-live="polite">
                         {tip.detail}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
         ))}
       </div>
    </div>
  );
}

function CorridorSimulation() {
  const [roadElevation, setRoadElevation] = useState(0); 
  const [cutSlopeLeft, setCutSlopeLeft] = useState(2); 
  const [fillSlopeLeft, setFillSlopeLeft] = useState(2); 
  const [cutSlopeRight, setCutSlopeRight] = useState(2); 
  const [fillSlopeRight, setFillSlopeRight] = useState(2); 
  const [terrainCrossSlope, setTerrainCrossSlope] = useState(20); // %
  
  const midX = 300; 
  const baseY = 120;
  const roadY = baseY - roadElevation; 
  const roadHalfW = 60;
  
  const roadLeft = midX - roadHalfW;
  const roadRight = midX + roadHalfW;

  const terrainSlope = terrainCrossSlope / 100;
  const getTerrainY = (x: number) => baseY + (x - midX) * terrainSlope;

  const terrainYLeft = getTerrainY(roadLeft);
  const terrainYRight = getTerrainY(roadRight);

  // Helper to calculate daylight intersection
  const calcDaylight = (roadSideX: number, tY_edge: number, isLeft: boolean) => {
      const isCut = roadY > tY_edge;
      const slope = isLeft ? (isCut ? cutSlopeLeft : fillSlopeLeft) : (isCut ? cutSlopeRight : fillSlopeRight);
      
      const safeSlope = Math.min(slope, (1 / (Math.abs(terrainSlope) + 0.01)) - 0.1);

      let catchY, catchX;
      if (isLeft) {
          if (isCut) {
              catchY = (tY_edge - roadY * safeSlope * terrainSlope) / (1 - safeSlope * terrainSlope);
              catchX = roadSideX - (roadY - catchY) * safeSlope;
          } else {
              catchY = (tY_edge + roadY * safeSlope * terrainSlope) / (1 + safeSlope * terrainSlope);
              catchX = roadSideX - (catchY - roadY) * safeSlope;
          }
      } else {
          if (isCut) {
              catchY = (tY_edge + roadY * safeSlope * terrainSlope) / (1 + safeSlope * terrainSlope);
              catchX = roadSideX + (roadY - catchY) * safeSlope;
          } else {
              catchY = (tY_edge - roadY * safeSlope * terrainSlope) / (1 - safeSlope * terrainSlope);
              catchX = roadSideX + (catchY - roadY) * safeSlope;
          }
      }
      return { catchX, catchY, isCut };
  };

  const leftDaylight = calcDaylight(roadLeft, terrainYLeft, true);
  const rightDaylight = calcDaylight(roadRight, terrainYRight, false);

  type Pt = { x: number; y: number };
  const cutPolys: Pt[][] = [];
  const fillPolys: Pt[][] = [];
  let cutArea = 0;
  let fillArea = 0;

  const addPoly = (pts: Pt[], isCut: boolean) => {
      if (pts.length < 3) return;
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % pts.length];
          area += p1.x * p2.y - p2.x * p1.y;
      }
      area = Math.abs(area) / 2;
      
      const scaleFactor = 0.01;
      
      if (isCut) {
          cutPolys.push(pts);
          cutArea += area * scaleFactor;
      } else {
          fillPolys.push(pts);
          fillArea += area * scaleFactor;
      }
  };

  // Interval 1: Left Daylight
  const p1 = { x: leftDaylight.catchX, y: leftDaylight.catchY };
  const p2 = { x: roadLeft, y: roadY };
  const p2_terrain = { x: roadLeft, y: terrainYLeft };
  addPoly([p1, p2, p2_terrain], leftDaylight.isCut);

  // Interval 2: Road
  const crossX = terrainSlope === 0 ? -999999 : midX + (roadY - baseY) / terrainSlope;
  if (crossX > roadLeft && crossX < roadRight) {
      const pCross = { x: crossX, y: roadY }; 
      addPoly([p2, pCross, p2_terrain], leftDaylight.isCut);
      const p3 = { x: roadRight, y: roadY };
      const p3_terrain = { x: roadRight, y: terrainYRight };
      addPoly([pCross, p3, p3_terrain], !leftDaylight.isCut);
  } else {
      const p3 = { x: roadRight, y: roadY };
      const p3_terrain = { x: roadRight, y: terrainYRight };
      addPoly([p2, p3, p3_terrain, p2_terrain], leftDaylight.isCut); 
  }

  // Interval 3: Right Daylight
  const p3 = { x: roadRight, y: roadY };
  const p3_terrain = { x: roadRight, y: terrainYRight };
  const p4 = { x: rightDaylight.catchX, y: rightDaylight.catchY };
  addPoly([p3, p4, p3_terrain], rightDaylight.isCut);

  const toPoints = (pts: Pt[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="mt-8 bg-sky-50/50 border border-sky-100 rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-sky-900 mb-4 flex items-center"><PlayCircle className="w-5 h-5 mr-2 text-sky-600"/> Simulação Interativa: Seção Tipo e Terraplenagem</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center group">
                <span className="flex items-center gap-1">
                  Greide (Elevação)
                </span>
                <span className="text-sky-600 font-mono bg-sky-50 px-1.5 rounded">{roadElevation.toFixed(0)}m</span>
              </label>
              <input 
                type="range" min="-80" max="80" value={roadElevation} onChange={(e) => setRoadElevation(Number(e.target.value))} 
                className="w-full accent-sky-500 cursor-pointer"
              />
           </div>
           
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center group">
                <span className="flex items-center gap-1">
                  Inclinação Terreno
                </span>
                <span className="text-sky-600 font-mono bg-sky-50 px-1.5 rounded">{terrainCrossSlope}%</span>
              </label>
              <input 
                type="range" min="-40" max="40" step="5" value={terrainCrossSlope} onChange={(e) => setTerrainCrossSlope(Number(e.target.value))} 
                className="w-full accent-amber-500 cursor-pointer"
              />
           </div>

           <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div className="col-span-2">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taludes Lado Esquerdo</h4>
              </div>
              <div className="col-span-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between items-center mb-1">
                   <span>Corte (H:V)</span>
                   <span className="text-red-600 bg-red-50 px-1 rounded">{cutSlopeLeft.toFixed(1)}:1</span>
                 </label>
                 <input 
                   type="range" min="0.5" max="6" step="0.5" value={cutSlopeLeft} onChange={(e) => setCutSlopeLeft(Number(e.target.value))} 
                   className="w-full accent-red-500 cursor-pointer" 
                 />
              </div>
              <div className="col-span-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between items-center mb-1">
                   <span>Aterro (H:V)</span>
                   <span className="text-emerald-600 bg-emerald-50 px-1 rounded">{fillSlopeLeft.toFixed(1)}:1</span>
                 </label>
                 <input 
                   type="range" min="0.5" max="6" step="0.5" value={fillSlopeLeft} onChange={(e) => setFillSlopeLeft(Number(e.target.value))} 
                   className="w-full accent-emerald-500 cursor-pointer" 
                 />
              </div>

              <div className="col-span-2 mt-2">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-1">Taludes Lado Direito</h4>
              </div>
              <div className="col-span-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between items-center mb-1">
                   <span>Corte (H:V)</span>
                   <span className="text-red-600 bg-red-50 px-1 rounded">{cutSlopeRight.toFixed(1)}:1</span>
                 </label>
                 <input 
                   type="range" min="0.5" max="6" step="0.5" value={cutSlopeRight} onChange={(e) => setCutSlopeRight(Number(e.target.value))} 
                   className="w-full accent-red-500 cursor-pointer" 
                 />
              </div>
              <div className="col-span-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between items-center mb-1">
                   <span>Aterro (H:V)</span>
                   <span className="text-emerald-600 bg-emerald-50 px-1 rounded">{fillSlopeRight.toFixed(1)}:1</span>
                 </label>
                 <input 
                   type="range" min="0.5" max="6" step="0.5" value={fillSlopeRight} onChange={(e) => setFillSlopeRight(Number(e.target.value))} 
                   className="w-full accent-emerald-500 cursor-pointer" 
                 />
              </div>
           </div>
           
           <div className="pt-4 border-t border-slate-200">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Áreas de Terraplenagem</h4>
              <div className="flex justify-between items-center bg-red-50 p-2 rounded-lg border border-red-100 mb-2">
                 <span className="text-xs font-bold text-red-800">Área de Corte</span>
                 <span className="text-sm font-black text-red-600">{cutArea.toFixed(1)} m²</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                 <span className="text-xs font-bold text-emerald-800">Área de Aterro</span>
                 <span className="text-sm font-black text-emerald-600">{fillArea.toFixed(1)} m²</span>
              </div>
           </div>
        </div>
        
        <div className="col-span-1 md:col-span-3 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center p-2 min-h-[350px]">
           <svg viewBox="0 0 600 240" className="w-full h-full bg-white rounded shadow-inner" preserveAspectRatio="xMidYMid meet">
              <defs>
                 <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                 </pattern>
                 <pattern id="cutHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="40" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
                 </pattern>
                 <pattern id="fillHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                    <line x1="0" y1="0" x2="0" y2="40" stroke="#10b981" strokeWidth="2" opacity="0.4" />
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <polygon points={`0,${getTerrainY(0)} 600,${getTerrainY(600)} 600,240 0,240`} fill="#fef3c7" opacity="0.5" />
              
              <line x1="0" y1={getTerrainY(0)} x2="600" y2={getTerrainY(600)} stroke="#b45309" strokeWidth="2" strokeDasharray="5,5" />
              
              {cutPolys.map((pts, i) => (
                  <g key={`cut-${i}`}>
                     <polygon points={toPoints(pts)} fill="#fecaca" fillOpacity={0.3} />
                     <polygon points={toPoints(pts)} fill="url(#cutHatch)" />
                     <polygon points={toPoints(pts)} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
                  </g>
              ))}

              {fillPolys.map((pts, i) => (
                  <g key={`fill-${i}`}>
                     <polygon points={toPoints(pts)} fill="#bbf7d0" fillOpacity={0.3} />
                     <polygon points={toPoints(pts)} fill="url(#fillHatch)" />
                     <polygon points={toPoints(pts)} fill="none" stroke="#10b981" strokeWidth="1.5" />
                  </g>
              ))}
              
              <line 
                 x1={roadLeft} y1={roadY} 
                 x2={leftDaylight.catchX} y2={leftDaylight.catchY} 
                 stroke={leftDaylight.isCut ? "#dc2626" : "#059669"} 
                 strokeWidth="2.5" 
              />
              <line 
                 x1={roadRight} y1={roadY} 
                 x2={rightDaylight.catchX} y2={rightDaylight.catchY} 
                 stroke={rightDaylight.isCut ? "#dc2626" : "#059669"} 
                 strokeWidth="2.5" 
              />

              <line x1={roadLeft} y1={roadY} x2={roadRight} y2={roadY} stroke="#475569" strokeWidth="6" />
              <circle cx={midX} cy={roadY} r="4" fill="#ef4444" />
              <line x1={midX} y1={roadY} x2={midX} y2={roadY + 20} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />

              <text x="10" y="20" fill="#b45309" fontSize="12" fontFamily="monospace" fontWeight="bold">Terreno Natural</text>
              <text x="10" y="40" fill="#475569" fontSize="12" fontFamily="monospace" fontWeight="bold">Pista / Greide</text>
              
              <text x={midX} y={roadY - 10} fill="#334155" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">EIXO</text>

              <text x={leftDaylight.catchX - 10} y={leftDaylight.catchY - 10} fill={leftDaylight.isCut ? "#dc2626" : "#059669"} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                 {leftDaylight.isCut ? "Lç Corte" : "Lç Aterro"}
              </text>
              <text x={rightDaylight.catchX + 10} y={rightDaylight.catchY - 10} fill={rightDaylight.isCut ? "#dc2626" : "#059669"} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                 {rightDaylight.isCut ? "Lç Corte" : "Lç Aterro"}
              </text>
           </svg>
           <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-md shadow-sm border border-slate-200 text-xs font-mono font-bold text-slate-700">
               Seção Tipo
           </div>
        </div>
      </div>
    </div>
  );
}

function ModuleTimeline({
  moduleLessons,
  currentLessonId,
  completedLessons,
  navigateToLesson
}: {
  moduleLessons: Lesson[];
  currentLessonId: string;
  completedLessons: string[];
  navigateToLesson: (id: string) => void;
}) {
  const [confirmLessonId, setConfirmLessonId] = React.useState<string | null>(null);

  return (
    <div className="flex items-center gap-2 mt-4 mb-2 overflow-x-auto pb-4 custom-scrollbar">
      {moduleLessons.map((l, idx) => {
        const isCurrent = l.id === currentLessonId;
        const isCompleted = completedLessons.includes(l.id);

        return (
          <React.Fragment key={l.id}>
            <button
              onClick={() => {
                if (isCompleted && !isCurrent) {
                  setConfirmLessonId(l.id);
                  setTimeout(() => {
                    setConfirmLessonId(null);
                    navigateToLesson(l.id);
                  }, 600);
                } else if (isCurrent) {
                  navigateToLesson(l.id);
                }
              }}
              disabled={!isCompleted && !isCurrent}
              aria-label={isCurrent ? `Aula atual: ${l.title}` : isCompleted ? `Aula concluída: ${l.title}` : `Aula bloqueada: ${l.title}`}
              className={cn(
                "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all relative group",
                confirmLessonId === l.id
                  ? "border-emerald-500 bg-emerald-500 text-white scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)] duration-300"
                  : isCurrent 
                  ? "border-sky-500 bg-sky-500 text-white ring-4 ring-sky-100" 
                  : isCompleted 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600 cursor-pointer hover:bg-emerald-100" 
                    : "border-slate-200 bg-white text-slate-300 cursor-not-allowed"
              )}
            >
              {isCompleted && !isCurrent ? (confirmLessonId === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />) : (!isCompleted && !isCurrent ? <Lock className="w-3.5 h-3.5" /> : (idx + 1))}
              
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                {l.title}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
              </div>
            </button>
            {idx < moduleLessons.length - 1 && (
              <div className={cn("w-8 h-1 flex-shrink-0 rounded-full transition-colors duration-500", completedLessons.includes(l.id) && (moduleLessons[idx + 1]?.id === currentLessonId || completedLessons.includes(moduleLessons[idx + 1]?.id)) ? "bg-emerald-200" : "bg-slate-100")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const COURSE_GLOSSARY = [
  { word: 'Corridors', def: 'O modelo 3D dinâmico resultante da união do Alinhamento, Perfil e Assembly.' },
  { word: 'Corridor', def: 'O modelo 3D dinâmico resultante da união do Alinhamento, Perfil e Assembly.' },
  { word: 'Assembly', def: 'A seção tipo (gabarito transversal) aplicada ao longo do corredor.' },
  { word: 'TIN', def: 'Triangulated Irregular Network - Malha de triângulos para superfícies.' },
  { word: 'Toolspace', def: 'A janela principal de gerenciamento de dados e configurações do Civil 3D.' },
  { word: 'BIM', def: 'Building Information Modeling - Metodologia de Modelagem da Informação da Construção.' },
  { word: 'InfoDrainage', def: 'Software avançado da Autodesk para análise hidrológica e hidráulica.' },
  { word: 'Ribbon', def: 'A faixa de opções na interface de usuário onde as ferramentas são organizadas.' },
  { word: 'Templates', def: 'Arquivos base (.dwt) contendo estilos, tabelas e configurações pré-definidas.' },
  { word: 'Pontos COGO', def: 'Coordinate Geometry - Pontos inteligentes base que guardam Norte, Este, Elevação e Descrição.' },
  { word: 'Tool Palettes', def: 'Paleta flutuante carregando bibliotecas de subassemblies (peças parametrizadas).' },
  { word: 'Inlets', def: 'Estruturas de captação de água pluvial, como as bocas de lobo.' },
  { word: 'Manholes', def: 'Poços de visita para inspeção e junção de tubulações.' },
  { word: 'Volume Dashboard', def: 'Painel para quantificação exata de volumes de corte e aterro.' },
  { word: 'View Frames', def: 'Molduras de pranchas geradas ao longo de um alinhamento para detalhamento automático.' },
  { word: 'Project Explorer', def: 'Painel interativo para auditar elementos, navegar e exportar relatórios complexos.' },
  { word: 'SuDS', def: 'Sustainable Drainage Systems - Sistemas de drenagem concebidos para simular a drenagem natural.' }
];

const drainageData = [
  { name: 'Chuva Leve', volume: 15, capacity: 50, color: '#38bdf8' },
  { name: 'Chuva Moderada', volume: 45, capacity: 50, color: '#0284c7' },
  { name: 'Chuva Intensa', volume: 75, capacity: 50, color: '#0f172a' }
];

function CatchmentSimulator() {
  const [area1, setArea1] = useState(2.5); // Hectares
  const [area2, setArea2] = useState(1.5); // Hectares

  const c1 = 0.9; // Urbano/Asfalto
  const c2 = 0.3; // Gramado/Residencial pouco denso
  const i = 120; // Intensidade (mm/h)
  
  // Q = (C * I * A) / 360  em m³/s
  const q1 = (c1 * i * area1) / 360;
  const q2 = (c2 * i * area2) / 360;
  const qTotal = q1 + q2;

  const data = [
    { name: 'Bacia 1 (Urbana)', Area: area1, 'Vazão (L/s)': Math.round(q1 * 1000) },
    { name: 'Bacia 2 (Verde)', Area: area2, 'Vazão (L/s)': Math.round(q2 * 1000) },
  ];

  // For pipe animation, we can have a flow indicator.
  const flowDuration = Math.max(0.3, 3 - (qTotal * 1.5)); // The more flow, the faster (less duration), cap at 0.3s
  // O pipe enche mais quanto maior for a vazão total, máximo em ~0.4 m3/s (400 L/s, para dar espaço visual)
  const fillPercentage = Math.min(100, Math.max(10, (qTotal / 0.4) * 100));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 mt-8">
      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Droplets className="w-5 h-5 text-blue-600" />
        Simulador de Dimensionamento: Bacias e Redes
      </h4>
      <p className="text-sm text-slate-500 mb-6">
        Ajuste a área de contribuição de duas bacias virtuais para visualizar o impacto na vazão de pico, utilizando o Método Racional (Q = CIA/360). Observe a animação do fluxo se ajustando no tubo e o gráfico comparativo.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20"><Home className="w-12 h-12 text-slate-600" /></div>
            <h5 className="text-sm font-bold text-slate-700 mb-4 relative z-10">Bacia 1: Área Urbana Consolidada (C = 0.9)</h5>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Área de Contribuição</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{area1.toFixed(1)} ha</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.1" 
              value={area1}
              onChange={(e) => setArea1(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none relative z-10"
            />
            <div className="mt-3 flex justify-between items-center text-xs text-slate-600 border-t border-slate-200/60 pt-3 relative z-10">
              <span className="font-medium text-slate-500">I = 120 mm/h</span>
              <span>Vazão Pico: <strong className="text-blue-700 font-mono text-sm bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{(q1 * 1000).toFixed(0)} L/s</strong></span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20"><TreePine className="w-12 h-12 text-emerald-600" /></div>
            <h5 className="text-sm font-bold text-slate-700 mb-4 relative z-10">Bacia 2: Área Verde / Gramado (C = 0.3)</h5>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Área de Contribuição</span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{area2.toFixed(1)} ha</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.1" 
              value={area2}
              onChange={(e) => setArea2(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none relative z-10"
            />
            <div className="mt-3 flex justify-between items-center text-xs text-slate-600 border-t border-slate-200/60 pt-3 relative z-10">
              <span className="font-medium text-slate-500">I = 120 mm/h</span>
              <span>Vazão Pico: <strong className="text-emerald-700 font-mono text-sm bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{(q2 * 1000).toFixed(0)} L/s</strong></span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-xl flex justify-between items-center shadow-sm">
             <div className="flex flex-col">
                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Vazão Total Entrando na Rede</span>
                 <span className="text-slate-500 text-[10px] uppercase font-bold mt-1">Soma das Contribuições Ponderadas</span>
             </div>
             <span className="text-2xl font-black text-blue-700 font-mono drop-shadow-sm">{(qTotal * 1000).toFixed(0)} L/s</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="h-[250px] bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
              <h5 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider text-center">Comparativo: Área vs Vazão de Pico</h5>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                      <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                      <Bar yAxisId="left" dataKey="Vazão (L/s)" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vazão (L/s)" maxBarSize={50} />
                      <Bar yAxisId="right" dataKey="Area" fill="#10b981" radius={[4, 4, 0, 0]} name="Área (Hectares)" maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
           </div>
           
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-center items-center relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
               
               <h5 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider z-10 w-full text-center flex items-center justify-center gap-2">
                  <PlayCircle className="w-4 h-4" /> Simulação de Fluxo no Tubo Coletor
               </h5>
               
               <div className="w-full max-w-sm h-16 bg-slate-800 rounded-full border-4 border-slate-700 relative overflow-hidden shadow-inner flex flex-col justify-end z-10">
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_20%,#ffffff_50%,transparent_80%)] mix-blend-overlay pointer-events-none z-30" />
                  
                  {/* Animating water flow wrapper */}
                  <div 
                      className="w-full relative transition-all duration-300 ease-in-out border-t border-blue-400/30"
                      style={{ height: `${fillPercentage}%` }}
                  >
                        {/* Dynamic water speed */}
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 opacity-80"
                            style={{ backgroundSize: '200% 100%' }}
                            animate={{ 
                                backgroundPosition: ["100% 0%", "0% 0%"]
                            }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: flowDuration
                            }}
                        />
                        {/* Highlights */}
                        <div className="absolute top-0 w-full h-[1px] bg-blue-300/50 z-20" />
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-slate-900/90 px-2 py-1 rounded text-[10px] font-mono text-blue-300 font-bold border border-slate-700 shadow-md backdrop-blur-sm">
                    Q: {(qTotal * 1000).toFixed(0)} L/s
                  </div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-[10px] font-bold text-slate-500 uppercase tracking-widest mix-blend-screen">
                    Tubo HDPE
                  </div>
               </div>
               <div className="mt-4 text-[10px] text-slate-500 font-mono flex justify-between w-full max-w-sm z-10">
                  <span>CAPACIDADE: 400 L/s</span>
                  <span className={fillPercentage >= 95 ? "text-red-400 font-bold" : ""}>
                     {fillPercentage >= 95 ? "SOBRECARGA!" : `${fillPercentage.toFixed(0)}% OCUPADO`}
                  </span>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function CatchmentScatterPlot() {
  const [adjustableArea, setAdjustableArea] = useState<number>(5.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [flowParticles, setFlowParticles] = useState<{ id: number; delay: number; left: number }[]>([]);

  const calculateFlow = (area: number) => {
    return Number((area * 0.34).toFixed(2));
  };

  const dynamicFlow = calculateFlow(adjustableArea);

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Create random rain/flow particles for animation
    const particles = Array.from({ length: Math.min(Math.floor(dynamicFlow * 5), 50) }).map((_, i) => ({
      id: Date.now() + i,
      delay: Math.random() * 1.5,
      left: 5 + Math.random() * 90
    }));
    
    setFlowParticles(particles);

    setTimeout(() => {
      setIsSimulating(false);
      setFlowParticles([]);
    }, 2500);
  }

  // Pre-calculate the background trend line points
  const bgData = Array.from({ length: 21 }).map((_, i) => {
    const area = i;
    return { area, flow: calculateFlow(area) };
  });

  const currentPointData = [{ area: adjustableArea, flow: dynamicFlow }];

  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mb-6 relative overflow-hidden">
      <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
        <Droplets className="w-5 h-5 mr-2 text-indigo-600"/> 
        Relação: Área da Bacia x Vazão de Pico
      </h3>
      <p className="text-sm text-slate-600 mb-6">
        Explore como o tamanho da bacia de contribuição (hectares) influencia a vazão de pico estimada (m³/s) usando o Método Racional simplificado. Ajuste a área abaixo e simule o escoamento.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 h-80 flex flex-col">
          <div className="w-full flex-1 min-h-[0]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="area" name="Área" unit=" ha" domain={[0, 20]} stroke="#64748b" tick={{fontSize: 12}} label={{ value: 'Área da Bacia (ha)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} />
                <YAxis type="number" dataKey="flow" name="Vazão" unit=" m³/s" domain={[0, 7]} stroke="#64748b" tick={{fontSize: 12}} label={{ value: 'Vazão de Pico (m³/s)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} />
                <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value} />
                
                <Scatter name="Curva Teórica" data={bgData} fill="#cbd5e1" line={{ stroke: '#cbd5e1', strokeWidth: 2 }} shape={<circle r={0} />} isAnimationActive={false} />
                <Scatter name="Bacia Selecionada" data={currentPointData} fill="#4f46e5" shape={<circle r={8} stroke="#c7d2fe" strokeWidth={3} />} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="pt-4 px-4 pb-2 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">Ajuste da Área (ha):</label>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{adjustableArea.toFixed(1)} ha</span>
            </div>
            <input 
              type="range" 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              min="0.5" 
              max="20" 
              step="0.5" 
              value={adjustableArea} 
              onChange={(e) => setAdjustableArea(parseFloat(e.target.value))}
            />
          </div>
        </div>
        
        <div className="bg-sky-50 rounded-xl border border-sky-100 p-6 flex flex-col items-center relative overflow-hidden h-80 z-0">
          <div className="relative z-10 w-full flex flex-col items-center flex-1">
            <h4 className="text-sm font-bold text-sky-900 mb-2 uppercase tracking-wide">Resultados</h4>
            
            <div className="bg-white/90 p-4 rounded-xl w-full text-center border border-sky-100 shadow-sm mb-4 backdrop-blur-sm transition-all duration-300">
              <div className="text-sm font-bold text-slate-500 mb-1">Vazão Escoada</div>
              <div className="text-4xl font-black text-sky-600">{dynamicFlow.toFixed(2)} <span className="text-base text-sky-400 font-bold">m³/s</span></div>
            </div>
            
            <div className="mt-auto pt-4 w-full">
               <button 
                 onClick={handleSimulate}
                 disabled={isSimulating}
                 className={cn("w-full py-3 px-4 rounded-lg font-bold text-sm transition-all focus:ring-4 focus:ring-sky-100 flex items-center justify-center relative overflow-hidden", isSimulating ? "bg-sky-300 text-white cursor-not-allowed" : "bg-sky-600 text-white hover:bg-sky-700 shadow-md hover:shadow-lg")}
               >
                 {isSimulating ? (
                   <><Loader2 className="w-5 h-5 mr-2 animate-spin relative z-10" /> <span className="relative z-10">Simulando...</span></>
                 ) : (
                   <><Droplets className="w-5 h-5 mr-2 relative z-10" /> <span className="relative z-10">Simular Escoamento</span></>
                 )}
               </button>
            </div>
          </div>
          
          {isSimulating && (
            <div className="absolute inset-0 pointer-events-none z-0 flex items-end">
               <div 
                 className="w-full bg-blue-400/30 transition-all duration-[2000ms] ease-out absolute bottom-0" 
                 style={{ height: `${Math.min((dynamicFlow / 7) * 100, 100)}%` }}
               />
               <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden w-full h-full"> 
                 {flowParticles.map(p => (
                   <div 
                     key={p.id}
                     className="absolute -top-4 w-1.5 h-4 sm:w-2 sm:h-6 bg-blue-500/60 rounded-full"
                     style={{
                       left: `${p.left}%`,
                       animation: `fall-down 1s linear ${p.delay}s forwards`
                     }}
                   />
                 ))}
               </div>
            </div>
          )}

          <style>{`
            @keyframes fall-down {
              0% { transform: translateY(0); opacity: 0; }
              10% { opacity: 0.8; }
              90% { opacity: 0.8; }
              100% { transform: translateY(320px); opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

const stockData = [
  { date: 'D-6', price: 122.20 },
  { date: 'D-5', price: 119.80 },
  { date: 'D-4', price: 125.40 },
  { date: 'D-3', price: 128.90 },
  { date: 'D-2', price: 135.20 },
  { date: 'D-1', price: 142.10 },
  { date: 'Hoje', price: 148.50 },
];

function StockPriceChart() {
  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-emerald-600"/> 
        Ações da Civil 3D Corp. (Últimos 7 dias)
      </h3>
      <p className="text-sm text-slate-600 mb-6 font-medium">Acompanhe a evolução hipotética do valor das ações da "Civil 3D Corp." após o anúncio da nova integração com o AutoCAD 2027.</p>
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stockData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={(value) => `$${value}`} />
            <RechartsTooltip 
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Preço da Ação']}
              labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '8px' }}
            />
            <RechartsLine 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UrbanDrainageSimulation() {
  const [area1, setArea1] = useState(10);
  const [area2, setArea2] = useState(8);
  const [scenario, setScenario] = useState(2);
  const [method, setMethod] = useState<'tr55' | 'faa' | 'kirpich'>('faa');
  const [useUgs, setUseUgs] = useState(false);
  const { addXp, unlockBadge } = useGamification();
  const [hasAwardedXp, setHasAwardedXp] = useState(false);

  // FAA e Kirpich foram adicionados ao C3D 2027. Ajustamos levemente o impacto na concentração
  const methodMultiplier = {
    'tr55': 1.0,     // Base
    'faa': 0.85,     // Método FAA (costuma gerar TC menor = pico maior)
    'kirpich': 1.15  // Kirpich (depende da declividade, aqui simulamos pico levemente atenuado)
  };

  const intensities = [2.0, 4.0, 6.5]; // L/s per ha

  const scenarioNames = ['Chuva Leve', 'Moderada', 'Intensa'];
  const colors = ['#38bdf8', '#0284c7', '#0f172a'];
  const baseCapacity = 80;
  // UGS (Underground Storage) atua como buffer no C3D 2027, aumentando capacidade local
  const capacity = useUgs ? baseCapacity + 50 : baseCapacity;

  const currentIntensity = intensities[scenario];
  const q1 = Math.round(area1 * currentIntensity * methodMultiplier[method]);
  const q2 = Math.round(area2 * currentIntensity * methodMultiplier[method]);
  const totalVolume = q1 + q2;
  const isOverflow = totalVolume > capacity;

  useEffect(() => {
    if ((area1 !== 10 || area2 !== 8 || scenario !== 2 || useUgs || method !== 'faa') && !hasAwardedXp) {
      addXp(30);
      unlockBadge('simulation_complete');
      setHasAwardedXp(true);
    }
  }, [area1, area2, scenario, useUgs, method, hasAwardedXp, addXp, unlockBadge]);

  const chartData = [
    { name: 'Bacia 1', volume: q1, fill: '#60a5fa' },
    { name: 'Bacia 2', volume: q2, fill: '#34d399' },
    { name: 'Total', volume: totalVolume, fill: isOverflow ? '#ef4444' : '#8b5cf6' }
  ];

  return (
    <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center mb-2">
         <Droplets className="w-5 h-5 mr-2 text-sky-600"/> 
         Simulação Tática: Civil 3D 2027
      </h3>
      <p className="text-sm text-slate-500 mb-6">Avalie as inovações na análise hidrológica testando novos métodos de tempo de concentração (FAA/Kirpich) e adicionando armazenamento subterrâneo (UGS) nativo.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-end mb-4">
            <h4 className="text-sm font-bold text-slate-700">Cenário de Chuva</h4>
            <div className="flex gap-1 border border-slate-200 rounded-lg p-0.5 bg-white">
              {scenarioNames.map((name, i) => (
                <button 
                  key={i}
                  onClick={() => setScenario(i)}
                  className={cn("px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors", scenario === i ? "bg-sky-100 text-sky-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50")}
                  title={`Intensidade: ${intensities[i]} L/s por ha`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
             <h4 className="text-sm font-bold text-slate-700 mb-2">Método de T.C. (Novo 2027)</h4>
             <div className="flex gap-2">
                <button onClick={() => setMethod('tr55')} className={cn("flex-1 py-1.5 text-[11px] font-bold rounded border", method === 'tr55' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>TR-55</button>
                <button onClick={() => setMethod('faa')} className={cn("flex-1 py-1.5 text-[11px] font-bold rounded border", method === 'faa' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>FAA</button>
                <button onClick={() => setMethod('kirpich')} className={cn("flex-1 py-1.5 text-[11px] font-bold rounded border", method === 'kirpich' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>Kirpich</button>
             </div>
          </div>
          
          <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 mb-4">
             <div>
               <div className="flex justify-between text-xs font-bold mb-1">
                 <span className="text-blue-600">Área Bacia 1 (ha)</span>
                 <span>{area1} ha</span>
               </div>
               <input 
                 type="range" min="5" max="50" step="1" 
                 value={area1} onChange={e => setArea1(parseFloat(e.target.value))}
                 className="w-full accent-blue-500"
               />
               <div className="text-[10px] text-slate-400 font-medium">Vazão Parcial: {q1} L/s</div>
             </div>

             <div>
               <div className="flex justify-between text-xs font-bold mb-1">
                 <span className="text-emerald-600">Área Bacia 2 (ha)</span>
                 <span>{area2} ha</span>
               </div>
               <input 
                 type="range" min="5" max="50" step="1" 
                 value={area2} onChange={e => setArea2(parseFloat(e.target.value))}
                 className="w-full accent-emerald-500"
               />
               <div className="text-[10px] text-slate-400 font-medium">Vazão Parcial: {q2} L/s</div>
             </div>
          </div>

          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors mb-4">
            <input type="checkbox" checked={useUgs} onChange={(e) => setUseUgs(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
            <div className="flex flex-col">
               <span className="text-sm font-bold text-slate-800">Habilitar Armazenamento (UGS)</span>
               <span className="text-[10px] text-slate-500 font-medium mt-0.5">Aumenta capacidade em +50 L/s</span>
            </div>
          </label>

          <div className="bg-white p-4 rounded-xl border border-slate-200 h-48">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <ReferenceLine y={capacity} label={{ position: 'top', value: `Capacidade do Tubo (${capacity} L/s)`, fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} stroke="#ef4444" strokeDasharray="3 3" />
                <Bar dataKey="volume" name="Volume Escoado (L/s)" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="transition-all duration-300" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Diagrama de Contribuição e Rede</h4>
          <div className="relative bg-white rounded-xl border border-slate-200 p-6 h-[26rem] flex flex-col items-center justify-center overflow-hidden">
             
             {/* Rain animation based on scenario */}
             <div className={cn("absolute inset-x-0 top-0 h-24 opacity-50 flex justify-around pointer-events-none", 
                scenario === 0 ? "animate-pulse" : scenario === 1 ? "animate-bounce" : "animate-ping")} style={{ backgroundImage: 'linear-gradient(to bottom, #bae6fd, transparent)' }}>
             </div>

             <div className="flex gap-4 mb-4 relative z-10 w-full justify-center">
               {/* Catchment 1 Area */}
               <div className="flex flex-col items-center transition-all duration-300" style={{ transform: `scale(${0.8 + (area1 / 100)})` }}>
                 <div className="w-24 h-24 bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center relative shadow-sm">
                    <span className="text-[10px] font-bold text-blue-600 uppercase flex flex-col items-center text-center px-1">
                      <Droplets className="w-4 h-4 mb-1 opacity-60" /> Bacia 1<br/>{area1}ha
                    </span>
                 </div>
                 <ArrowDown className="w-5 h-5 text-blue-400 animate-bounce mt-2" />
               </div>

               {/* Catchment 2 Area */}
               <div className="flex flex-col items-center transition-all duration-300" style={{ transform: `scale(${0.8 + (area2 / 100)})` }}>
                 <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-300 border-dashed rounded-lg flex items-center justify-center relative shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase flex flex-col items-center text-center px-1">
                      <Droplets className="w-4 h-4 mb-1 opacity-60" /> Bacia 2<br/>{area2}ha
                    </span>
                 </div>
                 <ArrowDown className="w-5 h-5 text-emerald-400 animate-bounce mt-2" />
               </div>
             </div>

             <div className="relative flex flex-col items-center w-full">
               {isOverflow && (
                 <>
                   <div className="absolute -inset-x-8 -top-8 -bottom-2 bg-red-400/20 rounded-full animate-pulse blur-md z-0"></div>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 border-4 border-red-500/40 rounded-full animate-[ping_2s_ease-out_infinite] z-20"></div>
                 </>
               )}
               {/* Catch Basin */}
               <div className="w-32 h-10 bg-slate-700 rounded-t flex items-center justify-center border-t-4 border-slate-900 relative z-10 shadow-lg">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Poço de Visita</span>
               </div>
               
               {/* Pipe */}
               <div className="w-full h-10 bg-slate-200 border-x-2 border-b-2 border-slate-300 relative overflow-hidden flex items-center shadow-inner rounded-b">
                  <div 
                    className={cn("h-full transition-all duration-1000 ease-in-out flex items-center justify-center", isOverflow ? "bg-red-500" : "bg-sky-500")}
                    style={{ width: `${Math.min(100, (totalVolume / capacity) * 100)}%` }}
                  >
                      {isOverflow && <span className="text-[10px] font-bold text-white uppercase px-2 animate-pulse whitespace-nowrap">Sobrecarga Requerida!</span>}
                  </div>
                  <span className="absolute inset-x-0 text-center text-[10px] font-bold text-slate-700 uppercase mix-blend-overlay">Tubo Principal</span>
               </div>
             </div>

             {isOverflow && (
               <div className="absolute bottom-4 right-4 flex items-center bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-red-200 animate-in slide-in-from-bottom-2 fade-in z-20">
                 <Info className="w-3.5 h-3.5 mr-1" />
                 Rede Insuficiente ({totalVolume} L/s)
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Alignment3D({ radius }: { radius: number }) {
  const [animRadius, setAnimRadius] = useState(radius);

  useFrame((state, delta) => {
    // Lerp the value for smooth animation
    if (Math.abs(animRadius - radius) > 0.01) {
      setAnimRadius((prev) => THREE.MathUtils.lerp(prev, radius, 10 * delta));
    } else if (animRadius !== radius) {
      setAnimRadius(radius);
    }
  });

  const scale = 0.1;
  const r = animRadius * scale;
  
  const arcPoints = useMemo(() => {
    const points = [];
    const segments = 32;
    const center = new THREE.Vector3(-r, 0, r);
    for (let i = 0; i <= segments; i++) {
       const angle = Math.PI * 1.5 + (Math.PI / 2) * (i / segments);
       points.push(new THREE.Vector3(center.x + r * Math.cos(angle), 0, center.z + r * Math.sin(angle)));
    }
    return points;
  }, [r]);

  return (
     <group>
        {/* Tangent 1 */}
        <Line points={[[-r - 50, 0, 0], [-r, 0, 0]]} color="white" lineWidth={3} />
        <Line points={[[-r, 0, 0], [0, 0, 0]]} color="red" lineWidth={2} dashed dashSize={2} gapSize={1} />
        {/* Curve */}
        <Line points={arcPoints} color="yellow" lineWidth={5} />
        {/* Tangent 2 */}
        <Line points={[[0, 0, 0], [0, 0, r]]} color="red" lineWidth={2} dashed dashSize={2} gapSize={1} />
        <Line points={[[0, 0, r], [0, 0, r + 50]]} color="white" lineWidth={3} />

        {/* PI Point */}
        <mesh position={[0, 0, 0]}>
           <sphereGeometry args={[1.5, 16, 16]} />
           <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* PC Point */}
        <mesh position={[-r, 0, 0]}>
           <sphereGeometry args={[1.5, 16, 16]} />
           <meshBasicMaterial color="#22c55e" />
        </mesh>
        {/* PT Point */}
        <mesh position={[0, 0, r]}>
           <sphereGeometry args={[1.5, 16, 16]} />
           <meshBasicMaterial color="#3b82f6" />
        </mesh>

        <Html position={[2, 2, 2]}>
           <div className="text-red-600 font-bold text-xs bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-red-200">PI</div>
        </Html>
        <Html position={[-r - 2, 2, -2]}>
           <div className="text-green-600 font-bold text-xs bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-green-200">PC</div>
        </Html>
        <Html position={[-2, 2, r + 2]}>
           <div className="text-blue-600 font-bold text-xs bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-blue-200">PT</div>
        </Html>
        
        <Line points={[[-r, 0, 0], [-r, 0, r]]} color="#64748b" lineWidth={1} dashed dashSize={1} gapSize={1} />
        <Line points={[[0, 0, r], [-r, 0, r]]} color="#64748b" lineWidth={1} dashed dashSize={1} gapSize={1} />
        <mesh position={[-r, 0, r]}>
           <sphereGeometry args={[0.8, 8, 8]} />
           <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <Html position={[-r, 0, r]}>
           <motion.div 
               key={radius}
               initial={{ scale: 1.5, opacity: 0.5, color: '#4f46e5' }}
               animate={{ scale: 1, opacity: 1, color: '#64748b' }}
               transition={{ duration: 0.5 }}
               className="font-bold text-[10px] bg-white/80 px-1 py-0.5 rounded ml-2 whitespace-nowrap"
           >
              R={Math.round(animRadius)}m
           </motion.div>
        </Html>
     </group>
  );
}

function AlignmentDesignPanel() {
  const [alignmentName, setAlignmentName] = useState('Eixo Rodovia Sul');
  const [piCoord, setPiCoord] = useState('E=1200.50, N=3450.25');
  const [radius, setRadius] = useState(250);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 relative overflow-hidden flex flex-col gap-6">
        <div>
           <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Configuração de Alinhamento Horizontal
           </h4>
           <p className="text-sm text-slate-500">
              Ao definir o Raio da Curva neste painel, o projeto calculará automaticamente os elementos da curva horizontal (Desenvolvimento, Tangentes), visualizando em tempo real as mudanças geométricas.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">Nome do Alinhamento</label>
                  <input 
                     type="text" 
                     value={alignmentName}
                     onChange={(e) => setAlignmentName(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
               </div>
               <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">Coordenadas do PI (Ponto de Interseção)</label>
                  <input 
                     type="text" 
                     value={piCoord}
                     onChange={(e) => setPiCoord(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
               </div>
               <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2 flex justify-between">
                     Raio da Curva Horizontal
                     <span className="text-indigo-600">{radius} m</span>
                  </label>
                  <input 
                     type="range" 
                     min="50" 
                     max="1000" 
                     step="10" 
                     value={radius}
                     onChange={(e) => setRadius(Number(e.target.value))}
                     className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 w-full px-1">
                     <span>50m</span>
                     <span>1000m</span>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2">Propriedades Dinâmicas</h5>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Comprimento da Curva (L)</span>
                        <motion.span 
                           key={`L-${radius}`}
                           initial={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                           animate={{ backgroundColor: '#f8fafc', color: '#1e293b' }}
                           transition={{ duration: 0.5 }}
                           className="text-sm font-bold font-mono px-2 py-1 rounded border border-slate-200"
                        >
                           {((Math.PI * radius * 90) / 180).toFixed(2)} m
                        </motion.span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Tangente (T)</span>
                        <motion.span 
                           key={`T-${radius}`}
                           initial={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                           animate={{ backgroundColor: '#f8fafc', color: '#1e293b' }}
                           transition={{ duration: 0.5 }}
                           className="text-sm font-bold font-mono px-2 py-1 rounded border border-slate-200"
                        >
                           {(radius * Math.tan(90 * Math.PI / 360)).toFixed(2)} m
                        </motion.span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Velocidade Diretriz</span>
                        <motion.span 
                           key={`V-${radius}`}
                           initial={{ scale: 1.1 }}
                           animate={{ scale: 1 }}
                           transition={{ duration: 0.3 }}
                           className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100"
                        >
                           {radius < 100 ? '40 km/h' : radius < 300 ? '60 km/h' : radius < 600 ? '80 km/h' : '100 km/h'}
                        </motion.span>
                     </div>
                  </div>
               </div>
               
               <button 
                  onClick={handleSave}
                  className={cn(
                     "w-full mt-6 py-3 rounded-lg font-bold text-sm transition-all focus:outline-none flex items-center justify-center gap-2",
                     saved ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5"
                  )}
               >
                  {saved ? (
                     <><Check className="w-5 h-5" /> Aplicado à Simulação 3D</>
                  ) : (
                     <><Save className="w-5 h-5" /> Aplicar Alterações</>
                  )}
               </button>
            </div>
            
            <div className="h-[400px] bg-slate-900 rounded-xl overflow-hidden relative shadow-inner border border-slate-200/50">
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="px-2 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase">Visualização de Raio</span>
                  <span className="px-2 py-1 bg-indigo-500/80 backdrop-blur-md rounded border border-indigo-400 text-white text-[10px] font-bold tracking-wider uppercase">Δ = 90°</span>
               </div>
               <div className="absolute bottom-4 left-4 z-10 text-white/50 text-[10px] uppercase tracking-wider">
                  Arraste para girar • Scroll para zoom
               </div>
               <Canvas camera={{ position: [0, 80, 80], fov: 45 }}>
                 <ambientLight intensity={0.5} />
                 <directionalLight position={[10, 10, 5]} intensity={1} />
                 <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
                 <Grid infiniteGrid fadeDistance={200} sectionColor="#334155" cellColor="#1e293b" />
                 <Alignment3D radius={radius} />
               </Canvas>
            </div>
        </div>
    </div>
  );
}

function CorridorCenterlineTable({ activeCenterline, onSelectAxis }: { activeCenterline: string | null, onSelectAxis: (id: string | null) => void }) {
  const centerlines = [
    { id: 'br-101', name: 'Eixo Principal (BR-101)', stationStart: '0+000.00', stationEnd: '3+500.00', extension: '3.5 km' },
    { id: 'ramo-a', name: 'Alinhamento do Ramo A', stationStart: '0+000.00', stationEnd: '0+450.00', extension: '450 m' },
    { id: 'ramo-b', name: 'Alinhamento do Ramo B', stationStart: '0+000.00', stationEnd: '0+600.00', extension: '600 m' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6 mb-8 relative z-10 w-full flex-1 w-full max-w-full">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
         <h4 className="text-sm font-bold text-slate-800 flex items-center">
           <MapPin className="w-4 h-4 mr-2 text-indigo-600" /> Tabela de Eixos (Alignments)
         </h4>
         <span className="text-xs font-medium text-slate-500">Clique para inspecionar no painel 3D</span>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap table-auto">
          <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">Nome do Eixo</th>
              <th className="px-6 py-3">Estaca Inicial</th>
              <th className="px-6 py-3">Estaca Final</th>
              <th className="px-6 py-3 text-right">Extensão</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {centerlines.map(c => {
               const isSelected = activeCenterline === c.id;
               return (
                 <tr 
                   key={c.id} 
                   onClick={() => onSelectAxis(isSelected ? null : c.id)}
                   className={cn(
                     "transition-colors cursor-pointer group hover:bg-indigo-50",
                     isSelected ? "bg-indigo-50/80" : "bg-white"
                   )}
                 >
                   <td className="px-6 py-4 font-medium text-slate-800 border-l-2 border-transparent group-hover:border-indigo-400" style={{ borderLeftColor: isSelected ? '#6366f1' : undefined }}>
                     {c.name}
                   </td>
                   <td className="px-6 py-4 text-slate-500 font-mono text-xs">{c.stationStart}</td>
                   <td className="px-6 py-4 text-slate-500 font-mono text-xs">{c.stationEnd}</td>
                   <td className="px-6 py-4 text-slate-700 text-right font-medium">{c.extension}</td>
                   <td className="px-6 py-4 text-right">
                     <button 
                       className={cn(
                         "text-xs px-3 py-1.5 rounded-md font-bold transition-colors",
                         isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                       )}
                     >
                       {isSelected ? 'Inspecionando' : 'Inspecionar eixo'}
                     </button>
                   </td>
                 </tr>
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function AILessonSummary({ lesson }: { lesson: Lesson }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    if (isLoading || summary) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash',
        contents: [
          { role: 'user', parts: [{ text: `Gera um resumo muito conciso (em um único parágrafo) do seguinte conteúdo de uma aula:\n\nTítulo: ${lesson.title}\nConteúdo:\n${lesson.content}\n\nResumo:` }] }
        ]
      });
      setSummary(response.text || 'Não foi possível gerar o resumo.');
    } catch (err) {
      console.error(err);
      setError('Erro ao gerar resumo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSummary(null);
    setError(null);
    setIsLoading(false);
  }, [lesson.id]);

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
          Resumo Inteligente
        </h3>
        {!summary && !isLoading && (
          <button 
            onClick={generateSummary}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            Gerar Resumo com IA
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center space-x-2 text-indigo-600/70 p-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Analisando conteúdo da aula...</span>
        </div>
      ) : summary ? (
        <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
          {summary}
        </p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <p className="text-sm text-indigo-400">
          Clique no botão para gerar um resumo da aula usando IA.
        </p>
      )}
    </div>
  );
}

export function LessonView({ lessonId, completedLessons, toggleLessonCompletion, navigateToLesson }: LessonViewProps) {
  const [isInfoDrainageOpen, setIsInfoDrainageOpen] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [isCCEnabled, setIsCCEnabled] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showVideoGen, setShowVideoGen] = useState(false);
  
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');

  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState(false);
  const [showCompletionAnim, setShowCompletionAnim] = useState(false);

  const [leftSlopeValue, setLeftSlopeValue] = useState(1);
  const [rightSlopeValue, setRightSlopeValue] = useState(1);
  const [savedLeftSlope, setSavedLeftSlope] = useState(1);
  const [savedRightSlope, setSavedRightSlope] = useState(1);

  const [quizFinished, setQuizFinished] = useState(false);

  // Video Player State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const videoDuration = 300; // 5 minutes in seconds

  const [activeCenterline, setActiveCenterline] = useState<string | null>(null);

  const { addXp } = useGamification();
  const [hasAwardedVideoXp, setHasAwardedVideoXp] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= videoDuration) {
            setIsVideoPlaying(false);
            if (!hasAwardedVideoXp) {
               addXp(30);
               setHasAwardedVideoXp(true);
            }
            return videoDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, videoDuration, hasAwardedVideoXp, addXp]);

  const toggleVideoPlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVideoPlaying(!isVideoPlaying);
    if (videoProgress >= videoDuration) {
      setVideoProgress(0);
      setIsVideoPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoProgress(parseFloat(e.target.value));
  };
  
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoVolume(parseFloat(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{x: number, y: number} | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state on lesson change
  useEffect(() => {
    setIsInfoDrainageOpen(false);
    setQuizFinished(false);
    const storedNotes = localStorage.getItem(`c3d_notes_${lessonId}`);
    setNotes(storedNotes || '');
    setSavedNotes(false);
    setShowPdfViewer(false);
    setShowGlossary(false);
    setGlossarySearch('');
    setSelectedText('');
    setSelectionPosition(null);
  }, [lessonId]);

  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<{term: string, def: string, x: number, y: number} | null>(null);
  const [favoriteTerms, setFavoriteTerms] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const savedFavs = localStorage.getItem('c3d_glossary_favorites');
    if (savedFavs) {
      try {
        setFavoriteTerms(JSON.parse(savedFavs));
      } catch (e) {}
    }
  }, []);

  const toggleFavoriteTerm = (termWord: string) => {
    const newFavs = favoriteTerms.includes(termWord) 
      ? favoriteTerms.filter(t => t !== termWord)
      : [...favoriteTerms, termWord];
    setFavoriteTerms(newFavs);
    localStorage.setItem('c3d_glossary_favorites', JSON.stringify(newFavs));
  };

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    container.querySelectorAll('.term-click-button').forEach(b => {
      if (activeGlossaryTerm && b.getAttribute('data-term-id') === activeGlossaryTerm.term) {
        b.classList.add('bg-indigo-100', 'border-b-2', 'border-indigo-600', 'scale-110', 'z-10', 'relative', 'rounded', 'shadow-sm', 'transition-all', 'duration-200');
        b.classList.remove('border-dashed');
      } else {
        b.classList.remove('bg-indigo-100', 'border-b-2', 'border-indigo-600', 'scale-110', 'z-10', 'relative', 'rounded', 'shadow-sm', 'transition-all', 'duration-200');
        b.classList.add('border-dashed');
      }
    });
  }, [activeGlossaryTerm]);

  useEffect(() => {
    const handleScroll = () => {
      setActiveGlossaryTerm(null);
      setSelectionPosition(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const existingTerms = [
      { word: 'BIM', def: 'Building Information Modeling - Metodologia de Modelagem da Informação da Construção.' },
      { word: 'Ribbon', def: 'A faixa de opções na interface de usuário onde as ferramentas são organizadas.' },
      { word: 'Toolspace', def: 'A janela principal de gerenciamento de dados e configurações do Civil 3D.' },
      { word: 'Templates', def: 'Arquivos base (.dwt) contendo estilos, tabelas e configurações pré-definidas.' },
      { word: 'Pontos COGO', def: 'Coordinate Geometry - Pontos inteligentes base que guardam Norte, Este, Elevação e Descrição.' },
      { word: 'COGO Points', def: 'Coordinate Geometry - Pontos inteligentes base que guardam Norte, Este, Elevação e Descrição.' },
      { word: 'Pipe Network', def: 'Redes de tubulação e estruturas de drenagem ou esgoto.' },
      { word: 'Pipe Networks', def: 'Redes de tubulação e estruturas de drenagem ou esgoto.' },
      { word: 'Feature Lines', def: 'Linhas 3D dinâmicas utilizadas para terraplenagem e modelagem de terrenos.' },
      { word: 'Feature Line', def: 'Linha 3D dinâmica utilizada para terraplenagem e modelagem de terrenos.' },
      { word: 'Corridors', def: 'O modelo 3D dinâmico resultante da união do Alinhamento, Perfil e Assembly.' },
      { word: 'Corridor', def: 'O modelo 3D dinâmico resultante da união do Alinhamento, Perfil e Assembly.' },
      { word: 'Assembly', def: 'A seção tipo (gabarito transversal) aplicada ao longo do corredor.' },
      { word: 'TIN', def: 'Triangulated Irregular Network - Malha de triângulos para superfícies.' },
      { word: 'InfoDrainage', def: 'Software avançado da Autodesk para análise hidrológica e hidráulica.' }
    ];

    const allTerms = [
      ...glossaryTerms.map(t => ({ word: t.term, def: t.def })),
      ...existingTerms
    ];

    const sortedTerms = [...allTerms].sort((a, b) => b.word.length - a.word.length);
    const pattern = sortedTerms.map(t => t.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    const applyTooltips = () => {
      if (!contentRef.current) return;
      const walk = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT, null);
      let n;
      const nodesToReplace: { node: Node, parent: Node, newHTML: string }[] = [];
      
      while ((n = walk.nextNode())) {
        const parentNode = n.parentNode as HTMLElement;
        if (parentNode && parentNode.nodeName !== 'SPAN' && parentNode.nodeName !== 'A' && parentNode.nodeName !== 'BUTTON' && !parentNode.classList.contains('term-click-button')) {
          const originalText = n.nodeValue || '';
          
          const newText = originalText.replace(regex, (match) => {
            const matchedTerm = sortedTerms.find(t => t.word.toLowerCase() === match.toLowerCase());
            if (!matchedTerm) return match;
            
            return `
              <button data-term-id="${matchedTerm.word}" type="button" class="cursor-pointer text-indigo-600 font-bold border-b border-indigo-400 border-dashed hover:bg-indigo-50 focus:bg-indigo-50 outline-none rounded term-click-button" aria-expanded="false">
                ${match}
              </button>
            `.trim().replace(/\n\s+/g, '');
          });

          if (newText !== originalText) {
            nodesToReplace.push({ node: n, parent: parentNode, newHTML: newText });
          }
        }
      }

      nodesToReplace.forEach(({ node, parent, newHTML }) => {
        const span = document.createElement('span');
        span.innerHTML = newHTML;
        if (parent.contains(node)) {
          parent.replaceChild(span, node);
        }
      });
    };
    
    applyTooltips();
    const timeoutId = setTimeout(applyTooltips, 50);

    const handleTermClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.term-click-button') as HTMLElement;
      if (btn) {
        const word = btn.getAttribute('data-term-id');
        const termObj = sortedTerms.find(t => t.word === word);
        if (termObj) {
          const rect = btn.getBoundingClientRect();
          setActiveGlossaryTerm({
            term: termObj.word,
            def: termObj.def,
            x: rect.left + rect.width / 2,
            y: rect.top
          });
        }
      } else {
        setActiveGlossaryTerm(null);
      }
    };
    
    const container = contentRef.current;
    container.addEventListener('click', handleTermClick);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('click', handleTermClick);
    };
  }, [lessonId]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0 && contentRef.current?.contains(selection.anchorNode)) {
        const text = selection.toString().trim();
        if (text.length > 5) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setSelectionPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 40
          });
          return;
        }
      }
      setSelectedText('');
      setSelectionPosition(null);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', handleSelectionChange);
    };
  }, []);

  const saveNotes = () => {
    localStorage.setItem(`c3d_notes_${lessonId}`, notes);
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2000);
  };

  const exportNotes = () => {
    if (!notes.trim() || !currentLesson) return;
    const element = document.createElement("a");
    const file = new Blob([`Anotações: ${currentLesson.title}\n\n${notes}`], {type: 'text/plain'});
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = `anotacoes-${lessonId}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handleCompleteLesson = (currentId: string) => {
    const willComplete = !completedLessons.includes(currentId);
    toggleLessonCompletion(currentId);
    if (willComplete) {
      setShowCompletionAnim(true);
      setTimeout(() => setShowCompletionAnim(false), 1500);
    }
  };
  
  // Find current lesson and its context
  let currentLesson: (Lesson & { moduleId: string, moduleTitle: string }) | undefined;
  let currentModuleTitle = "";
  let prevLesson: string | null = null;
  let nextLesson: string | null = null;
  let moduleLessons: Lesson[] = [];
  let currentLessonIndexInModule = 0;

  const allLessons = courseModules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id, moduleTitle: m.title })));
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);

  if (currentIndex !== -1) {
    currentLesson = allLessons[currentIndex];
    currentModuleTitle = allLessons[currentIndex].moduleTitle;
    prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
    nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null;
    
    // Variables for module progress
    moduleLessons = allLessons.filter(l => l.moduleId === currentLesson?.moduleId);
    currentLessonIndexInModule = moduleLessons.findIndex(l => l.id === currentLesson?.id);
  }

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Lição não encontrada.</p>
      </div>
    );
  }

  const isCompleted = completedLessons.includes(currentLesson.id);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLesson.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex flex-col space-y-6"
          >
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center text-xs text-slate-500 gap-1.5 mb-1" aria-label="Breadcrumb">
              <button onClick={() => navigateToLesson('dashboard')} className="hover:text-slate-800 transition-colors flex items-center gap-1">
                 <Home className="w-3.5 h-3.5" />
                 <span>Início</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600 line-clamp-1">{currentModuleTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-medium line-clamp-1">{currentLesson.title}</span>
              <span className="text-slate-400 ml-1">({currentLesson.duration})</span>
            </nav>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">
                  {currentLesson.title}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowGlossary(true)}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  title="Glossário Civil 3D"
                  aria-label="Abrir Glossário"
                >
                   <BookText className="w-4 h-4" /> <span className="hidden sm:inline">Glossário</span>
                </button>
                <button
                  onClick={() => setShowPdfViewer(true)}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
                  title="Abrir material complementar em PDF"
                  aria-label="View PDF Material"
                >
                   <FileText className="w-4 h-4" /> <span className="hidden sm:inline">View PDF Material</span>
                </button>
                <button
                  onClick={() => setShowVideoGen(true)}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  title="Gerar vídeo tutorial baseado no conteúdo"
                  aria-label="Gerar vídeo tutorial"
                >
                   <Video className="w-4 h-4" /> <span className="hidden sm:inline">Gerar Vídeo Tutorial</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setIsShareCopied(true);
                    setTimeout(() => setIsShareCopied(false), 2000);
                  }}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  title="Copiar link"
                  aria-label={isShareCopied ? "Link copiado" : "Copiar link"}
                  aria-live="polite"
                >
                  {isShareCopied ? <><Check className="w-4 h-4 text-emerald-500" /> <span className="hidden sm:inline">Copiado</span></> : <><Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Compartilhar</span></>}
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  animate={showCompletionAnim ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleCompleteLesson(currentLesson!.id)}
                  aria-label={isCompleted ? "Desmarcar aula como concluída" : "Marcar aula como concluída"}
                  aria-live="polite"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 relative overflow-hidden",
                    isCompleted 
                      ? "bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100" 
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  )}
                >
                  <AnimatePresence>
                    {showCompletionAnim && (
                        <motion.span 
                           initial={{ scale: 0, opacity: 0.8 }}
                           animate={{ scale: 2.5, opacity: 0 }}
                           transition={{ duration: 0.5, ease: "easeOut" }}
                           className="absolute inset-0 bg-emerald-400 rounded-md pointer-events-none"
                        />
                    )}
                  </AnimatePresence>
                  {isCompleted ? (
                    <>
                      <motion.div 
                        initial={{ scale: 0, rotate: -90 }} 
                        animate={showCompletionAnim ? { scale: [0, 1.5, 1], rotate: [-90, 20, 0] } : { scale: 1, rotate: 0 }} 
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                      Concluído
                    </>
                  ) : <><Trophy className="w-4 h-4" /> Marcar Concluído</>}
                </motion.button>
              </div>
            </div>

            <ModuleTimeline 
              moduleLessons={moduleLessons}
              currentLessonId={currentLesson.id}
              completedLessons={completedLessons}
              navigateToLesson={navigateToLesson}
            />

            <AILessonSummary lesson={currentLesson} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Content Column */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                
                {/* Video Player */}
                <div 
                  className="w-full aspect-video bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col group select-none"
                  role="region"
                  aria-label="Player de vídeo simulado"
                  onMouseEnter={() => setIsVideoHovered(true)}
                  onMouseLeave={() => setIsVideoHovered(false)}
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  {/* Main Video Area Component */}
                  <div 
                    className="flex-1 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 focus-visible:ring-inset" 
                    tabIndex={0} 
                    role="button" 
                    aria-label={isVideoPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                    onClick={toggleVideoPlay}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleVideoPlay();
                      }
                    }}
                  >
                    {!isVideoPlaying && (
                      <div className="text-center z-10 transition-transform group-hover:scale-105">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/20 hover:bg-sky-500/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-400 transition-colors">
                          <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-sky-300 drop-shadow-md" />
                        </div>
                        <p className="text-white font-bold text-lg tracking-wide drop-shadow-md">
                          {videoProgress > 0 ? "Continuar Aula" : "Apresentação da Aula"}
                        </p>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isCCEnabled && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={cn("absolute left-0 right-0 flex justify-center pointer-events-none z-20 transition-all duration-300", isVideoHovered || !isVideoPlaying ? "bottom-24" : "bottom-8")}
                        aria-live="polite"
                      >
                        <span className="bg-black/80 text-white font-medium px-4 py-2 rounded text-sm sm:text-base max-w-xl text-center border border-white/20 shadow-lg">
                          [Legendas geradas automaticamente apareceriam aqui]
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Video Controls Area */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 pb-2 px-4 flex flex-col justify-end z-20 transition-opacity duration-300",
                    (isVideoHovered || !isVideoPlaying) ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}>
                    {/* Seek Bar */}
                    <div className="w-full flex items-center group/seek cursor-pointer mb-2 relative h-5" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      setVideoProgress(pos * videoDuration);
                    }}>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative transition-all group-hover/seek:h-2">
                        <div 
                          className="absolute top-0 left-0 bottom-0 bg-sky-500 rounded-full"
                          style={{ width: `${(videoProgress / videoDuration) * 100}%` }}
                        />
                      </div>
                      <div 
                        className="absolute w-3 h-3 bg-white rounded-full shadow cursor-grab active:cursor-grabbing top-1/2 -translate-y-1/2 -ml-1.5 scale-0 group-hover/seek:scale-100 transition-transform"
                        style={{ left: `${(videoProgress / videoDuration) * 100}%` }}
                      />
                      <input 
                        type="range" 
                        min="0" 
                        max={videoDuration} 
                        value={videoProgress} 
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Buscar"
                      />
                    </div>

                    <div className="flex justify-between items-center text-white">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button 
                          onClick={toggleVideoPlay}
                          className="p-1 hover:text-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
                          aria-label={isVideoPlaying ? "Pausar" : "Reproduzir"}
                        >
                          {isVideoPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>

                        <div className="flex items-center gap-2 group/volume relative">
                          <button 
                            onClick={() => setVideoVolume(videoVolume === 0 ? 1 : 0)}
                            className="p-1 hover:text-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
                            aria-label={videoVolume === 0 ? "Ativar som" : "Desativar som"}
                          >
                            {videoVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 flex items-center">
                            <input 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.05"
                              value={videoVolume} 
                              onChange={handleVolume}
                              className="w-full h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                              aria-label="Volume"
                              style={{
                                background: `linear-gradient(to right, #0ea5e9 ${videoVolume * 100}%, rgba(255,255,255,0.2) ${videoVolume * 100}%)`
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm font-medium tabular-nums ml-2 tracking-wide drop-shadow-md select-none opacity-90">
                          {formatTime(videoProgress)} <span className="opacity-50 mx-1">/</span> {formatTime(videoDuration)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsCCEnabled(!isCCEnabled); }}
                          className={cn(
                            "p-1.5 sm:p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors flex items-center justify-center",
                            isCCEnabled ? "text-sky-400" : "text-white/80 hover:text-white"
                          )}
                          aria-pressed={isCCEnabled}
                          aria-label="Ativar Legendas Ocultas (CC)"
                          title="Ativar/Desativar Legendas"
                        >
                          <Subtitles className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-1.5 sm:p-2 rounded text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors"
                          aria-label="Tela cheia"
                          title="Tela cheia"
                        >
                          <Maximize className="w-4 h-4 sm:w-5 sm:h-5 z-10" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Text Content */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div ref={contentRef} className="prose prose-slate max-w-none">
                     {currentLesson.content}
                  </div>
                </div>
                
                {/* Interactive Tips Section */}
                <InteractiveTips lessonId={currentLesson.id} />
                
                {/* Custom Interactive Elements based on Lesson ID */}
                {currentLesson.id === 'm1-l1' && (
                  <>
                    <Civil3DInterfaceDemo />
                    <TemplateSelector />
                  </>
                )}
                {currentLesson.id === 'm2-l1' && (
                  <StockPriceChart />
                )}
                {currentLesson.id === 'm2-l2' && (
                  <>
                    <AlignmentDesignPanel />
                    <MassHaulSimulator />
                    <Simple3DViewer model="corridor" label="Alinhamento e Corredor (Corridor)" highlightedPart={'centerline'} />
                  </>
                )}
                {currentLesson.id === 'm3-l2' && (
                  <>
                    <Assembly2DViewer />
                    <CorridorSimulation />
                    <Simple3DViewer model="corridor" label="Corredor Viário (Corridor)" highlightedPart={activeCenterline ? 'centerline' : null} />
                    <CorridorCenterlineTable activeCenterline={activeCenterline} onSelectAxis={setActiveCenterline} />
                  </>
                )}
                {currentLesson.id === 'm3-l3' && (
                  <>
                    <MassHaulSimulator />
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 mt-8">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Cuboid className="w-5 h-5 text-emerald-600" />
                        Ajustes de Terraplenagem Avançada
                      </h4>
                      <p className="text-sm text-slate-500 mb-6">
                        Experimente diferentes inclinações (H:V) para os taludes. Isso simula como os subassemblies projetam as superfícies de corte e aterro até atingirem a superfície do terreno (Target Surface).
                      </p>
                      <div className="flex flex-col sm:flex-row gap-6 mb-6">
                        <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <label className="text-xs font-bold text-slate-700 block mb-3">Inclinação Talude Esquerdo (Cut)</label>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-mono w-8 text-right">1:1</span>
                            <input 
                              type="range" min="1" max="4" step="0.5" 
                              value={leftSlopeValue} 
                              onChange={e => setLeftSlopeValue(Number(e.target.value))} 
                              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                            />
                            <span className="text-xs text-slate-400 font-mono w-8">4:1</span>
                            <div className="bg-white text-emerald-700 font-mono font-bold text-sm px-3 py-1.5 rounded border border-emerald-200 shadow-sm">{leftSlopeValue}:1</div>
                          </div>
                        </div>
                        <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <label className="text-xs font-bold text-slate-700 block mb-3">Inclinação Talude Direito (Fill)</label>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-mono w-8 text-right">1:1</span>
                            <input 
                              type="range" min="1" max="4" step="0.5" 
                              value={rightSlopeValue} 
                              onChange={e => setRightSlopeValue(Number(e.target.value))} 
                              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                            />
                            <span className="text-xs text-slate-400 font-mono w-8">4:1</span>
                            <div className="bg-white text-emerald-700 font-mono font-bold text-sm px-3 py-1.5 rounded border border-emerald-200 shadow-sm">{rightSlopeValue}:1</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={(e) => {
                            setSavedLeftSlope(leftSlopeValue);
                            setSavedRightSlope(rightSlopeValue);
                            const btn = e.currentTarget;
                            const originalText = btn.innerHTML;
                            btn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Ajustes Salvos';
                            btn.classList.add('bg-emerald-600');
                            btn.classList.remove('bg-indigo-600');
                            setTimeout(() => {
                              btn.innerHTML = originalText;
                              btn.classList.remove('bg-emerald-600');
                              btn.classList.add('bg-indigo-600');
                            }, 2000);
                          }} 
                          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm flex items-center transition-all focus:ring-4 focus:ring-indigo-100"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Ajustes
                        </button>
                      </div>
                    </div>
                    <Simple3DViewer model="intersection" label="Interseção Típica (Intersection)" />
                  </>
                )}
                {currentLesson.id === 'm4-l1' && (
                  <>
                    <UrbanDrainageSimulation />
                    <CatchmentScatterPlot />
                  </>
                )}
                {currentLesson.id === 'm4-l2' && (
                  <>
                    <CatchmentSimulator />
                    <Simple3DViewer model="manhole" label="Estrutura de Drenagem (Pipe Network)" />
                  </>
                )}

                {/* Scripts Assistant */}
                {currentLesson.id === 'm7-l1' && (
                  <AILispEditor />
                )}

                {/* Interactive Quiz Section */}
                {currentLesson.quiz && (
                  <QuizSection quiz={currentLesson.quiz} onComplete={() => setQuizFinished(true)} />
                )}

                {/* AI Dynamic Quiz - Available for specific lessons */}
                {(currentLesson.id === 'm7-l1' || currentLesson.id === 'm3-l3' || currentLesson.id === 'm3-l2') && (
                  <DynamicQuiz lesson={currentLesson} autoStart={currentLesson.id === 'm3-l3'} />
                )}

                {/* Notes System - Moved to main column for prominence */}
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 md:p-8 shadow-sm flex flex-col mb-8 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 rounded-full opacity-50 pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center">
                        <PenTool className="w-4 h-4 text-amber-600" />
                      </div>
                      Anotações da Aula
                    </h3>
                  </div>
                  
                  <textarea 
                    className="w-full h-40 p-4 text-sm text-slate-700 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-y relative z-10 leading-relaxed"
                    placeholder="Quais os pontos mais importantes dessa aula? Digite aqui, suas anotações ficarão salvas no seu navegador para você revisar depois..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                  
                  <div className="mt-4 flex justify-end gap-3 relative z-10">
                    {notes.trim().length > 0 && (
                      <button 
                        onClick={exportNotes}
                        className="px-6 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                        title="Exportar anotações para .txt"
                      >
                        <Download className="w-4 h-4" /> 
                        Exportar
                      </button>
                    )}
                    <motion.button 
                      whileTap={notes.trim().length > 0 ? { scale: 0.95 } : undefined}
                      onClick={saveNotes}
                      className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 relative overflow-hidden min-w-[140px]",
                        notes.trim().length > 0 
                          ? "bg-amber-500 hover:bg-amber-600 text-white hover:shadow" 
                          : "bg-amber-100 text-amber-500/50 cursor-not-allowed border border-amber-200/50"
                      )}
                      disabled={notes.trim().length === 0}
                    >
                      <AnimatePresence mode="popLayout">
                        {savedNotes ? (
                           <motion.div 
                             key="saved"
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.8 }}
                             className="flex items-center gap-2"
                           >
                             <Check className="w-4 h-4" /> 
                             Salvo!
                           </motion.div>
                        ) : (
                           <motion.div 
                             key="save"
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, y: -10 }}
                             className="flex items-center gap-2"
                           >
                             <Save className="w-4 h-4" /> 
                             Salvar Notas
                           </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>

                {/* Navigation Buttons inside main column */}
                <div className="flex flex-col space-y-5 pt-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4">
                    <button
                      onClick={() => prevLesson && navigateToLesson(prevLesson)}
                      disabled={!prevLesson}
                      className={cn(
                        "flex-1 flex justify-center items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors border",
                        prevLesson ? "border-slate-300 text-slate-700 bg-white hover:bg-slate-50" : "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                      )}
                    >
                      <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Aula Anterior</span><span className="sm:hidden">Anterior</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const allLessons = courseModules.flatMap(m => m.lessons);
                        const nextIncompleteAction = allLessons.find(l => !completedLessons.includes(l.id))?.id || allLessons[allLessons.length - 1].id;
                        navigateToLesson(nextIncompleteAction);
                      }}
                      className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors border border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      <PlayCircle className="w-4 h-4" /> Continuar de onde parou
                    </button>

                    <button
                      onClick={() => nextLesson && navigateToLesson(nextLesson)}
                      disabled={!nextLesson}
                      className={cn(
                        "flex-1 flex justify-center items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors border",
                        nextLesson ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                      )}
                    >
                      Próxima <span className="hidden sm:inline">Aula</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Module Progress Position */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                      <span>Progresso do Módulo: Aula {currentLessonIndexInModule + 1} de {moduleLessons.length}</span>
                      <span>{Math.round(((currentLessonIndexInModule + 1) / moduleLessons.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                        <motion.div 
                          layoutId="module-progress"
                          className="absolute top-0 left-0 bottom-0 bg-sky-500 origin-left"
                          initial={{ width: `${((currentLessonIndexInModule + 1) / moduleLessons.length) * 100}%` }}
                          animate={{ width: `${((currentLessonIndexInModule + 1) / moduleLessons.length) * 100}%` }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <div className="absolute inset-0 flex gap-0.5">
                           {moduleLessons.map((l, i) => (
                               <div key={l.id} className="flex-1 h-full border-r-[1.5px] border-slate-50 opacity-60 last:border-0" />
                           ))}
                        </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sidebar Info Column */}
              <div className="flex flex-col space-y-6">
                
                {/* Advanced Feature Highlight */}
                <div className="bg-gradient-to-br from-[#0B1E33] to-[#0A1626] rounded-xl border border-sky-900/50 p-5 shadow-sm overflow-hidden text-white relative">
                  <button 
                    onClick={() => setIsInfoDrainageOpen(!isInfoDrainageOpen)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                        <Droplets className="w-4 h-4 text-sky-400" />
                      </div>
                      <h3 className="text-sm font-bold tracking-wide">InfoDrainage 2027 Pro</h3>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-sky-400 transition-transform duration-300", isInfoDrainageOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isInfoDrainageOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pb-1">
                          <p className="text-xs text-slate-300 leading-relaxed mb-4">
                          A integração nativa permite exportar bacias, tubulações e reservatórios para a nuvem Autodesk.
                        </p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-start text-xs">
                            <span className="text-sky-400 mr-2 font-bold">•</span>
                            <span className="text-slate-200">Dimensionamento SuDS avançado</span>
                          </li>
                          <li className="flex items-start text-xs">
                            <span className="text-sky-400 mr-2 font-bold">•</span>
                            <span className="text-slate-200">Reversão bidirecional de resultados (Merge)</span>
                          </li>
                        </ul>
                        
                        <CatchmentMap />

                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Links Oficiais</h4>
                          
                          <div className="space-y-3">
                            <div>
                                <span className="text-[10px] text-sky-400 font-semibold uppercase mb-1 block">Documentação e Instalação</span>
                                <div className="space-y-1">
                                  <a href="https://help.autodesk.com/view/CIV3D/2027/PTB/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-sky-500/20 hover:scale-[1.02] hover:text-sky-100 border border-transparent hover:border-sky-500/30 transform transition-all duration-200 text-xs text-slate-300 group shadow-sm">
                                      <span>Ajuda Civil 3D 2027</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300" />
                                  </a>
                                  <a href="https://help.autodesk.com/view/INFODRAINAGE/ENU/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-sky-500/20 hover:scale-[1.02] hover:text-sky-100 border border-transparent hover:border-sky-500/30 transform transition-all duration-200 text-xs text-slate-300 group shadow-sm">
                                      <span>Ajuda InfoDrainage</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300" />
                                  </a>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] text-sky-400 font-semibold uppercase mb-1 block">Artigos e Recursos</span>
                                <div className="space-y-1">
                                  <a href="https://www.autodesk.com/blogs/water/2026/04/07/infodrainage-2027-whats-new/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-sky-500/20 hover:scale-[1.02] hover:text-sky-100 border border-transparent hover:border-sky-500/30 transform transition-all duration-200 text-xs text-slate-300 group shadow-sm">
                                      <span>InfoDrainage 2027 Novidades</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300" />
                                  </a>
                                  <a href="https://www.autodesk.com/blogs/water/2025/04/09/autodesk-infodrainage-vs-ssa-vs-drainage-analysis-for-civil-3d/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-sky-500/20 hover:scale-[1.02] hover:text-sky-100 border border-transparent hover:border-sky-500/30 transform transition-all duration-200 text-xs text-slate-300 group shadow-sm">
                                      <span>Comparativo SSA vs InfoDrainage</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300" />
                                  </a>
                                </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Demonstração Prática</h4>
                          <a href="https://www.autodesk.com/learn/ondemand/tutorial/creating-catchments-in-civil-3d" target="_blank" rel="noreferrer" className="block relative group rounded-lg overflow-hidden border border-white/10 hover:border-sky-500/50 hover:scale-[1.02] transform transition-all duration-300 aspect-video bg-slate-800 shadow-md">
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0A1626]/90 via-[#0A1626]/40 to-transparent z-10 flex flex-col justify-end p-4">
                                <span className="text-xs font-bold text-white mb-1.5 group-hover:text-sky-300 transition-colors">Workflow Nuvem InfoDrainage</span>
                                <span className="text-[10px] text-sky-200/70 flex items-center gap-1.5 font-medium"><PlayCircle className="w-3.5 h-3.5" /> Assistir Estudo de Caso</span>
                             </div>
                             <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 z-20">
                                <PlayCircle className="w-12 h-12 text-sky-400 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                             </div>
                             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                          </a>
                        </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Supportive Tips */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Recursos da Aula</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-sky-50 rounded border border-sky-100">
                      <p className="text-xs font-bold text-sky-800 mb-1 uppercase tracking-tight">Material de Apoio</p>
                      <p className="text-xs text-sky-900 leading-relaxed">
                        Faça o download do template (DWT) e arquivos de prática DWG anexados a este módulo para acompanhar o instrutor.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <p className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-tight">Atalhos</p>
                      <p className="text-xs text-slate-600 leading-relaxed font-mono">
                        Acostume-se a utilizar o "Toolspace" e "Panorama" a todo momento.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowPdfViewer(true)}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors mb-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-bold">View PDF Material</span>
                    </button>
                    <button 
                      onClick={() => setShowVideoGen(true)}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span className="text-sm font-bold">Gerar Vídeo Tutorial</span>
                    </button>
                  </div>
                </div>

                {/* Progress / Next Goal */}
                <div className="bg-slate-900 rounded-xl p-5 text-white">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Seu Progresso</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                       <Trophy className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Resumo</p>
                      <p className="text-[10px] text-slate-300">
                        {completedLessons.length} de {courseModules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas concluídas
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {currentLesson && <AIChatbot lesson={currentLesson} />}
      
      {currentLesson && (
         <VideoGeneratorModal 
            isOpen={showVideoGen} 
            onClose={() => setShowVideoGen(false)} 
            initialPrompt={`Gerar um vídeo tutorial explicando o tópico: "${currentLesson.title}" no Autodesk Civil 3D.`} 
            currentLessonId={currentLesson.id}
            navigateToLesson={navigateToLesson}
         />
      )}

      {/* Glossary Modal */}
      <AnimatePresence>
        {showGlossary && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="glossary-modal-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowGlossary(false);
            }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowGlossary(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col focus:outline-none"
              tabIndex={-1}
            >
              <div className="flex flex-col gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600" aria-hidden="true">
                      <BookText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="glossary-modal-title" className="font-bold text-slate-800">Glossário Civil 3D</h2>
                      <p className="text-xs text-slate-500">Termos técnicos explicados</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowGlossary(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Fechar glossário"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={glossarySearch}
                      onChange={(e) => setGlossarySearch(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                      placeholder="Pesquisar termo..."
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showOnlyFavorites ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                    Favoritos
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-slate-50/50">
                {COURSE_GLOSSARY
                  .filter(t => (showOnlyFavorites ? favoriteTerms.includes(t.word) : true) && (t.word.toLowerCase().includes(glossarySearch.toLowerCase()) || t.def.toLowerCase().includes(glossarySearch.toLowerCase()))).length > 0 ? (
                  <div className="grid gap-3">
                    {COURSE_GLOSSARY
                      .filter(t => (showOnlyFavorites ? favoriteTerms.includes(t.word) : true) && (t.word.toLowerCase().includes(glossarySearch.toLowerCase()) || t.def.toLowerCase().includes(glossarySearch.toLowerCase())))
                      .map((term, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-bold text-emerald-700">{term.word}</h3>
                            <button 
                              onClick={() => toggleFavoriteTerm(term.word)}
                              className={`p-1 rounded-md transition-colors ${favoriteTerms.includes(term.word) ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'}`}
                              title={favoriteTerms.includes(term.word) ? "Remover dos favoritos" : "Favoritar termo"}
                            >
                              <Star className={`w-4 h-4 ${favoriteTerms.includes(term.word) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{term.def}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BookText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Nenhum termo encontrado.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {showPdfViewer && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="pdf-modal-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowPdfViewer(false);
            }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowPdfViewer(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col focus:outline-none"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600" aria-hidden="true">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 id="pdf-modal-title" className="font-bold text-slate-800">Material Complementar</h2>
                    <p className="text-xs text-slate-500">{currentLesson?.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPdfViewer(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Fechar visualizador de PDF"
                  autoFocus
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 bg-slate-200/50 p-2 sm:p-4">
                <iframe 
                  src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
                  className="w-full h-full rounded-xl border border-slate-200 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title={`Material Complementar PDF da aula sobre ${currentLesson?.title}`}
                  tabIndex={0}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Text Selection Popup */}
      <AnimatePresence>
        {selectedText && selectionPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ 
              position: 'fixed', 
              top: selectionPosition.y, 
              left: selectionPosition.x, 
              transform: 'translate(-50%, -100%)',
              zIndex: 9999
            }}
            className="pointer-events-auto"
          >
            <button
              onMouseDown={(e) => {
                // Prevent selection cleanup
                e.preventDefault(); 
              }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-ai-chatbot', { detail: `Explique este trecho da aula:\n\n"${selectedText}"` }));
                setSelectedText('');
                setSelectionPosition(null);
                window.getSelection()?.removeAllRanges();
              }}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl shadow-sky-900/20 text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors border border-sky-500/30 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              Explicar com IA
            </button>
            <div className="absolute left-1/2 -ml-2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-t-slate-900 border-x-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Glossary Popup */}
      <AnimatePresence>
        {activeGlossaryTerm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ 
              position: 'fixed', 
              top: activeGlossaryTerm.y - 10, 
              left: activeGlossaryTerm.x, 
              transform: 'translate(-50%, -100%)',
              zIndex: 9999
            }}
            className="pointer-events-auto"
          >
            <div className="bg-slate-900 p-4 rounded-xl shadow-2xl shadow-indigo-900/20 border border-indigo-500/30 w-72 flex flex-col gap-2 pointer-events-auto">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-white text-base leading-tight pr-2">{activeGlossaryTerm.term}</h4>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => toggleFavoriteTerm(activeGlossaryTerm.term)}
                    className={`transition-colors p-1 rounded-md ${favoriteTerms.includes(activeGlossaryTerm.term) ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'}`}
                    title={favoriteTerms.includes(activeGlossaryTerm.term) ? "Remover dos favoritos" : "Favoritar termo"}
                  >
                    <Star className={`w-4 h-4 ${favoriteTerms.includes(activeGlossaryTerm.term) ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => setActiveGlossaryTerm(null)}
                    className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{activeGlossaryTerm.def}</p>
            </div>
            <div className="absolute left-1/2 -ml-2 -bottom-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-t-slate-900 border-x-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
