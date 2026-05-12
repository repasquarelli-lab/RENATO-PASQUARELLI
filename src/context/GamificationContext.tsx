import React, { createContext, useContext, useEffect, useState } from 'react';

export interface GamificationState {
  xp: number;
  streakDays: number;
  lastLoginDate: string;
  badges: string[];
  chatRewardsData?: Record<string, number>;
  selectedTrack?: 'none' | 'infra' | 'loteamento' | 'saneamento';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface GamificationContextProps {
  state: GamificationState;
  addXp: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  rewardChatInteraction: (lessonId: string) => void;
  setSelectedTrack: (track: 'none' | 'infra' | 'loteamento' | 'saneamento') => void;
  level: string;
  progressToNextLevel: number; // 0 to 100
  nextLevelXp: number;
  currentLevelXp: number;
}

const GamificationContext = createContext<GamificationContextProps | undefined>(undefined);

export const LEVELS = [
  { name: 'Cadista Júnior', max: 500 },
  { name: 'Projetista Pleno', max: 1200 },
  { name: 'Engenheiro Sênior', max: 2500 },
  { name: 'Master BIM', max: Infinity },
];

export const BADGES = [
  { id: 'first_lesson', name: 'Primeiros Passos', description: 'Completou a primeira aula', color: 'text-emerald-500' },
  { id: 'first_quiz', name: 'Primeiro Quiz', description: 'Acertou seu primeiro exercício', color: 'text-amber-500' },
  { id: 'streak_3', name: 'Foco Total', description: '3 dias seguidos de estudo', color: 'text-rose-500' },
  { id: 'ai_helper', name: 'Mentalidade Inovadora', description: 'Usou a IA para gerar um quiz dinâmico', color: 'text-indigo-500' },
  { id: 'module_m1_complete', name: 'Explorador', description: 'Completou o Módulo 1', color: 'text-emerald-500' },
  { id: 'module_m2_complete', name: 'O Topógrafo', description: 'Completou o Módulo 2', color: 'text-emerald-500' },
  { id: 'module_m3_complete', name: 'O Projetista', description: 'Completou o Módulo 3', color: 'text-emerald-500' },
  { id: 'module_m4_complete', name: 'Mestre das Águas', description: 'Completou o Módulo 4', color: 'text-emerald-500' },
  { id: 'module_m5_complete', name: 'Inspetor', description: 'Completou o Módulo 5', color: 'text-emerald-500' },
  { id: 'module_m6_complete', name: 'Detalhista', description: 'Completou o Módulo 6', color: 'text-emerald-500' },
  { id: 'module_m7_complete', name: 'Dev Civil', description: 'Completou o Módulo 7', color: 'text-emerald-500' },
  { id: 'course_complete', name: 'Engenheiro Civil', description: 'Finalizou o Curso 100%', color: 'text-amber-500' },
  { id: 'simulation_complete', name: 'Mão na Massa', description: 'Completou uma simulação com sucesso', color: 'text-blue-500' },
];

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('c3d_gamification');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, badges: parsed.badges || [] };
    }
    return { xp: 0, streakDays: 0, lastLoginDate: '', badges: [] };
  });

  useEffect(() => {
    // Process streak logic on mount
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      let newStreak = prev.streakDays;
      if (prev.lastLoginDate !== today) {
        if (prev.lastLoginDate) {
          const lastDate = new Date(prev.lastLoginDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1; // reset streak if missed a day
          }
        } else {
          newStreak = 1; // first login
        }
      }
      return { ...prev, streakDays: newStreak, lastLoginDate: today };
    });
  }, []);

  useEffect(() => {
    if (state.streakDays >= 3 && !state.badges.includes('streak_3')) {
      unlockBadge('streak_3');
    }
  }, [state.streakDays]);

  useEffect(() => {
    localStorage.setItem('c3d_gamification', JSON.stringify(state));
  }, [state]);

  const addXp = (amount: number) => {
    setState(prev => ({ ...prev, xp: prev.xp + amount }));
  };

  const unlockBadge = (badgeId: string) => {
    setState(prev => {
      if (prev.badges.includes(badgeId)) return prev;
      return { ...prev, badges: [...prev.badges, badgeId] };
    });
  };

  const rewardChatInteraction = (lessonId: string) => {
    setState(prev => {
      const currentRewards = prev.chatRewardsData || {};
      const currentCount = currentRewards[lessonId] || 0;
      if (currentCount < 3) {
        return {
          ...prev,
          xp: prev.xp + 10,
          chatRewardsData: {
            ...currentRewards,
            [lessonId]: currentCount + 1,
          }
        };
      }
      return prev;
    });
  };

  const setSelectedTrack = (track: 'none' | 'infra' | 'loteamento' | 'saneamento') => {
    setState(prev => ({ ...prev, selectedTrack: track }));
  };

  const currentLevelIndex = LEVELS.findIndex(l => state.xp <= l.max) === -1 ? LEVELS.length - 1 : LEVELS.findIndex(l => state.xp <= l.max);
  const currentLevel = LEVELS[currentLevelIndex].name;
  
  const currentLevelBaseXp = currentLevelIndex === 0 ? 0 : LEVELS[currentLevelIndex - 1].max;
  const nextLevelXpLimit = LEVELS[currentLevelIndex].max;
  
  let progressToNextLevel = 100;
  if (nextLevelXpLimit !== Infinity) {
    const range = nextLevelXpLimit - currentLevelBaseXp;
    const progress = state.xp - currentLevelBaseXp;
    progressToNextLevel = Math.min(100, Math.max(0, (progress / range) * 100));
  }

  return (
    <GamificationContext.Provider value={{
      state,
      addXp,
      unlockBadge,
      rewardChatInteraction,
      setSelectedTrack,
      level: currentLevel,
      progressToNextLevel,
      nextLevelXp: nextLevelXpLimit,
      currentLevelXp: currentLevelBaseXp
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
