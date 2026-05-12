import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers } from 'lucide-react';

const flashcardsData = [
  { q: "Qual o atalho para ativar/desativar o Object Snap (OSNAP)?", a: "F3" },
  { q: "Qual o atalho para o modo Ortho?", a: "F8" },
  { q: "Comando comum para criar um Offset?", a: "O (Offset) + Enter" },
  { q: "Qual painel principal usamos para visualizar Surfaces, Alignments e Corridors?", a: "Toolspace (Aba Prospector)" },
  { q: "O conceito que junta um perfil longitudinal, uma seção tipo (assembly) e um alinhamento?", a: "Corridor (Corredor)" },
  { q: "Para que serve a aba 'Settings' no Toolspace?", a: "Para gerenciar configurações de estilos, rótulos (labels) e comportamentos dos objetos do Civil 3D." },
  { q: "O que é uma 'Feature Line'?", a: "É um objeto linear 3D altamente configurável usado no Civil 3D, essencial para projetos de terraplenagem (grading)." },
  { q: "O que significa 'Target' em um Corridor?", a: "O alvo (superfície, alinhamento ou perfil) que uma submontagem (subassembly) tenta alcançar para gerar a geometria 3D." },
  { q: "Como criar uma superfície a partir de pontos?", a: "Crie um Point Group, depois crie uma TIN Surface, em 'Definition' adicione o Point Group criado." },
  { q: "O que é um 'Alignment' (Alinhamento)?", a: "É um elemento 2D linear que define o eixo em planta de estradas, dutos ou ferrovias." },
  { q: "O que é um 'Profile' (Desenho de Perfil)?", a: "Uma representação do terreno ou projeto ao longo de um alinhamento (eixo Z)." },
  { q: "Diferença entre 'Surface Profile' e 'Layout Profile'?", a: "Surface Profile representa a cota do terreno existente. Layout Profile (Greide) representa a elevação projetada final." },
  { q: "O que compõe um 'Assembly' (Seção Tipo)?", a: "É composto por um eixo e 'Subassemblies' (pistas, acostamentos, passeios, taludes) que formam a seção transversal." },
  { q: "Para que serve o comando 'Intersection' do Civil 3D?", a: "Gera automaticamente o cruzamento (Corridor complexo) entre dois alinhamentos que se interceptam." },
  { q: "Qual o atalho para o 'Panorama'?", a: "Não há um atalho de teclado fixo, mas ele abre automaticamente ao editar tabelas (ex: Profile Geometry, Pipe Network Vistas)." },
  { q: "O que representa uma 'Pipe Network'?", a: "Uma rede de tubulações estruturadas e parametrizadas (Tubos e Poços de Visita/Bocas de Lobo) usadas em projetos de drenagem ou esgoto." },
  { q: "O que é um 'Sample Line'?", a: "Uma linha de amostragem criada ao longo de um alinhamento para gerar seções transversais (Cross Sections) e calcular volumes." },
  { q: "Qual a função do 'Data Shortcuts'?", a: "Permite referenciar objetos do Civil 3D (Superfícies, Alinhamentos, etc) de outros arquivos, promovendo o trabalho em equipe sem sobrecarregar um único arquivo." }
];

export function Flashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = flashcardsData[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcardsData.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcardsData.length) % flashcardsData.length);
    }, 150);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-10 text-center flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
            <Layers className="w-8 h-8 text-indigo-500" /> Flashcards
          </h1>
          <p className="text-slate-500 mt-2">Pratique conceitos do Civil 3D e atalhos de teclado.</p>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center mt-4 mb-16">
          <div 
            className="relative w-full max-w-lg aspect-[4/3] sm:aspect-video [perspective:1000px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="w-full h-full relative [transform-style:preserve-3d]"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front */}
              <div className="absolute w-full h-full bg-white border-2 border-slate-200 group-hover:border-indigo-300 transition-colors rounded-2xl shadow-md [backface-visibility:hidden] flex flex-col items-center justify-center p-8 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest absolute top-6">Cartão {currentIndex + 1} de {flashcardsData.length}</span>
                <h3 className="text-2xl font-medium text-slate-800">{card.q}</h3>
                <span className="text-sm font-semibold text-indigo-500 absolute bottom-6 opacity-75">Clique para virar</span>
              </div>
              
              {/* Back */}
              <div 
                className="absolute w-full h-full bg-indigo-600 border border-indigo-700 rounded-2xl shadow-md [backface-visibility:hidden] flex flex-col items-center justify-center p-8 text-center"
                style={{ transform: "rotateY(180deg)" }}
              >
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest absolute top-6">Resposta</span>
                <h3 className="text-2xl font-bold text-white">{card.a}</h3>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-6 mt-10">
            <button 
              onClick={handlePrev}
              className="px-6 py-3 rounded-lg font-bold bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Anterior
            </button>
            <button 
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-bold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
