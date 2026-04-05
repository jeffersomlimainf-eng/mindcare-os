import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  MessageCircle, Heart, Shield, Sparkles, 
  ArrowRight, Search, Clock, Calendar, User, 
  ChevronRight, Instagram, Linkedin, Facebook,
  Check
} from 'lucide-react';
import { blogPosts } from '../data/blogData';

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // SEO Dynamic Injection
    document.title = "Blog de Psicologia | Artigos sobre Saúde Mental e Bem-Estar";
    
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', 'Portal completo de psicologia: Ansiedade, Burnout, TDAH, TCC, Psicanálise e especialidades. Conteúdo científico e acolhedor para sua saúde mental.');
    updateMeta('keywords', 'psicologia, saúde mental, TCC, psicanálise, neuropsicologia, ansiedade, burnout, bem-estar, sintropia');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://meusistemapsi.com.br/blog');

    window.scrollTo(0, 0);
  }, []);

  const categories = ['Todos', 'Saúde Mental', 'Bem-estar', 'Abordagens', 'Relacionamentos', 'Especialidades', 'Carreira', 'Sociedade', 'Performance'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'Todos' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.seoDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const safeAnimation = (variants) => ({
    initial: "hidden",
    animate: "visible",
    variants: variants
  });

  const scrollAnimation = (variants) => ({
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-50px" },
    variants: variants
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      
      {/* 1. Hero Section - Acolhedora */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-white border-b border-purple-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-50/50 to-transparent -z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...safeAnimation(fadeUp)} className="max-w-3xl">
            <span className="inline-block px-4 py-1 rounded-full bg-purple-50 text-purple-600 font-medium text-xs uppercase tracking-widest mb-6 border border-purple-100">
              Espaço de Cuidado & Educação
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-8 leading-[1.1]">
              Sua jornada para o <span className="text-purple-600">bem-estar</span> mental começa com a informação certa.
            </h1>
            <p className="text-xl text-slate-600 mb-10 font-light max-w-2xl leading-relaxed">
              Conteúdos humanizados sobre os desafios da vida contemporânea. Um portal de acolhimento para todos que buscam equilíbrio emocional.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/cadastrar" className="px-10 py-4 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-700 hover:scale-[1.02] transition-all">
                Agende uma Consulta
              </Link>
              <a href="#artigos" className="px-10 py-4 border border-slate-200 text-slate-500 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
                Explorar Categorias
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Categorias e Pesquisa */}
      <section id="artigos" className="py-16 bg-white border-y border-purple-50 sticky top-[72px] z-40 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Qual assunto você gostaria de ler hoje?" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:border-purple-300 transition-all font-light text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Lista de Artigos Otimizada */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPosts.map((post, i) => (
              <motion.article 
                key={post.slug} 
                {...scrollAnimation(fadeUp)}
                transition={{ delay: (i % 3) * 0.1 }}
                className="flex flex-col group h-full"
              >
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] rounded-[32px] overflow-hidden mb-6 shadow-sm border border-slate-100">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                     <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold text-purple-600 uppercase tracking-[0.15em] shadow-sm">
                       {post.category}
                     </span>
                  </div>
                </Link>
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-serif text-slate-900 mb-4 group-hover:text-purple-600 transition-colors leading-tight italic">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  
                  <p className="text-slate-500 font-light text-sm mb-8 line-clamp-3 leading-relaxed">
                    {post.seoDescription}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-50 mt-auto">
                   <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-purple-600 font-bold uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all">
                     Ler Artigo Completo <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
              </motion.article>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-20 grayscale">
              <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-400 font-light text-xl">Nenhum artigo encontrado para sua busca.</p>
              <button 
                onClick={() => {setActiveCategory('Todos'); setSearchQuery('');}}
                className="mt-6 text-purple-600 font-bold uppercase tracking-widest text-sm underline underline-offset-8"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Sobre o Atendimento (Neutro) */}
      <section id="sobre" className="py-24 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...scrollAnimation(fadeUp)} className="relative">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl relative z-10">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Psicóloga Profissional" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-purple-200 rounded-full blur-[60px] opacity-50 -z-0" />
            </motion.div>
            
            <motion.div {...scrollAnimation(fadeUp)}>
              <h2 className="text-4xl font-serif text-slate-900 mb-6 italic">Acolhimento e Ciência</h2>
              <p className="text-lg text-slate-600 font-light mb-8 leading-relaxed">
                Nossos atendimentos são baseados no respeito à singularidade de cada indivíduo. Oferecemos um suporte profissional pautado na ética e no compromisso com a saúde mental, acolhendo pacientes de todas as idades e contextos.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "CRP Ativo", value: "Registro Profissional em dia" },
                  { title: "Público", value: "Adultos e Adolescentes" },
                  { title: "Formato", value: "Online e Presencial" },
                  { title: "Foco", value: "Saúde Mental Plena" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold leading-none mb-1">{item.title}</span>
                      <span className="text-slate-800 font-semibold text-sm">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Área Final de Impacto */}
      <section className="py-24 md:py-40 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div {...scrollAnimation(fadeUp)}>
            <Heart className="w-16 h-16 text-purple-500 mx-auto mb-10 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-serif mb-10 italic">O cuidado que sua mente merece.</h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-16 font-light leading-relaxed max-w-2xl mx-auto">
              A psicoterapia é um investimento em si mesmo. Ofereça a você o espaço necessário para crescer e florescer.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="https://wa.me/5544988446371" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-3 px-14 py-6 bg-green-500 text-white font-bold text-xl rounded-full shadow-2xl hover:bg-green-600 hover:scale-[1.05] transition-all">
                <MessageCircle className="w-6 h-6" /> WhatsApp
              </a>
              <Link to="/cadastrar" className="w-full sm:w-auto px-14 py-6 bg-purple-600 text-white font-bold text-xl rounded-full shadow-2xl hover:bg-purple-700 hover:scale-[1.05] transition-all">
                Iniciar Agora
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 bg-slate-900 border-t border-white/5 text-center px-6">
        <div className="mb-6">
          <Link to="/melhor-sistema-para-psicologos" className="text-purple-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
            Por que psicólogos precisam de um sistema de gestão?
          </Link>
        </div>
        <div className="mb-8">
          <span className="text-2xl font-serif italic text-white">Meu Sistema Psi</span>
        </div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; 2026 — Compromisso com a Saúde Mental Mundial em Sintropia.
        </p>
      </footer>
    </div>
  );
}


