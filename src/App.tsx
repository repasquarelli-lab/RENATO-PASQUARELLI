import { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Glossary } from './components/Glossary';
import { Flashcards } from './components/Flashcards';
import { CommunityForum } from './components/CommunityForum';
import { StudyReport } from './components/StudyReport';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Sparkles, Bell, Loader2 } from 'lucide-react';
import { courseModules } from './data/course';
import { VideoGeneratorModal } from './components/VideoGeneratorModal';
import { Joyride } from 'react-joyride';
import { cn } from './lib/utils';
import { GamificationProvider, useGamification } from './context/GamificationContext';

const LessonView = lazy(() => import('./components/LessonView').then(m => ({ default: m.LessonView })));
import { Logo } from './components/Logo';

function AppContent() {
  const [activeLessonId, setActiveLessonId] = useState<string>('dashboard');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const [runTour, setRunTour] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Novo Módulo Disponível', message: 'Descubra as novidades em Design de Interseções na seção bônus.', isRead: false },
    { id: 2, title: 'Atualização de Aula', message: 'A aula "Volume de Terraplenagem" foi atualizada com novos exemplos em vídeo.', isRead: false },
    { id: 3, title: 'Bem-vindo(a)!', message: 'Comece sua jornada no Civil 3D explorando a interface básica.', isRead: true }
  ]);

  const { state: gamificationState, level, addXp, unlockBadge } = useGamification();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, isRead: true})));
  };

  useEffect(() => {
    // Only run the tour if it hasn't been completed before
    const hasCompletedTour = localStorage.getItem('c3d_tour_completed');
    if (!hasCompletedTour) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];
    
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('c3d_tour_completed', 'true');
    }
  };

  const steps: any[] = [
    {
      target: 'body',
      placement: 'center',
      title: 'Bem-vindo ao Civil 3D Masterclass!',
      content: 'Este guia rápido vai te apresentar a nossa plataforma interativa de ensino.',
      hideBackButton: true,
    },
    {
      target: '.tour-sidebar',
      placement: 'right',
      title: 'Trilha de Aprendizado',
      content: 'Navegue pelos módulos e aulas. Recomendamos seguir a ordem desde o básico até o avançado.',
    },
    {
      target: '.tour-main',
      placement: 'left',
      title: 'Simulações Interativas',
      content: 'Leia o conteúdo, acompanhe o vídeo e interaja com os modelos 3D em tempo real. Não esqueça de explorar as opções de cada visualizador!',
    },
    {
      target: '.tour-ai',
      placement: 'bottom',
      title: 'C3D Workflow AI',
      content: 'Gere tutoriais em vídeo exclusivos utilizando a Inteligência Artificial diretamente na plataforma.',
    },
    {
      target: '.tour-high-contrast',
      placement: 'bottom',
      title: 'Acessibilidade',
      content: 'Alterne para o modo de alto contraste a qualquer momento para melhorar a leitura e descanso visual.',
    }
  ];

  const toggleLessonCompletion = (id: string) => {
    setCompletedLessons(prev => {
       const isCompleting = !prev.includes(id);
       // Give 100 XP for completing a lesson
       if (isCompleting) {
          addXp(100);
          const newCompleted = [...prev, id];
          
          if (newCompleted.length === 1) {
            unlockBadge('first_lesson');
          }

          const totalLessons = courseModules.reduce((acc, m) => acc + m.lessons.length, 0);
          if (newCompleted.length === totalLessons) {
            unlockBadge('course_complete');
          }

          const moduleId = id.split('-')[0];
          const moduleObj = courseModules.find(m => m.id === moduleId);
          if (moduleObj) {
            const allCompleted = moduleObj.lessons.every(l => newCompleted.includes(l.id));
            if (allCompleted) {
              unlockBadge(`module_${moduleId}_complete`);
            }
          }
          return newCompleted;
       }
       return prev.filter(l => l !== id);
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        onEvent={handleJoyrideCallback}
        options={{
          primaryColor: '#0ea5e9', // bg-blue-500
          zIndex: 1000,
        }}
        locale={{
          back: 'Anterior',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          skip: 'Pular',
        }}
      />
      <header className="h-[72px] bg-white text-slate-800 flex items-center justify-between px-6 lg:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-slate-200 shrink-0 z-40 relative">
        <div className="flex items-center space-x-6">
          <Logo className="h-10 w-auto" />
          <div className="hidden sm:block border-l border-slate-200 pl-6">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Treinamento Civil 3D 2027</h1>
            <p className="text-[10px] text-sky-600 uppercase tracking-[0.2em] font-extrabold mt-0.5">Masterclass Profissional</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-8">
          
          {/* Level Display */}
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nível Atual</span>
             <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-sm font-bold text-amber-500">{level}</span>
                <span className="text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200/50 rounded px-2 py-0.5">{gamificationState.xp} XP</span>
             </div>
          </div>

          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Progresso Geral</span>
            <div className="flex items-center space-x-3 mt-1 5">
              <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.round((completedLessons.length / courseModules.reduce((acc, m) => acc + m.lessons.length, 0)) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono font-bold text-slate-700">{Math.round((completedLessons.length / courseModules.reduce((acc, m) => acc + m.lessons.length, 0)) * 100)}%</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden lg:block"></div>
          
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors hover:bg-slate-50 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 text-slate-800"
                >
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-sm">Notificações</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] uppercase tracking-wider font-bold text-sky-600 hover:text-sky-700">
                        Marcar como lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(note => (
                        <div key={note.id} className={cn("p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer", !note.isRead ? "bg-sky-50/50" : "")}>
                           <div className="flex justify-between items-start mb-1">
                              <h4 className={cn("text-xs font-bold", !note.isRead ? "text-slate-900" : "text-slate-700")}>{note.title}</h4>
                              {!note.isRead && <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5 shrink-0 block"></span>}
                           </div>
                           <p className="text-[11px] text-slate-500 leading-snug">{note.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-500">Nenhuma notificação.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
             onClick={() => document.documentElement.classList.toggle('high-contrast-mode')}
             className="tour-high-contrast px-3 py-1.5 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-md text-xs font-bold text-slate-600 transition-colors tracking-wide items-center"
             title="Alternar Modo de Alto Contraste"
          >
             Alto Contraste
          </button>
          <button 
             onClick={() => setIsVideoModalOpen(true)}
             className="tour-ai hidden sm:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-bold transition-all tracking-wide items-center space-x-2 shadow-sm hover:shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>C3D Workflow AI</span>
          </button>
          <button className="hidden lg:block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-bold transition-colors uppercase tracking-wide">Sair</button>
          <button className="lg:hidden p-2 text-slate-400 hover:text-slate-800" onClick={() => setIsSidebarOpen(true)}>
             <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="tour-sidebar flex">
          <Sidebar 
            activeLessonId={activeLessonId} 
            completedLessons={completedLessons}
            onSelectLesson={setActiveLessonId}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        </div>
        
        <main className="tour-main flex-1 flex flex-col min-w-0">
          {activeLessonId === 'dashboard' ? (
            <Dashboard completedLessons={completedLessons} navigateToLesson={setActiveLessonId} />
          ) : activeLessonId === 'glossary' ? (
            <Glossary />
          ) : activeLessonId === 'flashcards' ? (
            <Flashcards />
          ) : activeLessonId === 'forum' ? (
            <CommunityForum />
          ) : activeLessonId === 'reports' ? (
            <StudyReport completedLessons={completedLessons} />
          ) : (
            <Suspense fallback={
              <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
                    Preparando Aula
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            }>
              <LessonView 
                lessonId={activeLessonId}
                completedLessons={completedLessons}
                toggleLessonCompletion={toggleLessonCompletion}
                navigateToLesson={setActiveLessonId}
              />
            </Suspense>
          )}
        </main>
      </div>
      
      <AnimatePresence>
        {isVideoModalOpen && (
          <VideoGeneratorModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} navigateToLesson={setActiveLessonId} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GamificationProvider>
      <AppContent />
    </GamificationProvider>
  )
}

