import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useUser();

    const menuItems = [
        { title: 'Painel', icon: 'dashboard', path: '/dashboard', activeColor: 'text-primary bg-primary/5 border-primary' },
        { title: 'Pacientes', icon: 'group', path: '/pacientes', activeColor: 'text-primary bg-primary/5 border-primary' },
        { title: 'Agenda', icon: 'calendar_month', path: '/agenda', activeColor: 'text-primary bg-primary/5 border-primary' },
        { title: 'Prontuários', icon: 'folder_open', path: '/prontuarios', activeColor: 'text-blue-600 bg-blue-50/50 border-blue-500 dark:bg-blue-900/10' },
        { title: 'Linha do Tempo', icon: 'visibility', path: '/linha-do-tempo', activeColor: 'text-blue-600 bg-blue-50/50 border-blue-500 dark:bg-blue-900/10' },
        { title: 'Evoluções', icon: 'clinical_notes', path: '/evolucoes', activeColor: 'text-emerald-600 bg-emerald-50/50 border-emerald-500 dark:bg-emerald-900/10' },
        { title: 'Laudos', icon: 'clinical_notes', path: '/laudos', activeColor: 'text-violet-600 bg-violet-50/50 border-violet-500 dark:bg-violet-900/10' },
        { title: 'Declarações', icon: 'verified', path: '/declaracoes', activeColor: 'text-emerald-600 bg-emerald-50/50 border-emerald-500 dark:bg-emerald-900/10' },
        { title: 'Atestados', icon: 'medical_information', path: '/atestados', activeColor: 'text-amber-600 bg-amber-50/50 border-amber-500 dark:bg-amber-900/10' },
        { title: 'Anamneses', icon: 'assignment', path: '/anamneses', activeColor: 'text-rose-600 bg-rose-50/50 border-rose-500 dark:bg-rose-900/10' },
        { title: 'Encaminhamentos', icon: 'send', path: '/encaminhamentos', activeColor: 'text-indigo-600 bg-indigo-50/50 border-indigo-500 dark:bg-indigo-900/10' },
        { title: 'TCLE', icon: 'handshake', path: '/tcles', activeColor: 'text-rose-600 bg-rose-50/50 border-rose-500 dark:bg-rose-900/10' },
        { title: 'Financeiro', icon: 'account_balance_wallet', path: '/financeiro', activeColor: 'text-primary bg-primary/5 border-primary' },
        { title: 'Relatórios', icon: 'bar_chart', path: '/relatorios', activeColor: 'text-primary bg-primary/5 border-primary' },
        { title: 'AI Clínica', icon: 'psychology_alt', path: '/ai-clinica', activeColor: 'text-purple-600 bg-purple-50/50 border-purple-500 dark:bg-purple-900/10' },
        { title: 'Configurações', icon: 'settings', path: '/configuracoes', activeColor: 'text-primary bg-primary/5 border-primary' },

    ];

    const filteredItems = menuItems.filter(item => !item.adminOnly || user.role === 'admin');

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen shadow-xl z-20">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm overflow-hidden p-1.5 border border-slate-100 dark:border-slate-800">
                        <img src="/favicon.png" alt="Logo" className="size-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white text-sm font-bold leading-none">Meu Sistema Psi</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Portal Clínico</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${isActive
                                ? `${item.activeColor} border-l-4 font-bold`
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary font-medium'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <p className="text-sm leading-normal">{item.title}</p>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-2">
                    <div className="size-9 rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Perfil" className="size-full object-cover" />
                        ) : (
                            <div className="size-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                                {user.nome ? user.nome.charAt(user.nome.startsWith('Dr.') ? 4 : 0) : '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-slate-900 dark:text-white text-xs font-bold truncate">{user.nome}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate">{user.especialidade}</p>
                    </div>
                    <button 
                        onClick={() => {
                            console.log('[Sidebar] Iniciando logout...');
                            logout();
                        }}
                        className="flex items-center justify-center size-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all ml-auto group"
                        title="Sair do sistema"
                    >
                        <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
