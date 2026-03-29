import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Home, ArrowRight, Sparkles, Shield, Rocket, HelpCircle } from 'lucide-react';
import creative404 from '../assets/404_creative.png'; // Vou linkar a imagem gerada

export default function NotFound() {
  useEffect(() => {
    document.title = "Página Não Encontrada | Meu Sistema Psi";
    
    // SEO Meta Tags for 404
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', 'Ops! Esta página não existe no Meu Sistema Psi, mas sua clínica pode existir com perfeição. Conheça o software de gestão para psicólogos líder em inovação.');
    updateMeta('robots', 'noindex, follow'); // Don't index 404 pages but follow links
  }, []);

  const bounce = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Creative Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative group"
        >
          <motion.div {...bounce} className="relative z-10">
            <img 
              src={creative404} 
              alt="Mente Criativa 404 MindCare OS" 
              className="w-full h-auto rounded-[60px] shadow-[0_0_80px_-20px_rgba(168,85,247,0.4)] border border-white/10"
            />
          </motion.div>
          {/* Decorative Ring */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent blur-3xl -z-1 group-hover:scale-110 transition-transform duration-1000" />
        </motion.div>

        {/* Right Side: Content */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUp}
          className="text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-purple-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" /> Labirinto Digital
          </div>

          <h1 className="text-7xl md:text-9xl font-serif font-black mb-4 tracking-tighter bg-gradient-to-r from-white via-purple-100 to-slate-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
            A peça que faltava<br/><span className="text-purple-400">não está aqui.</span>
          </h2>
          
          <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">
            O endereço que você buscou parece ter se desconectado. Mas no <strong>Meu Sistema Psi</strong>, sua clínica nunca fica offline. Aproveite este momento para profissionalizar sua gestão.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="p-5 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
              <Shield className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="font-bold text-sm mb-1">Sigilo Absoluto</h3>
              <p className="text-xs text-slate-500 leading-tight">Criptografia de ponta a ponta para seus prontuários.</p>
            </div>
            <div className="p-5 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
              <Heart className="w-6 h-6 text-pink-400 mb-3" />
              <h3 className="font-bold text-sm mb-1">Foco no Paciente</h3>
              <p className="text-xs text-slate-500 leading-tight">Menos telas, mais conexões humanas profundas.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/" 
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-white/5"
            >
              <Home className="w-5 h-5" /> Início
            </Link>
            <Link 
              to="/cadastrar" 
              className="px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-purple-600/20"
            >
              <Rocket className="w-5 h-5" /> Começar Grátis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="mt-12 text-slate-500 text-sm flex items-center gap-2">
            Precisa de ajuda? <HelpCircle className="w-4 h-4" /> <a href="mailto:ajuda@meusistemapsi.com.br" className="text-purple-400 hover:underline">Fale conosco</a>
          </p>
        </motion.div>
      </div>

      {/* Corporate Logo Floating */}
      <div className="absolute bottom-10 left-10 opacity-20 hidden lg:flex items-center gap-2">
        <Heart className="w-6 h-6" />
        <span className="font-bold tracking-tighter">MEUSISTEMAPSI</span>
      </div>
    </div>
  );
}
