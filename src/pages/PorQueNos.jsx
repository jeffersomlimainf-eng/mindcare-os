import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  CheckCircle2, AlertCircle, Clock, ShieldCheck, 
  TrendingUp, Zap, MessageCircle, Heart, 
  LayoutDashboard, CalendarRange, Wallet, Lock,
  ArrowRight, Sparkles, Star
} from 'lucide-react';

export default function PorQueNos() {
  useEffect(() => {
    // SEO Dynamic Injection
    document.title = "Melhor Sistema para Psicólogos — Por que usar o Meu Sistema Psi?";
    
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', 'Descubra por que psicólogos modernos precisam de um sistema de gestão integrado. Conheça as vantagens da agenda, financeiro e prontuário digital com o Meu Sistema Psi.');
    updateMeta('keywords', 'melhor sistema para psicólogos, software de gestão psicologia, agenda online psicologia, controle financeiro consultório');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://meusistemapsi.com.br/melhor-sistema-para-psicologos');

    window.scrollTo(0, 0);
  }, []);

  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
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

  const reasons = [
    {
      icon: <CalendarRange className="w-8 h-8" />,
      title: "Elimine o Furo na Agenda",
      description: "Esquecimentos e buracos na grade são perdas financeiras diretas. Um sistema automatizado avisa seus pacientes por WhatsApp e organiza sua semana em segundos.",
      benefit: "Até 30% mais sessões confirmadas."
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Controle Financeiro Real",
      description: "Chega de planilhas confusas. Saiba exatamente quem pagou, quem deve e qual seu lucro real no mês com relatórios de faturamento automáticos.",
      benefit: "Gestão impecável do fluxo de caixa."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Segurança e Sigilo (LGPD)",
      description: "Prontuários em papel ou arquivos locais são vulneráveis. No Meu Sistema Psi, seus dados são criptografados e seguem todas as normas do CFP e LGPD.",
      benefit: "Tranquilidade jurídica e ética total."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      
      {/* 1. Hero: O Consultório de Papel Ficou no Passado */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-50 to-transparent -z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...safeAnimation(fadeUp)} className="max-w-4xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 font-bold text-xs uppercase tracking-[0.2em] mb-8 border border-purple-100">
               Estratégia & Gestão Clínica
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-10 leading-[1.05]">
              Por que o psicólogo moderno não pode mais depender de <span className="text-purple-600">agendas de papel</span>?
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 font-light leading-relaxed max-w-3xl">
              Gerenciar um consultório envolve mais do que apenas atender. Envolve tempo, segurança e controle. Descubra como um sistema profissional transforma sua carreira.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/cadastrar" className="px-12 py-5 bg-purple-600 text-white rounded-full font-bold text-xl shadow-2xl hover:bg-purple-700 hover:scale-[1.03] transition-all">
                Testar Grátis por 30 dias
              </Link>
              <a href="#vantagens" className="px-12 py-5 border-2 border-slate-200 text-slate-500 rounded-full font-bold text-xl hover:bg-slate-50 transition-all">
                Ver diferenciais
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. O Caos vs. A Sintropia */}
      <section id="vantagens" className="py-24 md:py-32 bg-slate-50 border-y border-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 italic">Você gasta mais tempo em burocracia do que em clínica?</h2>
            <p className="text-slate-500 font-light text-xl max-w-2xl mx-auto">
              Muitos profissionais perdem horas preciosas organizando prontuários e conferindo transferências bancárias. <strong>Isso não é clínica, é tarefa administrativa.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reasons.map((reason, i) => (
                <motion.div 
                  key={i}
                  {...scrollAnimation(fadeUp)}
                  transition={{ delay: i * 0.2 }}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:translate-y-[-8px] transition-all group"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  {reason.icon}
                </div>
                <h3 className="text-2xl font-serif mb-4 text-slate-900">{reason.title}</h3>
                <p className="text-slate-500 font-light mb-8 leading-relaxed">
                  {reason.description}
                </p>
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" /> {reason.benefit}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Por que o Meu Sistema Psi? Differential Section */}
      <section className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div {...scrollAnimation(fadeUp)}>
              <span className="text-purple-600 font-bold text-sm uppercase tracking-[0.3em] mb-6 block">Nosso Diferencial</span>
              <h2 className="text-4xl md:text-6xl font-serif text-slate-900 mb-10 leading-tight">
                Criado para Psicólogos, <span className="italic">por quem entende</span> de Psicologia.
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Simplicidade Real", desc: "Chega de softwares que parecem ERP de empresas. Nossa interface é limpa, acolhedora e foca no que importa: o paciente." },
                  { title: "Integração WhatsApp", desc: "Seu sistema 'fala' com seu paciente. Lembretes automáticos que reduzem faltas em até 80%." },
                  { title: "Sintropia Clínica", desc: "Otimizamos seu fluxo para que tudo esteja a no máximo 2 cliques de distância." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-500 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              {...scrollAnimation(fadeUp)}
              className="relative"
            >
              <div className="aspect-square bg-slate-50 rounded-[60px] p-8 shadow-inner border border-slate-100 flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex flex-col items-center">
                    <LayoutDashboard className="w-10 h-10 text-purple-600 mb-4" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Dashboard</span>
                  </div>
                  <div className="bg-purple-600 p-6 rounded-3xl shadow-lg border border-purple-500 flex flex-col items-center text-white">
                    <Sparkles className="w-10 h-10 mb-4" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">IA Clínica</span>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex flex-col items-center">
                    <MessageCircle className="w-10 h-10 text-purple-600 mb-4" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">WhatsApp</span>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex flex-col items-center">
                    <ShieldCheck className="w-10 h-10 text-purple-600 mb-4" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">LGPD</span>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-purple-200 rounded-full blur-[80px] opacity-40" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Tabela de Comparação SEO-Focused */}
      <section className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-16 italic">Não somos apenas mais um software. Somos o seu parceiro clínico.</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 font-bold text-slate-400 uppercase tracking-widest text-xs">Recurso</th>
                  <th className="py-6 font-bold text-white uppercase tracking-widest text-xs">Sistemas Genéricos</th>
                  <th className="py-6 font-bold text-purple-400 uppercase tracking-widest text-xs">Meu Sistema Psi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Interface para Psicólogos", "Complexa / Médicos", "Simples / Acolhedora"],
                  ["IA para Evolução", "Não disponível", "Incluso (Otimização 10/10)"],
                  ["Foco em Sintropia", "Desconhecido", "Total (Fluidez Clínica)"],
                  ["Suporte Especializado", "Suporte Geral", "Suporte para Profissionais Psi"],
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-8 text-slate-400 font-light">{row[0]}</td>
                    <td className="py-8 font-light italic">{row[1]}</td>
                    <td className="py-8 font-bold text-white flex items-center gap-2">
                       <Zap className="w-4 h-4 text-purple-400" /> {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. CTA Final Re-Focus */}
      <section className="py-24 md:py-40 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...scrollAnimation(fadeUp)}>
            <Heart className="w-12 h-12 text-purple-600 mx-auto mb-10" />
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 mb-10 leading-tight">
              Sua clínica merece a <span className="text-purple-600">Sintropia</span> que oferecemos.
            </h2>
            <p className="text-xl text-slate-500 mb-14 font-light leading-relaxed max-w-2xl mx-auto">
              Liberte-se das planilhas e das anotações perdidas. Comece hoje sua transformação digital com o melhor parceiro clínico.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/cadastrar" className="w-full sm:w-auto px-12 py-5 bg-purple-600 text-white font-bold text-xl rounded-full shadow-2xl hover:bg-purple-700 hover:scale-105 transition-all">
                Começar agora gratuitamente
              </Link>
              <a href="https://wa.me/5544988446371" className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-green-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all">
                <MessageCircle className="w-6 h-6" /> Falar com Consultor
              </a>
            </div>
            <p className="mt-8 text-slate-400 text-sm font-light">30 dias grátis. Use sem compromisso. Sem cartão de crédito.</p>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 bg-slate-900 text-center px-6">
        <span className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; 2026 — Meu Sistema Psi. O Futuro da Psicologia Clínica.
        </span>
      </footer>
    </div>
  );
}


