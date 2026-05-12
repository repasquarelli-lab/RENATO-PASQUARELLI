import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, User, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Lesson } from '../data/course';
import { useGamification } from '../context/GamificationContext';

interface AIChatbotProps {
  lesson: Lesson;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function AIChatbot({ lesson }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { rewardChatInteraction } = useGamification();

  useEffect(() => {
    // Reset chat when lesson changes
    setMessages([
      { role: 'model', content: `Olá! Sou seu assistente de IA para a aula "${lesson.title}". Como posso ajudar com o conteúdo de hoje?` }
    ]);
  }, [lesson.id, lesson.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleOpenChat = (e: CustomEvent<string>) => {
      setIsOpen(true);
      setInput(e.detail);
    };
    window.addEventListener('open-ai-chatbot', handleOpenChat as EventListener);
    return () => window.removeEventListener('open-ai-chatbot', handleOpenChat as EventListener);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    // Give XP per lesson using context
    rewardChatInteraction(lesson.id);

    try {
      // Build conversation history format for gemini API
      const aiMessages = messages.filter(m => m.role === 'user' || m.role === 'model').map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      // Add current message
      aiMessages.push({ role: 'user', parts: [{ text: userMessage }] });

      const chat = ai.chats.create({
        model: 'gemini-3.1-flash-lite',
        config: {
          systemInstruction: `Você é um tutor amigável e especialista em Civil 3D, ajudando um aluno. 
O aluno está cursando a aula "${lesson.title}".
Conteúdo da aula atual como contexto: 
${lesson.content}

Seja consiso, claro, didático. Responda APENAS perguntas relacionadas ao contexto da aula ou Civil 3D.`,
        }
      });

      // To preserve history correctly in the single chat creation flow if we want, but ai.chats.create handles ongoing, wait, `ai.chats.create` creates a new chat session. The initial messages aren't correctly passed this way unless we do `history: ...`. Wait, does genai support `history` in `chats.create`? 
      // Actually, standard structure:
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `Você é um tutor amigável e especialista no software Autodesk Civil 3D.
Você está ajudando o aluno a entender o conteúdo da aula atual.
Título da Aula: ${lesson.title}
Conteúdo da aula: ${lesson.content}

Responda dúvidas sobre a aula ou Civil 3D de forma clara e profissional.`,
        }
      });

      const text = response.text || "Desculpe, não consegui gerar uma resposta.";
      setMessages(prev => [...prev, { role: 'model', content: text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Desculpe, ocorreu um erro de comunicação com a IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 p-4 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-sky-500 hover:shadow-xl transition-all duration-300 z-40 group",
          isOpen ? "scale-0" : "scale-100"
        )}
        aria-label="Assistente IA"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-full max-w-md sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
          >
            {/* Header */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center bg-gradient-to-r from-slate-900 to-sky-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400">
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Tutor IA</h3>
                  <p className="text-[10px] text-sky-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Baseado na Aula Atual
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                  <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
                    msg.role === 'user' ? "bg-orange-100 ml-2" : "bg-sky-100 mr-2"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-sky-600" />}
                  </div>
                  <div className={cn("px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap shadow-sm",
                    msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 mr-2 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Buscando resposta...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Faça uma pergunta sobre a aula..."
                  className="flex-1 px-4 py-2.5 text-sm bg-slate-100 border-transparent rounded-full focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
