import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Lectorium Rosicrucianum */}
          <div>
            <h3 className="font-normal text-sm mb-4">Lectorium Rosicrucianum</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-light">
              École spirituelle internationale dédiée à la renaissance de l'homme selon les enseignements rosicruciens.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-normal text-sm mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition font-light">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-sm text-gray-600 hover:text-gray-900 transition font-light">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/actualites" className="text-sm text-gray-600 hover:text-gray-900 transition font-light">
                  Actualités
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-sm text-gray-600 hover:text-gray-900 transition font-light">
                  Activités
                </Link>
              </li>
            </ul>
          </div>

          {/* Membres */}
          <div>
            <h3 className="font-normal text-sm mb-4">Membres</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/connexion" className="text-sm text-gray-600 hover:text-gray-900 transition font-light">
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/adhesion" className="text-sm text-gray-600 hover:text-gray-900 transition font-light">
                  Adhésion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-normal text-sm mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600 font-light">
                <span className="font-normal">Email:</span> contact@lectorium-benin.org
              </li>
              <li className="text-sm text-gray-600 font-light">
                <span className="font-normal">Téléphone:</span> +229 01 21 30 45 67
              </li>
              <li className="text-sm text-gray-600 font-light">
                <span className="font-normal">Adresse:</span> Centre Lectorium, Cotonou, Bénin
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 font-light">
            © 2025 Lectorium Rosicrucianum. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

