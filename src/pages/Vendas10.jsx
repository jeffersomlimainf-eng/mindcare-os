import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BadgeCheck,
    BellRing,
    Brain,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    FileCheck2,
    FileText,
    HeartHandshake,
    LockKeyhole,
    MessageCircleMore,
    Radar,
    ShieldCheck,
    Sparkles,
    WalletCards
} from 'lucide-react';
import ReviewsSection from '../components/ReviewsSection';
import dashboardImg from '../assets/screens/dashboard.png';
import agendaImg from '../assets/screens/agenda.png';
import financeiroImg from '../assets/screens/financeiro.png';
import pacientesImg from '../assets/screens/Pacientes.png';

const enterUp = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: 'easeOut' }
    }
};

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const credibility = [
    { value: 'Agenda automatica', label: 'para reduzir esquecimentos e no-shows' },
    { value: 'Cobranca inteligente', label: 'sem voce virar cobrador do consultorio' },
    { value: 'Prontuario seguro', label: 'com aparencia e fluxo profissional' },
    { value: 'Operacao unificada', label: 'agenda, pacientes, documentos e financeiro' }
];

const painCards = [
    'Confirmar consulta no manual e ainda correr atras de resposta.',
    'Cobrar paciente pelo particular e carregar o desconforto emocional disso.',
    'Abrir varias abas ou conversas para controlar a semana.',
    'Perder energia com tarefas pequenas antes de atender.',
    'Parecer desorganizado mesmo sendo um bom profissional.',
    'Sentir que a rotina depende de voce o tempo inteiro.'
];

const valueCards = [
    {
        icon: CalendarClock,
        title: 'Agenda que continua trabalhando',
        text: 'O sistema organiza a semana, prepara o fluxo e ajuda voce a sair do modo reativo.'
    },
    {
        icon: MessageCircleMore,
        title: 'Confirmacao automatica',
        text: 'O paciente recebe a mensagem certa na hora certa, com menos atrito e mais previsibilidade.'
    },
    {
        icon: CircleDollarSign,
        title: 'Financeiro que cobra por voce',
        text: 'As cobrancas deixam de depender da sua memoria ou da sua energia emocional depois do atendimento.'
    },
    {
        icon: FileText,
        title: 'Tudo com cara de sistema premium',
        text: 'Voce transmite organizacao, metodo e confianca em cada etapa da experiencia do paciente.'
    }
];

const comparisonRows = [
    {
        manual: 'Confirma consulta no WhatsApp manualmente',
        automated: 'Lembretes e confirmacoes saem de forma automatica'
    },
    {
        manual: 'Lembra cobranca quando sobra energia',
        automated: 'Financeiro acompanha pendencias com linguagem profissional'
    },
    {
        manual: 'Mistura agenda, pagamentos e documentos na cabeca',
        automated: 'Centraliza tudo em um fluxo visual claro'
    },
    {
        manual: 'Passa imagem de improviso operacional',
        automated: 'Passa imagem de consultorio organizado e serio'
    }
];

const transitionCards = [
    {
        eyebrow: 'Antes',
        title: 'O consultorio depende da sua energia para tudo acontecer',
        points: [
            'Voce confirma consultas no manual.',
            'Voce lembra cobrancas quando sobra cabeca.',
            'Voce atende carregando a operacao inteira junto.'
        ],
        tone: 'rose'
    },
    {
        eyebrow: 'Depois',
        title: 'A rotina fica estruturada e o sistema assume a parte repetitiva',
        points: [
            'A agenda ajuda a confirmar sem conversa manual.',
            'O financeiro acompanha pendencias e cobrancas.',
            'Voce atende com mais presenca e menos peso operacional.'
        ],
        tone: 'emerald'
    }
];

