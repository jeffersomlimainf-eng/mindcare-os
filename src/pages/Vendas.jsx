import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, Shield, Heart, MessageCircle,
  Mail, ArrowRight, Star, Sparkles, CreditCard, Clock, Lock
} from 'lucide-react';
import ReviewsSection from '../components/ReviewsSection';
import heroBg from '../assets/vendas_hero_bg.png';
import dashboardImg from '../assets/screens/dashboard.png';
import agendaImg from '../assets/screens/agenda.png';
import financeiroImg from '../assets/screens/financeiro.png';

export default function Vendas() {
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

  // Auto-scroll logic for feature carrousel
  useEffect(() => {
    // Dynamic SEO Metadata
    document.title = "Sistema para Psicólogos — Prontuário, Agenda e Financeiro | Meu Sistema Psi";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Sistema completo para psicólogos: prontuário eletrônico seguro (LGPD), agenda com lembretes por WhatsApp, gestão financeira e IA para evoluções clínicas. Criado por psicólogo. Teste grátis 30 dias.');
    }

    // Add canonical tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/');

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const nextIndex = (currentSlide + 1) % 3; // 3 slides
        setCurrentSlide(nextIndex);
        sliderRef.current.scrollTo({
          left: sliderRef.current.offsetWidth * nextIndex,
          behavior: 'smooth'
        });
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleScroll = () => {
    if (sliderRef.current) {
      const index = Math.round(sliderRef.current.scrollLeft / sliderRef.current.offsetWidth);
      if (index !== currentSlide) {
        setCurrentSlide(index);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <a href="#funcionalidades" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">Pular para o conteúdo principal</a>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-purple-600 fill-purple-100" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Meu Sistema Psi
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
            <Link to="/cadastrar" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all transform hover:-translate-y-0.5">
              Testar Grátis
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute top-40 left-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-purple-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                SISTEMA FEITO POR PSICÓLOGOS PARA PSICÓLOGOS
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Sistema para <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Psicólogos</span> — Prontuário Eletrônico, Agenda com WhatsApp e Gestão Financeira
              </h1>

              <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0">
                Software de psicologia completo: prontuário eletrônico seguro e adequado à LGPD, agenda inteligente com lembretes automáticos por WhatsApp e gestão financeira para consultório de psicologia. Criado por psicólogo clínico, com inteligência artificial para evoluções de sessão. O melhor sistema para psicólogos do Brasil.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Link to="/cadastrar" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all transform hover:-translate-y-1 text-center">
                  Experimentar Sem Compromisso
                </Link>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500 font-medium">
                <Check className="w-4 h-4 text-green-500" /> Teste grátis por 30 dias
                <span className="text-slate-300">|</span>
                <Check className="w-4 h-4 text-green-500" /> Sem fidelidade
              </div>
            </div>

            <div className="relative mx-auto max-w-md md:max-w-none w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-white/40">
                <img
                  src={heroBg}
                  alt="Sistema para psicólogos — Interface do prontuário eletrônico seguro, agenda com WhatsApp e financeiro integrado"
                  className="w-full h-full object-cover aspect-4/3"
                  fetchpriority="high"
                  loading="eager"
                  width="800"
                  height="600"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Antes vs Depois */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Antes vs Depois: Gestão do Consultório de Psicologia
              </h2>
              <p className="text-slate-600">
                Veja a diferença de gerenciar sua clínica com inteligência e classe.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Antes */}
              <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="text-2xl">😫</span> Vida sem Controle
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                      <span className="text-red-500 font-black">✕</span> Papéis e cadernos espalhados que somem com facilidade.
                    </li>
                    <li className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                      <span className="text-red-500 font-black">✕</span> Pacientes esquecendo consultas por falta de lembretes.
                    </li>
                    <li className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                      <span className="text-red-500 font-black">✕</span> Estresse no final do mês sem saber quanto realmente faturou.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Depois */}
              <div className="bg-gradient-to-b from-purple-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl shadow-purple-900/10 border border-purple-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-2xl">✨</span> Vida Plena e Autoridade
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-purple-100 text-sm font-medium">
                      <span className="text-emerald-400 font-black">✓</span> Tudo centralizado, seguro e acessível.
                    </li>
                    <li className="flex items-start gap-3 text-purple-100 text-sm font-medium">
                      <span className="text-emerald-400 font-black">✓</span> Alertas de WhatsApp automáticos.
                    </li>
                    <li className="flex items-start gap-3 text-purple-100 text-sm font-medium">
                      <span className="text-emerald-400 font-black">✓</span> Gestão financeira visual e prática.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Funcionalidades do Sistema de Gestão para Consultório de Psicologia
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Agenda com Lembretes Automáticos por WhatsApp</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Agenda para psicólogo com lembretes automáticos via WhatsApp que reduzem faltas em até 40%. Agendamento online integrado ao prontuário do paciente.</p>
              </div>

              <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Prontuário Eletrônico Seguro — LGPD</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Prontuário psicológico eletrônico com dados criptografados, adequado à LGPD. Armazene evoluções, anamneses e laudos com total segurança e sigilo profissional.</p>
              </div>

              <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Inteligência Artificial para Evoluções Clínicas</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Software de psicologia com IA integrada que gera resumos de sessão e evoluções clínicas em segundos. Economize tempo e mantenha registros profissionais detalhados.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Conheça por Dentro */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Software para Psicólogo: Tudo em Um Só Lugar</h2>
          </div>
          <div className="max-w-5xl mx-auto px-4 overflow-hidden rounded-[40px] shadow-2xl border border-slate-100">
            <img src={dashboardImg} alt="Dashboard do sistema para psicólogos — visão geral com agenda, pacientes e financeiro" className="w-full h-auto" loading="lazy" width="1200" height="675" />
          </div>
        </section>

        {/* Pricing / Trial Section */}
        <section id="precos" className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">30 Dias para Transformar sua Gestão — 100% Grátis</h2>
            <p className="text-lg text-slate-500 mb-12 font-medium">Experimente o melhor software para psicólogos do Brasil. <br className="hidden md:block" />Sem cartão de crédito agora e sem compromisso de permanência.</p>
            
            <div className="bg-white rounded-[40px] p-8 md:p-16 border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 blur-3xl opacity-60" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-100 rounded-full -ml-40 -mb-40 blur-3xl opacity-60" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-indigo-100 text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  Teste Gratuito com Acesso Total
                </div>
                
                <h3 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900">Experimente Grátis</h3>
                <p className="text-xl md:text-2xl text-slate-500 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
                  Toda a inteligência do sistema à sua disposição para organizar sua clínica hoje mesmo.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left w-full">
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 backdrop-blur-sm">
                    <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-bold text-sm text-slate-700">Agenda & Prontuário</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 backdrop-blur-sm">
                    <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-bold text-sm text-slate-700">IA para Evoluções</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 backdrop-blur-sm">
                    <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-bold text-sm text-slate-700">Financeiro Completo</span>
                  </div>
                </div>
                
                <div className="relative group">
                  <Link to="/cadastrar" className="relative inline-flex items-center gap-3 px-10 md:px-14 py-6 bg-indigo-600 text-white font-bold text-xl md:text-2xl rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:scale-[0.98]">
                    Criar Minha Conta Grátis
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </div>
                
                <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    Não pede cartão agora
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Cadastro em 1 minuto
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Sem fidelidade
                  </div>
                </div>
                
                <p className="mt-8 text-xs text-slate-400 font-medium italic">
                  * Sua conta apenas expira após 30 dias se você não escolher um plano. Sem cobranças surpresas.
                </p>
              </div>
            </div>
            
            {/* Objection Killers */}
            <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <p className="text-slate-800 font-bold text-sm mb-1">O que acontece depois?</p>
                <p className="text-slate-500 text-xs leading-relaxed">Sua conta é "congelada" e os dados ficam salvos. Nada é cobrado automaticamente.</p>
              </div>
              <div className="p-4">
                <p className="text-slate-800 font-bold text-sm mb-1">Preciso instalar algo?</p>
                <p className="text-slate-500 text-xs leading-relaxed">Não. Use direto no seu computador, tablet ou celular. 100% online.</p>
              </div>
              <div className="p-4">
                <p className="text-slate-800 font-bold text-sm mb-1">Meus dados estão seguros?</p>
                <p className="text-slate-500 text-xs leading-relaxed">Sim! Usamos criptografia de nível militar e backups diários para sua segurança.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bônus */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black italic mb-2">Bônus Exclusivo!</h3>
                <p className="text-sm font-medium">Assinando hoje você ganha Modelos de Contrato + Guia de Captação.</p>
              </div>
              <Link to="/cadastrar" className="px-6 py-4 bg-white text-orange-600 font-black rounded-2xl shadow-lg">Garantir Meu Bônus</Link>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection />

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-12">Perguntas Frequentes</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)} 
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="font-bold text-slate-800">{item.question}</span>
                    <span className="text-indigo-600 font-bold text-xl">{openFaq === index ? '−' : '+'}</span>
                  </button>
                  {openFaq === index && (
                    <div 
                      id={`faq-answer-${index}`}
                      className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50 animate-in fade-in slide-in-from-top-1"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-slate-50 rounded-[40px] p-12 text-center border border-slate-100 shadow-xl">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">Pronta para Transformar a Gestão do seu Consultório?</h2>
              <Link to="/cadastrar" className="px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 inline-block hover:scale-105 transition-transform">Começar Teste de 30 Dias</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600 fill-purple-100" />
            <span className="font-bold text-slate-800">Meu Sistema Psi</span>
          </div>
          <p className="text-slate-500 text-xs text-center">© 2026 Meu Sistema Psi. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs font-medium text-slate-500">
            <a href="#" className="hover:text-purple-600 transition-colors" aria-label="Ver Política de Privacidade">Privacidade</a>
            <a href="#" className="hover:text-purple-600 transition-colors" aria-label="Ver Termos de Uso">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
