import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import NovoAgendamentoModal from '../components/NovoAgendamentoModal';
import { useAppointments } from '../contexts/AppointmentContext';
import { useNotifications } from '../contexts/NotificationContext';
import { showToast } from '../components/Toast';
import NotificationDropdown from '../components/NotificationDropdown';
import TenantSwitcher from '../components/TenantSwitcher';
import { useUser } from '../contexts/UserContext';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';

const titulos = {
    '/dashboard': 'Painel Principal',
    '/pacientes': 'Diretório de Pacientes',
    '/agenda': 'Agenda de Consultas',
    '/prontuarios': 'Prontuários',
    '/financeiro': 'Gestão Financeira',
    '/relatorios': 'Relatórios e Análises',
    '/modelos': 'Modelos de Documentos',
    '/configuracoes': 'Configurações',
    '/tcles': 'Termos de Consentimento',
};

const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const titulo = titulos[location.pathname] || 'Meu Sistema Psi';
    const { user } = useUser();
    const isTrialExpired = user?.is_trial && user?.trial_end_date && new Date(user.trial_end_date) < new Date();
    const isLocked = (user?.plan_status !== 'Ativo' || isTrialExpired) && location.pathname !== '/configuracoes';
    
    const { addAppointment } = useAppointments();
    const { unreadCount } = useNotifications();
    const [modalNovaConsulta, setModalNovaConsulta] = useState(false);
    const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Integrar atalho Esc Global
    useGlobalShortcuts({
        isModalOpen: modalNovaConsulta || notificacoesAbertas || isSidebarOpen,
        closeModal: () => {
            if (modalNovaConsulta) setModalNovaConsulta(false);
            if (notificacoesAbertas) setNotificacoesAbertas(false);
            if (isSidebarOpen) setIsSidebarOpen(false);
        }
    });

    // Proteção de rota
    if (!user?.id) {
        return <Navigate to="/login" replace />;
    }

    if (user && user.onboardingCompleted === false) {
        return <Navigate to="/onboarding" replace />;
    }


    const handleNovaConsulta = (dados) => {
        const horaNum = parseInt(dados.hora.split(':')[0]) + parseInt(dados.hora.split(':')[1]) / 60;
        const d = new Date(dados.ano, dados.mes, dados.dia);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dataISO = `${year}-${month}-${day}`;

        const payload = {
            ...dados,
            timeStart: horaNum,
            data: dataISO,
            status: 'confirmado'
        };

        addAppointment(payload);
        setModalNovaConsulta(false);
        showToast('Consulta agendada com sucesso!', 'success');
    };

    return (
        <>
            <NovoAgendamentoModal
                isOpen={modalNovaConsulta}
                onClose={() => setModalNovaConsulta(false)}
                onSave={handleNovaConsulta}
            />

            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased print:bg-white overflow-x-hidden">
                <div className="print:hidden">
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                </div>
                <main className="flex-1 flex flex-col min-w-0 max-w-full print:m-0">
                    {/* Header Global */}
                    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm print:hidden">
                        <div className="flex items-center gap-2 md:gap-3">
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden flex items-center justify-center p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg truncate max-w-[150px] sm:max-w-none">{titulo}</h2>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Tenant Switcher (Apenas para Admin) */}
                            {/* {user.role === 'admin' && <TenantSwitcher />} */}

                            {/* Data */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>

                            {/* Botão Nova Consulta */}
                            <button
                                onClick={() => setModalNovaConsulta(true)}
                                className="flex items-center justify-center size-10 md:size-auto md:w-auto md:px-5 md:py-2 bg-primary text-white text-sm font-bold rounded-xl md:rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                <span className="hidden md:inline ml-2">Nova Consulta</span>
                            </button>

                            {/* Notificações */}
                            <div className="relative">
                                <button 
                                    onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
                                    className={`relative p-2 rounded-lg transition-colors ${notificacoesAbertas ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                                >
                                    <span className="material-symbols-outlined">notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <NotificationDropdown 
                                    isOpen={notificacoesAbertas} 
                                    onClose={() => setNotificacoesAbertas(false)} 
                                />
                            </div>
                        </div>
                    </header>

                    {/* Conteúdo da página */}
                    <div className="p-4 md:p-8 flex-1 w-full print:p-0">
                        {isLocked ? (
                            <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                                <span className="material-symbols-outlined text-6xl text-rose-500 mb-4 animate-bounce">{isTrialExpired ? 'hourglass_empty' : 'lock'}</span>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">
                                    {isTrialExpired ? 'Período de Testes Expirado' : 'Acesso Suspenso'}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                                    {isTrialExpired 
                                        ? 'Seu período de testes de 30 dias expirou. Assine um plano para continuar acessando seus dados e recursos.' 
                                        : `Sua assinatura está **${user.plan_status === 'Inadimplente' ? 'em atraso' : 'suspensa'}**. Para continuar usando o Meu Sistema Psi, regularize seu pagamento.`}
                                </p>
                                <button 
                                    onClick={() => navigate('/configuracoes')} 
                                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-base">credit_card</span>
                                    {isTrialExpired ? 'Assinar um Plano' : 'Regularizar Assinatura'}
                                </button>
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default DashboardLayout;


