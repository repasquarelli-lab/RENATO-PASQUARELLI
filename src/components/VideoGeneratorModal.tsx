import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Video, Sparkles, Loader2, PlaySquare, BookOpen, ExternalLink } from 'lucide-react';
import { courseModules } from '../data/course';

export function VideoGeneratorModal({ isOpen, onClose, initialPrompt = "", currentLessonId, navigateToLesson }: { isOpen: boolean; onClose: () => void; initialPrompt?: string, currentLessonId?: string, navigateToLesson?: (id: string) => void }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [context, setContext] = useState(currentLessonId || 'general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
       setPrompt(initialPrompt);
       setContext(currentLessonId || 'general');
       setGeneratedVideo(false);
       setIsGenerating(false);
    }
  }, [isOpen, initialPrompt, currentLessonId]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedVideo(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedVideo(true);
    }, 3500);
  };

  const closeModal = () => {
    if (!isGenerating) {
        onClose();
        setTimeout(() => {
           setPrompt("");
           setGeneratedVideo(false);
        }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl relative z-10 overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
               <h2 className="text-base font-bold text-slate-800">C3D Video AI</h2>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Gerador de Workflow</p>
            </div>
          </div>
          <button 
            onClick={closeModal} 
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!generatedVideo && !isGenerating && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Descreva o fluxo de trabalho do Civil 3D que você gostaria de visualizar. Nossa IA criará uma abstração animada do processo.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-1.5 flex gap-2">
                  <div className="w-full">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center"><BookOpen className="w-3 h-3 mr-1" /> Lesson Context</label>
                    <select 
                      value={context} 
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="general">Geral (Sem contexto específico)</option>
                      {courseModules.map(module => (
                        <optgroup key={module.id} label={module.title}>
                          {module.lessons.map(lesson => (
                            <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {context !== 'general' && navigateToLesson && (
                      <div className="mt-1.5 flex justify-end">
                        <button 
                          onClick={() => {
                            navigateToLesson(context);
                            onClose();
                          }}
                          className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center"
                        >
                          Visualizar conteúdo da aula <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Prompt de Geração</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Como importar pontos COGO e gerar uma superfície TIN no Civil 3D..."
                    className="w-full h-32 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                 <button onClick={() => setPrompt("Como dimensionar uma rede de bueiros gravitária usando pipes e structures.")} className="text-xs px-2.5 py-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Dimensionamento de Bueiros</button>
                 <button onClick={() => setPrompt("Delimitação interativa de bacia de contribuição (catchment).")} className="text-xs px-2.5 py-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Delimitação de Bacia</button>
                 <button onClick={() => setPrompt("Integração do Civil 3D com InfoDrainage na Nuvem.")} className="text-xs px-2.5 py-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">InfoDrainage Cloud</button>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  <span>Gerar Animação</span>
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="text-center">
                 <h3 className="text-lg font-bold text-slate-800">Sintetizando Workflow...</h3>
                 <p className="text-sm text-slate-500 mt-1">Renderizando vetores do Autodesk Civil 3D 2027</p>
                 <p className="text-xs text-indigo-400 mt-2">Contexto: {context === 'general' ? 'Geral' : courseModules.flatMap(m => m.lessons).find(l => l.id === context)?.title}</p>
              </div>
            </div>
          )}

          {generatedVideo && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="space-y-4"
            >
              <div className="w-full aspect-video bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center group shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-slate-900/40 mix-blend-overlay"></div>
                
                <div className="text-center z-10 transition-transform duration-300 group-hover:scale-110">
                  <PlaySquare className="w-16 h-16 text-indigo-400 mx-auto mb-3 filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)] cursor-pointer hover:text-indigo-300" />
                  <p className="text-indigo-200 font-semibold text-sm">Reproduzir Workflow Sintético</p>
                </div>
                
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              </div>
              
              <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm flex items-center border border-green-200">
                 <span className="font-bold mr-3 text-lg">✓</span> 
                 <p className="leading-tight">Animação gerada com sucesso baseada em: <strong>"{prompt.slice(0, 50)}{prompt.length > 50 && '...'}"</strong> no contexto {context === 'general' ? 'Geral' : courseModules.flatMap(m => m.lessons).find(l => l.id === context)?.title}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setPrompt("");
                    setGeneratedVideo(false);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Gerar Novo Workflow
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
