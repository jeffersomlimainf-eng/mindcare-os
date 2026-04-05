import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Check, Heart, ArrowRight, Shield, 
  Zap, Star, HelpCircle, MessageCircle,
  CreditCard, Clock, Lock, Sparkles
} from 'lucide-react';

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

    updateMeta('description', 'Escolha o plano ideal para sua clínica de psicologia. Teste grátis por 30 dias todos os recursos: Agenda, Prontuário LGPD, Financeiro e IA. Sem fidelidade.');
    updateMeta('keywords', 'preços sistema psicologia, planos software psicólogos, gestão clínica valor, prontuário eletrônico preço');

    window.scrollTo(0, 0);
  }, []);

  // Animation Helpers
  const fadeUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const scaleUp = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
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

  const faqs = [
    {
      q: "Preciso de cartão de crédito para o teste grátis?",
      a: "Não! Você pode criar sua conta e usar todas as funcionalidades por 30 dias sem informar nenhum dado de pagamento. Só pediremos se você decidir continuar conosco."
    },
    {
      q: "O que acontece depois dos 30 dias?",
      a: "Sua conta ficará pausada. Seus dados permanecerão seguros por 90 dias, permitindo que você assine um plano e continue de onde parou a qualquer momento."
    },
    {
      q: "Existe taxa de cancelamento ou fidelidade?",
      a: "Nenhuma. Nosso modelo é de assinatura mensal. Você pode cancelar quando quiser através do painel de configurações, sem letras miúdas."
    },
    {
      q: "Como funciona o suporte técnico?",
      a: "Temos suporte humanizado via WhatsApp e E-mail. No plano Profissional, o tempo de resposta é prioritário para garantir que sua clínica nunca pare."
    },
    {
        q: "Os dados dos meus pacientes estão seguros?",
        a: "Absolutamente. Utilizamos criptografia de ponta a ponta e servidores seguros (AWS). O sistema é 100% adequado à LGPD e às normas do CFP."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      
      {/* 1. Header Fixo (Consistência com Landing Page) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-purple-600 fill-purple-100" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              MeuSistemaPsi
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">
              Entrar
            </Link>
            <Link to="/cadastrar" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-purple-100 transition-all hover:scale-105">
              Testar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        
        {/* 2. Hero Section Preços */}
        <section className="relative px-6 text-center max-w-4xl mx-auto mb-20">
           <motion.div {...safeAnimation(fadeUp)}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-bold shadow-sm mb-6 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Justo e Transparente
              </span>
              <h1 className="text-5xl md:text-6xl font-serif text-slate-900 mb-6 leading-tight">
                Planos simples para<br/>
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent italic">grandes resultados.</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
                Toda a inteligência clínica do Meu Sistema Psi à sua disposição. Comece gratuitamente e profissionalize sua prática em minutos.
              </p>
           </motion.div>
        </section>

        {/* 3. Cards de Planos */}
        <section className="px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-32">
          
          {/* Card 1: Trial */}
          <motion.div {...scrollAnimation(fadeUp)} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Experiência Total</h2>
              <p className="text-slate-500 font-light mb-8 italic">Degustação gratuita para novos usuários</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">R$ 0,00</span>
                <span className="text-slate-400 font-medium tracking-wide">/30 dias</span>
              </div>

              <div className="space-y-4 mb-10">
                {[
                  "Acesso a 100% das ferramentas",
                  "Agenda Inteligente & WhatsApp",
                  "Prontuários Ilimitados",
                  "IA para Evoluções (Trial)",
                  "Suporte via Central de Ajuda",
                  "Exportação de Dados"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-600 font-light">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/cadastrar" className="mt-auto w-full py-5 border-2 border-slate-900 text-slate-900 font-bold text-xl rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-center">
                Começar agora
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Profissional (Destaque) */}
          <motion.div {...scrollAnimation(fadeUp)} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-10 shadow-2xl relative overflow-hidden text-white flex flex-col group">
            <div className="absolute top-0 right-0 p-6">
               <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-block px-4 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                Plano Recomendado
              </div>
              <h2 className="text-2xl font-bold mb-2">Profissional</h2>
              <p className="text-slate-300 font-light mb-8 italic">O parceiro definitivo da sua jornada clínica</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-6xl font-black text-white tracking-tighter">R$ 79,90</span>
                <span className="text-slate-400 font-medium tracking-wide">/mês</span>
              </div>

              <div className="space-y-4 mb-10">
                {[
                  "Tudo do plano Trial",
                  "IA Geradora de Evoluções Ilimitada",
                  "Bio-Painel de Análise Clínica",
                  "Lembretes de WhatsApp Premium",
                  "Suporte Prioritário no WhatsApp",
                  "Gestão Financeira com Fluxo de Caixa",
                  "Relatórios Customizados"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                    <span className="text-slate-100 font-light">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/cadastrar" className="mt-auto w-full py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xl rounded-2xl shadow-xl hover:scale-[1.03] transition-all text-center flex items-center justify-center gap-2 border border-white/10 group-hover:shadow-purple-500/20">
                Garantir meu Plano <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* 4. Tabela de Funcionalidades Resumida */}
        <section className="px-6 py-24 bg-white border-y border-slate-100">
           <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                 <h2 className="text-3xl font-serif text-slate-900 mb-4 italic">Por que escolher o Meu Sistema Psi?</h2>
                 <p className="text-slate-500 font-light">Comparamos os recursos para ajudar você na decisão.</p>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b-2 border-slate-100">
                          <th className="py-6 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Funcionalidade</th>
                          <th className="py-6 px-4 text-xs font-bold uppercase tracking-widest text-slate-900 text-center">Trial</th>
                          <th className="py-6 px-4 text-xs font-bold uppercase tracking-widest text-purple-600 text-center">Profissional</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {[
                          ["Prontuário com Criptografia", true, true],
                          ["Agenda com WhatsApp", true, true],
                          ["Inteligência Artificial (IA)", "Limitada", "Ilimitada"],
                          ["Bio-Painel (Sintropia)", false, true],
                          ["Financeiro & Fluxo de Caixa", true, true],
                          ["Suporte WhatsApp VIP", false, true],
                          ["Modelos de Contratos", true, true],
                       ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                             <td className="py-6 px-4 font-medium text-slate-700">{row[0]}</td>
                             <td className="py-6 px-4 text-center">
                                {typeof row[1] === 'boolean' ? (row[1] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <Lock className="w-4 h-4 text-slate-200 mx-auto" />) : <span className="text-xs font-bold text-slate-400 uppercase">{row[1]}</span>}
                             </td>
                             <td className="py-6 px-4 text-center">
                                {typeof row[2] === 'boolean' ? (row[2] ? <Check className="w-5 h-5 text-purple-600 mx-auto" /> : <Lock className="w-4 h-4 text-slate-200 mx-auto" />) : <span className="text-xs font-bold text-purple-600 uppercase">{row[2]}</span>}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>

        {/* 5. FAQ de Cobrança */}
        <section className="py-32 px-6 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-14 justify-center">
               <HelpCircle className="w-8 h-8 text-purple-600" />
               <h2 className="text-4xl md:text-5xl font-serif text-slate-900 italic">Dúvidas Frequentes</h2>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div 
                   key={i} 
                   {...scrollAnimation(fadeUp)} 
                   transition={{ delay: i * 0.05 }}
                   className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className="font-bold text-slate-800 text-lg group-hover:text-purple-600 transition-colors">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                       <ArrowRight className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-8 pb-8 text-slate-500 font-light leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CTA Final Impactante */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[50px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/40 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />
             
             <div className="relative z-10">
                <Heart className="w-16 h-16 text-white/20 mx-auto mb-10" />
                <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 leading-tight">
                   Comece hoje sua jornada de <span className="italic">sintropia clínica.</span>
                </h2>
                <p className="text-xl text-purple-100/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                   Centenas de psicólogos já transformaram sua gestão. Agora é a sua vez de ter paz mental e focar no que realmente importa: seu paciente.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <Link to="/cadastrar" className="w-full sm:w-auto px-12 py-6 bg-white text-purple-700 font-bold text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all">
                      Iniciar meu Teste Grátis 
                   </Link>
                   <a href="https://wa.me/5544988446371" className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-6 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/5 transition-all">
                      <MessageCircle className="w-6 h-6" /> Falar com Consultor
                   </a>
                </div>
                <div className="mt-8 flex items-center justify-center gap-6 text-purple-200/60 text-xs font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> 100% Seguro</div>
                   <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Sem Cartão Agora</div>
                </div>
             </div>
          </div>
        </section>

      </main>

      {/* 7. Footer Institucional */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                 <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-6 h-6 text-purple-600 fill-purple-100" />
                    <span className="text-lg font-bold text-slate-900">MeuSistemaPsi</span>
                 </div>
                 <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
                    O software de gestão que une psicologia e tecnologia para elevar seu nível de atendimento clínico. Desenvolvido por psicólogos para psicólogos.
                 </p>
                 <div className="flex gap-4">
                    {/* Placeholder para Redes Sociais */}
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-purple-600 transition-colors cursor-pointer shadow-sm">
                       <MessageCircle className="w-5 h-5" />
                    </div>
                 </div>
              </div>
              <div className="flex flex-col gap-4">
                 <p className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Portal</p>
                 <Link to="/blog" className="text-slate-500 hover:text-purple-600 transition-colors text-sm">Blog de Autoridade</Link>
                 <Link to="/login" className="text-slate-500 hover:text-purple-600 transition-colors text-sm">Entrar no Sistema</Link>
                 <Link to="/cadastrar" className="text-slate-500 hover:text-purple-600 transition-colors text-sm font-bold">Teste Grátis</Link>
                 <Link to="/melhor-sistema-para-psicologos" className="text-slate-500 hover:text-purple-600 transition-colors text-sm">Por que nós?</Link>
              </div>
              <div className="flex flex-col gap-4">
                 <p className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Suporte & Legal</p>
                 <p className="text-slate-500 text-sm italic">contato@meusistemapsi.com.br</p>
                 <a href="#" className="text-slate-500 hover:text-purple-600 transition-colors text-sm">Termos de Uso</a>
                 <a href="#" className="text-slate-500 hover:text-purple-600 transition-colors text-sm">Política de Privacidade</a>
                 <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-bold text-[10px] border border-emerald-100 uppercase tracking-wider w-fit">
                    <Shield className="w-3 h-3" /> Adequado LGPD
                 </div>
              </div>
           </div>
           <div className="pt-8 border-t border-slate-200 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">© 2026 Meu Sistema Psi — Inteligência Clínica em Sintropia.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
