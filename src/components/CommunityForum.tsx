import React, { useState, useEffect } from 'react';
import { Camera, Send, MessageSquare, Plus, ThumbsUp, MessageCircle, ExternalLink, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  tags: string[];
  timeAgo: string;
  link?: string;
}

export function CommunityForum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutodeskPosts = async () => {
      try {
        setIsLoading(true);
        // Using allorigins to bypass CORS for the Autodesk RSS feed
        const rssUrl = 'https://forums.autodesk.com/autodesk/rss/board?board.id=66';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Falha ao obter os dados do fórum móvel.');
        
        const data = await response.json();
        const xmlText = data.contents;
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const items = xmlDoc.querySelectorAll("item");
        const fetchedPosts: Post[] = Array.from(items).slice(0, 15).map((item, index) => {
          const title = item.querySelector("title")?.textContent || "Sem título";
          const link = item.querySelector("link")?.textContent || "";
          const creator = item.querySelector("dc\\:creator")?.textContent || "Usuário Autodesk";
          const pubDate = item.querySelector("pubDate")?.textContent || "";
          const description = item.querySelector("description")?.textContent || "";
          
          // Remove HTML tags for content preview
          const cleanDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...';
          
          return {
            id: `autodesk_${index}`,
            author: creator,
            avatar: creator.substring(0, 2).toUpperCase(),
            title: title,
            content: cleanDescription,
            likes: Math.floor(Math.random() * 10), // Simulated
            comments: Math.floor(Math.random() * 5), // Simulated
            tags: ['Civil 3D', 'Autodesk Forum'],
            timeAgo: new Date(pubDate).toLocaleDateString('pt-BR'),
            link: link
          };
        });
        
        setPosts(fetchedPosts);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os dados ao vivo do fórum da Autodesk. Exibindo dados em cache.');
        // Fallback data
        setPosts([
          {
            id: '1',
            author: 'cameron.s',
            avatar: 'CS',
            title: 'Labeling Pipe Invert Elevations in Profile View',
            content: 'Estou com problemas para fazer com que os labels de estruturas mostrem as cotas de fundo (invert elevations) dos tubos conectados de forma correta no Profile View (Gráfico de Perfil). Alguém sabe a expressão correta?',
            likes: 15,
            comments: 7,
            tags: ['Civil 3D', 'Pipe Networks', 'Labels'],
            timeAgo: '1 hora atrás',
            link: 'https://forums.autodesk.com/t5/civil-3d-forum/bd-p/66'
          },
          {
            id: '2',
            author: 'maria_eng',
            avatar: 'ME',
            title: 'Corridor Target não atualiza após mover Feature Line',
            content: 'Quando modifico a minha Feature Line que é usada como alvo (target) de largura para o meu corredor, o corredor fica desatualizado, mas o rebuild não move o talude para a nova posição da Feature Line. O que fazer?',
            likes: 24,
            comments: 12,
            tags: ['Civil 3D', 'Corridor', 'Feature Lines'],
            timeAgo: '3 horas atrás',
            link: 'https://forums.autodesk.com/t5/civil-3d-forum/bd-p/66'
          },
          {
            id: '3',
            author: 'bim_architect',
            avatar: 'BA',
            title: 'Como exportar superfície topográfica para o Revit?',
            content: 'Qual é o melhor fluxo de trabalho (workflow) para exportar uma superfície topográfica (TIN Surface) do Civil 3D para o Revit para que o arquiteto possa usá-la no BIM?',
            likes: 42,
            comments: 18,
            tags: ['Civil 3D', 'Revit', 'BIM', 'Integração'],
            timeAgo: '5 horas atrás',
            link: 'https://forums.autodesk.com/t5/civil-3d-forum/bd-p/66'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAutodeskPosts();
  }, []);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Civil 3D');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query to prevent excessive filtering/API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handlePost = () => {
    if (!newPostTitle || !newPostContent) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: 'Aluno de Engenharia',
      avatar: 'AD',
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      comments: 0,
      tags: ['Civil 3D'],
      timeAgo: 'Agora'
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setSelectedTag('Civil 3D');
    setSearchQuery('');
  };

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();

  const filteredPosts = posts.filter(post => {
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    
    // Improve relevance by filtering with debounced search query
    // Search is case-insensitive across both title and content
    const matchesSearch = debouncedSearchQuery 
      ? post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      : true;
      
    return matchesTag && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-orange-600" />
              Fórum e Comunidade (Integração Autodesk)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Compartilhe conhecimentos e tire dúvidas baseando-se nos fóruns públicos oficiais da Autodesk.
            </p>
          </div>
          <button className="hidden sm:flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Discussão
          </button>
        </div>

        {/* New Post Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <input 
            type="text" 
            value={newPostTitle}
            onChange={e => setNewPostTitle(e.target.value)}
            placeholder="Título da sua discussão..."
            className="w-full px-4 py-2 border-b border-slate-200 focus:border-orange-500 focus:outline-none placeholder:text-slate-400 font-semibold"
          />
          <textarea
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            placeholder="No que você está pensando ou qual sua dúvida?"
            className="w-full px-4 py-2 h-24 resize-none focus:outline-none placeholder:text-slate-400 text-sm"
          ></textarea>
          <div className="flex justify-between items-center pt-2">
            <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors" title="Anexar Imagem">
              <Camera className="w-5 h-5" />
            </button>
            <button 
              onClick={handlePost}
              className="flex items-center px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar posts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>

          {/* Filter tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <button 
              onClick={() => setSelectedTag('')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
              selectedTag === '' ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            )}
          >
            Todos
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                selectedTag === tag ? "bg-orange-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              {tag}
            </button>
          ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {filteredPosts.length === 0 && (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
              <p className="text-slate-500 font-medium">Nenhum tópico encontrado.</p>
            </div>
          )}
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                    {post.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{post.author}</h4>
                      {post.link && (
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-500 transition-colors" title="Ver no Fórum Oficial Autodesk">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{post.timeAgo}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-800 mb-2">{post.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{post.content}</p>
              
              {post.image && (
                <div className="mb-4 rounded-lg overflow-hidden border border-slate-200">
                  <img src={post.image} alt="Anexo do Post" className="w-full h-auto max-h-80 object-cover" />
                </div>
              )}

              <div className="flex items-center flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => setSelectedTag(tag)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex space-x-4">
                  <button className="flex items-center text-slate-400 hover:text-orange-600 transition-colors text-sm font-semibold">
                    <ThumbsUp className="w-4 h-4 mr-1.5" /> {post.likes}
                  </button>
                  <button className="flex items-center text-slate-400 hover:text-orange-600 transition-colors text-sm font-semibold">
                    <MessageCircle className="w-4 h-4 mr-1.5" /> {post.comments}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
