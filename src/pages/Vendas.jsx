import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, Shield, Zap, Calendar, Gift, Heart, MessageCircle,
  Mail, ArrowRight, Star, Award, Users, Lock, Sparkles
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
    document.title = "Aumente sua Produtividade Clínica | Meu Sistema Psi - 30 Dias Grátis";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Descubra como o Meu Sistema Psi ajuda psicólogos a automatizar agenda, prontuários e faturamento. Experimente agora com 30 dias de teste gratuito!');
    }

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
                Sistema Completo para <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Psicólogos e Terapeutas</span> — Prontuário, Agenda e Financeiro
              </h1>

              <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0">
                Prontuário eletrônico seguro, agenda com alertas automáticos por WhatsApp e gestão financeira completa. Desenvolvido por um psicólogo clínico para profissionais de todas as abordagens. Adequado à LGPD.
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
                  alt="Interface do Meu Sistema Psi"
                  className="w-full h-full object-cover aspect-4/3"
                  loading="eager"
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
                Antes vs Depois: Vida Digital do Psicólogo
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
                Funcionalidades que Elevam sua Prática Clínica
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Automático</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Lembretes automáticos que reduzem faltas em até 40%.</p>
              </div>

              <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança LGPD</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Dados criptografados e prontuário seguro conforme exigências legais.</p>
              </div>

              <div className="bg-gradient-to-b from-purple-50/50 to-white p-8 rounded-3xl border border-purple-50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Inteligência Artificial</h3>
                <p className="text-slate-600 text-sm leading-relaxed">IA que ajuda nos resumos e evoluções clínicas em segundos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Conheça por Dentro */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Tudo em Um Só Lugar</h2>
          </div>
          <div className="max-w-5xl mx-auto px-4 overflow-hidden rounded-[40px] shadow-2xl border border-white">
            <img src={dashboardImg} alt="Dashboard" className="w-full h-auto" loading="lazy" />
          </div>
        </section>

        {/* Pricing / Trial Section */}
        <section id="precos" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Comece Agora, Pague Depois</h2>
            <p className="text-lg text-slate-600 mb-12">Libere todas as funcionalidades do sistema gratuitamente por 30 dias. <br className="hidden md:block" />Sem cartão de crédito, sem compromisso.</p>
            
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[48px] p-8 md:p-16 text-white shadow-2xl shadow-purple-200 relative overflow-hidden group transition-all hover:scale-[1.01]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-white/10">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Acesso Total Liberado
                </div>
                
                <h3 className="text-4xl md:text-6xl font-black mb-4">30 Dias Grátis</h3>
                <p className="text-xl md:text-2xl text-purple-100 font-medium mb-10 max-w-lg mx-auto">
                  Toda a inteligência do Meu Sistema Psi à sua disposição para transformar sua clínica.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-12 text-left bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-bold">Agenda & Prontuário</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-bold">IA para Evoluções</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-bold">Financeiro Completo</span>
                  </div>
                </div>
                
                <Link to="/cadastrar" className="inline-flex items-center gap-3 px-12 py-6 bg-white text-indigo-600 font-black text-xl rounded-2xl shadow-xl hover:bg-slate-100 transition-all transform hover:-translate-y-1">
                  Criar Conta Grátis
                  <ArrowRight className="w-6 h-6" />
                </Link>
                
                <p className="mt-6 text-sm text-purple-200 font-medium">
                  Não pedimos cartão de crédito agora. Cancele quando quiser.
                </p>
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
              <a href="#precos" className="px-6 py-4 bg-white text-orange-600 font-black rounded-2xl shadow-lg">Garantir Meu Bônus</a>
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
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                    <span className="font-bold text-slate-800">{item.question}</span>
                    <span className="text-indigo-600 font-bold text-xl">{openFaq === index ? '−' : '+'}</span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[40px] p-12 text-center text-white shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Pronta para Evoluir sua Clínica?</h2>
              <Link to="/cadastrar" className="px-10 py-5 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl inline-block hover:scale-105 transition-transform">Começar Teste de 30 Dias</Link>
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
            <a href="#" className="hover:text-purple-600">Privacidade</a>
            <a href="#" className="hover:text-purple-600">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
