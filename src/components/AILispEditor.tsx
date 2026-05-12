import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Play, Bot, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useGamification } from '../context/GamificationContext';

export function AILispEditor() {
  const [code, setCode] = useState(`# Python Node for Dynamo / Civil 3D - Melhores Práticas
import clr
import sys

# Importando a biblioteca de Geometria do Dynamo
clr.AddReference('ProtoGeometry')
from Autodesk.DesignScript.Geometry import Line, Point

def create_points_on_line(start_pt, end_pt, count):
    """
    Cria uma série de pontos interpolados entre dois pontos.
    """
    points = []
    try:
        # 1. Validação de entradas
        if not start_pt or not end_pt:
            raise ValueError("Pontos inicial ou final ausentes.")
        if count < 2:
            raise ValueError("É necessário pelo menos 2 pontos (início e fim).")
            
        # 2. Criação da geometria
        line = Line.ByStartPointEndPoint(start_pt, end_pt)
        
        # 3. Lógica principal (interpolação)
        for i in range(count):
            param = i / float(count - 1) # Garante divisão em ponto flutuante
            points.append(line.PointAtParameter(param))
            
        # 4. Limpeza de memória (boa prática no Dynamo)
        line.Dispose()
        return points
        
    except Exception as e:
        # Melhor tratamento de erro ao invés de falhar silenciosamente
        import traceback
        return "Erro: " + str(e) + "\\n" + traceback.format_exc()

# 5. Captura segura de inputs (Evita IndexError se a porta não existir)
start = IN[0] if len(IN) > 0 else None
end = IN[1] if len(IN) > 1 else None
num_pts = IN[2] if len(IN) > 2 else 10

OUT = create_points_on_line(start, end, num_pts)`);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'success' | 'error' | 'warning', message: string, suggestions?: string[], corrected_code?: string | null } | null>(null);
  const { addXp } = useGamification();

  const handleEvaluate = async () => {
    if (!code.trim() || isEvaluating) return;
    setIsEvaluating(true);
    setFeedback(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Você é um Especialista em Autodesk Civil 3D, Dynamo e Python/LISP.
O aluno escreveu a seguinte rotina:

\`\`\`python
${code}
\`\`\`

Faça uma revisão de código desse script. Identifique erros lógicos, erros de uso da API do Civil 3D ou melhorias de performance.
Se houver erros ou melhorias possíveis, além de identificar os problemas, sugira a correção reescrevendo o código.
Retorne o resultado neste formato estrito em JSON (sem formatação extra):
{
  "status": "success" | "error" | "warning",
  "message": "Mensagem principal de feedback",
  "suggestions": ["Sugestão 1", "Sugestão 2"],
  "corrected_code": "Código corrigido e otimizado completo (caso haja ajustes a fazer) ou null se o script original estiver perfeito."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || "{}");
      setFeedback(result);
      
      if (result.status === 'success') {
        addXp(50); // Bônus por script validado!
      } else {
        addXp(10);
      }
    } catch (e) {
      console.error(e);
      setFeedback({
        status: 'error',
        message: 'Falha ao comunicar com a IA. Tente novamente mais tarde.'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="mt-8 bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-semibold">Assistente de Scripts IA (Dynamo/Python)</h3>
        </div>
        <div className="flex bg-slate-900 rounded p-1">
          <button className="px-3 py-1 text-xs text-white bg-slate-700 rounded shadow-sm">Python</button>
          <button className="px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors">AutoLISP</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Editor */}
        <div className="relative group">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 bg-slate-900 text-emerald-300 font-mono text-sm p-6 focus:outline-none resize-none"
            spellCheck="false"
          />
          <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            [EDITOR DE SCRIPT]
          </div>
        </div>

        {/* AI Output / Feedback */}
        <div className="bg-slate-800 p-6 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col">
          <div className="mb-4">
             <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {isEvaluating ? (
                   <><Loader2 className="w-5 h-5 animate-spin" /> Analisando Código...</>
                ) : (
                   <><Bot className="w-5 h-5" /> Auditar Script com IA</>
                )}
             </button>
             <p className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
                <Info className="w-3 h-3" /> A IA validará as chamadas de API e a lógica.
             </p>
          </div>

          <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-y-auto border border-slate-700">
             {!feedback ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                   <Bot className="w-12 h-12 opacity-20" />
                   <p className="text-sm text-center">Escreva seu script de automação e peça para a IA revisar.</p>
                </div>
             ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                   <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                     feedback.status === 'success' ? 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400' : 
                     feedback.status === 'error' ? 'bg-rose-900/30 border-rose-800/50 text-rose-400' :
                     'bg-amber-900/30 border-amber-800/50 text-amber-400'
                   }`}>
                     {feedback.status === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : 
                      feedback.status === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> :
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                     }
                     <div>
                       <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">{feedback.status === 'success' ? 'Aprovado' : feedback.status === 'warning' ? 'Atenção' : 'Erro Detectado'}</h4>
                       <p className="text-sm text-slate-300 leading-relaxed">{feedback.message}</p>
                     </div>
                   </div>

                   {feedback.suggestions && feedback.suggestions.length > 0 && (
                     <div className="pl-2 border-l-2 border-slate-700">
                       <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sugestões da IA</h5>
                       <ul className="space-y-2">
                         {feedback.suggestions.map((sug, i) => (
                           <li key={i} className="text-sm text-slate-300 flex gap-2">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                             {sug}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {feedback.corrected_code && feedback.corrected_code !== code && (
                     <div className="mt-4 pt-4 border-t border-slate-700/50">
                       <p className="text-sm text-slate-400 mb-3">A IA gerou uma versão corrigida do seu script.</p>
                       <button
                         onClick={() => {
                           setCode(feedback.corrected_code!);
                           setFeedback(null);
                         }}
                         className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H5"/><path d="M14 20h2"/></svg>
                         Aplicar Código Sugerido
                       </button>
                     </div>
                   )}
                </motion.div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
