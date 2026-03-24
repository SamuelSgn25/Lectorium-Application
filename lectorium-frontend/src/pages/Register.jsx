import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AdhesionPage() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    codePostal: "",
    pays: "",
    dateNaissance: "",
    motivation: "",
    connaissancePrecedente: "",
    accepteConditions: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Votre demande d'adhésion a été envoyée avec succès ! Nous vous contacterons bientôt.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Formulaire d'Adhésion
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Rejoignez notre communauté spirituelle internationale. Remplissez ce formulaire pour commencer votre cheminement avec le Lectorium Rosicrucianum.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Informations Personnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  required
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  id="dateNaissance"
                  name="dateNaissance"
                  required
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Adresse
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  required
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="ville"
                    name="ville"
                    required
                    value={formData.ville}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    id="codePostal"
                    name="codePostal"
                    required
                    value={formData.codePostal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="pays" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <input
                    type="text"
                    id="pays"
                    name="pays"
                    required
                    value={formData.pays}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Votre Cheminement Spirituel
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                  Qu'est-ce qui vous motive à rejoindre le Lectorium Rosicrucianum ? *
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  required
                  rows="5"
                  value={formData.motivation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Partagez vos aspirations spirituelles..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="connaissancePrecedente" className="block text-sm font-medium text-gray-700 mb-2">
                  Avez-vous une connaissance préalable des enseignements rosicruciens ?
                </label>
                <textarea
                  id="connaissancePrecedente"
                  name="connaissancePrecedente"
                  rows="4"
                  value={formData.connaissancePrecedente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Décrivez votre parcours spirituel..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="accepteConditions"
                name="accepteConditions"
                required
                checked={formData.accepteConditions}
                onChange={handleChange}
                className="mt-1 w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="accepteConditions" className="ml-3 text-sm text-gray-700">
                J'accepte les conditions d'adhésion et je m'engage à respecter les principes et valeurs du Lectorium Rosicrucianum. Je comprends que cette demande sera examinée et qu'un entretien pourra être organisé. *
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition"
            >
              Soumettre ma demande d'adhésion
            </button>
            <Link
              to="/"
              className="flex-1 text-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-md font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Prochaines étapes</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
              <span>Votre demande sera examinée par notre équipe dans un délai de 7 jours</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
              <span>Un entretien personnel pourra être organisé pour mieux vous connaître</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
              <span>Vous recevrez une confirmation par email avec les prochaines étapes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

