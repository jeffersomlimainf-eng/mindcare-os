import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Agenda from './pages/Agenda';
import Prontuarios from './pages/Prontuarios';
import EvolucaoSessao from './pages/EvolucaoSessao';
import HistoricoEvolucoes from './pages/HistoricoEvolucoes';
import Financeiro from './pages/Financeiro';
import Relatorios from './pages/Relatorios';
import Modelos from './pages/Modelos';
import Configuracoes from './pages/Configuracoes';
import Recibo from './pages/Recibo';
import LaudosLista from './pages/LaudosLista';
import LaudoPsicologico from './pages/LaudoPsicologico';
import DeclaracoesLista from './pages/DeclaracoesLista';
import DeclaracaoComparecimento from './pages/DeclaracaoComparecimento';
import AtestadosLista from './pages/AtestadosLista';
import AtestadoSaudeMental from './pages/AtestadoSaudeMental';
import AnamnesesLista from './pages/AnamnesesLista';
import FichaAnamnese from './pages/FichaAnamnese';
import EncaminhamentosLista from './pages/EncaminhamentosLista';
import EncaminhamentoProfissional from './pages/EncaminhamentoProfissional';
import TclesLista from './pages/TclesLista';
import TermoConsentimento from './pages/TermoConsentimento';
import ProntuarioDetalhado from './pages/ProntuarioDetalhado';
import SelfRegister from './pages/SelfRegister';
import AIClinica from './pages/AIClinica';
import LinhaDoTempo from './pages/LinhaDoTempo';
import EvolucoesLista from './pages/EvolucoesLista';
import Onboarding from './pages/Onboarding';
import PasswordReset from './pages/PasswordReset';
import GerarCobranca from './pages/GerarCobranca';
import VisualizarCobranca from './pages/VisualizarCobranca';
import { useUser } from './contexts/UserContext';
import AdminDashboard from './pages/AdminDashboard';
import Vendas from './pages/Vendas';
import Toast from './components/Toast';
import AnalyticsTracker from './components/AnalyticsTracker';
import WhatsAppButton from './components/WhatsAppButton';

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
            <Routes>
                <Route path="/vendas" element={<Vendas />} />
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
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