const featureShowcase = [
    {
        eyebrow: 'Agenda viva',
        title: 'Veja a semana inteira com status, blocos e clareza de operacao',
        text: 'A agenda nao e so bonita. Ela ajuda o profissional a antecipar a rotina e entender o estado de cada sessao sem friccao visual.',
        image: agendaImg,
        alt: 'Agenda de consultas do Meu Sistema Psi',
        bullets: ['Visual limpo e profissional', 'Confirmacoes mais previsiveis', 'Menos desgaste operacional']
    },
    {
        eyebrow: 'Financeiro que acompanha',
        title: 'Receitas, pendencias e cobrancas em uma unica estrutura',
        text: 'Seu financeiro deixa de ser um conjunto de lembrancas soltas e passa a ser um processo claro, com cobranca automatizada e visao de caixa.',
        image: financeiroImg,
        alt: 'Tela financeira do Meu Sistema Psi',
        bullets: ['Regua de cobranca', 'Pendencias visiveis', 'Mais controle sem perseguir pagamento']
    },
    {
        eyebrow: 'Centro de comando',
        title: 'Abra o sistema e entenda seu dia em segundos',
        text: 'Dashboard com agenda, documentos, atalhos e panorama clinico para voce iniciar o dia sem caos e sem excesso de informacao.',
        image: dashboardImg,
        alt: 'Dashboard do Meu Sistema Psi',
        bullets: ['Acoes rapidas', 'Visao geral elegante', 'Rotina com mais calma']
    }
];

const patientFlow = [
    {
        icon: BellRing,
        title: 'Antes da consulta',
        text: 'O paciente recebe lembrete e a agenda fica mais protegida contra esquecimento.'
    },
    {
        icon: CheckCircle2,
        title: 'Na confirmacao',
        text: 'O sistema registra a confirmacao e voce nao precisa conduzir a conversa no manual.'
    },
    {
        icon: WalletCards,
        title: 'No financeiro',
        text: 'Quando existe pendencia, a cobranca entra no fluxo sem que o profissional precise se desgastar.'
    },
    {
        icon: FileCheck2,
        title: 'Na continuidade do atendimento',
        text: 'Documentos, pacientes e agenda permanecem conectados no mesmo ambiente.'
    }
];

const reassurance = [
    'Menos faltas por esquecimento.',
    'Menos vergonha ou desgaste para cobrar.',
    'Mais controle sem aumentar a carga mental.',
    'Mais tempo para focar no que e clinico.',
    'Mais impressao de metodo e confianca.',
    'Mais tranquilidade para crescer com organizacao.'
];

const faqs = [
    {
        question: 'Nao vai dar trabalho aprender a usar?',
        answer: 'A proposta do Meu Sistema Psi e justamente simplificar a rotina. A interface foi desenhada para deixar agenda, pacientes, documentos e financeiro mais claros, e nao para criar mais complexidade.'
    },
    {
        question: 'Eu ainda vou precisar confirmar consulta e cobrar manualmente?',
        answer: 'A ideia central desta pagina e mostrar o oposto: o sistema reduz bastante esse trabalho manual com agenda automatica, confirmacao de consultas e cobranca inteligente dentro do fluxo operacional.'
    },
    {
        question: 'Serve para quem atende sozinho e tambem para clinica?',
        answer: 'Sim. A pagina foi pensada para conversar tanto com o psicologo clinico individual quanto com consultorios e clinicas que querem mais organizacao, previsibilidade e imagem profissional.'
    },
    {
        question: 'As telas mostradas sao do produto real?',
        answer: 'Sim. A pagina usa imagens reais do proprio sistema para aumentar credibilidade e diminuir a distancia entre promessa e produto.'
    },
    {
        question: 'E se eu estiver cansado de planilha, WhatsApp manual e cobranca improvisada?',
        answer: 'Entao esta e exatamente a conversa certa. A pagina vende o ganho de sair do improviso e entrar em uma rotina mais organizada, com agenda, documentos e financeiro trabalhando de forma integrada.'
    },
    {
        question: 'Por que essa pagina foca tanto em agenda e financeiro?',
        answer: 'Porque essas sao duas das dores mais sensiveis na rotina de muitos psicologos. Quando agenda e cobranca saem do manual, a sensacao de alivio operacional fica muito mais evidente.'
    }
];

