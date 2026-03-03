import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Accueil', path: '/' },
        { name: 'À Propos', path: '/about' },
        { name: 'Événements', path: '/events' },
        { name: 'Actualités', path: '/news' },
        { name: 'Podcasts', path: '/podcasts' }
    ];

    return (
        <nav className="fixed w-full z-50 top-0 start-0 bg-white/90 backdrop-blur-md border-b border-stone-200">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4 px-6">
                <Link to="/" className="flex items-center space-x-3">
                    <img src="/logo.png" className="h-[48px] object-contain" alt="Lectorium Rosicrucianum Logo" />
                    <span className="self-center text-xl font-serif text-stone-800 tracking-wide font-light">
                        Lectorium Rosicrucianum
                    </span>
                </Link>

                {/* Mobile menu button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-stone-600 hover:text-stone-900 focus:outline-none"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`${isOpen ? "block" : "hidden"} w-full md:flex md:w-auto md:order-1 items-center gap-8`}>
                    <ul className="flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0 font-medium text-stone-600">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    to={link.path}
                                    className={`block py-2 px-3 rounded-sm md:p-0 transition-colors ${location.pathname === link.path ? 'text-[#b89047]' : 'hover:text-[#b89047]'}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex bg-transparent md:order-2 space-x-3 mt-4 md:mt-0 pb-4 md:pb-0">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="flex items-center gap-2 text-stone-700 hover:text-[#b89047] transition-colors text-sm font-semibold">
                                    <User size={18} />
                                    <span>Espace {user.role === 'Admin' ? 'Admin' : 'Membre'}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-stone-600 hover:text-red-700 font-medium rounded-lg text-sm px-4 py-2 transition-all flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    <span className="hidden md:inline">Sortir</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-stone-600 hover:text-[#b89047] transition-colors font-medium text-sm">
                                    Connexion
                                </Link>
                                <Link to="/register" className="text-white bg-[#b89047] hover:bg-[#a37b3b] font-medium rounded px-5 py-2 text-sm transition-all shadow-sm">
                                    Demande d'adhésion
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
