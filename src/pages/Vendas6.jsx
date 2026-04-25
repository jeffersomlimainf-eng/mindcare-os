import React, { useEffect } from 'react';
import '../assets/premium.css';
import { 
  Hero, Manifesto, Features, 
  Workflow, Security, Pricing, 
  Testimonials, FAQ, FooterCTA, Footer 
} from '../components/PremiumLanding/Sections';

export default function Vendas6() {
  useEffect(() => {
    // SEO Dynamic Injection
    document.title = "Sistema para Psicólogos: Prontuário, Agenda e IA | Meu Sistema PSI";
    document.documentElement.setAttribute('data-accent', 'plum');
    document.documentElement.setAttribute('data-mode', 'dark');
    
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', 'O mais avançado sistema de gestão para psicólogos. Inteligência Artificial para evoluções, prontuário eletrônico seguro (LGPD), agenda inteligente com WhatsApp e gestão financeira. Experimente a excelência clínica.');
    updateMeta('keywords', 'software para psicólogos, sistema para psicólogos, prontuário eletrônico seguro, gestão clínica psicologia, agenda para psicólogos online, lembretes de sessão whatsapp, gestão financeira consultório, ia para psicologia, prontuário seguro lgpd, evolução clínica digital, ficha de anamnese online, atestados e recibos psicólogos');

    window.scrollTo(0, 0);

    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-up, .reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="premium-font-sans">
      <main>
        <Hero />
        <Manifesto />
        <Features />
        <Workflow />
        <Security />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        body {
          margin: 0;
          background: var(--bg);
          color: var(--ink);
        }

        .reveal.in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}
