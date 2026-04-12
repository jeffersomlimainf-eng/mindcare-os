import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  Lock,
  Heart,
  Sparkles,
  Gavel
} from 'lucide-react';

const crpData = [
  { region: '01', states: 'Distrito Federal', url: 'https://www.crp-01.org.br/' },
  { region: '02', states: 'Pernambuco', url: 'https://www.crppe.org.br/' },
  { region: '03', states: 'Bahia', url: 'https://www.crp03.org.br/' },
  { region: '04', states: 'Minas Gerais', url: 'https://www.crp04.org.br/' },
  { region: '05', states: 'Rio de Janeiro', url: 'https://www.crprj.org.br/' },
  { region: '06', states: 'São Paulo', url: 'https://www.crpsp.org.br/' },
  { region: '07', states: 'Rio Grande do Sul', url: 'https://www.crprs.org.br/' },
  { region: '08', states: 'Paraná', url: 'https://www.crppr.org.br/' },
  { region: '09', states: 'Goiás', url: 'https://www.crp09.org.br/' },
  { region: '10', states: 'Pará e Amapá', url: 'https://www.crp10.org.br/' },
  { region: '11', states: 'Ceará', url: 'https://www.crp11.org.br/' },
  { region: '12', states: 'Santa Catarina', url: 'https://www.crpsc.org.br/' },
  { region: '13', states: 'Paraíba', url: 'https://www.crp13.org.br/' },
  { region: '14', states: 'Mato Grosso do Sul', url: 'https://www.crp14.org.br/' },
  { region: '15', states: 'Alagoas', url: 'https://www.crp15.org.br/' },
  { region: '16', states: 'Espírito Santo', url: 'https://www.crp16.org.br/' },
  { region: '17', states: 'Rio Grande do Norte', url: 'https://www.crp17.org.br/' },
  { region: '18', states: 'Mato Grosso', url: 'https://www.crp18.org.br/' },
  { region: '19', states: 'Sergipe', url: 'https://www.crp19.org.br/' },
  { region: '20', states: 'Amazonas e Roraima', url: 'https://www.crp20.org.br/' },
  { region: '21', states: 'Piauí', url: 'https://www.crp21.org.br/' },
  { region: '22', states: 'Maranhão', url: 'https://www.crp22.org.br/' },
  { region: '23', states: 'Tocantins', url: 'https://www.crp23.org.br/' },
  { region: '24', states: 'Acre e Rondônia', url: 'https://www.crp24.org.br/' },
];

const PAGE_TITLE = 'CRP e CFP: Guia Completo dos Conselhos de Psicologia do Brasil | Meu Sistema Psi';
const PAGE_DESCRIPTION = 'Lista completa de todos os CRPs do Brasil por estado, guia do CFP (Conselho Federal de Psicologia), resoluções sobre prontuário eletrônico e atendimento online. Consulte agora.';
const PAGE_URL = 'https://meusistemapsi.com.br/crp';
const PAGE_IMAGE = 'https://meusistemapsi.com.br/og-image.png';

