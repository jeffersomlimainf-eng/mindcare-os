import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { PatientProvider } from './contexts/PatientContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { EvolutionProvider } from './contexts/EvolutionContext';
import { ModelProvider } from './contexts/ModelContext';
import { LaudoProvider } from './contexts/LaudoContext';
import { DeclaracaoProvider } from './contexts/DeclaracaoContext';
import { AtestadoProvider } from './contexts/AtestadoContext';
import { AnamneseProvider } from './contexts/AnamneseContext';
import { EncaminhamentoProvider } from './contexts/EncaminhamentoContext';
import { TcleProvider } from './contexts/TcleContext';
import { logger } from './utils/logger';

/**
 * ErrorBoundary Global para capturar falhas críticas e oferecer recuperação.
 */
class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        logger.error('[Fatal Error Boundary]', error, errorInfo);
    }

    handleReset = () => {
        // Limpa storage e cookies para tentar recuperar de estados corrompidos
        localStorage.clear();
        sessionStorage.clear();
        
        // Tenta remover cookies do Supabase se possível via JS
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Recarrega a página do zero
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center antialiased">
                    <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl">
                        <div className="size-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl">running_with_errors</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-4 italic tracking-tight">Ops! Algo travou no sistema.</h1>
                        <p className="text-slate-500 font-medium mb-8">
                            Isso pode ter sido causado por dados antigos em cache ou uma falha inesperada na carga inicial.
                        </p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={this.handleReset}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                Limpar Cache e Reiniciar
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                            >
                                Apenas Recarregar
                            </button>
                        </div>
                        
                        <div className="mt-10 pt-6 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Detalhes técnicos</p>
                            <div className="bg-slate-50 p-4 rounded-xl text-left overflow-auto max-h-32">
                                <code className="text-[10px] text-rose-500 font-bold whitespace-pre">
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <GlobalErrorBoundary>
            <ThemeProvider>
                <NotificationProvider>
                    <UserProvider>
                        <PatientProvider>
                            <AppointmentProvider>
                                <FinanceProvider>
                                    <EvolutionProvider>
                                        <ModelProvider>
                                            <LaudoProvider>
                                                <DeclaracaoProvider>
                                                    <AtestadoProvider>
                                                        <AnamneseProvider>
                                                            <EncaminhamentoProvider>
                                                                <TcleProvider>
                                                                    <App />
                                                                </TcleProvider>
                                                            </EncaminhamentoProvider>
                                                        </AnamneseProvider>
                                                    </AtestadoProvider>
                                                </DeclaracaoProvider>
                                            </LaudoProvider>
                                        </ModelProvider>
                                    </EvolutionProvider>
                                </FinanceProvider>
                            </AppointmentProvider>
                        </PatientProvider>
                    </UserProvider>
                </NotificationProvider>
            </ThemeProvider>
        </GlobalErrorBoundary>
    </React.StrictMode>
);



