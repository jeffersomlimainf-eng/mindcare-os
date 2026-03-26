import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import Toast from './components/Toast';
import AnalyticsTracker from './components/AnalyticsTracker';
import WhatsAppButton from './components/WhatsAppButton';

// Lazy loading components for better performance
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pacientes = lazy(() => import('./pages/Pacientes'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Prontuarios = lazy(() => import('./pages/Prontuarios'));
const EvolucaoSessao = lazy(() => import('./pages/EvolucaoSessao'));
const HistoricoEvolucoes = lazy(() => import('./pages/HistoricoEvolucoes'));
const Financeiro = lazy(() => import('./pages/Financeiro'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Modelos = lazy(() => import('./pages/Modelos'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Recibo = lazy(() => import('./pages/Recibo'));
const LaudosLista = lazy(() => import('./pages/LaudosLista'));
const LaudoPsicologico = lazy(() => import('./pages/LaudoPsicologico'));
const DeclaracoesLista = lazy(() => import('./pages/DeclaracoesLista'));
const DeclaracaoComparecimento = lazy(() => import('./pages/DeclaracaoComparecimento'));
const AtestadosLista = lazy(() => import('./pages/AtestadosLista'));
const AtestadoSaudeMental = lazy(() => import('./pages/AtestadoSaudeMental'));
const AnamnesesLista = lazy(() => import('./pages/AnamnesesLista'));
const FichaAnamnese = lazy(() => import('./pages/FichaAnamnese'));
const EncaminhamentosLista = lazy(() => import('./pages/EncaminhamentosLista'));
const EncaminhamentoProfissional = lazy(() => import('./pages/EncaminhamentoProfissional'));
const TclesLista = lazy(() => import('./pages/TclesLista'));
const TermoConsentimento = lazy(() => import('./pages/TermoConsentimento'));
const ProntuarioDetalhado = lazy(() => import('./pages/ProntuarioDetalhado'));
const SelfRegister = lazy(() => import('./pages/SelfRegister'));
const AIClinica = lazy(() => import('./pages/AIClinica'));
const LinhaDoTempo = lazy(() => import('./pages/LinhaDoTempo'));
const EvolucoesLista = lazy(() => import('./pages/EvolucoesLista'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const PasswordReset = lazy(() => import('./pages/PasswordReset'));
const GerarCobranca = lazy(() => import('./pages/GerarCobranca'));
const VisualizarCobranca = lazy(() => import('./pages/VisualizarCobranca'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Vendas = lazy(() => import('./pages/Vendas'));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
            <p className="text-slate-500 font-medium animate-pulse">Carregando o Meu Sistema Psi...</p>
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUser();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
            </div>
        );
    }

    if (!user?.id) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
            </div>
        );
    }

    if (user?.id) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};


const AdminRoute = ({ children }) => {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
            </div>
        );
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <AnalyticsTracker />
            <WhatsAppButton />
            <Toast />
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<PublicRoute><Vendas /></PublicRoute>} />
                    <Route path="/vendas" element={<Navigate to="/" replace />} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/cadastrar" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                    <Route path="/self-register" element={<SelfRegister />} />
                    <Route path="/reset-password" element={<PublicRoute><PasswordReset /></PublicRoute>} />
                    <Route path="/cobranca/:id" element={<VisualizarCobranca />} />
                    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/pacientes" element={<Pacientes />} />
                        <Route path="/agenda" element={<Agenda />} />
                        <Route path="/prontuarios" element={<Prontuarios />} />
                        <Route path="/prontuarios/paciente/:id" element={<ProntuarioDetalhado />} />
                        <Route path="/prontuarios/evolucao/:id" element={<EvolucaoSessao />} />
                        <Route path="/prontuarios/historico/:pacienteId" element={<HistoricoEvolucoes />} />
                        <Route path="/financeiro" element={<Financeiro />} />
                        <Route path="/financeiro/recibo/:id" element={<Recibo />} />
                        <Route path="/financeiro/cobrar/:id" element={<GerarCobranca />} />
                        <Route path="/relatorios" element={<Relatorios />} />
                        <Route path="/ai-clinica" element={<AIClinica />} />
                        <Route path="/linha-do-tempo/:id?" element={<LinhaDoTempo />} />
                        <Route path="/evolucoes" element={<EvolucoesLista />} />
                        <Route path="/modelos" element={<Modelos />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        <Route path="/super-admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/laudos" element={<LaudosLista />} />
                        <Route path="/laudos/:id" element={<LaudoPsicologico />} />
                        <Route path="/declaracoes" element={<DeclaracoesLista />} />
                        <Route path="/declaracoes/:id" element={<DeclaracaoComparecimento />} />
                        <Route path="/atestados" element={<AtestadosLista />} />
                        <Route path="/atestados/:id" element={<AtestadoSaudeMental />} />
                        <Route path="/anamneses" element={<AnamnesesLista />} />
                        <Route path="/anamneses/:id" element={<FichaAnamnese />} />
                        <Route path="/encaminhamentos" element={<EncaminhamentosLista />} />
                        <Route path="/encaminhamentos/:id" element={<EncaminhamentoProfissional />} />
                        <Route path="/tcles" element={<TclesLista />} />
                        <Route path="/tcles/:id" element={<TermoConsentimento />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
