import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, CheckSquare, FileText, Timer, Sun, Moon, Cloud, CloudOff, LogOut, ClipboardList, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Layout = () => {
    const { theme, toggleTheme, logout } = useApp();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', icon: <Home size={22} />, label: 'Home' },
        { path: '/timetable', icon: <Calendar size={22} />, label: 'Schedule' },
        { path: '/exams', icon: <ClipboardList size={22} />, label: 'Exams' },
        { path: '/assignments', icon: <CheckSquare size={22} />, label: 'Tasks' },
        { path: '/notes', icon: <FileText size={22} />, label: 'Notes' },
        { path: '/timer', icon: <Timer size={22} />, label: 'Timer' },
    ];

    const [deferredPrompt, setDeferredPrompt] = React.useState(null);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="app-container">
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            {/* Mobile/Tablet Header */}
            <header className="header glass">
                <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src="/app-logo.png" alt="StudentLife Logo" className="app-logo-icon" />
                    <h1 className="logo">StudentLife</h1>
                </div>
                <div className="header-actions">
                    {deferredPrompt && (
                        <button onClick={handleInstallClick} className="theme-toggle" style={{ color: 'var(--primary)' }}>
                            <Cloud size={20} />
                        </button>
                    )}
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button onClick={() => navigate('/profile')} className="theme-toggle">
                        <User size={20} />
                    </button>
                </div>
            </header>

            {/* Desktop Sidebar / Mobile Bottom Nav */}
            <nav className="bottom-nav glass">
                <div className="sidebar-top desktop-only">
                    <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: '2rem' }}>
                        <img src="/app-logo.png" alt="StudentLife Logo" className="app-logo-icon" />
                        <h1 className="logo">StudentLife</h1>
                    </div>
                </div>

                <div className="nav-items-wrapper">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-bottom desktop-only">
                    {deferredPrompt && (
                        <button onClick={handleInstallClick} className="nav-item theme-btn-sidebar" style={{ width: '100%', cursor: 'pointer', color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)' }}>
                            <span className="nav-icon"><Cloud size={22} /></span>
                            <span className="nav-label">Install App</span>
                        </button>
                    )}
                    <button onClick={toggleTheme} className="nav-item theme-btn-sidebar" style={{ width: '100%', cursor: 'pointer' }}>
                        <span className="nav-icon">{theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}</span>
                        <span className="nav-label">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="nav-item profile-btn-sidebar" style={{ width: '100%', cursor: 'pointer' }}>
                        <span className="nav-icon"><User size={22} /></span>
                        <span className="nav-label">My Profile</span>
                    </button>
                    <button onClick={logout} className="nav-item logout-btn-sidebar" style={{ width: '100%', cursor: 'pointer', marginTop: '1rem', color: 'var(--danger)' }}>
                        <span className="nav-icon"><LogOut size={22} /></span>
                        <span className="nav-label">Sign Out</span>
                    </button>
                </div>
            </nav>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
