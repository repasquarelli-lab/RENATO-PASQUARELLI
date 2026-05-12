import React, { useState } from 'react';
import { Search, Book } from 'lucide-react';

export const glossaryTerms = [
  { term: 'Alignment', translated: 'Alinhamento', def: 'Elemento geométrico linear que define o eixo de uma via, tubo ou outro percurso de projeto no plano horizontal.' },
  { term: 'Assembly', translated: 'Seção Tipo', def: 'Coleção de subassemblies (submontagens) que formam a estrutura transversal de um corredor (Corridor).' },
  { term: 'Breakline', translated: 'Linha de Quebra', def: 'Linha usada numa superfície TIN que obriga a triangulação a seguir determinadas feições topográficas (como bordas de estradas ou fundos de vales), melhorando a precisão do modelo.' },
  { term: 'Catchment', translated: 'Bacia de Contribuição', def: 'Área delimitada de onde toda a água da chuva escoa para um único ponto de saída (outfall).' },
  { term: 'Code Set Style', translated: 'Estilo de Conjunto de Códigos', def: 'Define a aparência e a anotação (labels) para Pontos, Links (linhas) e Shapes (áreas) pertencentes a subassemblies de um corredor ou seção transversal.' },
  { term: 'Corridor', translated: 'Corredor', def: 'Modelo 3D complexo gerado pela projeção de uma Seção Tipo (Assembly) ao longo de um Alinhamento e Perfil (Greide).' },
  { term: 'Data Shortcuts', translated: 'Atalhos de Dados', def: 'Um recurso de colaboração que permite compartilhar referências de superfícies, alinhamentos e outros objetos entre diferentes arquivos de desenho (.dwg).' },
  { term: 'Feature Line', translated: 'Linha de Feição', def: 'Objeto linear em 3D dinâmico, usado no Civil 3D como ferramenta fundamental para modelagem de terraplenagem (grading) e determinação de elevações.' },
  { term: 'Grading', translated: 'Terraplenagem', def: 'Processo de modelagem de taludes e plataformas para adequar o terreno natural às necessidades do projeto em questão.' },
  { term: 'Intersection', translated: 'Interseção', def: 'Objeto paramétrico no Civil 3D que automatiza a criação de corredores para cruzamentos e junções de vias.' },
  { term: 'Parcel', translated: 'Lote / Parcela', def: 'Forma poligonal fechada usada em projetos de urbanismo e loteamento para delinear glebas, ruas e gerenciar relatórios de área.' },
  { term: 'Pipe Network', translated: 'Rede de Tubulações (Gravidade)', def: 'Sistema de tubos e estruturas (poços de visita, bocas de lobo) usado para projetar drenagem pluvial e redes de esgoto sanitário.' },
  { term: 'Point Group', translated: 'Grupo de Pontos', def: 'Coleção gerenciável de pontos COGO (Coordinate Geometry) que compartilham características similares, usados para controle visual ou geração de superfícies.' },
  { term: 'Pressure Network', translated: 'Rede de Pressão', def: 'Objetos inteligentes 3D que compõem redes pressurizadas contendo tubos de pressão, conexões (fittings) e equipamentos (appurtenances), como adutoras de água.' },
  { term: 'Profile', translated: 'Perfil / Greide', def: 'Representação da elevação natural do terreno (profile view) ou da geometria altimétrica de projeto (layout profile) ao longo de um alinhamento.' },
  { term: 'Prospector', translated: 'Prospector (Toolspace)', def: 'Aba principal, dentro do Toolspace, onde o projetista organiza, visualiza e acessa, hierarquicamente, todos os dados de projeto presentes.' },
  { term: 'Sample Line', translated: 'Linha de Amostragem', def: 'Linhas transversais dispostas ao longo de um alinhamento, sendo utilizadas para calcular volumes de material e gerar as vistas de seções transversais (Section Views).' },
  { term: 'Section View', translated: 'Vista de Seção', def: 'Representação gráfica bidimensional do terreno natural e do projeto em um ponto específico de amarração no estaqueamento criado por uma Linha de Amostragem.' },
  { term: 'Subassembly', translated: 'Submontagem', def: 'O bloco construtivo paramétrico básico que compõe uma seção tipo completa (ex: faixa de rolamento, meio-fio, barreira rígida, valeta de inclinação).' },
  { term: 'Superelevation', translated: 'Superelevação', def: 'O ajuste da inclinação transversal da pista de rolamento ao longo das curvas para contrabalançar a força centrífuga que age sobre um veículo em trânsito.' },
  { term: 'Surface', translated: 'Superfície / Modelo Digital de Terreno', def: 'Representação tridimensional contínua da topografia de uma área, geralmente modelada por meio de uma rede de malha triangular (TIN).' },
  { term: 'Target', translated: 'Alvo', def: 'Elementos de controle condicional (como superfícies, alinhamentos verticais/horizontais e linhas de feições 3D) que um subassembly projeta para ajustar dinamicamente cotas ou deslocamentos.' },
  { term: 'TIN (Triangulated Irregular Network)', translated: 'Rede Triangular Irregular', def: 'Método vetorial estatístico padrão usado no Civil 3D para interpolar matematicamente as elevações através da criação de triângulos não sobrepostos.' },
];

export function Glossary() {
  const [search, setSearch] = useState('');

  const filtered = glossaryTerms.filter(
    t => t.term.toLowerCase().includes(search.toLowerCase()) || t.translated.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Book className="w-8 h-8 text-indigo-500" /> Dicionário BIM
            </h1>
            <p className="text-slate-500 mt-2">Glossário de termos e jargões técnicos do Civil 3D.</p>
          </div>
          
          <div className="relative w-full md:w-72 border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm flex items-center px-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
             <Search className="w-4 h-4 text-slate-400 shrink-0" />
             <input 
               type="text" 
               placeholder="Buscar termo..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-10 px-3 outline-none text-sm text-slate-700 bg-transparent font-medium" 
             />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length > 0 ? filtered.map((item, idx) => (
            <div key={idx} className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-lg font-bold text-slate-800">{item.term}</h3>
              </div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Tradução: {item.translated}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.def}</p>
            </div>
          )) : (
            <div className="col-span-full py-10 text-center text-slate-500">
               Nenhum termo encontrado para "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
