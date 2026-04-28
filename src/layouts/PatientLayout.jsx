import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const NAV = [
    { to: '/paciente/home',    icon: 'home',       label: 'Início' },
    { to: '/paciente/escalas', icon: 'assignment', label: 'Escalas' },
    { to: '/paciente/perfil',  icon: 'person',     label: 'Perfil' },
];

const PatientLayout = () => {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/paciente/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                /* ── Sidebar: visível só em telas ≥ 768px ── */
                .ps-sidebar {
                    width: 180px;
                    min-height: 100vh;
                    background: #fff;
                    border-right: 1px solid #e8eaf0;
                    display: flex;
                    flex-direction: column;
                    padding: 24px 0;
                    flex-shrink: 0;
                    position: fixed;
                    top: 0; left: 0; bottom: 0;
                    z-index: 10;
                }
                /* ── Conteúdo principal ── */
                .ps-main {
                    margin-left: 180px;
                    flex: 1;
                    min-height: 100vh;
                    min-width: 0;
                    overflow-x: hidden;
                }
                /* ── Bottom nav: escondido por padrão (desktop) ── */
                .ps-bottom-nav { display: none !important; }

                /* ── Mobile ── */
                @media (max-width: 767px) {
                    .ps-sidebar    { display: none !important; }
                    .ps-main       { margin-left: 0; padding-bottom: 80px; }
                    .ps-bottom-nav {
                        display: flex !important;
                        position: fixed;
                        bottom: 0; left: 0; right: 0;
                        background: #fff;
                        border-top: 1px solid #e8eaf0;
                        padding: 8px 0;
                        padding-bottom: max(8px, env(safe-area-inset-bottom));
                        z-index: 100;
                        justify-content: space-around;
                        align-items: center;
                    }
                }
            `}</style>

            {/* ── Sidebar (desktop) ── */}
            <aside className="ps-sidebar">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px 28px' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>psychology</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1e1b4b', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                        MEU SISTEMA<br/>PSI
                    </span>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}>
                    {NAV.map(({ to, icon, label }) => (
                        <NavLink key={to} to={to} style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 12,
                            fontWeight: 700, fontSize: 14, textDecoration: 'none',
                            color: isActive ? '#fff' : '#64748b',
                            background: isActive ? '#6d28d9' : 'transparent',
                            transition: 'all 0.15s',
                        })}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '0 10px 8px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 12, border: 0,
                            background: 'transparent', cursor: 'pointer',
                            fontWeight: 700, fontSize: 14, color: '#ef4444',
                            transition: 'all 0.15s', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
                        Sair
                    </button>
                </div>
            </aside>

            {/* ── Conteúdo principal ── */}
            <main className="ps-main">
                <Outlet />
            </main>

            {/* ── Bottom navigation (mobile) ── */}
            <nav className="ps-bottom-nav">
                {NAV.map(({ to, icon, label }) => (
                    <NavLink key={to} to={to} style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 3, padding: '4px 20px', textDecoration: 'none',
                        color: isActive ? '#6d28d9' : '#94a3b8',
                        transition: 'color 0.15s',
                    })}>
                        {({ isActive }) => (
                            <>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: 24,
                                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                                }}>
                                    {icon}
                                </span>
                                <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 600, letterSpacing: '0.03em' }}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default PatientLayout;
