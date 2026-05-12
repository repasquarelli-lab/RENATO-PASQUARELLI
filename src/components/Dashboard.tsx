import React, { useState } from 'react';
import { courseModules } from '../data/course';
import { Trophy, Target, Award, PlayCircle, Flame, Star, Medal, Crown, Route, Map, Droplets, Lock } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { useGamification, BADGES } from '../context/GamificationContext';
import { CertificateModal } from './CertificateModal';

interface DashboardProps {
  completedLessons: string[];
  navigateToLesson: (id: string) => void;
}

export function Dashboard({ completedLessons, navigateToLesson }: DashboardProps) {
  const { state: gamificationState, level, progressToNextLevel, currentLevelXp, nextLevelXp, setSelectedTrack } = useGamification();
  const [showCertificate, setShowCertificate] = useState(false);

  const totalLessons = courseModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);
  
  // Dummy study time
  const studyHours = Math.round((completedLessons.length * 45) / 60);

  const weeklyData = [
    { name: 'Sem 1', horas: 4 },
    { name: 'Sem 2', horas: 7 },
    { name: 'Sem 3', horas: 5 },
    { name: 'Sem 4', horas: Math.max(2, studyHours - 16) },
  ];

  // System badges (from GAMIFICATION)
  const allBadges = BADGES.map(b => ({
    id: b.id, name: b.name, desc: b.description, icon: <Star className={`w-6 h-6 ${b.color}`} />, earned: gamificationState.badges.includes(b.id)
  }));

  // Leaderboard placeholder
  const leaderboard = [
    { name: 'Você', xp: gamificationState.xp, isUser: true },
    { name: 'Carlos Silva', xp: 2100, isUser: false },
    { name: 'Amanda Oliveira', xp: 1850, isUser: false },
    { name: 'Roberto Santos', xp: Math.max(100, gamificationState.xp - 50), isUser: false },
    { name: 'Lucas Costa', xp: Math.max(50, gamificationState.xp - 150), isUser: false },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 relative">
      <CertificateModal isOpen={showCertificate} onClose={() => setShowCertificate(false)} />
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="mb-10 pt-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard do Aluno</h1>
          <p className="text-slate-500 mt-2 font-medium">Visão geral do seu progresso, metas e conquistas no treinamento.</p>
        </header>

        {/* Weekly Goals / Streaks Panel */}
        <div className="bg-white border text-slate-800 border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col lg:flex-row gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent pointer-events-none" />
           <div className="lg:w-1/3 flex flex-col justify-center items-center text-center relative z-10 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-orange-100">
                 <Flame className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{gamificationState.streakDays} Dias</h2>
              <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">Sequência de Estudo</p>
           </div>
           <div className="lg:w-2/3 flex flex-col justify-center relative z-10">
              <div className="flex justify-between items-end mb-4">
                 <div>
                    <span className="text-sm font-extrabold text-indigo-600 uppercase tracking-[0.2em]">{level}</span>
                    <h3 className="text-4xl font-black text-slate-800 mt-1 tracking-tight">{gamificationState.xp} <span className="text-xl text-slate-400 font-bold">XP</span></h3>
                 </div>
                 <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Próximo Nível</span>
                    <h3 className="text-lg font-extrabold text-slate-700 mt-1">{nextLevelXp === Infinity ? 'Nível Máximo' : `${nextLevelXp} XP`}</h3>
                 </div>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
                 <div className="h-full bg-indigo-500 relative transition-all duration-1000 ease-out" style={{ width: `${progressToNextLevel}%` }}>
                 </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Continue estudando, crie simulações em 3D e use o Quiz de IA para garantir ainda mais pontos hoje!
              </p>
           </div>
        </div>

        {/* Daily Missions Panel */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3"><Target className="w-7 h-7 text-rose-500" /> Missões Diárias</h2>
             <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">Atualiza em 14h 22m</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between">
                 <div>
                    <h3 className="font-bold text-base text-slate-800 mb-2 group-hover:text-sky-700 transition-colors">Devorador de Aulas</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Complete pelo menos duas aulas diferentes no dia de hoje.</p>
                 </div>
                 <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg flex items-center shadow-sm"><Flame className="w-4 h-4 mr-1.5" /> +150 XP</span>
                    <span className="text-sm font-bold text-slate-400">0/2</span>
                 </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between">
                 <div>
                    <h3 className="font-bold text-base text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">Mestre do Quiz AI</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Faça e acerte 100% em um Quiz Dinâmico nas Lições usando AI.</p>
                 </div>
                 <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg flex items-center shadow-sm"><Flame className="w-4 h-4 mr-1.5" /> +100 XP</span>
                    <span className="text-sm font-bold text-slate-400">0/1</span>
                 </div>
              </div>
              <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white shadow-sm">
                 <div className="absolute top-0 right-0 -mr-6 -mt-6 text-emerald-100 opacity-50">
                    <CheckCircleIcon className="w-32 h-32" />
                 </div>
                 <div className="relative z-10">
                    <h3 className="font-bold text-base text-emerald-900 flex items-center justify-between mb-2">
                      Check-in Constante
                    </h3>
                    <p className="text-sm text-emerald-700 font-medium leading-relaxed">Obrigado por logar hoje! Você manteve a sua sequência viva.</p>
                 </div>
                 <div className="mt-6 flex items-center justify-between relative z-10">
                    <span className="text-sm font-bold text-slate-300 line-through">100 XP</span>
                    <span className="text-[11px] tracking-[0.2em] font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-sm uppercase">Completada</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Trilhas de Especialização Panel */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
           <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Trilhas de Especialização</h2>
           <p className="text-sm text-slate-500 font-medium mb-8">Baseado no seu perfil profissional, escolha uma trilha para alinhar as recomendações, metas e conquistas.</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { id: 'infra', title: 'Infraestrutura Viária', desc: 'Interseções, Superelevação, Corredores.', icon: <Route className="w-8 h-8 text-indigo-500" />, requiredXp: 0 },
               { id: 'loteamento', title: 'Loteamentos', desc: 'Parcelamento, Grading, Platôs.', icon: <Map className="w-8 h-8 text-amber-500" />, requiredXp: 50 },
               { id: 'saneamento', title: 'Saneamento e Drenagem', desc: 'Pipe Networks, InfoDrainage.', icon: <Droplets className="w-8 h-8 text-sky-500" />, requiredXp: 150 }
             ].map(track => {
               const isActive = gamificationState.selectedTrack === track.id;
               const isLocked = gamificationState.xp < track.requiredXp;
               
               return (
                 <div 
                   key={track.id} 
                   onClick={() => !isLocked && setSelectedTrack(track.id as any)}
                   className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-start ${
                     isLocked ? 'border-slate-200 bg-slate-50 opacity-75 cursor-not-allowed' :
                     isActive ? 'border-indigo-500 bg-indigo-50/30 shadow-md cursor-pointer' : 
                     'border-slate-100 bg-slate-50 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer'
                   }`}
                 >
                   {isActive && <div className="absolute top-4 right-4"><CheckCircleIcon className="w-6 h-6 text-indigo-600" /></div>}
                   {isLocked && <div className="absolute top-4 right-4 flex items-center gap-1.5 text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-200"><Lock className="w-3 h-3" /> {track.requiredXp} XP</div>}
                   
                   <div className={`p-3 rounded-xl shadow-sm border border-slate-100 mb-4 ${isLocked ? 'bg-slate-200' : 'bg-white'}`}>
                     {track.icon}
                   </div>
                   <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${isActive ? 'text-indigo-900' : isLocked ? 'text-slate-600' : 'text-slate-800'}`}>
                     {track.title}
                   </h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{track.desc}</p>
                 </div>
               );
             })}
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Target className="w-24 h-24" /></div>
            <div className="flex items-start space-x-5 relative z-10">
              <div className="p-4 bg-sky-50 rounded-2xl text-sky-500 border border-sky-100 shadow-sm shrink-0">
                <Target className="w-8 h-8" />
              </div>
              <div className="pt-1">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">Progresso</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-extrabold text-slate-800 tracking-tight">{progressPercent}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">Estudo Semanal (Horas)</p>
            <div className="h-20 w-full mt-2 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="horas" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><CheckCircleIcon className="w-24 h-24" /></div>
            <div className="flex items-start space-x-5 relative z-10">
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500 border border-emerald-100 shadow-sm shrink-0">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div className="pt-1">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1">Concluídas</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-extrabold text-slate-800 tracking-tight">{completedLessons.length}</span>
                  <span className="text-sm font-bold text-slate-400">/{totalLessons}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-6">
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8 flex items-center gap-3"><Trophy className="w-7 h-7 text-amber-500" /> Suas Conquistas</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBadges.map(b => (
                    <div key={b.id} className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all ${b.earned ? 'bg-slate-50 border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md' : 'bg-slate-50/50 border-slate-100 opacity-50 grayscale'}`}>
                      <div className={`p-4 rounded-full mb-4 ${b.earned ? 'bg-white ring-4 ring-slate-100 shadow-sm' : 'bg-slate-200'}`}>
                        {b.icon}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-2">{b.name}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{b.desc}</p>
                      <div className="mt-auto">
                        {!b.earned && <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Bloqueado</span>}
                        {b.earned && <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/50 border border-emerald-200 px-3 py-1.5 rounded-lg">Ganhou!</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
           </div>
           
           <div className="md:col-span-1">
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
                 <div className="bg-slate-50 border-b border-slate-200 p-6 shrink-0 flex items-center gap-3">
                    <Medal className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Placar de Líderes</h2>
                 </div>
                 <div className="p-4 space-y-2">
                    {leaderboard.map((user, idx) => (
                       <div key={user.name} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${user.isUser ? 'bg-indigo-50/80 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50'}`}>
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600 shadow-sm border border-amber-200' : idx === 1 ? 'bg-slate-200 text-slate-600 shadow-sm border border-slate-300' : idx === 2 ? 'bg-orange-100 text-orange-700 shadow-sm border border-orange-200' : 'bg-slate-100 text-slate-400'}`}>
                             {idx === 0 ? <Crown className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className={`text-sm font-bold truncate ${user.isUser ? 'text-indigo-900' : 'text-slate-700'}`}>{user.name}</div>
                          </div>
                          <div className={`text-sm font-black ${user.isUser ? 'text-indigo-600' : 'text-slate-400'}`}>
                             {user.xp} <span className="text-[10px] font-bold">XP</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>

        {progressPercent === 100 && (
          <section className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white flex items-center justify-between shadow-lg">
            <div>
              <h2 className="text-2xl font-black mb-2">Parabéns! Você concluiu o curso.</h2>
              <p className="text-amber-100 font-medium">Seu certificado de conclusão já está disponível.</p>
            </div>
            <button 
              onClick={() => setShowCertificate(true)}
              className="px-6 py-3 bg-white text-orange-600 font-bold rounded-lg shadow-sm hover:bg-amber-50 transition-colors"
            >
              Baixar Certificado PDF
            </button>
          </section>
        )}

      </div>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
