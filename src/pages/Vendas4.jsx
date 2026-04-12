import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Check, Shield, Heart, Sparkles, ArrowRight, 
  Clock, Lock, Zap, BarChart3, Users, 
  ChevronRight, Brain, Star, Award,
  Target, TrendingUp, Gem
} from 'lucide-react';

// Assets
import highEndOffice from '../assets/high_end_office.png';
import authorityStatus from '../assets/authority_status.png';
import dashboardImg from '../assets/screens/dashboard.png';

export default function Vendas4() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // SEO Meta Tags
    document.title = "Sistema para Clínica de Alto Padrão | Meu Sistema PSI";
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    updateMeta('description', 'Aumente sua autoridade clínica e ganhe tempo precioso. O software de elite para psicólogos que buscam uma gestão de alto padrão e segurança absoluta.');
    updateMeta('keywords', 'software para psicólogos premium, sistema psicologia alto padrão, prontuário eletrônico seguro, gestão clínica psicologia, software psicologia LGPD, agenda psicólogo');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://meusistemapsi.com.br/vendas5');

    const updateOg = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    updateOg('og:title', 'Sistema para Clínica de Alto Padrão | Meu Sistema PSI');
    updateOg('og:description', 'Aumente sua autoridade clínica e ganhe tempo precioso. O software de elite para psicólogos que buscam uma gestão de alto padrão e segurança absoluta.');
    updateOg('og:url', 'https://meusistemapsi.com.br/vendas4');
    updateOg('og:image', 'https://meusistemapsi.com.br/og-image.png');

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15
      }
    }
  };

  const scaleUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
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
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* Premium Glass Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'py-4 bg-white/80 backdrop-blur-2xl border-b border-purple-50 shadow-sm' : 'py-8 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="p-2.5 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20 group-hover:rotate-6 transition-all duration-500">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              MEU SISTEMA <span className="text-purple-600">PSI</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Diferenciais', 'Segurança', 'Autoridade', 'Planos'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-purple-600 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-all">Entrar</Link>
            <Link to="/cadastrar" className="px-7 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-600/20 active:scale-95 transition-all outline-none">
              Início Imediato
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero: High-Standard Elite Branding */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-48 overflow-hidden">
        {/* Soft Aura Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <motion.div {...safeAnimation(staggerContainer)} className="lg:col-span-7">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-[9px] font-black uppercase tracking-[0.25em] mb-10">
                <Gem className="w-3.5 h-3.5" /> Padrão Ouro em Gestão Clínica
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-6xl lg:text-[5.5rem] font-serif font-black text-slate-900 leading-[0.9] mb-10 tracking-tighter">
                Sua clínica de <br/>
                <span className="italic bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">alto padrão,</span> <br/>
                em um clique.
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-xl text-slate-500 max-w-xl mb-12 font-light leading-relaxed">
                Recupere até 10 horas da sua semana. O **Meu Sistema PSI** combina inteligência artificial com simplicidade extrema para elevar sua autoridade profissional e blindar sua clínica.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6">
                <Link to="/cadastrar" className="group px-10 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.25em] rounded-full shadow-2xl hover:bg-purple-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                  Experimentar Grátis <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
                <div className="flex flex-col justify-center">
                  <div className="flex -space-x-2 mb-1">
                    {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />)}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">+2.5k Psicólogos de Sucesso</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border-[12px] border-white">
                <img src={highEndOffice} alt="Consultório de luxo psicoterapia" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent" />
              </div>
              
              {/* Floating Dashboard Card */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-10 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-purple-50 max-w-[200px] hidden xl:block"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-2xl mb-4 flex items-center justify-center text-purple-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status de Evolução</p>
                <p className="text-lg font-black text-slate-900">Alta Clínica +12%</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Pillar: Ganho de Tempo (IA + Clique) */}
      <section id="diferenciais" className="py-24 lg:py-40 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div {...scrollAnimation(staggerContainer)}>
              <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-serif font-black text-slate-900 mb-10 leading-tight">
                Seu tempo é seu ativo <br/> <span className="text-purple-600 italic">mais valioso.</span>
              </motion.h2>
              
              <div className="space-y-12">
                <motion.div variants={fadeUp} className="flex gap-8 items-start group">
                  <div className="p-4 bg-white rounded-[2rem] shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">Simplicidade de um Clique</h3>
                    <p className="text-slate-500 font-light leading-relaxed">Deixe o papel para trás. Agende, fature e registre com um único toque. Interface minimalista desenhada para eliminar a carga cognitiva.</p>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex gap-8 items-start group">
                  <div className="p-4 bg-white rounded-[2rem] shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">Tecnologia Invisível (IA)</h3>
                    <p className="text-slate-500 font-light leading-relaxed">Nossa IA traduz suas notas em evoluções clínicas estruturadas e resumidas. Você foca no paciente, nós cuidamos da documentação.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-50px" }}
              className="relative p-2 bg-white rounded-[4rem] shadow-2xl border border-purple-50"
            >
              <img src={dashboardImg} alt="Interface Meu Sistema PSI" className="rounded-[3.5rem] w-full h-auto" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-2xl animate-pulse cursor-pointer">
                <Sparkles className="w-8 h-8" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authority Pillar: Aumento de Status */}
      <section id="autoridade" className="py-24 lg:py-48 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-20 items-center">
            <motion.div 
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-50px" }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border-[8px] border-slate-50">
                <img src={authorityStatus} alt="Autoridade profissional psicologia" className="w-full h-auto" />
                <div className="absolute top-6 left-6 p-4 bg-white/40 backdrop-blur-3xl border border-white/20 rounded-3xl">
                  <Award className="w-10 h-10 text-slate-900" />
                </div>
              </div>
            </motion.div>

            <motion.div {...scrollAnimation(staggerContainer)} className="lg:col-span-7">
              <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-serif font-black text-slate-900 mb-10 leading-tight">
                Seja percebido como <br/> uma <span className="italic text-purple-600">Autoridade de Elite.</span>
              </motion.h2>
              
              <motion.p variants={fadeUp} className="text-xl text-slate-500 font-light leading-relaxed mb-12">
                O valor da sua sessão está diretamente ligado à percepção do seu profissionalismo. O **Meu Sistema PSI** organiza sua clínica para que cada interação — do agendamento ao faturamento — transmita confiança absoluta.
              </motion.p>

              <div className="grid sm:grid-cols-2 gap-8 mb-16">
                {[
                  { icon: Shield, title: "Sigilo Exemplar", t: "Segurança LGPD que blinda sua reputação ética." },
                  { icon: Target, title: "Precisão Clínica", t: "O Bio-Painel demonstra o valor do seu trabalho ao paciente." }
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-slate-900 transition-all duration-500">
                    <item.icon className="w-8 h-8 text-purple-600 mb-4 group-hover:text-white" />
                    <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-white transition-colors">{item.title}</h4>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 font-light">{item.t}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeUp}>
                <Link to="/cadastrar" className="inline-flex items-center gap-4 text-slate-900 font-black text-xs uppercase tracking-[0.3em] group">
                  Sua Carreira de Alto Padrão Começa Aqui <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Strategic CTA (No Pricing) */}
      <section id="planos" className="py-24 lg:py-40 bg-slate-900 text-white rounded-[4rem] lg:rounded-[10rem] mx-4 my-8 overflow-hidden relative text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div {...scrollAnimation(staggerContainer)}>
            <motion.h2 variants={fadeUp} className="text-5xl lg:text-8xl font-serif font-black mb-10 tracking-tighter">
              Eleve o nível do seu <br/> <span className="italic text-purple-400 text-6xl lg:text-7xl block mt-4">atendimento hoje.</span>
            </motion.h2>
            
            <motion.div variants={fadeUp} className="bg-white/5 backdrop-blur-3xl border border-white/5 p-12 lg:p-24 rounded-[4rem] shadow-2xl">
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.5em] block mb-8">Acesso Exclusivo</span>
              
              <p className="text-xl lg:text-2xl font-light text-slate-300 mb-16 leading-relaxed max-w-2xl mx-auto">
                Deixe a burocracia para trás e foque no que realmente importa: **seus pacientes.** Experimente a gestão de elite por 30 dias.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
                {['Prontuário de Elite', 'IA de Evolução', 'Sigilo Absoluto'].map(it => (
                  <div key={it} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Check className="w-4 h-4 text-purple-500" />
                    {it}
                  </div>
                ))}
              </div>

              <Link to="/cadastrar" className="group inline-flex items-center gap-6 px-16 py-8 bg-white text-slate-900 font-black text-xs uppercase tracking-[0.3em] rounded-full hover:bg-purple-50 hover:scale-105 active:scale-95 transition-all outline-none">
                Iniciar Experiência Ouro <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
              </Link>
              
              <div className="mt-12 flex justify-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                <span>✓ Sem cartão de crédito</span>
                <span>✓ 30 dias de presente</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sophisticated Footer */}
      <footer className="py-24 bg-white border-t border-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-1.5 bg-slate-900 rounded-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 uppercase">MEU SISTEMA <span className="text-purple-600">PSI</span></span>
              </div>
              <p className="text-slate-500 font-light text-sm max-w-xs leading-relaxed">
                Elevando o padrão da gestão clínica para psicólogos que buscam autoridade e excelência.
              </p>
            </div>
            
            <div className="flex gap-20">
              {['Produto', 'Legal', 'Contato'].map(section => (
                <div key={section}>
                  <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-8">{section}</h4>
                  <div className="space-y-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <p className="hover:text-purple-600 cursor-pointer transition-colors">Mais Destaques</p>
                    <p className="hover:text-purple-600 cursor-pointer transition-colors">Segurança</p>
                    <p className="hover:text-purple-600 cursor-pointer transition-colors">Suporte</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5em]">© 2026 Meu Sistema PSI — O Padrão Ouro da Psicologia.</p>
            <div className="flex gap-8 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="hover:text-slate-900 cursor-pointer">Privacidade</span>
              <span className="hover:text-slate-900 cursor-pointer">Termos</span>
              <span className="hover:text-slate-900 cursor-pointer">Ética CFP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