const faqItems = [
  {
    question: 'O que é o CRP (Conselho Regional de Psicologia)?',
    answer: 'O Conselho Regional de Psicologia (CRP) é o órgão responsável por fiscalizar e regulamentar o exercício da profissão de psicólogo em cada região do Brasil. Existem 24 CRPs regionais, cada um responsável por um ou mais estados. O CRP emite o registro profissional, orienta sobre ética, fiscaliza consultórios e clínicas, e conduz processos éticos disciplinares.',
  },
  {
    question: 'O que é o CFP (Conselho Federal de Psicologia)?',
    answer: 'O Conselho Federal de Psicologia (CFP) é o órgão máximo de regulamentação da profissão no Brasil. Ele coordena os Conselhos Regionais (CRPs), emite o Código de Ética Profissional, cria resoluções sobre atendimento online (e-Psi), prontuário eletrônico e novas modalidades de atuação do psicólogo.',
  },
  {
    question: 'Qual a diferença entre CRP e CFP?',
    answer: 'O CFP (Conselho Federal de Psicologia) é o conselho nacional, responsável pelas normas, resoluções e pelo Código de Ética que valem para todo o Brasil. Os CRPs (Conselhos Regionais de Psicologia) são as unidades regionais que executam essas normas em cada estado: registram os profissionais, fiscalizam a atuação e atendem o psicólogo no dia a dia.',
  },
  {
    question: 'Como consultar meu número de CRP?',
    answer: 'Você pode consultar seu número de CRP diretamente no site do Conselho Regional da sua região. Acesse a lista de CRPs nesta página, selecione seu estado e clique no site oficial para usar o sistema de consulta de registros profissionais.',
  },
  {
    question: 'O CRP é obrigatório para atender pacientes?',
    answer: 'Sim. O registro no CRP da região onde você atua é obrigatório para exercer legalmente a profissão de psicólogo no Brasil. Atender sem registro ativo é considerado exercício ilegal da profissão.',
  },
  {
    question: 'O prontuário eletrônico é permitido pelo CFP?',
    answer: 'Sim. O Conselho Federal de Psicologia regulamenta o uso de prontuário eletrônico e sistemas digitais de gestão clínica. A Resolução CFP 01/2009 estabelece normas para o registro de informações em prontuários, exigindo sigilo, segurança dos dados e conformidade com a LGPD.',
  },
  {
    question: 'O atendimento online por psicólogos é regulamentado pelo CFP?',
    answer: 'Sim. O CFP regulamenta o atendimento psicológico online (teleconsulta) através de resoluções específicas e do cadastro e-Psi. O psicólogo deve estar devidamente registrado no e-Psi para oferecer atendimentos à distância de forma ética e legal.',
  },
  {
    question: 'Quantos CRPs existem no Brasil?',
    answer: 'Existem 24 Conselhos Regionais de Psicologia (CRPs) no Brasil, numerados de CRP-01 a CRP-24, abrangendo todos os estados e o Distrito Federal. Alguns CRPs são responsáveis por mais de um estado, como o CRP-10 (Pará e Amapá) e o CRP-20 (Amazonas e Roraima).',
  },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-purple-50/50 transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-800 text-base">{question}</span>
        <span className={`shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center transition-transform ${open ? 'rotate-45' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
          <p className="pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function CrpInfo() {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Title
    document.title = PAGE_TITLE;

    // Helper: upsert meta tag
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attrName.trim(), attrVal.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // Helper: upsert link tag
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
      el.setAttribute('href', href);
    };

    // Standard
    setMeta('meta[name="description"]', 'content', PAGE_DESCRIPTION);
    setMeta('meta[name="keywords"]', 'content', 'CRP psicologia, CFP psicologia, Conselho Regional de Psicologia, Conselho Federal de Psicologia, lista CRP Brasil, registro psicólogo, CRP-01, CRP-05, CRP-06, CFP resoluções, prontuário eletrônico psicólogo, atendimento online psicólogo, e-Psi CFP, ética profissional psicologia');
    setMeta('meta[name="robots"]', 'content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Canonical + hreflang
    setLink('canonical', PAGE_URL);
    setLink('alternate', PAGE_URL);
    let hreflang = document.querySelector('link[hreflang="pt-BR"]');
    if (!hreflang) { hreflang = document.createElement('link'); hreflang.setAttribute('rel', 'alternate'); hreflang.setAttribute('hreflang', 'pt-BR'); document.head.appendChild(hreflang); }
    hreflang.setAttribute('href', PAGE_URL);

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', PAGE_TITLE);
    setMeta('meta[property="og:description"]', 'content', PAGE_DESCRIPTION);
    setMeta('meta[property="og:url"]', 'content', PAGE_URL);
    setMeta('meta[property="og:image"]', 'content', PAGE_IMAGE);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[property="og:locale"]', 'content', 'pt_BR');
    setMeta('meta[property="og:site_name"]', 'content', 'Meu Sistema Psi');

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', PAGE_TITLE);
    setMeta('meta[name="twitter:description"]', 'content', PAGE_DESCRIPTION);
    setMeta('meta[name="twitter:image"]', 'content', PAGE_IMAGE);

    // JSON-LD Structured Data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': PAGE_URL,
          url: PAGE_URL,
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          inLanguage: 'pt-BR',
          isPartOf: { '@id': 'https://meusistemapsi.com.br/#website' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://meusistemapsi.com.br/' },
              { '@type': 'ListItem', position: 2, name: 'CRP e CFP — Guia de Conselhos', item: PAGE_URL },
            ],
          },
          mainEntity: {
            '@type': 'FAQPage',
            mainEntity: faqItems.map(({ question, answer }) => ({
              '@type': 'Question',
              name: question,
              acceptedAnswer: { '@type': 'Answer', text: answer },
            })),
          },
        },
        {
          '@type': 'Organization',
          '@id': 'https://meusistemapsi.com.br/#organization',
          name: 'Meu Sistema Psi',
          url: 'https://meusistemapsi.com.br/',
          logo: 'https://meusistemapsi.com.br/favicon.png',
          sameAs: [],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://meusistemapsi.com.br/#website',
          url: 'https://meusistemapsi.com.br/',
          name: 'Meu Sistema Psi',
          description: 'Software para psicólogos: prontuário, agenda e financeiro.',
          publisher: { '@id': 'https://meusistemapsi.com.br/#organization' },
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://meusistemapsi.com.br/crp?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    };
    let scriptEl = document.querySelector('script[data-schema="crp"]');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.setAttribute('data-schema', 'crp');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      // Cleanup JSON-LD on unmount
      const el = document.querySelector('script[data-schema="crp"]');
      if (el) el.remove();
    };
  }, []);

  const filteredCrps = crpData.filter(item => 
    item.states.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.region.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header / Navbar Placeholder (Similar to Sales Pages) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-purple-600 fill-purple-100" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Meu Sistema Psi
            </span>
          </Link>
          <Link to="/cadastrar" className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-purple-700 transition-all">
            Testar Grátis
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-purple-700 text-xs font-semibold mb-6">
            <Shield className="w-3.5 h-3.5" />
            GUIA DE ÉTICA E REGULAMENTAÇÃO
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Conselho Federal de Psicologia e <span className="text-purple-600">CRP</span>: <br className="hidden md:block" /> Guia de Ética e Diretório Nacional
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10">
            Encontre o site do seu Conselho Regional de Psicologia (CRP) e entenda as principais resoluções do CFP sobre prontuário eletrônico e atendimento online.
          </p>
          
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="text-xl font-bold mb-2">Sua Agenda e Cobrança no Automático</h3>
              <p className="text-purple-100 text-sm">O Meu Sistema Psi cuida da burocracia para você cumprir as normas do CFP com liberdade.</p>
            </div>
            <Link to="/cadastrar" className="px-6 py-3 bg-white text-purple-700 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform shrink-0">
              Liberdade Agora
            </Link>
          </div>
        </section>

        {/* Directory Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20" id="diretorio">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Lista de CRPs por Região e Estado</h2>
              <p className="text-slate-500">Selecione seu estado para acessar o site oficial do seu conselho.</p>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por estado ou região..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCrps.map((crp) => (
              <a 
                key={crp.region}
                href={crp.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      CRP-{crp.region}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-purple-700 transition-colors">
                    {crp.states}
                  </h3>
                </div>
                <div className="mt-4 text-xs font-medium text-slate-400 group-hover:text-purple-500 flex items-center gap-1">
                  Acessar site oficial <ArrowRight className="w-3 h-3" />
                </div>
              </a>
            ))}
            {filteredCrps.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 italic">
                Nenhum conselho encontrado para sua busca.
              </div>
            )}
          </div>
        </section>

        {/* Educational Content */}
        <section className="bg-white py-20 border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">O papel do Conselho Federal de Psicologia (CFP)</h2>
            
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Gavel className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Normatização e Disciplina</h3>
                <p className="text-slate-600 leading-relaxed">
                  O Conselho Federal de Psicologia (CFP) é o órgão responsável por orientar, disciplinar e fiscalizar o exercício da profissão em todo o Brasil. Ele emite resoluções que definem padrões éticos fundamentais, como o sigilo profissional e a qualidade técnica dos serviços prestados.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Emissão do Código de Ética Profissional</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Regulamentação do Atendimento Online (Resoluções recentes)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Gestão do cadastro e-Psi para teleconsultas</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Conselho Regional de Psicologia (CRP)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Os CRPs são as unidades regionais que executam a fiscalização direta do dia a dia da clínica. Cada estado possui sua jurisdição onde o psicólogo deve estar devidamente registrado para atuar legalmente. É através do CRP que você resolve questões de anuidade, ética local e denúncias.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Fiscalização de consultórios e clínicas</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Orientação técnica profissional</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Processos éticos disciplinares locais</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Resolutions Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-xs w-full text-center">
                  <Sparkles className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-800 mb-2">Automação Ética</h4>
                  <p className="text-xs text-slate-500">Regulamentado pelo CFP, automatizado pelo Meu Sistema Psi.</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Agenda, Cobrança e Prontuário: Tudo no Automático.</h3>
                  <p className="text-slate-600 mb-6">
                    A Resolução CFP 01/2009 exige rigor nos registros, mas não diz que você precisa sofrer com isso. O Meu Sistema Psi automatiza toda a gestão da sua clínica com segurança e ética, devolvendo a liberdade que você precisa para focar apenas nos seus pacientes.
                  </p>
                  <Link to="/cadastrar" className="inline-flex items-center gap-2 text-purple-600 font-bold hover:gap-3 transition-all">
                    Começar minha jornada de liberdade <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section — FAQPage Schema visible content */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" id="perguntas-frequentes">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Perguntas Frequentes sobre CRP e CFP</h2>
          <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">Dúvidas comuns sobre os Conselhos de Psicologia, registro profissional e regulamentação do atendimento.</p>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <FaqItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-[40px] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-20 -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 -ml-40 -mb-40" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Menos Burocracia, Mais Liberdade.</h2>
              <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mb-12">
                Agenda, Cobrança e Prontuários no automático para você ser 100% Psicólogo e 0% Secretário.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/cadastrar" className="px-10 py-5 bg-purple-600 text-white font-bold text-xl rounded-2xl shadow-xl shadow-purple-900/40 hover:bg-purple-700 transition-all transform hover:-translate-y-1">
                  Começar Teste de 30 Dias
                </Link>
              </div>
              
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-indigo-300 text-sm font-medium">
                <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> 100% Criptografado</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Adequado à LGPD</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Recomendado para Clínicas</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600 fill-purple-100" />
            <span className="font-bold text-slate-800">Meu Sistema Psi</span>
          </div>
          <p className="text-slate-500 text-xs">© 2026 Meu Sistema Psi. Guia de Referência CRP/CFP.</p>
          <div className="flex gap-6 text-xs font-medium text-slate-400">
            <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-purple-600 transition-colors">Blog</Link>
            <Link to="/vendas5" className="hover:text-purple-600 transition-colors">Funcionalidades</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
