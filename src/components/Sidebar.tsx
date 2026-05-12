import React, { useState } from 'react';
import { CourseModule, Lesson, courseModules } from '../data/course';
import { 
  ChevronRight, 
  ChevronDown, 
  CheckCircle,
  Circle,
  PlayCircle,
  Menu,
  X,
  Search,
  LayoutDashboard,
  BookA,
  Layers,
  HardDriveDownload,
  MessageSquare,
  FileBox
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeLessonId: string;
  completedLessons: string[];
  onSelectLesson: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ activeLessonId, completedLessons, onSelectLesson, isOpen, setIsOpen }: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ m1: true });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const calculateProgress = () => {
    const total = courseModules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completed = completedLessons.length;
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Filter modules/lessons based on search query
  const filteredModules = courseModules.map(module => {
    const matchedLessons = module.lessons.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      module.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...module, lessons: matchedLessons };
  }).filter(module => module.lessons.length > 0);

  return (
    <>
      <div className={cn(
        "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsOpen(false)} />
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0 lg:static lg:w-80 shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)]",
        isOpen ? "translate-x-0 pt-[72px] lg:pt-0" : "-translate-x-full pt-[72px] lg:pt-0"
      )}>
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-slate-200 bg-white lg:hidden absolute top-0 left-0 w-full z-50">
          <span className="font-extrabold text-slate-800 tracking-tight">Menu Principal</span>
          <button className="text-slate-400 hover:text-slate-800 transition-colors" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 border-b border-slate-200 bg-white space-y-3 mt-[72px] lg:mt-0">
          <div className="mb-4 lg:hidden">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Treinamento Civil 3D</h2>
            <p className="text-[10px] text-sky-600 uppercase tracking-[0.2em] font-extrabold mt-0.5">Masterclass Profissional</p>
          </div>
          
          <button
            onClick={() => { onSelectLesson('dashboard'); if (window.innerWidth < 1024) setIsOpen(false); }}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm", activeLessonId === 'dashboard' ? 'bg-sky-50 text-sky-700 border border-sky-100 shadow-sky-100/50' : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent')}
          >
             <LayoutDashboard className="w-5 h-5" /> Dashboard do Aluno
          </button>
          
          <button
            onClick={() => { onSelectLesson('glossary'); if (window.innerWidth < 1024) setIsOpen(false); }}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm", activeLessonId === 'glossary' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-indigo-100/50' : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent')}
          >
             <BookA className="w-5 h-5" /> Dicionário BIM
          </button>

          <button
            onClick={() => { onSelectLesson('flashcards'); if (window.innerWidth < 1024) setIsOpen(false); }}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm", activeLessonId === 'flashcards' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-emerald-100/50' : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent')}
          >
             <Layers className="w-5 h-5" /> Flashcards
          </button>

          <button
            onClick={() => { onSelectLesson('forum'); if (window.innerWidth < 1024) setIsOpen(false); }}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm", activeLessonId === 'forum' ? 'bg-orange-50 text-orange-700 border border-orange-100 shadow-orange-100/50' : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent')}
          >
             <MessageSquare className="w-5 h-5" /> Fórum e Comunidade
          </button>

          <button
            onClick={() => { onSelectLesson('reports'); if (window.innerWidth < 1024) setIsOpen(false); }}
            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm", activeLessonId === 'reports' ? 'bg-rose-50 text-rose-700 border border-rose-100 shadow-rose-100/50' : 'bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent')}
          >
             <FileBox className="w-5 h-5" /> Relatório Consolidado
          </button>

          <div className="relative pt-2">
            <Search className="absolute left-4 top-[22px] w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar aulas..." 
              value={searchQuery}
              onChange={e => {
                 setSearchQuery(e.target.value);
                 if (e.target.value !== '') {
                   // Expand all on search
                   const allIds = courseModules.reduce((acc, m) => ({...acc, [m.id]: true}), {});
                   setExpandedModules(allIds);
                 }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-slate-50/50">
          <div className="p-4 space-y-2">
          <span className="px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] block mb-4 mt-2">Grade do Curso</span>
          {filteredModules.map((module, moduleIndex) => (
            <div key={module.id} className="mb-2">
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left",
                  expandedModules[module.id] ? "bg-slate-100/50" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center">
                  <span className="w-6 text-xs font-mono font-bold text-slate-400">
                    {String(moduleIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 ml-2">{module.title}</span>
                </div>
                {expandedModules[module.id] ? 
                  <ChevronDown className="w-4 h-4 text-slate-400" /> : 
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                }
              </button>

              {expandedModules[module.id] && (
                <div className="mt-1 space-y-1">
                  {module.lessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isActive = activeLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          onSelectLesson(lesson.id);
                          if (window.innerWidth < 1024) setIsOpen(false);
                        }}
                        className={cn(
                          "w-full flex flex-col justify-center p-3 text-left transition-all duration-200 relative group",
                          isActive 
                            ? "bg-indigo-50 border-l-4 border-indigo-600 rounded-r shadow-sm" 
                            : isCompleted
                              ? "hover:bg-slate-100/50 border-l-4 border-transparent pl-4 opacity-90"
                              : "hover:bg-slate-50 border-l-4 border-transparent pl-4"
                        )}
                      >
                        {isActive && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                          </div>
                        )}
                        <div className="flex items-center w-full">
                          <div className="shrink-0 mr-3">
                            {isCompleted ? (
                              <CheckCircle className="w-[18px] h-[18px] text-emerald-500 fill-emerald-50 group-hover:fill-emerald-100 transition-colors" />
                            ) : isActive ? (
                              <PlayCircle className="w-[18px] h-[18px] text-indigo-600 fill-indigo-100" />
                            ) : (
                              <Circle className="w-[18px] h-[18px] text-slate-300" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm pr-6 leading-snug", 
                            isActive ? "font-bold text-indigo-900" : 
                            isCompleted ? "font-medium text-slate-500 line-through decoration-slate-300 decoration-1" : 
                            "font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors"
                          )}>
                            {lesson.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {filteredModules.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-500">
              Nenhuma aula encontrada para "{searchQuery}".
            </div>
          )}
          </div>
        </nav>

        <button 
          onClick={() => {
            const dataToExport = {
               gamification: localStorage.getItem('c3d_gamification'),
               completedLessons: completedLessons
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href",     dataStr);
            downloadAnchorNode.setAttribute("download", "meu_progresso_c3d.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
          className="w-full text-left p-4 bg-slate-50 border-t border-slate-200 hover:bg-slate-100 transition-colors group focus:outline-none focus:ring-inset focus:ring-2 focus:ring-sky-500"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white overflow-hidden flex items-center justify-center font-bold text-slate-500 uppercase group-hover:bg-sky-200 group-hover:text-sky-700 transition-colors">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-700 group-hover:text-sky-800 transition-colors">Aluno de Engenharia</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5 group-hover:text-sky-600 transition-colors flex items-center">
                 <HardDriveDownload className="w-3 h-3 mr-1" /> Exportar Dados
              </p>
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
