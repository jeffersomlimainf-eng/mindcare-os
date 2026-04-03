import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, Shield, Heart, Calendar,
  PieChart, ArrowRight, Sparkles, CreditCard, Clock, Lock, Star,
  AlertCircle, BarChart3, Users, HelpCircle, Activity
} from 'lucide-react';

// Imagens de Sistema e Lifestyle
import agendaImg from '../assets/screens/agenda.png';
import financeiroImg from '../assets/screens/financeiro.png'; 
import pacientesImg from '../assets/screens/Pacientes.png';
import laptopShowcase from '../assets/screens/WhatsApp Image 2026-03-29 at 11.07.59 (1).jpeg';
import tabletShowcase from '../assets/screens/WhatsApp Image 2026-03-29 at 11.07.59.jpeg';
import userTablet from '../assets/screens/WhatsApp Image 2026-03-29 at 11.08.00 (2).jpeg';
import userPatient from '../assets/screens/WhatsApp Image 2026-03-29 at 11.08.00.jpeg';

export default function Vendas2() {
  useEffect(() => {
    // Heavy SEO injection
    document.title = "Software de Gestão para Psicólogos | Prontuário e Agenda | Meu Sistema Psi";
    
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', 'Mais tempo para a clínica, menos tempo com a burocracia. Software de gestão para psicólogos com prontuário (LGPD), agenda avançada e Bio-Painel. Teste grátis.');
    updateMeta('keywords', 'software de gestão para psicólogos, prontuário eletrônico seguro, gestão de clínica de psicologia, agenda para psicólogo, sistema psicologia LGPD, prontuário psicológico digital');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://meusistemapsi.com.br/');

    // Schema.org
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Meu Sistema Psi",
      "applicationCategory": "BusinessApplication",
      "description": "Software de gestão para clínica de psicologia. Consolide sua agenda, garanta o sigilo dos prontuários (LGPD) e acompanhe a evolução com o Bio-Painel."
    });
    script.id = 'seo-schema-vendas2';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('seo-schema-vendas2');
      if (existingScript) existingScript.remove();
    };
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-purple-500 selection:text-white overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-purple-600 fill-purple-100" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              MeuSistemaPsi
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cadastrar" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-purple-100 transition-all hover:scale-105">
              Testar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Semantic Hero Section com Nova Copy (Dor/Solução) */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-24 px-4 overflow-hidden bg-gradient-to-b from-slate-50 to-white" aria-labelledby="hero-heading">
          <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[1000px] h-[600px] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
            
            {/* Etiqueta de Autoridade / Trust Badge */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-bold shadow-sm mb-8">
              <Shield className="w-4 h-4 text-purple-600" />
              100% Adequado à LGPD e Resoluções do CFP
            </motion.div>

            {/* Headline com Foco no Benefício Real (Intenção de Busca) */}
            <motion.h1 id="hero-heading" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1] mb-6">
              Mais tempo para a clínica.<br className="hidden md:block"/>
              Menos tempo com a <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">burocracia.</span>
            </motion.h1>

            {/* Subheadline Explicativa e Segura */}
            <motion.h2 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="text-xl text-slate-600 max-w-2xl font-light mb-10 leading-relaxed">
              Software de gestão feito <strong>por psicólogos, para psicólogos.</strong> Consolide sua agenda, garanta o sigilo absoluto dos seus prontuários e acompanhe a evolução dos pacientes com nosso exclusivo <em>Bio-Painel</em> de observação clínica.
            </motion.h2>

            {/* CTA Forte */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/cadastrar" className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-[0_10px_40px_-10px_rgba(147,51,234,0.4)] hover:shadow-[0_10px_40px_-10px_rgba(147,51,234,0.7)] hover:scale-[1.02] transform transition-all duration-300 flex items-center gap-2">
                Testar Grátis por 30 Dias <ArrowRight className="w-5 h-5" />
              </Link>
              <span className="text-sm text-slate-500 font-medium">Não requer cartão de crédito.</span>
            </motion.div>
          </div>
        </section>

        {/* 2. Seção de Dores: O Caos da Gestão Manual */}
        <section className="py-24 bg-white relative border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 px-4">
              <span className="text-purple-600 font-bold text-sm uppercase tracking-widest block mb-4">O cenário atual</span>
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Por que agendas de papel e planilhas<br className="hidden md:block"/> são o inimigo silencioso da sua clínica?</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <AlertCircle className="w-8 h-8 text-red-500" />,
                  title: "Risco Legal e Sigilo",
                  desc: "Agendas de papel podem ser perdidas ou acessadas por terceiros. No Meu Sistema PSI, seus dados são criptografados com padrão bancário."
                },
                {
                  icon: <Clock className="w-8 h-8 text-orange-500" />,
                  title: "O Dreno de Tempo",
                  desc: "Passar horas confirmando consultas no WhatsApp é um desperdício. Deixe que nosso Bot automatizado faça o trabalho pesado para você."
                },
                {
                  icon: <PieChart className="w-8 h-8 text-amber-500" />,
                  title: "Caos Financeiro",
                  desc: "Saber quanto você faturou no mês não deveria ser uma adivinhação. A falta de controle mata o crescimento do consultório."
                }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all group"
                >
                  <div className="mb-6 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlight 1: Agenda */}
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-purple-50/50 -z-0 blur-3xl rounded-full translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-2 md:order-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold mb-6">
                    <Calendar className="w-4 h-4" /> Gestão de Tempo Inteligente
                 </div>
                 <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Sua agenda nunca mais será<br/> um fardo.</h2>
                 <p className="text-lg text-slate-600 font-light mb-8 italic">
                   "Diga adeus ao trabalho manual de confirmar sessões. O Meu Sistema PSI cuida da logística para você focar no que importa: o humano."
                 </p>
                 <ul className="space-y-4">
                   {['Confirmação automática via WhatsApp com 1 clique', 'Cancelamentos e remarcações sincronizadas', 'Lista de espera inteligente para horários vagos'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <Check className="w-5 h-5 text-purple-600" /> {item}
                      </li>
                   ))}
                 </ul>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp} className="order-1 md:order-2 bg-white p-6 md:p-10 rounded-[40px] shadow-2xl shadow-purple-100 border border-slate-100 relative">
                 <img src={agendaImg} alt="Melhor Agenda para Psicólogos do Mercado" className="w-full h-auto rounded-xl shadow-lg border border-slate-200/50" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Highlight 2: Financeiro */}
        <section className="py-24 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp} className="bg-white p-6 md:p-10 rounded-[40px] shadow-2xl shadow-emerald-100 border border-slate-100 relative">
                 <img src={financeiroImg} alt="Gestão Financeira para Clínicas de Psicologia" className="w-full h-auto rounded-xl shadow-lg border border-slate-200/50" />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold mb-6">
                    <PieChart className="w-4 h-4" /> Controle Absoluto
                 </div>
                 <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Controle Financeiro Descomplicado.</h2>
                 <p className="text-lg text-slate-600 font-light mb-8">
                   Um sistema para psicólogos não está completo sem o lado das finanças. Centralize suas sessões cobradas e acompanhe métricas de faturamento em tempo real.
                 </p>
                 <ul className="space-y-4">
                   {['Acompanhamento das pendências dos pacientes', 'Gráficos de fluxo de caixa automático', 'Geração de PIX e Recibos na hora'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <Check className="w-5 h-5 text-emerald-600" /> {item}
                      </li>
                   ))}
                 </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Highlight 3: O Exclusivo BIO-PAINEL (A cereja do bolo) */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="order-2 md:order-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md text-purple-300 rounded-lg text-sm font-bold mb-6 border border-white/10 uppercase tracking-widest">
                    <Activity className="w-4 h-4" /> Inovação Meu Sistema PSI
                 </div>
                 <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-white">Bio-Painel: A visão além da sessão.</h2>
                 <p className="text-xl text-purple-100 font-light mb-8 leading-relaxed">
                   Anote observações clínicas em tempo real e visualize o progresso emocional dos seus pacientes através de gráficos de evolução integrados. Não é apenas texto, é inteligência de dados aplicada à cura humana.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-slate-300 font-medium">
                    {[
                      { icon: <Sparkles className="w-4 h-4" />, text: "Insights gerados por IA" },
                      { icon: <Lock className="w-4 h-4" />, text: "Criptografia Militar" },
                      { icon: <Activity className="w-4 h-4" />, text: "Métricas de Bem-estar" },
                      { icon: <Clock className="w-4 h-4" />, text: "Evoluções em 30 segundos" }
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-purple-400">{feat.icon}</span>
                        <span className="text-sm">{feat.text}</span>
                      </div>
                    ))}
                 </div>
                 <Link to="/cadastrar" className="px-8 py-4 bg-white text-purple-900 font-bold rounded-full hover:bg-purple-50 transition-all inline-flex items-center gap-2 shadow-xl">
                   Quero o Bio-Painel Agora <ArrowRight className="w-5 h-5" />
                 </Link>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp} className="order-1 md:order-2 bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-[40px] shadow-2xl shadow-purple-900/50 border border-white/10 relative group">
                 <div className="absolute inset-0 bg-purple-500/10 rounded-[40px] group-hover:bg-purple-500/20 transition-all -z-1" />
                 <img src={pacientesImg} alt="Painel Clínico Inteligente para Psicólogos" className="w-full h-auto rounded-xl shadow-lg border border-white/20" />
                 {/* Decorative Floating Element */}
                 <div className="absolute -top-8 -right-8 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 hidden md:block animate-bounce-slow">
                    <div className="flex items-center gap-3 text-slate-900">
                       <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-green-600" />
                       </div>
                       <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Status LGPD</p>
                          <p className="text-sm font-bold">Protocolo Seguro Ativo</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Carousel de Recursos Rápido */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
            <h2 className="text-3xl font-serif text-white">O melhor sistema para psicólogos que buscam sintropia</h2>
          </div>
          <div className="relative flex overflow-x-hidden">
            <motion.div 
               animate={{ x: [0, -1000] }} 
               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               className="flex gap-6 px-6"
            >
               {[...Array(2)].map((_, arrayIndex) => (
                  <React.Fragment key={arrayIndex}>
                    {['Agenda Inteligente WhatsApp', 'Pacientes e Sessões Ilimitados', 'Sistema Seguro LGPD', 'Gráficos Financeiros em Tempo Real', 'Inteligência Artificial Auxiliar', 'O Melhor Custo/Benefício', 'Prontuário com Anexos', 'Geração de Receitas e Laudos'].map((feature, i) => (
                      <div key={i} className="whitespace-nowrap px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 text-lg font-bold shadow-lg">
                        {feature}
                      </div>
                    ))}
                  </React.Fragment>
               ))}
            </motion.div>
          </div>
        </section>

        {/* Galeria Visual Completa */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">O Sistema em Todo Lugar</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Seja no seu consultório com um paciente, no tablet em casa ou no notebook entre uma sessão e outra. Sua gestão clínica com sintropia e mobilidade total.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:row-span-2">
                <img src={laptopShowcase} alt="Sistema para psicólogos no notebook" className="w-full h-full object-cover rounded-3xl shadow-lg" />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <img src={agendaImg} alt="Agenda Digital para Psicólogos" className="w-full h-48 object-cover rounded-3xl shadow-lg border border-slate-100" />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <img src={tabletShowcase} alt="Acesse no seu tablet" className="w-full h-48 object-cover rounded-3xl shadow-lg" />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:row-span-2">
                <img src={userPatient} alt="Profissional atendendo paciente" className="w-full h-full object-cover rounded-3xl shadow-lg" />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <img src={financeiroImg} alt="Controle financeiro clínica" className="w-full h-48 object-cover rounded-3xl shadow-lg border border-slate-100" />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <img src={userTablet} alt="Praticidade na palma da mão" className="w-full h-48 object-cover rounded-3xl shadow-lg" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Seção de Autoridade & Prova Social */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-blue-600 font-bold text-sm tracking-widest uppercase block mb-4">Recomendado por Especialistas</span>
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Quem usa, confirma: O Meu Sistema PSI<br className="hidden md:block"/> mudou seu jeito de clinicar.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  name: "Dra. Ana Silveira",
                  role: "Psicóloga TCC",
                  text: "Saí das agendas de papel para o Meu Sistema PSI e recuperei 5 horas da minha semana. O envio automático de links de vídeo é vida."
                },
                {
                  name: "Marcos Oliveira",
                  role: "Psicanalista",
                  text: "A segurança dos dados é minha prioridade. O sistema é robusto e o Bio-Painel me ajuda a ver padrões que eu nem percebia nas sessões."
                },
                {
                  name: "Juliana Mendes",
                  role: "Gestão de Clínica",
                  text: "Custo-benefício imbatível. O financeiro é o mais simples que já usei, gera meus recibos em segundos."
                }
              ].map((testimonial, i) => (
                <div key={i} className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 relative">
                   <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                   </div>
                   <p className="text-slate-700 mb-8 italic">"{testimonial.text}"</p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-200" />
                      <div>
                         <p className="font-bold text-slate-900">{testimonial.name}</p>
                         <p className="text-sm text-slate-500 font-medium">{testimonial.role}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section com Schema Markup Embutido */}
        <section className="py-24 bg-slate-50 relative border-t border-slate-200">
           <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4">Dúvidas Frequentes</h2>
                 <p className="text-slate-600 font-medium">Tudo o que você precisa saber para começar agora.</p>
              </div>
              
              <div className="space-y-4">
                 {[
                   { q: "O sistema é seguro e segue a LGPD?", a: "Sim, utilizamos criptografia AES-256 e nossos servidores seguem todos os protocolos de segurança exigidos pela LGPD e pelo Conselho Federal de Psicologia." },
                   { q: "Posso testar sem informar cartão?", a: "Com certeza. Você cria sua conta em 30 segundos e usa todos os recursos por 30 dias grátis, sem qualquer compromisso financeiro anterior." },
                   { q: "O Bio-Painel funciona em tablets?", a: "Sim, o Meu Sistema PSI é 100% responsivo. Você pode usar no computador do consultório, no seu iPad ou no seu smartphone com a mesma fluidez." }
                 ].map((faq, i) => (
                   <details key={i} className="group p-6 bg-white rounded-3xl border border-slate-200 cursor-pointer overflow-hidden transition-all">
                      <summary className="flex items-center justify-between font-bold text-slate-900 list-none">
                         {faq.q}
                         <HelpCircle className="w-5 h-5 text-purple-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-4 text-slate-600 leading-relaxed font-light">
                         {faq.a}
                      </p>
                   </details>
                 ))}
              </div>
              
              {/* FAQ Schema Markup */}
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  "mainEntity": [
                    { 
                      "@type": "Question", 
                      "name": "O sistema é seguro e segue a LGPD?", 
                      "acceptedAnswer": { 
                        "@type": "Answer", 
                        "text": "Sim, utilizamos criptografia AES-256 e nossos servidores seguem todos os protocolos de segurança exigidos pela LGPD e pelo Conselho Federal de Psicologia." 
                      } 
                    },
                    { 
                      "@type": "Question", 
                      "name": "Posso testar sem informar cartão?", 
                      "acceptedAnswer": { 
                        "@type": "Answer", 
                        "text": "Com certeza. Você cria sua conta em 30 segundos e usa todos os recursos por 30 dias grátis, sem qualquer compromisso financeiro anterior." 
                      } 
                    },
                    { 
                      "@type": "Question", 
                      "name": "O Bio-Painel funciona em tablets?", 
                      "acceptedAnswer": { 
                        "@type": "Answer", 
                        "text": "Sim, o Meu Sistema PSI é 100% responsivo. Você pode usar no computador do consultório, no seu iPad ou no seu smartphone com a mesma fluidez." 
                      } 
                    }
                  ]
                })}
              </script>
           </div>
        </section>

        {/* CTA Section Final */}
        <section className="py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp} className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[40px] p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl" />
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 relative z-10">Resgate seu tempo e sua paz mental.</h2>
              <p className="text-lg text-purple-50/80 mb-10 relative z-10 font-light">Junte-se a centenas de psicólogos que decidiram profissionalizar sua gestão clínica hoje mesmo.</p>
              <Link to="/cadastrar" className="px-12 py-6 bg-white text-purple-700 hover:bg-slate-50 font-bold text-xl rounded-2xl shadow-2xl transition-all relative z-10 inline-block hover:-translate-y-1">
                Iniciar meu Teste Grátis 
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-3 gap-12 mb-12">
              <div>
                 <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-6 h-6 text-purple-600 fill-purple-100" />
                    <span className="text-lg font-bold text-slate-900">MeuSistemaPsi</span>
                 </div>
                 <p className="text-slate-500 text-sm leading-relaxed">
                    O software de gestão que une psicologia e tecnologia para elevar seu nível de atendimento clínico.
                 </p>
              </div>
              <div className="flex flex-col gap-4">
                 <p className="font-bold text-slate-900">Links Úteis</p>
                 <Link to="/blog" className="text-slate-500 hover:text-purple-600 transition-colors">Blog de Autoridade</Link>
                 <Link to="/cadastrar" className="text-slate-500 hover:text-purple-600 transition-colors">Preços & Planos</Link>
                 <a href="#" className="text-slate-500 hover:text-purple-600 transition-colors">Termos de Uso</a>
              </div>
              <div className="flex flex-col gap-4">
                 <p className="font-bold text-slate-900">Contato</p>
                 <p className="text-slate-500">contato@meusistemapsi.com.br</p>
                 <p className="text-slate-500">Maringá - PR</p>
              </div>
           </div>
           <div className="pt-8 border-t border-slate-200 text-center">
              <p className="text-slate-400 text-xs">© 2026 Meu Sistema Psi — Desenvolvido com carinho para a saúde mental.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}


