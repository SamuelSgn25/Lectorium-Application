import { Link } from "react-router-dom";
import { History, Target, Users, BookOpen, Heart, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

export default function AboutPage() {
  return (
    <>
      <SEO
        title="À propos"
        description="Découvrez l'histoire, la mission et les valeurs du Lectorium Rosicrucianum Benin, une école spirituelle internationale dédiée à la renaissance de l'homme véritable."
        keywords="Lectorium Rosicrucianum, histoire, mission, valeurs, Bénin, spiritualité"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-6">
              À Propos du Lectorium Rosicrucianum
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Une école spirituelle internationale dédiée à la renaissance de l'homme véritable selon les enseignements de la sagesse universelle.
            </p>
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                <History className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                Notre Histoire
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                Le Lectorium Rosicrucianum est une école spirituelle internationale fondée en 1924. Elle s'inscrit dans la grande tradition de la Rose-Croix d'Or, une fraternité spirituelle qui remonte au XVIe siècle.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                En partant des œuvres classiques de la Rose-Croix d'Or, le Lectorium Rosicrucianum transmet un enseignement spirituel adapté à l'époque moderne. Cette école est présente dans de nombreux pays à travers le monde.
              </p>
              <p className="text-gray-600 leading-relaxed font-light">
                Au Bénin, notre communauté œuvre à faire connaître ces enseignements universels et accompagne les chercheurs sincères dans leur cheminement spirituel.
              </p>
            </div>
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"
                alt="Histoire du Lectorium Rosicrucianum"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Mission du Lectorium Rosicrucianum"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                Notre Mission
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                Le Lectorium Rosicrucianum a pour mission de transmettre un enseignement spirituel universel qui permet à l'homme de réaliser sa transformation intérieure et de redécouvrir sa nature véritable.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed font-light">
                À travers ses activités, conférences, séminaires et publications, l'école offre des outils concrets pour développer la connaissance de soi, la sagesse et l'amour universel.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-600 font-light">Transmettre les enseignements de la sagesse universelle</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-600 font-light">Accompagner le chercheur dans son cheminement spirituel</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-600 font-light">Construire une communauté fraternelle</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 lg:py-24 bg-white">
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
            <article className="text-center p-6 sm:p-8 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Amour Universel</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Cultiver l'amour inconditionnel et la compassion envers tous les êtres vivants.
              </p>
            </article>

            <article className="text-center p-6 sm:p-8 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Sagesse Éternelle</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Étudier et transmettre les enseignements spirituels universels de la tradition rosicrucienne.
              </p>
            </article>

            <article className="text-center p-6 sm:p-8 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Fraternité</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Construire une communauté basée sur l'entraide, le respect mutuel et l'unité.
              </p>
            </article>

            <article className="text-center p-6 sm:p-8 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-normal mb-3">Service</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                Servir l'humanité par nos actions, notre transformation personnelle et notre dévouement.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Rejoignez-nous */}
      <section className="py-16 lg:py-24 bg-gray-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-light mb-6">
            Rejoignez Notre Communauté
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Participez à notre mission spirituelle et découvrez un chemin de transformation intérieure adapté à notre époque.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/adhesion"
              className="bg-white text-black px-8 py-3.5 rounded-md text-sm font-normal hover:bg-gray-100 transition"
            >
              Devenir membre
            </Link>
            <Link
              to="/activities"
              className="border-2 border-white text-white px-8 py-3.5 rounded-md text-sm font-normal hover:bg-white hover:text-black transition"
            >
              Voir nos activités
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

