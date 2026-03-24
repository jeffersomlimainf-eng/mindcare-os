import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, Shield, Zap, Calendar, Gift, Heart, MessageCircle,
  Mail, ArrowRight, Star, Award, Users, Lock, Sparkles
} from 'lucide-react';
import heroBg from '../assets/vendas_hero_bg.png';
import dashboardImg from '../assets/screens/dashboard.png';
import agendaImg from '../assets/screens/agenda.png';
import financeiroImg from '../assets/screens/financeiro.png';

export default function Vendas() {
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const sliderRef = useRef(null);
  const testimonialRef = useRef(null);

  const faqItems = [
    {
      question: "O que é o Meu Sistema Psi?",
      answer: "O Meu Sistema Psi é um software 100% desenvolvido para psicólogas, pensado para otimizar todas as etapas do consultório em um único lugar. Nele, você gerencia agendamentos, prontuários, anotações, faturamento e mensagens de forma integrada e prática."
    },
    {
      question: "Como tenho acesso ao Meu Sistema Psi?",
      answer: "É simples! Basta fazer o seu cadastro no botão 'Testar Grátis' para ter 7 dias de uso gratuito, sem a necessidade de informar cartão de crédito. Assim, você conhece todas as funcionalidades da plataforma sem nenhum compromisso."
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

  const testimonials = [
    {
      text: "O design é maravilhoso e as mensagens de WhatsApp automáticas mudaram minha rotina. Os pacientes adoram o capricho!",
      name: "Dra. Fernanda Silva",
      role: "Psicóloga Clínica - RJ"
    },
    {
      text: "As notas com IA são incríveis. Consigo resumir a sessão em segundos após o atendimento com muita precisão e elegância.",
      name: "Dra. Mariana Costa",
      role: "Terapia Cognitivo Comportamental"
    },
    {
      text: "Não vivo mais sem o controle financeiro. A página é segura e me sinto tranquila sabendo que estou dentro da LGPD.",
      name: "Dra. Clara Novais",
      role: "Psicologia Hospitalar e Clínica"
    },
    {
      text: "O controle de prontuários é extremamente seguro e prático. Me sinto em conformidade com o CFP sem nenhum esforço diário.",
      name: "Dra. Juliana Mendes",
      role: "Psicanálise - SP"
    },
    {
      text: "O financeiro me salvou de horas de planilhas. Agora vejo o rendimento real do meu consultório em tempo real.",
      name: "Dr. Ricardo Almeida",
      role: "Gestalt Terapia - MG"
    },
    {
      text: "A automação de WhatsApp é o que meus pacientes mais elogiam. Reduziu faltas pela metade essa organização!",
      name: "Dra. Beatriz Rocha",
      role: "TCC e Infantil - PR"
    }
  ];

  // Auto-scroll logic for feature carrousel
  useEffect(() => {
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

  // Auto-scroll logic for testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      if (testimonialRef.current) {
        const nextIndex = (currentTestimonial + 1) % testimonials.length;
        setCurrentTestimonial(nextIndex);
        testimonialRef.current.scrollTo({
          left: (testimonialRef.current.offsetWidth / (window.innerWidth < 768 ? 1 : 3)) * nextIndex,
          behavior: 'smooth'
        });
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [currentTestimonial, testimonials.length]);

  const handleScroll = () => {
    if (sliderRef.current) {
      const index = Math.round(sliderRef.current.scrollLeft / sliderRef.current.offsetWidth);
      if (index !== currentSlide) {
        setCurrentSlide(index);
      }
    }
  };

  const handleTestimonialScroll = () => {
    if (testimonialRef.current) {
      const cardWidth = testimonialRef.current.offsetWidth / (window.innerWidth < 768 ? 1 : 3);
      const index = Math.round(testimonialRef.current.scrollLeft / cardWidth);
      if (index !== currentTestimonial) {
        setCurrentTestimonial(index);
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

      {/* Hero Section */}
      <main>
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 left-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-purple-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              SISTEMA FEITO POR PSICÓLOGOS PARA PSICÓLOGOS
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Sistema Completo para <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Psicólogos e Terapeutas</span> — Prontuário, Agenda e Financeiro
            </h1>

            <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0">
              Prontuário eletrônico seguro, agenda com alertas automáticos por WhatsApp e gestão financeira completa. Desenvolvido por um psicólogo clínico para profissionais de todas as abordagens. Adequado à LGPD.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link to="/cadastrar" aria-label="Testar o Meu Sistema Psi grátis por 7 dias" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all transform hover:-translate-y-1 text-center">
                Experimentar Sem Compromisso
              </Link>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500 font-medium">
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" /> Teste grátis por 7 dias
              <span className="text-slate-300" aria-hidden="true">|</span>
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" /> Sem fidelidade
            </div>
          </div>

          <div className="relative mx-auto max-w-md md:max-w-none w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-white/40">
              <img
                src={heroBg}
                alt="Interface do Meu Sistema Psi mostrando o painel de gestão para psicólogos com agenda, prontuários e financeiro integrados"
                className="w-full h-full object-cover aspect-4/3"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>
      {/* Seção Antes e Depois (Dores e Soluções) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Antes vs Depois: Software de Gestão para Terapeutas
            </h2>
            <p className="text-slate-600">
              Veja a diferença de gerenciar sua clínica com inteligência e classe. Atenda com postura e segurança.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Antes */}
            <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl shadow-red-50/10 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">Sem o Meu Sistema Psi</div>
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
                  <li className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                    <span className="text-red-500 font-black">✕</span> WhatsApp pessoal misturado com o profissional o tempo todo.
                  </li>
                </ul>
              </div>
            </div>

            {/* Depois */}
            <div className="bg-gradient-to-b from-purple-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl shadow-purple-900/10 relative overflow-hidden border border-purple-800 flex flex-col justify-between">
              <div>
                <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">Com o Meu Sistema Psi</div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Vida Plena e Autoridade
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-purple-100 text-sm font-medium">
                    <span className="text-emerald-400 font-black">✓</span> Tudo centralizado, seguro e acessível de qualquer lugar.
                  </li>
                  <li className="flex items-start gap-3 text-purple-100 text-sm font-medium">
                    <span className="text-emerald-400 font-black">✓</span> Alertas de WhatsApp automáticos que reduzem faltas em 40%.
                  </li>
                  <li className="flex items-start gap-3 text-purple-100 text-sm font-medium">
                    <span className="text-emerald-400 font-black">✓</span> Gráficos de faturamento que mostram a saúde do negócio em segundos.
                  </li>
                  <li className="flex items-start gap-3 text-purple-100 text-sm font-medium">
                    <span className="text-emerald-400 font-black">✓</span> Postura e comunicação como autoridade na sua região.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gatilhos / Profissionalismo Section */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Funcionalidades que Elevam sua Prática Clínica
            </h2>
            <p className="text-slate-600">
              Pequenos detalhes de postura fazem você cobrar o que realmente vale. O MindCare OS automatiza sem perder a elegância.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lembretes Automáticos por WhatsApp</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Chega de mandar áudios ou textos bagunçados. Lembretes de sessão e avisos chegam com visual formal e acolhedor, automatizados para você.
              </p>
            </div>

            <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Comunicação Profissional por E-mail</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Recibos, lembretes de pagamento e resumos chegam em caixas de entrada com visual premium que agregam valor à sua hora/aula.
              </p>
            </div>

            <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Agenda para Psicólogos com Alertas Inteligentes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Agenda inteligente que previne furos, ajuda no agendamento recorrente e garante que seu consultório nunca fique vazio.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Seção Conheça por Dentro (Telas Simuladas - Alta Resolução) */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Prontuário Eletrônico Seguro e Agenda Inteligente
            </h2>
            <p className="text-slate-600">
              Uma interface projetada para oferecer clareza e eficiência. Veja como o Meu Sistema Psi organiza sua rotina.
            </p>
          </div>

          {/* Container do Carrossel */}
          <div className="relative">
            <div
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex flex-nowrap overflow-x-auto space-x-6 pb-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 scroll-smooth"
            >

              {/* Card 1: Dashboard */}
              <div className="flex-shrink-0 w-[85vw] md:w-[700px] snap-center">
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 backdrop-blur-sm h-full flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">painel.meusistemapsi.com</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-100 shadow-inner mb-6 flex-grow">
                    <img src={dashboardImg} alt="Tela do painel de controle do Meu Sistema Psi mostrando gráficos de faturamento e sessões do dia" className="w-full h-auto object-cover" loading="lazy" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-900">Painel de Controle Inteligente</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Visualize a saúde do seu consultório em segundos. Faturamento e sessões direto ao ponto.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Agenda */}
              <div className="flex-shrink-0 w-[85vw] md:w-[700px] snap-center">
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 backdrop-blur-sm h-full flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">agenda.meusistemapsi.com</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-100 shadow-inner mb-6 flex-grow">
                    <img src={agendaImg} alt="Tela da agenda inteligente do Meu Sistema Psi com visualização semanal e alertas de WhatsApp integrados" className="w-full h-auto object-cover" loading="lazy" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-900">Agenda Intuitiva</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Gerencie seus horários com flexibilidade e facilidade. Alertas de whatsapp integrados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Financeiro */}
              <div className="flex-shrink-0 w-[85vw] md:w-[700px] snap-center">
                <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 backdrop-blur-sm h-full flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">financeiro.meusistemapsi.com</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-100 shadow-inner mb-6 flex-grow">
                    <img src={financeiroImg} alt="Tela da gestão financeira do Meu Sistema Psi com fluxo de caixa visual e controle de receitas" className="w-full h-auto object-cover" loading="lazy" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-900">Gestão Financeira Simplificada</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Acompanhe entradas e saídas sem dor de cabeça. Fluxo de caixa visual e automático.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Hint de Scroll / Painel de dots */}
            <div className="flex justify-center gap-2 -mt-4">
              <button aria-label="Ver tela do Dashboard" onClick={() => { setCurrentSlide(0); sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' }); }} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === 0 ? 'bg-purple-600 w-6' : 'bg-purple-200 w-2'}`}></button>
              <button aria-label="Ver tela da Agenda" onClick={() => { setCurrentSlide(1); sliderRef.current.scrollTo({ left: sliderRef.current.offsetWidth, behavior: 'smooth' }); }} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === 1 ? 'bg-purple-600 w-6' : 'bg-purple-200 w-2'}`}></button>
              <button aria-label="Ver tela do Financeiro" onClick={() => { setCurrentSlide(2); sliderRef.current.scrollTo({ left: sliderRef.current.offsetWidth * 2, behavior: 'smooth' }); }} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === 2 ? 'bg-purple-600 w-6' : 'bg-purple-200 w-2'}`}></button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Screenshot Redesign) */}
      <section id="precos" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Planos Acessíveis para Psicólogos — A Partir de R$ 39,90/mês
            </h2>
            <p className="text-slate-600">
              Escolha o plano que melhor se adapta ao momento da sua clínica. Teste grátis, sem cartão de crédito.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Plano Essencial */}
            <div className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-100 flex flex-col transition-all hover:shadow-xl">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                  <span className="material-symbols-outlined">dashboard</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 italic">Essencial</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <span className="text-4xl font-black text-slate-800">39,90</span>
                <span className="text-xs text-slate-400">/mês</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500" /> Agenda inteligente
                </li>
                <li className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500" /> Prontuário eletrônico
                </li>
                <li className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500" /> Pacientes ilimitados
                </li>
                <li className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-500" /> Gestão financeira
                </li>
              </ul>

              <a href="https://sun.eduzz.com/Q9N2YYZ101" aria-label="Assinar plano Essencial por R$ 39,90 por mês" className="w-full py-4 text-center bg-blue-500 hover:bg-blue-600 text-white font-black rounded-3xl shadow-md transition-all text-sm uppercase tracking-wide">
                Começar Agora
              </a>
            </div>

            {/* Plano Profissional (Mais Popular) */}
            <div className="bg-white p-8 rounded-[32px] shadow-xl border-2 border-blue-500 flex flex-col relative transition-all hover:shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                Mais Popular
              </div>

              <div className="mb-6 pt-2">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                    <Zap className="w-6 h-6 fill-blue-500/20" />
                  </div>
                  <div className="px-2 py-1 bg-amber-50 rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-amber-600">AI ATIVA</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 italic">Profissional</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <span className="text-4xl font-black text-slate-800">44,90</span>
                <span className="text-xs text-slate-400">/mês</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                  <Check className="w-5 h-5 text-emerald-500" /> Tudo do Essencial
                </li>
                <li className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                  <Check className="w-5 h-5 text-emerald-500" /> IA: Resumos de Sessão
                </li>
                <li className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                  <Check className="w-5 h-5 text-emerald-500" /> IA: Sugestão de Temas
                </li>
                <li className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                  <Check className="w-5 h-5 text-emerald-500" /> Lembretes WhatsApp
                </li>
              </ul>

              <a href="https://sun.eduzz.com/G96RKK6QW1" aria-label="Assinar plano Profissional com IA por R$ 44,90 por mês" className="w-full py-4 text-center bg-blue-500 hover:bg-blue-600 text-white font-black rounded-3xl shadow-md transition-all text-sm uppercase tracking-wide">
                Começar Agora
              </a>
            </div>

            {/* Plano Premium (Luxury) */}
            <div className="bg-[#0b1120] p-8 rounded-[32px] shadow-2xl flex flex-col relative text-white transition-all hover:shadow-cyan-500/10 hover:shadow-2xl">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-700">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="px-2 py-1 bg-amber-400/10 rounded-lg flex items-center gap-1 border border-amber-400/20">
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black text-amber-400">AI ATIVA</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black italic">Premium</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-bold text-slate-500">R$</span>
                <span className="text-4xl font-black text-white">72,90</span>
                <span className="text-xs text-slate-500">/mês</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-400" /> Tudo do Profissional
                </li>
                <li className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-400" /> IA: Análise de Sentimento
                </li>
                <li className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-400" /> Relatórios Avançados
                </li>
                <li className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <Check className="w-5 h-5 text-emerald-400" /> Multiclínica (Sub-contas)
                </li>
              </ul>

              <a href="https://sun.eduzz.com/89AXVVGG0D" aria-label="Assinar plano Premium completo por R$ 72,90 por mês" className="w-full py-4 text-center bg-slate-100 hover:bg-white text-slate-900 font-black rounded-3xl shadow-inner transition-all text-sm uppercase tracking-wide block">
                Começar Agora
              </a>
              <div className="text-center mt-3 text-[10px] text-slate-500 font-bold tracking-widest">
                PRE-PAGO • PIX
              </div>
            </div>
          </div>
          {/* Selo de Garantia */}
          <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex items-center gap-4 transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm md:text-base">Garantia Incondicional de 7 Dias</p>
              <p className="text-slate-500 text-xs">Se você não se adaptar ao sistema nos primeiros 7 dias, devolvemos seu investimento sem burocracia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Bônus (Gatilho de Valor) */}
      <section className="py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
            
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-widest uppercase">
                <Gift className="w-3.5 h-3.5" /> Bônus Exclusivo
              </div>
              <h3 className="text-2xl md:text-3xl font-black italic">Assinando Hoje Você Ganha Mais!</h3>
              <p className="text-white/90 text-sm font-medium">
                🎁 **Modelo de Contrato Clínico** + 📘 **Guia Completo de Captação de Pacientes**
              </p>
            </div>

            <a href="#precos" className="px-6 py-4 bg-white hover:bg-slate-50 text-orange-600 font-black rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 text-sm uppercase tracking-wide whitespace-nowrap">
              Garantir Meus Bônus
            </a>
          </div>
        </div>
      </section>
      {/* Seção Depoimentos (Prova Social) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Avaliado por Psicólogas de Todo o Brasil
            </h2>
            <p className="text-slate-600">
              Mais de centenas de psicólogas já modernizaram o consultório e estão economizando tempo.
            </p>
          </div>

          {/* Carrossel de Depoimentos */}
          <div className="relative">
            <div 
              ref={testimonialRef}
              onScroll={handleTestimonialScroll}
              className="flex flex-nowrap overflow-x-auto space-x-6 pb-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 scroll-smooth"
            >
              {testimonials.map((item, index) => (
                <div key={index} className="flex-shrink-0 w-[85vw] md:w-[380px] snap-center bg-slate-50 p-6 rounded-3xl relative flex flex-col justify-between h-full min-h-[180px]">
                  <div>
                    <div className="flex gap-1 mb-4 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <p className="text-slate-600 text-sm italic mb-6">
                      "{item.text}"
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-sm">{item.name}</p>
                    <p className="text-slate-500 text-xs">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint de Scroll / Painel de dots */}
            <div className="flex justify-center gap-1.5 -mt-4">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => { 
                    setCurrentTestimonial(index); 
                    const cardWidth = testimonialRef.current.offsetWidth / (window.innerWidth < 768 ? 1 : 3);
                    testimonialRef.current.scrollTo({left: cardWidth * index, behavior: 'smooth'}); 
                  }} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentTestimonial === index ? 'bg-purple-600 w-5' : 'bg-purple-200 w-1.5'}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security row */}
      <section id="seguranca" className="py-12 bg-[#121826] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold">100% Adequado à LGPD</h4>
              <p className="text-slate-400 text-xs">Seus dados e de seus pacientes com criptografia militar.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-300">Conexão Segura SSL</span>
          </div>
        </div>
      </section>

      {/* Seção Perguntas Frequentes (FAQ) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-xs font-bold uppercase tracking-wider">
              Perguntas Frequentes
            </div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
              Está com dúvidas? A gente te ajuda <Heart className="w-6 h-6 text-purple-600 fill-purple-600" />
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800 text-sm md:text-base">{item.question}</span>
                  <div className={`w-8 h-8 rounded-full border border-purple-200 flex items-center justify-center text-purple-600 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                    <span className="font-bold text-lg">{openFaq === index ? '−' : '+'}</span>
                  </div>
                </button>
                {openFaq === index && (
                  <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
                    {item.question === "Caso eu necessite de ajuda, como entro em contato?" ? (
                      <p>
                        Em caso de dúvidas ou sugestões, entre em contato com o nosso time de suporte pelo WhatsApp:{" "}
                        <a href="https://wa.me/5544988446371" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-bold underline">
                          +55 (44) 98844-6371
                        </a>
                        . Conte sempre com a gente!
                      </p>
                    ) : (
                      item.answer
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-3xl p-12 text-center text-white shadow-2xl space-y-6">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Pronta para Modernizar sua Clínica de Psicologia?
            </h2>
            <p className="text-purple-50 max-w-md mx-auto">
              Teste sem compromisso. É por nossa conta ver o quão sensacional o Meu Sistema Psi é.
            </p>
            <div className="flex justify-center pt-4">
              <Link to="/cadastrar" aria-label="Criar conta gratuita no Meu Sistema Psi" className="px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-bold rounded-2xl shadow-xl transition-all transform hover:-translate-y-1">
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Suporte Flutuante (Inspirado no Sintropia) */}
      <div className="max-w-4xl mx-auto px-4 -mb-12 relative z-10">
        <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 p-6 rounded-3xl shadow-xl shadow-purple-50 border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Atendimento" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="Atendimento" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Atendimento" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            </div>
            <div className="text-center md:text-left">
              <p className="font-extrabold text-slate-800 text-sm md:text-base">Não conseguiu tirar sua dúvida?</p>
              <p className="text-slate-500 text-xs">Toque no botão para falar com nosso suporte via WhatsApp</p>
            </div>
          </div>
          <a
            href="https://wa.me/5544988446371"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm"
          >
            Falar com o suporte
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600 fill-purple-100" />
            <span className="font-bold text-slate-800">Meu Sistema Psi</span>
          </div>
          <p className="text-slate-500 text-xs">
            © 2026 Meu Sistema Psi. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs font-medium text-slate-500">
            <a href="#" className="hover:text-purple-600">Privacidade</a>
            <a href="#" className="hover:text-purple-600">Termos</a>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
