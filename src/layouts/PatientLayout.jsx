import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const NAV = [
    { to: '/paciente/home',    icon: 'home',            label: 'Início' },
    { to: '/paciente/escalas', icon: 'assignment',      label: 'Escalas' },
    { to: '/paciente/perfil',  icon: 'person',          label: 'Perfil' },
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
            {/* Sidebar */}
            <aside style={{
                width: 180,
                minHeight: '100vh',
                background: '#fff',
                borderRight: '1px solid #e8eaf0',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
                flexShrink: 0,
                position: 'fixed',
                top: 0, left: 0, bottom: 0,
                zIndex: 10,
            }}>
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
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 14px',
                                borderRadius: 12,
                                fontWeight: 700,
                                fontSize: 14,
                                textDecoration: 'none',
                                color: isActive ? '#fff' : '#64748b',
                                background: isActive ? '#6d28d9' : 'transparent',
                                transition: 'all 0.15s',
                            })}
                        >
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
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ marginLeft: 180, flex: 1, minHeight: '100vh' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default PatientLayout;
