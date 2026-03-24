import { Link } from "react-router-dom";
import { Heart, BookOpen, Users, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Accueil"
        description="Découvrez le Lectorium Rosicrucianum Benin, une école spirituelle internationale dédiée à la renaissance de l'homme véritable selon les enseignements de la sagesse universelle."
        keywords="Lectorium Rosicrucianum, Rose-Croix, spiritualité, Bénin, école spirituelle"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 mb-6 leading-tight">
                Lectorium<br />Rosicrucianum
              </h1>
              <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed font-light">
                Une école spirituelle internationale dédiée à la renaissance de l'homme véritable selon les enseignements de la sagesse universelle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/a-propos"
                  className="bg-black text-white px-8 py-3.5 rounded-md text-sm font-normal hover:bg-gray-800 transition text-center"
                >
                  Découvrir notre mission
                </Link>
                <Link
                  to="/adhesion"
                  className="border border-black text-black px-8 py-3.5 rounded-md text-sm font-normal hover:bg-black hover:text-white transition text-center"
                >
                  Rejoindre notre communauté
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop"
                alt="Jardin spirituel - Lectorium Rosicrucianum"
                className="w-full h-full object-cover"
                loading="eager"
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs Fondamentales */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              Nos Valeurs Fondamentales
            </h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto font-light">
              Le Lectorium Rosicrucianum s'appuie sur des valeurs spirituelles universelles qui guident notre approche et nos enseignements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Amour Universel */}
            <article className="text-center p-6 sm:p-8 bg-white rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Amour Universel</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Cultiver l'amour inconditionnel et la compassion envers tous les êtres.
              </p>
            </article>

            {/* Sagesse Éternelle */}
            <article className="text-center p-6 sm:p-8 bg-white rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Sagesse Éternelle</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Étudier et transmettre les enseignements spirituels universels.
              </p>
            </article>

            {/* Fraternité */}
            <article className="text-center p-6 sm:p-8 bg-white rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Fraternité</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Construire une communauté basée sur l'entraide et le respect mutuel.
              </p>
            </article>

            {/* Service */}
            <article className="text-center p-6 sm:p-8 bg-white rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Service</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Servir l'humanité par nos actions et notre transformation personnelle.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Une Tradition Millénaire */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=800&fit=crop"
                alt="Livres anciens - Tradition rosicrucienne"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                Une Tradition Millénaire
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                Depuis des siècles, la tradition rosicrucienne transmet un enseignement spirituel unique visant à la renaissance de l'homme selon son essence divine. Notre école propose un chemin de transformation intérieure basé sur la connaissance de soi et l'amour universel.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed font-light">
                À travers nos activités, conférences et enseignements, nous accompagnons chaque chercheur dans sa quête de vérité et de réalisation spirituelle, dans le respect de sa liberté et de son rythme personnel.
              </p>
              <Link
                to="/a-propos"
                className="inline-block bg-black text-white px-8 py-3.5 rounded-md text-sm font-normal hover:bg-gray-800 transition"
              >
                En savoir plus sur notre histoire
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Prochains Événements */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              Prochains Événements
            </h2>
            <p className="text-base lg:text-lg text-gray-600 font-light">
              Découvrez nos prochaines activités ouvertes au public et aux membres
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Event 1 */}
            <article className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl font-light text-gray-900">15</div>
                    <div className="text-sm text-gray-600 font-light">Fév</div>
                  </div>
                  <span className="bg-black text-white text-xs px-3 py-1.5 rounded-full font-normal">
                    Public
                  </span>
                </div>
                <h3 className="text-lg font-normal mb-2">
                  Conférence sur la Sagesse Universelle
                </h3>
                <p className="text-gray-600 text-sm font-light">Cotonou</p>
              </div>
            </article>

            {/* Event 2 */}
            <article className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl font-light text-gray-900">22</div>
                    <div className="text-sm text-gray-600 font-light">Fév</div>
                  </div>
                  <span className="bg-gray-200 text-gray-800 text-xs px-3 py-1.5 rounded-full font-normal">
                    Membres
                  </span>
                </div>
                <h3 className="text-lg font-normal mb-2">
                  Séminaire Membres - Étude des Textes
                </h3>
                <p className="text-gray-600 text-sm font-light">Porto-Novo</p>
              </div>
            </article>

            {/* Event 3 */}
            <article className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl font-light text-gray-900">8</div>
                    <div className="text-sm text-gray-600 font-light">Mai</div>
                  </div>
                  <span className="bg-gray-200 text-gray-800 text-xs px-3 py-1.5 rounded-full font-normal">
                    Membres
                  </span>
                </div>
                <h3 className="text-lg font-normal mb-2">
                  Retraite Spirituelle
                </h3>
                <p className="text-gray-600 text-sm font-light">Abomey</p>
              </div>
            </article>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/activities"
              className="inline-block bg-black text-white px-8 py-3.5 rounded-md text-sm font-normal hover:bg-gray-800 transition"
            >
              Voir toutes les activités
            </Link>
          </div>
        </div>
      </section>

      {/* Rejoignez Notre Communauté */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                Rejoignez Notre Communauté
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                Devenez membre de notre communauté spirituelle internationale et accédez à un programme d'activités exclusives, de formations spirituelles et d'accompagnement personnalisé dans votre cheminement.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-600 font-light">Accès aux séminaires et retraites membres</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-600 font-light">Bibliothèque d'enseignements exclusifs</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-600 font-light">Accompagnement spirituel personnalisé</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-600 font-light">Participation à la vie communautaire</span>
                </li>
              </ul>
              <Link
                to="/adhesion"
                className="inline-block bg-black text-white px-8 py-3.5 rounded-md text-sm font-normal hover:bg-gray-800 transition"
              >
                Devenir membre
              </Link>
            </div>
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop"
                alt="Communauté spirituelle - Lectorium Rosicrucianum"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