const searchIntentCards = [
    {
        title: 'Sistema para psicologos',
        text: 'Se a busca for por sistema para psicologos, software para psicologos ou sistema para clinica de psicologia, esta pagina responde com agenda, pacientes, documentos e financeiro em um so produto.'
    },
    {
        title: 'Agenda para psicologos',
        text: 'Se a intencao de busca for agenda para psicologos, agenda online para psicologos ou confirmacao automatica de consultas, o foco aqui esta na previsibilidade da rotina e na reducao de faltas.'
    },
    {
        title: 'Prontuario eletronico psicologia',
        text: 'Para quem pesquisa prontuario eletronico psicologia, prontuario digital para psicologos ou sistema com documentos clinicos, a pagina reforca organizacao, seguranca e continuidade de atendimento.'
    },
    {
        title: 'Gestao financeira para consultorio',
        text: 'Para buscas como gestao financeira psicologos, cobranca automatica psicologos, recebimentos em consultorio e controle financeiro clinica, a promessa principal e menos desgaste para cobrar e mais clareza operacional.'
    }
];

const seoEditorialTopics = [
    {
        title: 'Sistema para psicologos que organiza a clinica inteira',
        text: 'Quem pesquisa sistema para psicologos normalmente quer parar de separar agenda, pacientes, prontuario eletronico e financeiro em ferramentas desconectadas. O Meu Sistema Psi atende essa intencao porque centraliza a operacao da clinica em um unico ambiente visualmente profissional e facil de acompanhar.'
    },
    {
        title: 'Agenda online para psicologos com confirmacao automatica de consultas',
        text: 'Para buscas como agenda para psicologos, agenda online para psicologos, sistema de agendamento psicologos e confirmacao automatica de consultas, esta pagina mostra exatamente o beneficio principal: menos faltas, menos retrabalho e mais previsibilidade para a semana de atendimentos.'
    },
    {
        title: 'Gestao financeira e cobranca automatica para consultorio psicologico',
        text: 'Tambem existe uma intencao de busca muito forte em torno de gestao financeira psicologos, cobranca automatica psicologos e controle financeiro para consultorio. Aqui o diferencial e que o sistema nao so registra valores: ele ajuda o profissional a cobrar com mais estrutura e menos desgaste emocional.'
    }
];

const testimonialCards = [
    {
        name: 'Dra. Amanda Ribeiro',
        role: 'Psicologa clinica',
        metric: 'Menos faltas e menos mensagens manuais',
        quote: 'Antes eu gastava energia confirmando sessoes e lembrando pagamentos. Com o sistema, minha agenda ficou mais previsivel e meu consultorio passou a parecer muito mais organizado.'
    },
    {
        name: 'Marcos Vieira',
        role: 'Terapeuta e gestor de clinica',
        metric: 'Mais controle financeiro',
        quote: 'O financeiro deixou de ser um peso no fim do dia. Hoje eu acompanho pendencias e recebimentos sem precisar virar cobrador depois de atender.'
    },
    {
        name: 'Dra. Beatriz Lopes',
        role: 'Psicologa online',
        metric: 'Mais imagem profissional',
        quote: 'A melhor parte foi a sensacao de ordem. Pacientes percebem mais organizacao, eu fico menos sobrecarregada e o atendimento flui com muito mais calma.'
    }
];

const offerHighlights = [
    'Teste gratis para conhecer a rotina automatizada.',
    'Sem depender de agenda manual e cobranca improvisada.',
    'Ideal para psicologo clinico, consultorio individual ou clinica com equipe.',
    'Mais tempo para atendimento, menos tempo para operacao.'
];

function SectionHeading({ eyebrow, title, description, light = false }) {
    return (
        <div className="max-w-3xl">
            <p className={`text-sm font-black uppercase tracking-[0.28em] ${light ? 'text-sky-300' : 'text-sky-700'}`}>
                {eyebrow}
            </p>
            <h2 className={`mt-4 text-4xl font-black tracking-tight md:text-5xl ${light ? 'text-white' : 'text-slate-950'}`}>
                {title}
            </h2>
            {description ? (
                <p className={`mt-5 text-lg leading-8 ${light ? 'text-slate-300' : 'text-slate-600'}`}>
                    {description}
                </p>
            ) : null}
        </div>
    );
}

