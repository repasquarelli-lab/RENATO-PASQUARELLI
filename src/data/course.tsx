import React from 'react';
import { 
  MonitorPlay, 
  Map, 
  Route, 
  Droplets, 
  Mountain, 
  FileSpreadsheet,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

export type Quiz = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  content: React.ReactNode;
  rawText?: string;
  quiz?: Quiz;
};

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  lessons: Lesson[];
};

export const courseModules: CourseModule[] = [
  {
    id: 'm1',
    title: 'Módulo 1: Introdução e Interface',
    description: 'Conceitos fundamentais e navegação no ambiente Autodesk Civil 3D 2027.',
    icon: MonitorPlay,
    lessons: [
      {
        id: 'm1-l1',
        title: 'Visão Geral do Civil 3D 2027',
        duration: '10 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Civil 3D 2027</h2>
            <p>
              O Autodesk Civil 3D é a principal ferramenta BIM (Building Information Modeling) 
              para projetos de infraestrutura civil, englobando rodovias, ferrovias, barragens, loteamentos e saneamento.
            </p>
            <p>
              Nesta versão 2027, o software aprimorou significativamente seus fluxos de trabalho, 
              destacando-se a <strong>conectividade na nuvem</strong> e ferramentas avançadas de análise integrada, 
              como o InfoDrainage.
            </p>
            <h3 className="text-xl font-semibold mt-6">A Interface (Ribbon e Toolspace)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Ribbon:</strong> A faixa de opções superior onde todos os comandos estão organizados por guias (Home, Insert, Annotate, Analyze, etc.).</li>
              <li><strong>Toolspace:</strong> O "coração" do Civil 3D. É dividido em abas (Prospector, Settings, Survey e Toolbox).
                <ul className="list-circle pl-6 mt-2 space-y-1 text-slate-500">
                  <li><em>Prospector:</em> Gerencia os dados do projeto (Pontos, Superfícies, Alinhamentos).</li>
                  <li><em>Settings:</em> Controla como os objetos são exibidos e nomeados (Estilos de Objeto e Textos).</li>
                </ul>
              </li>
            </ul>
          </div>
        ),
        quiz: {
          question: "Qual das abas do Toolspace gerencia a exibição e nomenclatura de objetos (Estilos)?",
          options: ["Prospector", "Settings", "Toolbox", "Survey"],
          correctAnswer: 1,
          explanation: "A aba Settings controla todos os estilos de apresentação de objetos e labels de anotação (textos)."
        }
      },
      {
        id: 'm1-l2',
        title: 'Configurações Iniciais e Templates',
        duration: '15 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Templates e Configurações de Desenho</h2>
            <p>
              Antes de iniciar qualquer projeto, é fundamental configurar o sistema de coordenadas e as unidades de medida.
              No Brasil, normalmente utilizamos sistemas como o SIRGAS 2000 referenciado nas zonas UTM apropriadas.
            </p>
            <div className="p-4 rounded-lg bg-blue-50 border border-sky-100 mt-4">
              <h4 className="font-semibold text-sky-800 mb-2">Dica Pro: Templates (DWT)</h4>
              <p className="text-sm text-sky-900">
                Utilize e crie <em>Project Templates</em>. A biblioteca do Civil 3D permite importar templates focados nas 
                normas locais (como DNIT ou ABNT), contendo estilos de cotas, camadas e catálogos de tubos pré-configurados.
                Isto economiza horas de formatação.
              </p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'm2',
    title: 'Módulo 2: Fundamentos de Modelagem',
    description: 'Criação de pontos COGO, superfícies topográficas e alinhamentos.',
    icon: Map,
    lessons: [
      {
        id: 'm2-l1',
        title: 'Pontos COGO e Superfícies',
        duration: '20 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Criando a Base do Projeto</h2>
            <p>
              Tudo começa com a topografia. Os pontos no Civil 3D não são apenas coordenadas; são objetos inteligentes chamados <strong>Pontos COGO</strong>.
            </p>
            <h3 className="text-xl font-semibold mt-6">Importação de Dados</h3>
            <p>Você pode importar arquivos .TXT ou .CSV vindos de Estações Totais ou GNSS através da aba <em>Insert {'>'} Points from File</em>.</p>
            
            <h3 className="text-xl font-semibold mt-6">Superfícies (TIN Surfaces)</h3>
            <p>
              Uma malha TIN (Triangulated Irregular Network) representa o terreno 3D. 
              Para criar:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>No <em>Prospector</em>, clique com o botão direito em <em>Surfaces</em> e escolha <strong>Create Surface</strong>.</li>
              <li>Expanda a nova superfície criada e vá em <em>Definition {'>'} Point Groups</em>.</li>
              <li>Adicione os pontos importados para gerar os triângulos e curvas de nível automaticamente.</li>
            </ol>
          </div>
        ),
        quiz: {
          question: "Para o que servem os 'Pontos COGO' no Civil 3D?",
          options: [
            "Apenas para desenhar nós gráficos.",
            "Para criar caixas de texto com anotações.",
            "São objetos inteligentes (Coordinate Geometry) que armazenam informações de Norte, Leste, Elevação e Descrição.",
            "Para servir como base de imagens de satélite."
          ],
          correctAnswer: 2,
          explanation: "Os Pontos COGO são elementos fundamentais com atributos geoespaciais completos."
        }
      },
      {
        id: 'm2-l2',
        title: 'Alinhamentos Horizontais',
        duration: '25 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Traçados e Diretrizes</h2>
            <p>
              Os alinhamentos definem o eixo de estradas, canais ou redes de tubulação. 
              Eles são entidades 2D que contêm estacas (stations) ao longo do seu comprimento.
            </p>
            <p>
              Use <strong>Alignment Creation Tools</strong> na aba <em>Home</em> para traçar tangentes e curvas. 
              Você pode adicionar curvas de transição (clotoides) de acordo com normas de projeto rodoviário de forma automatizada.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'm3',
    title: 'Módulo 3: Projeto de Rodovias',
    description: 'Projetando o perfil vertical e gerando corredores 3D.',
    icon: Route,
    lessons: [
      {
        id: 'm3-l1',
        title: 'Perfis e Greides',
        duration: '20 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Perfil Longitudinal</h2>
            <p>
              O perfil mostra a elevação ao longo de um alinhamento.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Surface Profile:</strong> Extrai as elevações do terreno natural cortado pelo alinhamento.</li>
              <li><strong>Profile Creation Tools:</strong> Ferramenta para desenhar o greide de projeto (tangentes e curvas verticais côncavas/convexas).</li>
            </ul>
          </div>
        )
      },
      {
        id: 'm3-l2',
        title: 'Seções Tipo e Corredores (Corridors)',
        duration: '35 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">O Modelo Corredor 3D</h2>
            <p>
              O <em>Corridor</em> é o modelo 3D dinâmico resultante da união de 3 elementos:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-4 mb-6">
              <li><strong>Alinhamento</strong> (Onde na planta)</li>
              <li><strong>Perfil/Greide</strong> (Qual elevação)</li>
              <li><strong>Assembly / Seção Tipo</strong> (A forma transversal, ex: faixa de rolamento, acostamento, taludes)</li>
            </ol>
            <p>
              Com a ferramenta <em>Tool Palettes</em>, você adiciona componentes (subassemblies) como pistas e sarjetas à sua <em>Assembly</em> base. 
              A construção do corredor permite calcular volumes de corte e aterro e modelar as superfícies de projeto.
            </p>
          </div>
        )
      },
      {
        id: 'm3-l3',
        title: 'Interseções e Terraplenagem Avançada',
        duration: '30 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Projeto de Interseções</h2>
            <p>
              Interseções exigem conexão precisa entre múltiplos eixos, perfis e superfícies. No Civil 3D, a ferramenta de <strong>Intersections</strong> cria as linhas de base automaticamente.
            </p>
            <p>
              Além disso, para gerenciar volumes, a <strong>Curva de Massa (Brückner)</strong> auxilia no entendimento de onde cortar, onde aterrar e as distâncias de transporte de material.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'm4',
    title: 'Módulo 4: Drenagem e Hidráulica',
    description: 'Técnicas avançadas de drenagem introduzidas no Civil 3D 2027.',
    icon: Droplets,
    lessons: [
      {
        id: 'm4-l1',
        title: 'Novidades do Civil 3D 2027: Drenagem Urbana',
        duration: '15 min',
        content: (
          <div className="space-y-4">
            <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 mb-6 flex gap-4">
               <div className="text-sky-600">
                 <Droplets className="w-8 h-8"/>
               </div>
               <div>
                  <h3 className="font-bold text-sky-900 text-lg">Novos Métodos Hidrológicos e InfoDrainage</h3>
                  <p className="text-sm text-sky-800 mt-1">
                    A versão 2027 traz análises de tempo de concentração pelos métodos <strong>FAA</strong> e <strong>Kirpich</strong> nas bacias de contribuição (além do TR-55). Ademais, a integração nativa com o <em>InfoDrainage</em> em nuvem facilita o dimensionamento completo (incluindo cálculo automático de HGL/EGL) e suporte a SuDS!
                  </p>
               </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Objetos Nativos Melhorados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-sky-600 mb-2">Armazenamento (UGS & Ponds)</h4>
                <p className="text-sm text-slate-600">
                  O Underground Storage (UGS) e piscinas (ponds) agora são objetos nativos com estilos específicos, porosidade, e conectividade completa: refletem automaticamente mudanças conectando tubulações e bacias.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-sky-600 mb-2">Canais com Múltiplas Inclinações</h4>
                <p className="text-sm text-slate-600">
                  Canalizações (drainage channels) agora permitem múltiplas inclinações em um mesmo trecho extraídas de linhas características ou de seções de montagens (assemblies).
                </p>
              </div>
            </div>
            
            <p className="mt-4 text-slate-700">
               Além do cálculo hidráulico e da equação de Manning incluída nos rótulos, você pode iniciar o projeto conceitual em <strong>InfraWorks</strong> e publicá-lo via <strong>Autodesk Docs</strong> para colaboração ágil com equipes <strong>Revit</strong>.
            </p>
          </div>
        ),
        quiz: {
          question: "Quais são os novos métodos de tempo de concentração implementados nas Bacias de Contribuição do Civil 3D 2027?",
          options: [
            "Método Racional Direto e TR-20.",
            "Somente o TR-55 está disponível.",
            "Métodos FAA e Kirpich, estendendo o TR-55.",
            "Método de Manning e Saint-Venant."
          ],
          correctAnswer: 2,
          explanation: "O Civil 3D 2027 inclui de forma inédita os métodos FAA e Kirpich diretamente nas ferramentas de 'Criar Área de Contribuição', permitindo maior precisão na estimativa de escoamentos e vazão de pico."
        }
      },
      {
        id: 'm4-l2',
        title: 'Bacias de Contribuição e Pipe Networks',
        duration: '40 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Passo a Passo: Drenagem Integrada</h2>
            
            <h3 className="text-xl font-semibold mt-6">1. Delimitação de Bacias (Catchments)</h3>
            <p>
              Você pode converter polilinhas fechadas em objetos <em>Catchment</em> via <code>Analyze {'>'} Ground Data</code>.
              Nesta versão 2027, ao definir o método de cálculo de tempo de concentração (Tc), além do TR-55 clássico, 
              <strong>foram adicionados os métodos Kirpich e FAA.</strong>
            </p>

            <h3 className="text-xl font-semibold mt-6">2. Pipe Networks e Pressure Networks</h3>
            <p>
              As Redes de Gravidade usam catálogos personalizáveis de Poços de Visita (Manholes), Bocas de Lobo (Inlets) e Tubos. 
              Os rótulos (labels) de tubulação foram ampliados na v2027 para exibir dados de controle de enxurrada e reservatórios.
            </p>
            <p>
              As <em>Pressure Networks</em> (Redes de Pressão para água potável) também ganharam criação 3D muito mais rápida 
              e exibições de símbolos aprimoradas.
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
              <h4 className="font-semibold mb-2 text-slate-800">Fluxo de Trabalho Recomendado: O "Ecosistema"</h4>
              <p className="text-sm text-slate-600">
                1. Modele a geometria espacial (superfície, bacias, rede) no Civil 3D.<br/>
                2. Sincronize (Send to InfoDrainage) para rodar os dados hidrológicos/hidráulicos multitempestades na nuvem.<br/>
                3. Traga os diâmetros e elevações otimizadas de volta ao Civil 3D através dos controles de "merge".
              </p>
              <p className="text-sm mt-2 italic text-slate-500">
                Nota: O Storm and Sanitary Analysis (SSA) ainda está disponível (como extensão legacy) para sistemas isolados.
              </p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'm5',
    title: 'Módulo 5: Terraplenagem e Grading',
    description: 'Movimentação de terra, taludes e cálculo de volumetria.',
    icon: Mountain,
    lessons: [
      {
        id: 'm5-l1',
        title: 'Grading com Feature Lines',
        duration: '30 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Feature Lines</h2>
            <p>
              As <em>Feature Lines</em> são as polilinhas em esteróides do Civil 3D. Elas suportam elevações em cada vértice 
              e definem o contorno de plataformas, bacias de retenção e estacionamentos.
            </p>
            <p>
              Você usa a barra <em>Grading Creation Tools</em> para projetar taludes (Corte e Aterro) mirando na superfície do terreno natural 
              com inclinações específicas (ex: 2:1 ou 1:1).
            </p>
          </div>
        )
      },
      {
        id: 'm5-l2',
        title: 'Cálculo de Volumes',
        duration: '15 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Volume Dashboard</h2>
            <p>
              Uma vez que você tem a Superfície Base (Terreno) e a Superfície de Projeto (Grading ou Corredor),
              utilize o <strong>Volumes Dashboard</strong> na aba <em>Analyze</em>.
            </p>
            <p>
              Ele criará uma <em>TIN Volume Surface</em>, subtraindo o projeto da base e fornecendo um relatório numérico 
              completo de Corte (Cut), Aterro (Fill) e Volume Líquido (Net).
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'm6',
    title: 'Módulo 6: Documentação e Entrega',
    description: 'Desenho final, extração de planilhas e colaboração.',
    icon: FileSpreadsheet,
    lessons: [
      {
        id: 'm6-l1',
        title: 'Plan Production (Plantas e Perfis Automáticos)',
        duration: '25 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Criação Rápida de Pranchas</h2>
            <p>
              Para grandes corredores ou redes de tubulação, recortar pranchas manualmente é inviável.
              Use <strong>View Frames</strong> sob a aba <em>Output</em> para gerar caixas de recorte baseadas num alinhamento.
            </p>
            <p>
              O Civil 3D gerará automaticamente dezenas de pranchas (layouts) divididas com precisão entre planta em cima 
              e perfil em baixo (padrão rodoviário), economizando semanas de detalhamento.
            </p>
          </div>
        )
      },
      {
        id: 'm6-l2',
        title: 'Entrega Final e Auditoria de Qualidade',
        duration: '20 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Project Explorer e Relatórios</h2>
            <p>
              O <strong>Project Explorer</strong> é a ferramenta definitiva para navegar, auditar e gerar relatórios customizados
              para todos os objetos do desenho: tabelas de locação de pontos, quantidades das tubulações e estruturas de terraplenagem.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Checklist Final:</strong> Valide se os estilos de rótulos estão conformes as normas.</li>
              <li><strong>Comparação:</strong> No Civil 3D 2027 a interoperabilidade dos objetos (como reservatórios e canais) entre versões está mais confiável, facilitando equipes híbridas.</li>
            </ul>
            <div className="mt-8 p-6 bg-sky-50 border border-sky-200 rounded-lg text-center">
              <h3 className="text-xl font-bold text-sky-800 mb-2">Parabéns!</h3>
              <p className="text-sky-900">
                Você concluiu a teoria base do treinamento passo a passo de Autodesk Civil 3D 2027! 
                Lembre-se: o melhor aprendizado no Civil 3D vem da prática intensa e do uso do "Toolspace".
              </p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'm7',
    title: 'Módulo 7: Automação com Dynamo e IA',
    description: 'Rotinas de automação (Visual Scripting) e uso da IA para validar scripts.',
    icon: MonitorPlay,
    lessons: [
      {
        id: 'm7-l1',
        title: 'Dynamo para Civil 3D',
        duration: '45 min',
        content: (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Visual Scripting e API</h2>
            <p>
              O Dynamo é o ambiente integrado de programação visual do Civil 3D, permitindo criar 
              rotinas customizadas (scripts) sem precisar de conhecimentos profundos de C# ou AutoLISP.
            </p>
            <p>
              Com ele, você pode manipular milhares de objetos geometricamente e ler/escrever 
              parâmetros no AutoCAD em segundos.
            </p>
            <h3 className="text-xl font-semibold mt-6">A Inteligência Artificial como Revisora</h3>
            <p>
              Em breve, você poderá colar seus scripts (Python Script Node) ou rotinas LISP 
              diretamente no assistente IA (nesta mesma aula) para buscar bugs na lógica ou 
              obter sugestões de melhorias baseadas na API do Civil 3D.
            </p>
          </div>
        ),
        rawText: "O Dynamo é o ambiente integrado de programação visual do Civil 3D, permitindo criar rotinas customizadas (scripts) sem precisar de conhecimentos profundos de C# ou AutoLISP. Com ele, você pode manipular milhares de objetos geometricamente e ler/escrever parâmetros no AutoCAD em segundos. Você também pode colar seus scripts (Python Script Node) ou rotinas LISP no assistente de IA para buscar bugs na lógica ou obter sugestões de melhorias baseadas na API do Civil 3D."
      }
    ]
  }
];
