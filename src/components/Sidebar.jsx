import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const NAV_SECTIONS = [
    {
        items: [
            { title: 'Painel',  icon: 'dashboard',      path: '/dashboard' },
            { title: 'Agenda',  icon: 'calendar_month', path: '/agenda' },
        ],
    },
    {
        label: 'Clínico',
        items: [
            { title: 'Pacientes',        icon: 'group',              path: '/pacientes' },
            { title: 'Prontuários',      icon: 'folder_open',        path: '/prontuarios' },
            { title: 'Linha do Tempo',   icon: 'account_tree',       path: '/linha-do-tempo' },
            { title: 'Evoluções',        icon: 'clinical_notes',     path: '/evolucoes' },
            { title: 'Laudos',           icon: 'description',        path: '/laudos' },
            { title: 'Declarações',      icon: 'verified',           path: '/declaracoes' },
            { title: 'Atestados',        icon: 'favorite',           path: '/atestados' },
            { title: 'Anamneses',        icon: 'assignment',         path: '/anamneses' },
            { title: 'Encaminhamentos',  icon: 'swap_horiz',         path: '/encaminhamentos' },
            { title: 'TCLE',             icon: 'handshake',          path: '/tcles' },
            { title: 'Escalas',          icon: 'assignment_turned_in', path: '/escalas' },
        ],
    },
    {
        label: 'Gestão',
        items: [
            { title: 'Financeiro',  icon: 'account_balance_wallet', path: '/financeiro' },
            { title: 'Relatórios',  icon: 'bar_chart',              path: '/relatorios' },
        ],
    },
    {
        label: 'IA & Config',
        items: [
            { title: 'AI Clínica',     icon: 'psychology_alt', path: '/ai-clinica' },
            { title: 'Lixeira',        icon: 'delete_outline', path: '/lixeira' },
            { title: 'Configurações',  icon: 'settings',       path: '/configuracoes' },
        ],
    },
];

const BrandIcon = () => (
    <svg viewBox="0 0 200 260" width="28" height="32" aria-hidden="true" style={{ flexShrink: 0 }}>
        <defs>
            <linearGradient id="sbrandg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff66c2" />
                <stop offset="100%" stopColor="#c940a8" />
            </linearGradient>
        </defs>
        <g fill="none" stroke="url(#sbrandg)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 170,15 C 85,15 30,70 30,130 C 75,125 115,105 145,80 C 165,60 172,35 170,15 Z" />
            <path d="M 30,245 C 115,245 170,190 170,130 C 125,135 85,155 55,180 C 35,200 28,225 30,245 Z" />
        </g>
    </svg>
);

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user, logout, hasPermission } = useUser();

    const isAllowed = (path) => {
        if (!hasPermission) return true;
        return hasPermission(path.replace('/', ''));
    };

    const initials = user?.nome
        ? user.nome.replace(/^Dr\.?\s*/i, '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : '?';

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[190] md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed top-0 left-0 bottom-0 md:sticky h-screen z-[200] shrink-0 md:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}
                style={{ width: 260, background: '#fff', borderRight: '1px solid rgba(26,20,40,0.08)', display: 'flex', flexDirection: 'column' }}
            >
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 18px 16px', borderBottom: '1px solid rgba(26,20,40,0.05)', marginBottom: 10 }}>
                    <BrandIcon />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1a1428', lineHeight: 1.2, fontFamily: 'inherit' }}>Meu Sistema</div>
                        <div style={{ fontSize: 10, fontWeight: 500, color: '#8b7a9e', letterSpacing: '0.04em', marginTop: 2, fontFamily: 'inherit' }}>.PSI · Portal Clínico</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden ml-auto"
                        style={{ background: 'none', border: 0, cursor: 'pointer', color: '#8b7a9e', padding: 4, display: 'flex', alignItems: 'center' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '0 14px', overflowY: 'auto' }}>
                    {NAV_SECTIONS.map((section, si) => (
                        <div key={si}>
                            {section.label && (
                                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b7a9e', fontWeight: 600, padding: '14px 10px 6px', fontFamily: 'inherit' }}>
                                    {section.label}
                                </div>
                            )}
                            {section.items.filter(item => isAllowed(item.path)).map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavItem
                                        key={item.path}
                                        item={item}
                                        isActive={isActive}
                                        onClose={onClose}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* User profile */}
                <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(26,20,40,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #ffd7f0, #e8d8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: '#c940a8', fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>{initials}</span>
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1428', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{user?.nome}</div>
                        <div style={{ fontSize: 11, color: '#8b7a9e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{user?.especialidade}</div>
                    </div>
                    <LogoutBtn onClick={logout} />
                </div>
            </aside>
        </>
    );
};

const NavItem = ({ item, isActive, onClose }) => {
    const handleMouseEnter = (e) => {
        if (!isActive) e.currentTarget.style.background = '#fbf7ff';
    };
    const handleMouseLeave = (e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
    };

    return (
        <Link
            to={item.path}
            onClick={() => { if (window.innerWidth < 768) onClose(); }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1a1428' : '#4b3b5f',
                background: isActive
                    ? 'linear-gradient(135deg, rgba(255,102,194,0.12) 0%, rgba(134,89,232,0.12) 100%)'
                    : 'transparent',
                textDecoration: 'none',
                transition: 'background .15s, color .15s',
                marginBottom: 2,
                fontFamily: 'inherit',
            }}
        >
            <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, flexShrink: 0, width: 18, color: isActive ? '#c940a8' : '#8b7a9e' }}
            >
                {item.icon}
            </span>
            {item.title}
        </Link>
    );
};

const LogoutBtn = ({ onClick }) => {
    const handleMouseEnter = (e) => {
        e.currentTarget.style.color = '#ef4444';
        e.currentTarget.style.background = '#fef2f2';
    };
    const handleMouseLeave = (e) => {
        e.currentTarget.style.color = '#8b7a9e';
        e.currentTarget.style.background = 'transparent';
    };

    return (
        <button
            onClick={onClick}
            title="Sair do sistema"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#8b7a9e', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8, flexShrink: 0 }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
        </button>
    );
};

export default Sidebar;
