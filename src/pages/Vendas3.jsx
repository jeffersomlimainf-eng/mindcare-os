import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, Shield, Heart, MessageCircle,
  Mail, ArrowRight, Star, Sparkles, CreditCard, Clock, Lock
} from 'lucide-react';
import ReviewsSection from '../components/ReviewsSection';
import heroBg from '../assets/vendas_hero_bg.png';
import dashboardImg from '../assets/screens/dashboard.png';
import agendaImg from '../assets/screens/agenda.png';
import financeiroImg from '../assets/screens/financeiro.png';
import pacientesImg from '../assets/screens/Pacientes.png';
import laptopShowcase from '../assets/screens/WhatsApp Image 2026-03-29 at 11.07.59 (1).jpeg';
import tabletShowcase from '../assets/screens/WhatsApp Image 2026-03-29 at 11.07.59.jpeg';
import userTablet from '../assets/screens/WhatsApp Image 2026-03-29 at 11.08.00 (2).jpeg';
import userPatient from '../assets/screens/WhatsApp Image 2026-03-29 at 11.08.00.jpeg';

export default function Vendas3() {
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const faqItems = [
    {
      question: "O que é o Meu Sistema Psi?",
      answer: "O Meu Sistema Psi é um software 100% desenvolvido para psicólogas, pensado para otimizar todas as etapas do consultório em um único lugar. Nele, você gerencia agendamentos, prontuários, anotações, faturamento e mensagens de forma integrada e prática."
    },
    {
      question: "Como tenho acesso ao Meu Sistema Psi?",
      answer: "É simples! Basta fazer o seu cadastro no botão 'Testar Grátis' para ter 30 dias de uso gratuito, sem a necessidade de informar cartão de crédito. Assim, você conhece todas as funcionalidades da plataforma sem nenhum compromisso."
    },
    {
      question: "O Meu Sistema Psi é adequado para quem está começando na psicologia?",
      answer: "Com certeza! Ele foi criado especialmente para psicólogas em diferentes fases da carreira, oferecendo ferramentas simples e eficazes. Ajuda você a manter tudo organizado desde o início, facilitando o crescimento do seu consultório."
    },
    {
      question: "Por onde consigo acessar o Meu Sistema Psi?",
      answer: "Você pode acessar a plataforma de qualquer lugar, tanto pelo navegador do computador (Web) quanto pelo navegador do seu celular ou tablet. É 100% responsivo."
    },
    {
      question: "Caso eu necessite de ajuda, como entro em contato?",
      answer: "Em caso de dúvidas ou sugestões, entre em contato com o nosso time de suporte pelo WhatsApp: +55 44 98844-6371. Conte sempre com a gente!"
    }
  ];

  useEffect(() => {
    document.title = "Sistema para Psicólogos — Prontuário, Agenda e Financeiro | Meu Sistema Psi";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Sistema completo para psicólogos similar ao Sintropia: prontuário eletrônico seguro (LGPD), agenda com lembretes por WhatsApp e gestão financeira. O software de psicologia líder em sintropia clínica.');
    }
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'agenda para psicólogos, sistema para psicólogos, programa para psicólogos, sintropia, sintropia app, gerenciamento clínico psicologia');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://meusistemapsi.com.br/vendas3');

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const nextIndex = (currentSlide + 1) % 3;
        setCurrentSlide(nextIndex);
        sliderRef.current.scrollTo({
          left: sliderRef.current.offsetWidth * nextIndex,
          behavior: 'smooth'
        });
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, [currentSlide]);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-purple-500 selection:text-white">
      <a href="#funcionalidades" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] bg-purple-600 text-white px-4 py-2 rounded-lg">Pular para o conteúdo principal</a>
      
      {/* Navbar with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-purple-600 fill-purple-100" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              MeuSistemaPsi
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Funcionalidades</a>
            <a href="#seguranca" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Segurança</a>
            <a href="#precos" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">Preços</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">
              Entrar
            </Link>
            <Link to="/cadastrar" className="px-5 py-2.5 bg-white border border-purple-200 hover:border-purple-600 text-slate-800 text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all">
              Testar Grátis
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Soft Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden px-4">
          <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-md border border-purple-50 rounded-full text-purple-700 text-xs font-semibold shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              SISTEMA FEITO POR PSICÓLOGOS PARA PSICÓLOGOS
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1] mb-6">
              Organize sua clínica com <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">simplicidade e sintropia.</span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-600 max-w-2xl font-light mb-10 leading-relaxed">
              Prontuário eletrônico seguro, agenda inteligente com WhatsApp e gestão financeira em um design pensado para quem busca o melhor sistema para psicólogos.
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/cadastrar" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg rounded-full shadow-[0_10px_40px_-10px_rgba(147,51,234,0.5)] hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] transform transition-all duration-300">
                Experimentar Sem Compromisso
              </Link>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.4 }} className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 30 dias grátis</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Sem fidelidade</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Não pede cartão hoje</span>
            </motion.div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={scaleUp} transition={{ delay: 0.5 }} className="mt-20 max-w-5xl mx-auto relative px-4 sm:px-0">
            <div className="rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border-[8px] border-white/60 backdrop-blur-sm">
              <img
                src={dashboardImg}
                alt="Sistema para psicólogos — Interface do prontuário eletrônico"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        </section>

        {/* Funcionalidades Elevadas */}
        <section id="funcionalidades" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-serif text-sintropia-text mb-6">Tudo que seu consultório precisa.</h2>
              <p className="text-lg text-sintropia-sub font-light">Sem excessos. Apenas o essencial, magnificamente projetado.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: MessageCircle, title: "Agenda Inteligente", desc: "Reduza faltas com lembretes automáticos integrados via WhatsApp perfeitamente desenhados para seus pacientes." },
                { icon: Shield, title: "Prontuário Seguro LGPD", desc: "Seus dados criptografados. Armazene evoluções e anamneses com o máximo de segurança exigido pela lei." },
                { icon: Sparkles, title: "Evoluções com IA", desc: "Ganhe tempo clínico. Nossa IA resume sessões e sugere evoluções organizadas em instantes." }
              ].map((item, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl p-10 border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-14 h-14 bg-sintropia-bg rounded-2xl flex items-center justify-center text-sintropia-accent mb-8">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-sintropia-text mb-4">{item.title}</h3>
                  <p className="text-sintropia-sub font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / Impression Section */}
        <section id="precos" className="py-24 md:py-32 bg-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-5xl md:text-6xl font-serif text-sintropia-text mb-8">Experimente o futuro da gestão clínica.</h2>
              <p className="text-xl text-sintropia-sub mb-14 font-light">Abra sua conta agora. Os primeiros 30 dias são por nossa conta.</p>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp} className="bg-white rounded-[40px] p-10 md:p-16 border border-purple-50 shadow-[0_40px_80px_-20px_rgba(147,51,234,0.15)] relative overflow-hidden isolate">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[80px] -z-10 translate-x-1/3 -translate-y-1/3" />
              
              <h3 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Cadastre-se Grátis</h3>
              
              <div className="flex flex-col md:flex-row justify-center gap-6 mb-12">
                {['Prontuário Digital', 'Chat via WhatsApp', 'Controle Financeiro'].map((feature, i) => (
                  <div key={i} className="flex items-center justify-center gap-3 bg-white px-6 py-3 rounded-2xl border border-purple-100 shadow-sm">
                    <Check className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-slate-800">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/cadastrar" className="inline-flex items-center justify-center gap-3 w-full md:w-auto px-12 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xl rounded-full shadow-[0_10px_40px_-10px_rgba(147,51,234,0.5)] hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.03] transition-all duration-300">
                Criar Minha Conta Ouro
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="mt-8 flex justify-center gap-8 text-xs font-semibold text-sintropia-sub uppercase tracking-wider">
                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Sem Cartão</span>
                <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Sem Multa</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection />

        {/* Visual Experience Showcase */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Experiência Clínica Completa</h2>
              <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto italic">
                "O design não é apenas como se vê, mas como funciona no seu dia a dia."
              </p>
            </div>

            <div className="flex flex-col gap-24">
              {/* Feature 1: Atendimento */}
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <h3 className="text-3xl font-serif text-slate-900 mb-6">Presença e Humanização</h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed mb-8">
                    Trabalhe com sintropia em seus atendimentos. Tenha o prontuário do paciente sempre à mão, seja em um notebook ou tablet, sem perder o contato visual e a conexão humana.
                  </p>
                  <div className="flex items-center gap-4 text-purple-600 font-medium">
                    <Check className="w-5 h-5" /> Foco total no paciente
                  </div>
                </motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp} className="rounded-[40px] overflow-hidden shadow-2xl">
                  <img src={userPatient} alt="Atendimento clínico com sistema" className="w-full h-auto" />
                </motion.div>
              </div>

              {/* Feature 2: Mobilidade */}
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp} className="order-2 md:order-1 rounded-[40px] overflow-hidden shadow-2xl">
                  <img src={userTablet} alt="Mobilidade com tablet" className="w-full h-auto" />
                </motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-1 md:order-2">
                  <h3 className="text-3xl font-serif text-slate-900 mb-6">Liberdade de Movimento</h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed mb-8">
                    Acesse seu consultório de qualquer lugar. Nosso programa para psicólogos foi desenhado para ser fluido em dispositivos móveis, garantindo que você nunca perca uma informação importante.
                  </p>
                  <div className="flex items-center gap-4 text-purple-600 font-medium">
                    <Check className="w-5 h-5" /> 100% Mobile Friendly
                  </div>
                </motion.div>
              </div>

              {/* Technical Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                {[
                  { img: agendaImg, title: "Agenda" },
                  { img: financeiroImg, title: "Financeiro" },
                  { img: pacientesImg, title: "Pacientes" },
                  { img: tabletShowcase, title: "Interface Tablet" }
                ].map((item, i) => (
                  <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                    className="relative group cursor-pointer overflow-hidden rounded-3xl shadow-lg aspect-square">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <span className="text-white font-bold">{item.title}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 md:py-32 bg-sintropia-bg">
          <div className="max-w-3xl mx-auto px-6">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-4xl font-serif text-center mb-16 text-sintropia-text">Dúvidas Frequentes</motion.h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: index * 0.1 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)} 
                    className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-sintropia-text text-lg">{item.question}</span>
                    <span className="text-sintropia-accent font-light text-2xl">{openFaq === index ? '−' : '+'}</span>
                  </button>
                  {openFaq === index && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-8 pb-6 pt-0 text-sintropia-sub font-light leading-relaxed border-t border-slate-50">
                      {item.answer}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* FAQ Schema Markup */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqItems.map(item => ({
                  "@type": "Question",
                  "name": item.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                  }
                }))
              })}
            </script>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-purple-600" />
            <span className="font-serif font-bold text-xl text-slate-900">MeuSistemaPsi</span>
          </div>
          <p className="text-slate-500 font-light text-sm">© 2026 Meu Sistema Psi. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-purple-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
