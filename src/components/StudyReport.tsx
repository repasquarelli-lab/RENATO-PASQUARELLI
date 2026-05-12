import React, { useState } from 'react';
import { FileBox, Download, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { courseModules } from '../data/course';
import { cn } from '../lib/utils';

export function StudyReport({ completedLessons }: { completedLessons: string[] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Simulate generation time to gather all local storage data, format and export.
    setTimeout(() => {
      // In a real app we'd build the markdown out of local storage notes & glossary.
      let content = "# Relatório Consolidado de Estudos - Civil 3D Masterclass\n\n";
      content += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n`;
      content += `**Aulas Concluídas:** ${completedLessons.length}\n\n`;

      content += "## Anotações Salvas\n";
      // Iterate through local storage to find notes
      let foundNotes = false;
      courseModules.forEach(module => {
        module.lessons.forEach(lesson => {
          const note = localStorage.getItem(`c3d_notes_${lesson.id}`);
          if (note) {
            foundNotes = true;
            content += `### ${lesson.title}\n${note}\n\n`;
          }
        });
      });
      if (!foundNotes) content += "Nenhuma anotação salva.\n\n";

      content += "## Termos do Glossário Favoritados\n";
      const favTerms = JSON.parse(localStorage.getItem('c3d_glossary_favorites') || '[]');
      if (favTerms.length > 0) {
        content += "*(Termos revisados)*\n\n";
        favTerms.forEach((term: string) => {
           content += `- **${term}**\n`;
        });
        content += "\n";
      } else {
        content += "Nenhum termo favoritado.\n\n";
      }

      const element = document.createElement("a");
      const file = new Blob([content], {type: 'text/markdown'});
      element.href = URL.createObjectURL(file);
      element.download = `relatorio-civil3d-${new Date().getTime()}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setIsGenerating(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <FileBox className="w-6 h-6 mr-3 text-rose-600" />
            Relatório Consolidado
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Gere um arquivo único contendo todas as suas anotações de aulas, resumos de IA e termos favoritados do glossário. Excelente para revisão antes de provas de certificação.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-4 bg-slate-50/50">
             <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
               <FileText className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800">Seu Dossiê de Estudo</h3>
               <p className="text-sm text-slate-500">Pronto para ser compilado no formato Markdown (.md).</p>
             </div>
          </div>
          <div className="p-6 space-y-4">
             <ul className="space-y-3">
               <li className="flex items-center text-sm text-slate-600">
                 <CheckCircle className="w-4 h-4 mr-3 text-emerald-500" /> Compila anotações de todas as aulas (<span className="font-mono ml-1 font-bold">{completedLessons.length}</span> concluídas)
               </li>
               <li className="flex items-center text-sm text-slate-600">
                 <CheckCircle className="w-4 h-4 mr-3 text-emerald-500" /> Extrai termos favoritados do Dicionário BIM
               </li>
               <li className="flex items-center text-sm text-slate-600">
                 <CheckCircle className="w-4 h-4 mr-3 text-emerald-500" /> Formatação limpa para impressão ou envio para o Notion
               </li>
             </ul>

             <div className="pt-6">
                <button 
                  onClick={generateReport}
                  disabled={isGenerating}
                  className={cn(
                    "w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm",
                    success 
                       ? "bg-emerald-500 text-white" 
                       : isGenerating
                         ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                         : "bg-slate-800 hover:bg-slate-700 text-white"
                  )}
                >
                  {success ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Gerado com Sucesso!
                    </>
                  ) : isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Compilando Dados...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Baixar Relatório (Markdown)
                    </>
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
