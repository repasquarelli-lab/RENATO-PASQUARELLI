import React, { useRef, useState } from 'react';
import { X, Award, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Logo } from './Logo';

export function CertificateModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificado_Civil3D_Masterclass.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-slate-100 rounded-3xl shadow-2xl p-6 w-full max-w-4xl relative max-h-[95vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-slate-200 text-slate-500 transition-colors shadow-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            {/* The actual certificate that will be captured */}
            <div 
              ref={certificateRef}
              className="bg-white aspect-[1.414/1] w-full p-12 relative overflow-hidden flex flex-col justify-center border-[12px] border-double border-slate-200"
              style={{
                 backgroundImage: 'radial-gradient(#f1f5f9 1px, transparent 1px)',
                 backgroundSize: '24px 24px',
              }}
            >
               {/* Decorative corners */}
               <div className="absolute top-0 left-0 w-24 h-24 border-t-[8px] border-l-[8px] border-amber-500 rounded-tl-2xl m-4"></div>
               <div className="absolute top-0 right-0 w-24 h-24 border-t-[8px] border-r-[8px] border-amber-500 rounded-tr-2xl m-4"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 border-b-[8px] border-l-[8px] border-amber-500 rounded-bl-2xl m-4"></div>
               <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[8px] border-r-[8px] border-amber-500 rounded-br-2xl m-4"></div>

               <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white to-white/80"></div>

               <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="flex items-center gap-3 mb-8">
                   <Logo className="h-12 w-auto" />
                   <div className="text-left">
                     <h1 className="text-2xl font-black text-[#0B1E33] tracking-tight">Civil 3D Masterclass</h1>
                     <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">Treinamento Profissional</p>
                   </div>
                 </div>

                 <h2 className="text-5xl font-extrabold text-slate-900 mb-6 uppercase tracking-wider font-serif">Certificado de Conclusão</h2>
                 
                 <p className="text-lg text-slate-600 mb-4">Certificamos que</p>
                 
                 <h3 className="text-4xl font-black text-amber-600 mb-4 border-b-2 border-amber-200 pb-2 px-12">Aluno Destacado</h3>
                 
                 <p className="text-lg text-slate-600 max-w-lg leading-relaxed mb-12">
                   Concluiu com êxito todas as etapas, simulações interativas e avaliações do curso <strong>Treinamento Autodesk Civil 3D 2027</strong>, adquirindo proficiência em infraestrutura e modelagem BIM.
                 </p>

                 <div className="flex justify-between items-end w-full px-12 mt-auto">
                   <div className="flex flex-col items-center">
                     <div className="text-lg font-bold text-slate-800 mb-1">{today}</div>
                     <div className="w-32 h-[2px] bg-slate-300 mb-1"></div>
                     <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data de Conclusão</div>
                   </div>
                   
                   <div className="w-32 h-32 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-amber-100 rounded-full animate-spin-slow opacity-50"></div>
                      <Award className="w-16 h-16 text-amber-500 relative z-10" />
                   </div>

                   <div className="flex flex-col items-center">
                     <div className="text-lg font-bold text-slate-800 mb-1">40 Horas</div>
                     <div className="w-32 h-[2px] bg-slate-300 mb-1"></div>
                     <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Carga Horária Estimada</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="w-full md:w-64 shrink-0 flex flex-col space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">Parabéns!</h3>
              <p className="text-sm text-slate-600 mb-6">Você completou o curso. Baixe o seu certificado de conclusão oficial para compartilhar em suas redes profissionais.</p>
              
              <button 
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Baixar PDF</span>
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
