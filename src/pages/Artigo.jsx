import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Calendar, Share2, 
  MessageCircle, Heart, ChevronRight, 
  ArrowRight, Instagram, Linkedin, Facebook 
} from 'lucide-react';
import { blogPosts } from '../data/blogData';

export default function Artigo() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Blog Meu Sistema Psi`;
      
      const updateMeta = (name, content) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMeta('description', post.seoDescription);
      updateMeta('keywords', post.seoKeywords);

      // Canonical
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://meusistemapsi.com.br/blog/${post.slug}`);

      // Scroll to top
      window.scrollTo(0, 0);
    }
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.slug !== post.slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      
      {/* Article Header */}
      <header className="pt-32 pb-16 bg-slate-50 border-b border-purple-50">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-purple-600 font-bold uppercase tracking-widest text-xs mb-8 hover:gap-4 transition-all">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
          </Link>
          
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex items-center gap-4 text-xs font-bold text-purple-600 uppercase tracking-widest mb-6">
              <span className="bg-purple-100 px-3 py-1 rounded-full">{post.category}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-slate-400">{post.date}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif text-slate-900 mb-8 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between py-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  P
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-900 leading-none mb-1">Psicologia Clínica</span>
                  <span className="block text-xs text-slate-400 font-medium">Equipe Meu Sistema Psi</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {post.readTime}
                </div>
                <button className="p-2 hover:text-purple-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20">
        <article className="max-w-3xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp}
            className="prose prose-slate prose-lg max-w-none"
          >
            <div className="rounded-[40px] overflow-hidden mb-16 shadow-2xl">
              <img src={post.image} alt={post.title} className="w-full h-auto" />
            </div>
            
            <div 
              className="article-body text-lg text-slate-600 font-light leading-relaxed space-y-8"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </motion.div>
          
          {/* Share / Tags section */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-4">Compartilhar</span>
              <div className="flex gap-4">
                <Instagram className="w-5 h-5 text-slate-400 hover:text-purple-600 cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 text-slate-400 hover:text-purple-600 cursor-pointer transition-colors" />
                <Facebook className="w-5 h-5 text-slate-400 hover:text-purple-600 cursor-pointer transition-colors" />
              </div>
            </div>
            <Link to="/blog" className="text-purple-600 font-bold uppercase tracking-widest text-xs">
              Ver mais conteúdos
            </Link>
          </div>
        </article>
      </main>

      {/* Related Posts */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-serif text-slate-900 mb-12">Leia também</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((rp, i) => (
              <Link to={`/blog/${rp.slug}`} key={i} className="group cursor-pointer">
                <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100">
                  <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-4">
                  <span>{rp.category}</span>
                </div>
                <h3 className="text-xl font-serif text-slate-900 mb-4 group-hover:text-purple-600 transition-colors leading-tight line-clamp-2">
                  {rp.title}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                   Ler Artigo <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Footer CTA */}
      <section className="py-24 md:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Heart className="w-12 h-12 text-purple-400 mx-auto mb-8" />
            <h2 className="text-5xl md:text-6xl font-serif mb-8 italic">Você não precisa lidar com tudo sozinho.</h2>
            <p className="text-xl text-slate-400 mb-14 font-light leading-relaxed">
              O autoconhecimento é o caminho para uma vida com mais sintropia e equilíbrio. Vamos conversar?
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a href="https://wa.me/5544988446371" className="flex items-center gap-3 px-12 py-5 bg-green-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all">
                <MessageCircle className="w-6 h-6" /> WhatsApp
              </a>
              <Link to="/cadastrar" className="px-12 py-5 bg-purple-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-purple-700 hover:scale-105 transition-all">
                Agendar Consulta
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 bg-slate-900 border-t border-white/5 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        <div className="mb-4">
          <Link to="/melhor-sistema-para-psicologos" className="text-purple-400 hover:text-white transition-colors">
            Por que psicólogos precisam de um sistema? Conheça o Meu Sistema Psi
          </Link>
        </div>
        &copy; 2026 Meu Sistema Psi — Saúde Mental e Sintropia Clínica.
      </footer>
    </div>
  );
}
