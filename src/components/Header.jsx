import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
    const navigate = useNavigate();

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex flex-col">
                <h2 className="text-slate-900 dark:text-white font-bold text-lg">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    Hoje: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </button>
                <button 
                    onClick={() => navigate('/agenda')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nova Consulta
                </button>
            </div>
        </header>
    );
};

export default Header;
