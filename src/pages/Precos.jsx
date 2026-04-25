import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Check, Heart, ArrowRight, Shield, 
  Zap, Star, HelpCircle, MessageCircle,
  CreditCard, Clock, Lock, Sparkles,
  Layout, Rocket, Calendar
} from 'lucide-react';
import { showToast } from '../components/Toast';
import AiAssistantAnimation from '../components/AiAssistantAnimation';

export default function Precos() {
  const shouldReduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // SEO Dynamic Injection
    document.title = "Preços e Planos — Meu Sistema Psi | Gestão para Psicólogos";
    
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', 'Escolha o plano ideal para sua clínica de psicologia. Planos a partir de R$ 28,91/mês com Agenda, Prontuário LGPD e inteligência Artificial.');
    updateMeta('keywords', 'preços sistema psicologia, planos software psicólogos, gestão clínica valor, prontuário eletrônico preço, ia para psicólogos');

    window.scrollTo(0, 0);
  }, []);

  // Animation Helpers
  const fadeUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const scrollAnimation = (variants) => ({
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-50px" },
    variants: variants
  });

  const plans = [
    {
      name: "Essencial",
      price: "39,90",
      period: "/mês",
      icon: Layout,
      color: "blue",
      btnColor: "bg-[#1392ec] hover:bg-[#1181d1]",
      features: [
        "Agenda inteligente",
        "Prontuário eletrônico",
        "Pacientes ilimitados",
        "Gestão financeira"
      ],
      link: "/cadastrar?plan=essencial"
    },
    {
      name: "Profissional",
      price: "44,90",
      period: "/mês",
      icon: Rocket,
      color: "blue",
      btnColor: "bg-[#1392ec] hover:bg-[#1181d1]",
      popular: true,
      ai: true,
      features: [
        "Tudo do Essencial",
        "IA: Resumos de Sessão",
        "IA: Sugestão de Temas",
        "Lembretes WhatsApp"
      ],
      link: "/cadastrar?plan=profissional"
    },
    {
      name: "Plano Anual",
      price: "28,91",
      period: "/mês",
      subtext: "12X DE R$ 28,91 OU R$ 346,92 À VISTA",
      icon: Calendar,
      color: "orange",
      btnColor: "bg-[#f59e0b] hover:bg-[#d97706]",
      highlight: true,
      ai: true,
      badge: "MELHOR VALOR",
      features: [
        "Tudo do Profissional",
        "Desconto Especial (55%)",
        "1 Ano de Acesso Total",
        "Suporte Prioritário"
      ],
      link: "/cadastrar?plan=anual"
    }
  ];

  const faqs = [
    {
      q: "Preciso de cartão de crédito para o teste grátis?",
      a: "Não! Você pode criar sua conta e usar todas as funcionalidades por 7 dias (ou conforme promoção atual) sem informar nenhum dado de pagamento."
    },
    {
      q: "Existe taxa de cancelamento ou fidelidade?",
      a: "No plano mensal, nenhuma. No plano anual, você garante um desconto de 55% pelo compromisso de 12 meses."
    },
    {
      q: "O que é o selo AI ATIVA?",
      a: "Significa que o plano inclui acesso total aos nossos recursos de Inteligência Artificial Generativa, como transcrição automática de áudio, resumos clínicos e sugestão de conduta baseada em abordagens teóricas."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AiAssistantAnimation size="micro" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#1392ec] to-indigo-600 bg-clip-text text-transparent">
              MeuSistemaPsi
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Entrar
            </Link>
            <Link to="/cadastrar" className="px-6 py-2.5 bg-gradient-to-r from-[#1392ec] to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-100 transition-all hover:scale-105">
              Fazer Upgrade
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20">
        
        {/* Banner de Status (Internal-style) */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-slate-800">Plano e Assinatura</h2>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Gerencie seu acesso profissional</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Status Atual</p>
                    <p className="text-sm font-bold text-slate-700">Período de Demonstração</p>
                 </div>
                 <div className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 animate-pulse">
                    Teste Grátis: 75 dias restantes
                 </div>
              </div>
           </div>
        </section>

        {/* Plan Cards */}
        <section className="px-6 max-w-[1240px] mx-auto pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-start">
          {plans.map((p, i) => (
            <motion.div 
              key={p.name} 
              {...scrollAnimation(fadeUp)} 
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-[40px] p-8 border-2 shadow-xl transition-all hover:scale-[1.02] ${
                p.popular ? 'border-[#1392ec] ring-4 ring-blue-50' : 
                p.highlight ? 'border-[#f59e0b] bg-[#fffcf5] ring-4 ring-orange-50' : 
                'border-slate-100'
              }`}
            >
              {/* Badges Principais */}
              {p.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1392ec] text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  Mais Popular
                </div>
              )}
              {p.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f59e0b] text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                  {p.badge}
                </div>
              )}

              {/* Header do Card */}
              <div className="flex justify-between items-start mb-10">
                <div className={`size-14 rounded-2xl flex items-center justify-center ${p.highlight ? 'bg-orange-100 text-[#f59e0b]' : 'bg-blue-50 text-[#1392ec]'}`}>
                   <p.icon className="w-8 h-8" />
                </div>

                {p.ai && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-xl border border-orange-200">
                    <Sparkles className="w-3.5 h-3.5 fill-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Ativa</span>
                  </div>
                )}
              </div>

              {/* Título e Preço */}
              <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter text-slate-900 mb-2">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[12px] font-black text-slate-400 uppercase">R$</span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{p.price}</span>
                <span className="text-slate-400 font-bold text-sm">{p.period}</span>
              </div>
              {p.subtext && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed mb-8">
                  {p.subtext}
                </p>
              )}
              {!p.subtext && <div className="h-8 mb-4" />}

              {/* Lista de Features */}
              <div className="space-y-4 mb-12">
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${p.highlight ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 leading-tight">{f}</span>
                  </div>
                ))}
              </div>

              {/* Botão de Upgrade */}
              <Link 
                to={p.link}
                className={`w-full py-5 ${p.btnColor} text-white font-black text-xl rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-tight`}
              >
                Fazer Upgrade
              </Link>
            </motion.div>
          ))}
        </section>

        {/* FAQs Resumidas */}
        <section className="max-w-3xl mx-auto px-6 mb-24">
           <h2 className="text-2xl font-black italic text-slate-900 text-center mb-10">Dúvidas Frequentes</h2>
           <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                   <p className="font-black text-slate-800 mb-2 uppercase text-[11px] tracking-widest">{f.q}</p>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.a}</p>
                </div>
              ))}
           </div>
        </section>

        {/* CTA Final */}
        <section className="px-6">
           <div className="max-w-4xl mx-auto bg-slate-900 rounded-[50px] p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10">
                 <h2 className="text-3xl md:text-5xl font-black italic text-white mb-6">Precisa de ajuda para escolher?</h2>
                 <p className="text-slate-400 font-medium mb-10 max-w-xl mx-auto">Nossa equipe de consultores está pronta para entender o fluxo da sua clínica e sugerir o melhor plano para você.</p>
                 <a 
                   href="https://wa.me/5544988446371" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-emerald-600 transition-all hover:scale-105"
                 >
                    <MessageCircle className="w-6 h-6" /> Falar com Consultor
                 </a>
              </div>
           </div>
        </section>

      </main>

      {/* Footer Minimalista */}
      <footer className="py-12 border-t border-slate-100 flex flex-col items-center gap-4">
         <AiAssistantAnimation size="micro" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">© 2026 Meu Sistema Psi — Inteligência Clínica</p>
      </footer>
    </div>
  );
}