export default function Vendas10() {
    const [openFaq, setOpenFaq] = useState(0);

    useEffect(() => {
        const updateMeta = (name, content) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        const updateOg = (property, content) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        document.title = 'Sistema para Psicologos com Agenda e Cobranca | Meu Sistema Psi';
        updateMeta(
            'description',
            'Sistema para psicologos com agenda automatica, confirmacao de consultas, prontuario eletronico e cobranca inteligente para clinica de psicologia.'
        );
        updateMeta(
            'keywords',
            'sistema para psicologos, software para psicologos, agenda para psicologos, agenda automatica psicologos, confirmacao automatica de consultas, cobranca automatica psicologos, gestao financeira psicologos, prontuario eletronico psicologia, prontuario digital psicologos, sistema para clinica de psicologia, software para consultorio psicologico, whatsapp para psicologos, lembrete de consulta psicologo, sistema de agendamento psicologos'
        );
        updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        updateMeta('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        updateMeta('author', 'Meu Sistema Psi');
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', 'Sistema para Psicologos com Agenda e Cobranca | Meu Sistema Psi');
        updateMeta(
            'twitter:description',
            'Software para psicologos com agenda automatica, prontuario eletronico e cobranca inteligente para clinica de psicologia.'
        );
        updateMeta('twitter:image', 'https://meusistemapsi.com.br/og-image.png');

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://meusistemapsi.com.br/vendas10');

        updateOg('og:title', 'Sistema para Psicologos com Agenda e Cobranca | Meu Sistema Psi');
        updateOg(
            'og:description',
            'Software para psicologos com agenda automatica, cobranca inteligente, prontuario eletronico e gestao clinica profissional.'
        );
        updateOg('og:url', 'https://meusistemapsi.com.br/vendas10');
        updateOg('og:image', 'https://meusistemapsi.com.br/og-image.png');
        updateOg('og:type', 'website');
        updateOg('og:locale', 'pt_BR');

        window.scrollTo(0, 0);
    }, []);

    const pageStructuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': 'https://meusistemapsi.com.br/vendas10#webpage',
                url: 'https://meusistemapsi.com.br/vendas10',
                name: 'Sistema para Psicologos com Agenda e Cobranca | Meu Sistema Psi',
                description: 'Pagina sobre sistema para psicologos com agenda automatica, confirmacao de consultas, prontuario eletronico e cobranca inteligente.',
                isPartOf: {
                    '@id': 'https://meusistemapsi.com.br/#website'
                },
                about: {
                    '@id': 'https://meusistemapsi.com.br/#software'
                },
                inLanguage: 'pt-BR'
            },
            {
                '@type': 'SoftwareApplication',
                '@id': 'https://meusistemapsi.com.br/#software',
                name: 'Meu Sistema Psi',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                url: 'https://meusistemapsi.com.br/vendas10',
                image: 'https://meusistemapsi.com.br/og-image.png',
                description: 'Sistema para psicologos com agenda automatica, prontuario eletronico, gestao financeira, confirmacao de consultas e cobranca inteligente.',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'BRL',
                    availability: 'https://schema.org/InStock',
                    url: 'https://meusistemapsi.com.br/cadastrar'
                },
                brand: {
                    '@type': 'Brand',
                    name: 'Meu Sistema Psi'
                },
                featureList: [
                    'Agenda automatica para psicologos',
                    'Confirmacao automatica de consultas',
                    'Cobranca automatica e gestao financeira',
                    'Prontuario eletronico para psicologia',
                    'Sistema para clinica de psicologia',
                    'Gestao de pacientes e documentos'
                ]
            },
            {
                '@type': 'BreadcrumbList',
                '@id': 'https://meusistemapsi.com.br/vendas10#breadcrumb',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: 'https://meusistemapsi.com.br/'
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Vendas 10',
                        item: 'https://meusistemapsi.com.br/vendas10'
                    }
                ]
            },
            {
                '@type': 'FAQPage',
                '@id': 'https://meusistemapsi.com.br/vendas10#faq',
                mainEntity: faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer
                    }
                }))
            }
        ]
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f6f8fc] text-slate-900">
            <script type="application/ld+json">
                {JSON.stringify(pageStructuredData)}
            </script>
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-sky-200/45 blur-3xl" />
                <div className="absolute right-[-8rem] top-16 h-[30rem] w-[30rem] rounded-full bg-violet-200/35 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-200/30 blur-3xl" />
            </div>

            <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-slate-950"
                    >
                        <Brain className="h-4 w-4 text-sky-600" />
                        Meu Sistema Psi
                    </Link>

                    <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
                        <a href="#diferenca" className="transition hover:text-slate-950">Diferenca</a>
                        <a href="#produto" className="transition hover:text-slate-950">Produto</a>
                        <a href="#faq" className="transition hover:text-slate-950">FAQ</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 sm:inline-flex"
                        >
                            Entrar
                        </Link>
                        <Link
                            to="/cadastrar"
                            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                        >
                            Testar gratis
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                <section className="px-6 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
                            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
                                <motion.div
                                    variants={enterUp}
                                    className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Agenda automatica, cobranca inteligente e operacao premium
                                </motion.div>

                                <motion.h1
                                    variants={enterUp}
                                    className="mt-6 text-5xl font-black leading-[0.94] tracking-tight text-slate-950 md:text-6xl xl:text-7xl"
                                >
                                    O sistema que faz sua
                                    <span className="block text-sky-600">agenda se confirmar</span>
                                    e seu
                                    <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-violet-600 bg-clip-text text-transparent">
                                        financeiro se mover sem voce.
                                    </span>
                                </motion.h1>

                                <motion.p
                                    variants={enterUp}
                                    className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl"
                                >
                                    O <strong>Meu Sistema Psi</strong> foi desenhado para vender alivio operacional.
                                    Menos mensagem manual. Menos cobranca constrangedora. Mais rotina organizada,
                                    previsibilidade na agenda e imagem profissional para o seu consultorio.
                                </motion.p>

                                <motion.div variants={enterUp} className="mt-9 flex flex-col gap-4 sm:flex-row">
                                    <Link
                                        to="/cadastrar"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-[0_24px_60px_rgba(5,150,105,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
                                    >
                                        Quero testar agora
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <a
                                        href="#produto"
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        Ver o produto por dentro
                                    </a>
                                </motion.div>

                                <motion.div variants={enterUp} className="mt-8 flex flex-wrap gap-3">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                        Teste gratis
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                        Menos faltas
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                        Menos desgaste para cobrar
                                    </span>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.85, ease: 'easeOut', delay: 0.12 }}
                                className="relative"
                            >
                                <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.35),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.22),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.66),rgba(255,255,255,0.12))] blur-2xl" />

                                <div className="relative rounded-[2.3rem] border border-white/80 bg-white/80 p-4 shadow-[0_45px_120px_rgba(15,23,42,0.14)] backdrop-blur">
                                    <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
                                        <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50">
                                            <img
                                                src={agendaImg}
                                                alt="Agenda automatica do Meu Sistema Psi"
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </div>

                                        <div className="grid gap-4">
                                            <div className="rounded-[1.6rem] bg-slate-950 p-5 text-white">
                                                <p className="text-[11px] uppercase tracking-[0.28em] text-sky-300">Operacao automatizada</p>
                                                <h2 className="mt-2 text-2xl font-black leading-tight">
                                                    Seu consultorio roda com mais ordem e menos atrito.
                                                </h2>
                                                <p className="mt-4 text-sm leading-6 text-slate-300">
                                                    A agenda confirma. O financeiro acompanha. O profissional respira.
                                                </p>
                                            </div>

                                            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-950">Consulta confirmada</p>
                                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                                            O paciente responde no fluxo e a agenda fica previsivel sem conversa manual.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                                                        <WalletCards className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-950">Cobranca inteligente</p>
                                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                                            O sistema acompanha pendencias para voce nao virar cobrador depois de atender.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                                        <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                                            <div className="flex items-center gap-2 text-sky-700">
                                                <BellRing className="h-4 w-4" />
                                                <span className="text-sm font-black">Lembrete</span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                O paciente recebe o contato no momento certo.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                                            <div className="flex items-center gap-2 text-emerald-700">
                                                <Radar className="h-4 w-4" />
                                                <span className="text-sm font-black">Previsibilidade</span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                A agenda ganha ritmo sem depender da sua memoria.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
                                            <div className="flex items-center gap-2 text-violet-700">
                                                <HeartHandshake className="h-4 w-4" />
                                                <span className="text-sm font-black">Postura</span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                O consultorio passa mais confianca em cada etapa.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-8 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-4 rounded-[2.6rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] md:grid-cols-4 md:p-8">
                        {credibility.map((item) => (
                            <div key={item.value} className="rounded-[1.7rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                                <p className="text-2xl font-black text-slate-950">{item.value}</p>
                                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="px-6 py-18 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl rounded-[2.6rem] border border-rose-100 bg-[linear-gradient(135deg,#fff4f4_0%,#fff9f0_100%)] p-8 md:p-10 lg:p-14">
                        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
                            <SectionHeading
                                eyebrow="A dor que vende"
                                title="Seu problema nao e falta de competencia. E excesso de operacao manual."
                                description="Profissionais bons acabam parecendo sobrecarregados quando precisam confirmar agenda, lembrar pagamento e organizar a rotina no improviso."
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                {painCards.map((item) => (
                                    <div key={item} className="rounded-[1.6rem] border border-white bg-white p-5 shadow-sm">
                                        <p className="text-base leading-7 text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16 lg:px-8 lg:py-20">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Intencoes de busca"
                            title="Conteudo alinhado com o que psicologos pesquisam no Google, Bing e buscadores com IA"
                            description="Esta pagina foi otimizada para responder buscas relacionadas a sistema para psicologos, software para consultorio psicologico, agenda online, prontuario eletronico e cobranca automatica."
                        />

                        <div className="mt-10 grid gap-6 md:grid-cols-2">
                            {searchIntentCards.map((item) => (
                                <div key={item.title} className="rounded-[1.8rem] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                                    <h3 className="text-2xl font-black tracking-tight text-slate-950">{item.title}</h3>
                                    <p className="mt-4 leading-8 text-slate-600">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm">
                            <Link to="/precos" className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200">
                                planos para psicologos
                            </Link>
                            <Link to="/melhor-sistema-para-psicologos" className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200">
                                melhor sistema para psicologos
                            </Link>
                            <Link to="/blog" className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200">
                                blog de psicologia
                            </Link>
                            <Link to="/crp" className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200">
                                conformidade e credibilidade
                            </Link>
                        </div>
                    </div>
                </section>

                <section id="diferenca" className="px-6 py-16 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="A diferenca pratica"
                            title="Voce nao esta comprando so software. Esta comprando uma rotina mais leve."
                            description="A proposta comercial da pagina e simples: tirar o profissional do operacional repetitivo e colocar o sistema para fazer o trabalho chato."
                        />

                        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {valueCards.map(({ icon: Icon, title, text }) => (
                                <motion.div
                                    key={title}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.45, ease: 'easeOut' }}
                                    className="rounded-[1.9rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
                                >
                                    <div className="inline-flex rounded-2xl bg-sky-50 p-3 text-sky-700">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-950 px-6 py-18 text-white lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Manual versus automatizado"
                            title="A mudanca que o paciente sente e o profissional agradece"
                            description="Nao e so eficiencia. E a sensacao de que existe um sistema estruturado por tras do atendimento."
                            light
                        />

                        <div className="mt-10 grid gap-6 lg:grid-cols-2">
                            {transitionCards.map((card) => (
                                <div
                                    key={card.eyebrow}
                                    className={`rounded-[2rem] border p-7 ${
                                        card.tone === 'rose'
                                            ? 'border-rose-400/20 bg-rose-500/10'
                                            : 'border-emerald-400/20 bg-emerald-500/10'
                                    }`}
                                >
                                    <p className={`text-sm font-black uppercase tracking-[0.26em] ${card.tone === 'rose' ? 'text-rose-200' : 'text-emerald-200'}`}>
                                        {card.eyebrow}
                                    </p>
                                    <h3 className="mt-4 text-2xl font-black tracking-tight text-white">{card.title}</h3>
                                    <div className="mt-6 space-y-3">
                                        {card.points.map((point) => (
                                            <div key={point} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                                                <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${card.tone === 'rose' ? 'text-rose-300' : 'text-emerald-300'}`} />
                                                <p className="text-slate-200">{point}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/5">
                            <div className="grid grid-cols-1 border-b border-white/10 lg:grid-cols-[1fr_1fr]">
                                <div className="border-b border-white/10 bg-rose-500/10 px-6 py-5 text-lg font-black text-rose-100 lg:border-b-0 lg:border-r lg:border-white/10">
                                    Sem o Meu Sistema Psi
                                </div>
                                <div className="bg-emerald-500/10 px-6 py-5 text-lg font-black text-emerald-100">
                                    Com o Meu Sistema Psi
                                </div>
                            </div>

                            {comparisonRows.map((row) => (
                                <div key={row.manual} className="grid grid-cols-1 border-t border-white/10 lg:grid-cols-[1fr_1fr] lg:border-t-0">
                                    <div className="border-b border-white/10 px-6 py-5 text-slate-300 lg:border-b-0 lg:border-r lg:border-white/10">
                                        {row.manual}
                                    </div>
                                    <div className="px-6 py-5 text-white">{row.automated}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="produto" className="px-6 py-18 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Produto por dentro"
                            title="Telas reais para vender credibilidade, nao promessas vagas"
                            description="Aqui a pagina sobe de nivel porque mostra o sistema com aparencia real, premium e utilizavel. Isso encurta a distancia entre curiosidade e decisao."
                        />

                        <div className="mt-12 space-y-10">
                            {featureShowcase.map((item, index) => (
                                <div
                                    key={item.title}
                                    className={`grid gap-8 rounded-[2.4rem] border border-slate-200 bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.06)] md:p-7 lg:grid-cols-2 lg:items-center ${index % 2 === 1 ? 'lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1' : ''}`}
                                >
                                    <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50">
                                        <img src={item.image} alt={item.alt} className="h-auto w-full object-cover" />
                                    </div>

                                    <div className="px-2 md:px-4">
                                        <p className="text-sm font-black uppercase tracking-[0.26em] text-sky-700">{item.eyebrow}</p>
                                        <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-950">{item.title}</h3>
                                        <p className="mt-5 text-lg leading-8 text-slate-600">{item.text}</p>

                                        <div className="mt-7 flex flex-wrap gap-3">
                                            {item.bullets.map((bullet) => (
                                                <span
                                                    key={bullet}
                                                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                                                >
                                                    {bullet}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.06)] md:p-7">
                            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                                <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50">
                                    <img src={pacientesImg} alt="Tela de pacientes do Meu Sistema Psi" className="h-auto w-full object-cover" />
                                </div>

                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.26em] text-violet-700">Base da operacao</p>
                                    <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                                        Pacientes, documentos e historico em um unico ecossistema
                                    </h3>
                                    <p className="mt-5 text-lg leading-8 text-slate-600">
                                        A venda fica mais forte quando a pessoa percebe que agenda e financeiro nao estao isolados.
                                        Eles fazem parte de um consultorio digital inteiro, com mais consistencia e mais valor percebido.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-18 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Prova social"
                            title="Depoimentos com dor especifica e beneficio claro convertem melhor"
                            description="Quando a pessoa se reconhece na dor e ve o resultado pratico, a chance de avancar aumenta muito. Por isso, aqui entram relatos mais especificos sobre agenda, cobranca e organizacao."
                        />

                        <div className="mt-12 grid gap-6 lg:grid-cols-3">
                            {testimonialCards.map((item) => (
                                <div key={item.name} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_22px_60px_rgba(15,23,42,0.05)]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-lg font-black text-sky-700">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-950">{item.name}</p>
                                            <p className="text-sm text-slate-500">{item.role}</p>
                                        </div>
                                    </div>
                                    <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                                        {item.metric}
                                    </p>
                                    <p className="mt-4 text-lg leading-8 text-slate-600">
                                        "{item.quote}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_100%)] px-6 py-18 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Motor de automacao"
                            title="Uma cadeia simples que reduz atrito em toda a jornada"
                            description="A agenda puxa a rotina. A confirmacao protege o horario. O financeiro continua o fluxo. E voce atende com menos peso mental."
                        />

                        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {patientFlow.map(({ icon: Icon, title, text }) => (
                                <div key={title} className="rounded-[1.8rem] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                                    <div className="inline-flex rounded-2xl bg-violet-50 p-3 text-violet-700">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                                    <p className="mt-3 leading-7 text-slate-600">{text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
                            <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
                                <p className="text-sm font-black uppercase tracking-[0.26em] text-sky-300">Resultado emocional</p>
                                <h3 className="mt-4 text-3xl font-black tracking-tight">
                                    O consultorio parece mais organizado porque ele realmente esta.
                                </h3>
                                <p className="mt-4 text-lg leading-8 text-slate-300">
                                    A melhor venda aqui nao e tecnologia pela tecnologia. E a sensacao de ordem, seriedade e cuidado que o sistema entrega.
                                </p>
                            </div>

                            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {reassurance.map((item) => (
                                        <div key={item} className="flex items-start gap-3 rounded-[1.4rem] bg-slate-50 p-4">
                                            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                                            <p className="text-base leading-7 text-slate-700">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-18 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl rounded-[2.6rem] bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_45%,#eef2ff_100%)] p-8 shadow-[0_28px_70px_rgba(15,23,42,0.06)] md:p-12">
                        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-700">Teste gratis</p>
                                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                                    Comece sem carregar a operacao inteira nas costas.
                                </h2>
                                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                                    Esta oferta fica mais forte quando deixa claro que a pessoa nao esta so testando um software. Ela esta testando uma rotina mais leve, mais previsivel e mais profissional.
                                </p>
                            </div>

                            <div className="rounded-[2rem] border border-white bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)] md:p-8">
                                <div className="space-y-4">
                                    {offerHighlights.map((item) => (
                                        <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                                            <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                                            <p className="text-slate-700">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                    <Link
                                        to="/cadastrar"
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-500"
                                    >
                                        Criar minha conta gratis
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/precos"
                                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Ver planos
                                    </Link>
                                </div>

                                <p className="mt-4 text-center text-sm text-slate-500">
                                    Mais facil testar uma rotina profissional do que continuar resolvendo tudo no improviso.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <ReviewsSection />

                <section className="px-6 py-18 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <SectionHeading
                            eyebrow="Bloco editorial SEO"
                            title="Conteudo mais denso para aparecer em pesquisas sobre software para psicologos"
                            description="Buscadores tradicionais e buscadores com IA tendem a responder melhor quando a pagina explica com clareza o problema, o produto e o contexto da decisao. Por isso, entra aqui um bloco mais editorial e semantico."
                        />

                        <div className="mt-12 grid gap-6 lg:grid-cols-3">
                            {seoEditorialTopics.map((topic) => (
                                <article key={topic.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                                    <h3 className="text-2xl font-black tracking-tight text-slate-950">{topic.title}</h3>
                                    <p className="mt-5 leading-8 text-slate-600">{topic.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="px-6 py-18 lg:px-8 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                        <SectionHeading
                            eyebrow="Perguntas finais"
                            title="Removendo as ultimas objecoes antes do clique"
                            description="A pagina tambem precisa segurar a decisao no final. Aqui entram respostas para objecoes sobre uso, valor, adaptacao e rotina."
                        />

                        <div className="space-y-4">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index;

                                return (
                                    <div
                                        key={faq.question}
                                        className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                        >
                                            <span className="text-lg font-black text-slate-950">{faq.question}</span>
                                            <ChevronDown
                                                className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {isOpen ? (
                                            <div className="border-t border-slate-100 px-6 py-5 text-slate-600">
                                                <p className="leading-7">{faq.answer}</p>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-24 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-[2.8rem] bg-[linear-gradient(135deg,#0f172a_0%,#111827_35%,#0b3b5a_100%)] p-8 text-white shadow-[0_35px_110px_rgba(15,23,42,0.28)] md:p-12">
                        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-300">Fechamento</p>
                                <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                                    Pare de sustentar no manual uma operacao que ja pode andar sozinha.
                                </h2>
                                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                                    O Meu Sistema Psi foi feito para o profissional que quer rotina organizada, imagem premium e menos peso operacional no dia a dia.
                                </p>
                            </div>

                            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                                        <Clock3 className="mt-1 h-5 w-5 text-sky-300" />
                                        <p className="text-slate-200">Menos tempo gasto com confirmacoes e cobrancas manuais.</p>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                                        <ShieldCheck className="mt-1 h-5 w-5 text-emerald-300" />
                                        <p className="text-slate-200">Mais consistencia, mais organizacao e mais confianca transmitida ao paciente.</p>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                                        <LockKeyhole className="mt-1 h-5 w-5 text-violet-300" />
                                        <p className="text-slate-200">Tudo integrado em um sistema com visual profissional e proposta clara de valor.</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                    <Link
                                        to="/cadastrar"
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
                                    >
                                        Criar minha conta gratis
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/precos"
                                        className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Ver planos
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
