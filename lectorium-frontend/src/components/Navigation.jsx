import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">L</span>
            </div>
            <span className="text-base font-normal">Lectorium Rosicrucianum</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
              Accueil
            </Link>
            <Link to="/a-propos" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
              À propos
            </Link>
            <Link to="/actualites" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
              Actualités
            </Link>
            <Link to="/podcasts" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
              Podcasts
            </Link>
            <Link to="/activities" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
              Activités
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
                    Admin
                  </Link>
                )}
                <Link to="/members/profil" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
                  Mon Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-normal text-gray-900 hover:text-gray-600 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="text-sm font-normal text-gray-900 hover:text-gray-600 transition">
                  Connexion
                </Link>
                <Link 
                  to="/adhesion" 
                  className="bg-black text-white px-6 py-2.5 rounded-md text-sm font-normal hover:bg-gray-800 transition"
                >
                  Adhésion
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t animate-in slide-in-from-top-2 duration-300">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
            >
              Accueil
            </Link>
            <Link 
              to="/a-propos" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
            >
              À propos
            </Link>
            <Link 
              to="/actualites" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
            >
              Actualités
            </Link>
            <Link 
              to="/podcasts" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
            >
              Podcasts
            </Link>
            <Link 
              to="/activities" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
            >
              Activités
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  to="/members/profil" 
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
                >
                  Mon Profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-normal text-gray-900 hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/connexion" 
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm font-normal hover:text-gray-600 hover:bg-gray-50 rounded-md transition"
                >
                  Connexion
                </Link>
                <Link 
                  to="/adhesion" 
                  onClick={() => setIsOpen(false)}
                  className="block bg-black text-white px-6 py-2.5 rounded-md text-sm font-normal hover:bg-gray-800 transition text-center mt-4"
                >
                  Adhésion
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

