import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Lesson } from '../data/course';
import { useGamification } from '../context/GamificationContext';

interface DynamicQuizProps {
  lesson: Lesson;
  autoStart?: boolean;
}

export function DynamicQuiz({ lesson, autoStart }: DynamicQuizProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  const { addXp, unlockBadge } = useGamification();

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setHasStarted(true);
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    
    // Unlock ai_helper badge immediately
    if (unlockBadge) {
       unlockBadge('ai_helper');
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Como um especialista em Civil 3D, gere 3 perguntas desafiadoras (podendo ser de múltipla escolha ou verdadeiro/falso) baseadas no seguinte conteúdo da aula "${lesson.title}".

Conteúdo:
${lesson.rawText ? lesson.rawText : typeof lesson.content === 'string' ? lesson.content : "Tópico da aula: " + lesson.title}

Retorne as perguntas estritamente no seguinte formato JSON (sem markdown, sem strings extras):
[
  {
    "question": "Pergunta...",
    "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
    "correctAnswer": 0,
    "explanation": "Explicação..."
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "[]");
      if (parsed.length > 0) {
        setQuestions(parsed);
      }
    } catch (e) {
      console.error(e);
      // fallback in case generation fails
      setQuestions([
        {
          question: "Qual recurso é focado nesta lição?",
          options: ["Superfícies", "Alinhamentos", "Tópicos Avançados", "Pontos"],
          correctAnswer: 2,
          explanation: "Esta é uma pergunta de fallback gerada devido a um erro de IA."
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (autoStart && !hasStarted && !isGenerating && questions.length === 0) {
      handleGenerate();
    }
  }, [autoStart, hasStarted, isGenerating, questions.length]);

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    
    if (idx === questions[currentQuestionIdx].correctAnswer) {
      setScore(s => s + 1);
      addXp(20);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    setCurrentQuestionIdx(i => i + 1);
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-indigo-50 to-fuchsia-50 rounded-2xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Sparkles className="w-24 h-24 text-indigo-600" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-900 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Gerador Dinâmico de Quizzes com IA
        </h3>
        
        {questions.length === 0 ? (
          <div>
            <p className="text-indigo-800/70 mb-6 max-w-2xl">
              Quer testar seus conhecimentos em um nível mais profundo? 
              A inteligência artificial pode ler o conteúdo da aula selecionada e formular perguntas exclusivas para você.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Desafio...
                </>
              ) : (
                <>Desafie-me Mais</>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 mt-4">
            {currentQuestionIdx < questions.length ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex justify-between items-center mb-4 text-sm font-medium text-indigo-400">
                    <span>Pergunta {currentQuestionIdx + 1} de {questions.length}</span>
                    <span>Placar: {score}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-6">
                    {questions[currentQuestionIdx].question}
                  </h4>
                  <div className="space-y-3">
                    {questions[currentQuestionIdx].options.map((opt: string, idx: number) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === questions[currentQuestionIdx].correctAnswer;
                      
                      let btnState = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
                      
                      if (showResult) {
                         if (isCorrect) btnState = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-1 ring-emerald-500 font-medium scale-[1.01] z-10";
                         else if (isSelected) btnState = "bg-rose-50 border-rose-500 text-rose-900 shadow-sm ring-1 ring-rose-500 font-medium";
                         else btnState = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                      } else if (isSelected) {
                         btnState = "bg-indigo-50 border-indigo-500 text-indigo-800";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center relative ${btnState}`}
                        >
                          <span className="flex-1 pr-4">{opt}</span>
                          {showResult && isCorrect && (
                            <div className="flex items-center text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 animate-in zoom-in duration-300">
                              <CheckCircle2 className="w-5 h-5 mr-1.5" /> Correto
                            </div>
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <div className="flex items-center text-rose-700 bg-rose-100 px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 animate-in zoom-in duration-300">
                              <XCircle className="w-5 h-5 mr-1.5" /> Incorreto
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6"
                    >
                      <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-900 text-sm mb-6">
                        <strong className="block mb-1">Explicação da IA:</strong>
                        {questions[currentQuestionIdx].explanation}
                      </div>
                      
                      <button
                        onClick={nextQuestion}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                         {currentQuestionIdx < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
                         <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
               <div className="text-center py-8">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Sparkles className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">Desafio Concluído!</h4>
                  <p className="text-slate-600 mb-6">Você acertou {score} de {questions.length} perguntas inéditas geradas pela IA.</p>
                  <button
                    onClick={handleGenerate}
                    className="px-6 py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Gerar Novo Desafio
                  </button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
