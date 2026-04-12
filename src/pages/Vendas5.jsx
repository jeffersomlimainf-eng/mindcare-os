import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    ShieldCheck,
    Sparkles,
    ChevronRight,
    MessageCircle
} from 'lucide-react';

const Vendas5 = () => {
    const navigate = useNavigate();

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

        document.title = "Sistema para Psicólogos: Agenda e Cobrança Automática | CRP e CFP";
        updateMeta('description', 'Ganhe liberdade com agenda e cobrança 100% automáticas. O Meu Sistema Psi é a única plataforma de gestão clínica 100% adequeada às normas do CRP e CFP. Teste grátis.');
        updateMeta('keywords', 'CRP, CFP, sistema para psicólogos, agenda automática psicologia, cobrança automática psicólogos, prontuário eletrônico CFP, gestão consultório psicologia');

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://meusistemapsi.com.br/vendas5');

        updateOg('og:title', 'Secretária Virtual para Psicólogos — Psiquê | Meu Sistema Psi');
        updateOg('og:description', 'A Psiquê cuida da burocracia enquanto você foca no paciente. Lembretes, cobranças e prontuários no automático. Teste grátis 30 dias.');
        updateOg('og:url', 'https://meusistemapsi.com.br/vendas5');
        updateOg('og:image', 'https://meusistemapsi.com.br/og-image.png');
    }, []);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
            
            {/* Header/Nav */}
            <header className="absolute top-0 w-full z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30">
                        Psi
                    </div>
                    <span className="font-bold text-xl text-slate-800 tracking-tight">MeuSistema Psi</span>
                </div>
                <div className="hidden md:flex gap-4">
                    <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
                        Entrar
                    </button>
                    <button onClick={() => navigate('/cadastrar')} className="px-5 py-2.5 text-sm font-medium bg-amber-400 text-amber-950 rounded-xl shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.23)] hover:bg-amber-300 transition-all">
                        Testar Grátis
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100/40 via-slate-50 to-white -z-10"></div>
                <div className="absolute top-0 right-0 -mr-48 mt-12 opacity-30 blur-3xl rounded-full bg-teal-200 w-96 h-96 mix-blend-multiply"></div>
                <div className="absolute bottom-0 left-0 -ml-40 mb-20 opacity-30 blur-3xl rounded-full bg-amber-100 w-80 h-80 mix-blend-multiply"></div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-2xl"
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>A sua nova secretária virtual integrada</span>
                        </motion.div>
                        
                        <motion.div variants={fadeIn}>
                            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                                Agenda e Cobrança <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
                                    100% no Automático.
                                </span>
                            </h1>
                        </motion.div>

                        <motion.p variants={fadeIn} className="text-lg text-slate-600 leading-relaxed mb-8">
                            Ganhe a <strong>liberdade</strong> que você merece. O Meu Sistema Psi cuida da burocracia e das cobranças enquanto você foca no paciente, garantindo 100% de conformidade com as normas do <strong>CRP e CFP</strong>.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => navigate('/cadastrar')} className="group flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-amber-400 text-amber-950 rounded-xl shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.23)] hover:bg-amber-300 transition-all">
                                Testar Grátis por 30 Dias
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => navigate('/precos')} className="px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                                Ver Planos
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-amber-500/10 rounded-2xl transform rotate-3 scale-105 blur-lg z-0"></div>
                        <img 
                            src="/vendas5_hero.png" 
                            alt="MeuSistema Psi Dashboard com IA" 
                            className="relative z-10 w-full h-auto rounded-2xl shadow-2xl ring-1 ring-slate-900/5 object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Como a Psiquê devolve o seu tempo
                        </h2>
                        <p className="text-lg text-slate-600">
                            Automatize tarefas repetitivas e ofereça uma experiência premium aos seus pacientes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group bg-slate-50 border border-slate-100 rounded-2xl p-8 hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Agenda que fala sozinha</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Esqueça o vaivém de mensagens. O sistema envia lembretes automáticos, solicita confirmação e faz o check-in do paciente por você, direto no WhatsApp ou E-mail.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="group bg-slate-50 border border-slate-100 rounded-2xl p-8 hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Financeiro Autônomo</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Chega de cobranças constrangedoras. O sistema envia faturas, cobra pendências educadamente e emite recibos automáticos. Você só olha o dinheiro entrando.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="group bg-slate-50 border border-slate-100 rounded-2xl p-8 hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança CRP e CFP</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Prontuários 100% seguros com criptografia de ponta e adequação total à LGPD e às resoluções do CFP. Sua clínica protegida juridicamente 24h por dia.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Banners */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 space-y-24">
                    {/* Conheça a Psiquê */}
                    <div>
                        <img 
                            src="/vendas5_conheca_psique.png" 
                            alt="Conheça a Psiquê" 
                            className="w-full h-auto rounded-3xl shadow-2xl ring-1 ring-slate-900/5 object-contain"
                        />
                    </div>
                    {/* Bio-Painel */}
                    <div>
                        <img 
                            src="/vendas5_biopainel.png" 
                            alt="Bio-Painel: Inteligência de dados" 
                            className="w-full h-auto rounded-3xl shadow-2xl ring-1 ring-slate-900/5 object-contain"
                        />
                    </div>
                    {/* Sigilo Absoluto */}
                    <div>
                        <img 
                            src="/vendas5_sigilo.png" 
                            alt="Sigilo absoluto e liberdade" 
                            className="w-full h-auto rounded-3xl shadow-2xl ring-1 ring-slate-900/5 object-contain"
                        />
                    </div>
                </div>
            </section>

            {/* Final Conversion Footer */}
            <footer className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                        Parem de ser o "faz tudo" da sua clínica.
                    </h2>
                    <p className="text-xl text-slate-600 mb-10">
                        Liberte-se da burocracia e das cobranças manuais. O Meu Sistema Psi faz o trabalho pesado para que você foque 100% no paciente e na sua qualidade de vida.
                    </p>
                    <button onClick={() => navigate('/cadastrar')} className="group inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-bold bg-amber-400 text-amber-950 rounded-xl shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.23)] hover:bg-amber-300 transition-all">
                        Criar minha conta gratuita agora
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <p className="mt-6 text-sm text-slate-500">
                        Sem necessidade de cartão de crédito. Cancele quando quiser.
                    </p>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} MeuSistema Psi. Todos os direitos reservados.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-teal-600 transition-colors">Termos de Uso</a>
                        <a href="#" className="hover:text-teal-600 transition-colors">Política de Privacidade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Vendas5;
