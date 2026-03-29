import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Shield, Heart, Sparkles, ArrowRight, 
  Clock, Lock, Zap, BarChart3, Users, 
  ChevronRight, Brain, Star, Award
} from 'lucide-react';

// Assets
import zenHero from '../assets/zen_tech_hero.png';
import aiInsight from '../assets/ai_insight.png';
import dashboardImg from '../assets/screens/dashboard.png';

export default function Vendas4() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // SEO Meta Tags
    document.title = "A Nova Era na Psicologia | Prontuário, Gestão e IA | Meu Sistema Psi";
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    updateMeta('description', 'O equilíbrio perfeito entre a tecnologia de ponta e o acolhimento humano. Sistema para psicólogos com Bio-Painel, IA e segurança absoluta.');
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 font-sans selection:bg-purple-500/30">
      
      {/* Dynamic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-[#0a0f1dc0] backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-8 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-white fill-white/20" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">
              MindCare <span className="text-purple-500">OS</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Inovação', 'Segurança', 'Acolhimento', 'Preços'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-400 hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-300 hover:text-white transition-colors">Entrar</Link>
            <Link to="/cadastrar" className="px-6 py-3 bg-white text-slate-900 font-black text-xs uppercase tracking-widest rounded-full hover:bg-purple-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section: Zen-Tech Fusion */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <Sparkles className="w-3 h-3" /> A Nova Era da Psicologia Clínica
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-6xl lg:text-8xl font-serif font-black text-white leading-[0.95] mb-8 tracking-tighter">
              A inteligência que <br/>
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-slate-200 bg-clip-text text-transparent italic">te devolve o tempo.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-slate-400 max-w-xl mb-12 font-light leading-relaxed">
              O MindCare OS une a precisão tecnológica do faturamento e prontuário seguro com o acolhimento zen de um design pensado para o seu bem-estar e do seu paciente.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-6">
              <Link to="/cadastrar" className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.03] transition-all flex items-center justify-center gap-3">
                Ativar Minha Clínica <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 px-6 text-slate-500 font-bold text-xs uppercase tracking-widest truncate">
                <Users className="w-5 h-5 text-purple-500/50" /> +2.500 Psicólogos Ativos
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-[60px] overflow-hidden border border-white/10 shadow-[0_0_100px_-20px_rgba(168,85,247,0.3)]">
              <img src={zenHero} alt="MindCare OS Zen Tech Fusion" className="w-full h-auto hover:scale-105 transition-transform duration-1000" />
            </div>
            {/* Holographic Element */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 z-20 p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl max-w-[240px] hidden md:block"
            >
              <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
              <div className="h-1.5 w-full bg-white/10 rounded-full mb-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 2 }} className="h-full bg-purple-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Evolução Clínica do Paciente</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section: Bio-Painel & AI */}
      <section id="inovação" className="py-24 lg:py-48 bg-[#0a0f1d] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="text-4xl lg:text-6xl font-serif font-black text-white mb-6"
            >
              Tecnologia Elevada a <span className="text-purple-500 italic">Ciência.</span>
            </motion.h2>
            <motion.p 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="text-xl text-slate-500 max-w-2xl mx-auto font-light"
            >
              Sua intuição clínica agora tem suporte de dados. O Bio-Painel organiza o progresso, enquanto a IA cuida do resto.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <div className="space-y-12">
                {[
                  { icon: Brain, title: "Bio-Painel Exclusivo", desc: "Transforme observações de sessões em gráficos de tendência emocional. Veja o progresso do paciente com clareza matemática." },
                  { icon: Zap, title: "Assistente de Evolução (IA)", desc: "Resumos estruturados em segundos. Nossa IA sugere padrões baseados na TCC, Psicanálise e outras abordagens." },
                  { icon: Clock, title: "Foco 100% no Atendimento", desc: "Reduza o tempo de preenchimento em 70%. Mais tempo para olhar nos olhos do paciente, menos tempo na tela." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex-shrink-0 w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{item.title}</h3>
                      <p className="text-slate-500 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 100 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="relative p-1 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-[60px]"
            >
              <div className="bg-[#0f172a] rounded-[58px] overflow-hidden shadow-2xl">
                <img src={aiInsight} alt="IA Insight MindCare OS" className="w-full h-auto opacity-90" />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="segurança" className="py-24 lg:py-32 bg-white text-[#0a0f1d] relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="order-2 md:order-1">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-12 bg-slate-50 rounded-[60px] border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl" />
              <Shield className="w-16 h-16 text-purple-600 mb-8" />
              <h3 className="text-4xl font-serif font-black mb-6">Sua paz jurídica <br/> é inegociável.</h3>
              <p className="text-lg text-slate-600 font-light mb-10 leading-relaxed">
                Prontuários com criptografia de grau bancário. Servidores 100% em conformidade com a LGPD e normativas do CFP. Seus dados nunca estiveram tão seguros.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Criptografia AES-256', 'Backup em Tempo Real', 'Sigilo Absoluto'].map(badge => (
                  <span key={badge} className="px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="order-1 md:order-2">
            <motion.h2 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="text-5xl lg:text-7xl font-serif font-black leading-none mb-8 tracking-tighter"
            >
              Para quem entende <br/> que segurança <br/> <span className="text-purple-600 italic">é status.</span>
            </motion.h2>
            <p className="text-lg text-slate-500 font-light mb-8 max-w-sm">
              Demonstre profissionalismo de elite para seus pacientes com um sistema que prioriza o sigilo.
            </p>
            <Link to="/cadastrar" className="inline-flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
              Ver especificações técnicas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section id="preços" className="py-24 lg:py-48 bg-[#0a0f1d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_50%)]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeIn} className="text-5xl lg:text-8xl font-serif font-black text-white mb-10 tracking-tighter">
              A clínica que você <br/> <span className="italic text-purple-500">sempre sonhou.</span>
            </motion.h2>
            
            <motion.div variants={fadeIn} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 lg:p-20 rounded-[80px] shadow-2xl relative">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-500/20 text-green-400 rounded-full font-black text-[10px] uppercase tracking-widest mb-10">
                <Award className="w-4 h-4" /> Oferta Exclusiva: 1 Mês Grátis
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-12 mb-16 items-center">
                <div className="text-left">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Assinatura Mensal</p>
                  <div className="flex items-end gap-1">
                    <span className="text-white text-4xl font-black">R$</span>
                    <span className="text-white text-8xl font-black tracking-tighter">29</span>
                    <span className="text-slate-400 text-2xl font-bold mb-3">,90</span>
                  </div>
                </div>
                <div className="h-20 w-px bg-white/10 hidden md:block" />
                <div className="grid grid-cols-1 gap-4 text-left">
                  {['Pacientes Ilimitados', 'Acesso pelo Celular', 'Painel de IA Ativo'].map(it => (
                    <div key={it} className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      {it}
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/cadastrar" className="w-full lg:w-auto px-16 py-6 bg-white text-[#0a0f1d] font-black text-sm uppercase tracking-[0.2em] rounded-3xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-4 group">
                Criar Minha Conta Grátis <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <p className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Sem contrato de fidelidade. Cancele quando quiser.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#0a0f1d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-6 h-6 text-purple-600 fill-purple-600" />
                <span className="text-xl font-black text-white uppercase tracking-tighter">MindCare OS</span>
              </div>
              <p className="text-slate-500 font-light text-sm max-w-xs">
                Inovando o cuidado em saúde mental através da tecnologia disruptiva e do design de elite.
              </p>
            </div>
            
            <div className="flex gap-16">
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Produto</h4>
                <div className="space-y-4 text-slate-500 text-xs font-bold">
                  <p className="hover:text-white cursor-pointer transition-colors">Funcionalidades</p>
                  <p className="hover:text-white cursor-pointer transition-colors">Segurança</p>
                  <p className="hover:text-white cursor-pointer transition-colors">Blog</p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Suporte</h4>
                <div className="space-y-4 text-slate-500 text-xs font-bold">
                  <p className="hover:text-white cursor-pointer transition-colors">FAQ</p>
                  <p className="hover:text-white cursor-pointer transition-colors">WhatsApp</p>
                  <p className="hover:text-white cursor-pointer transition-colors">Status</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">© 2026 MindCare OS — Made for the Excellence.</p>
            <div className="flex gap-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              <span className="hover:text-white cursor-pointer">Termos</span>
              <span className="hover:text-white cursor-pointer">Privacidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
