import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function NewsPage() {
  const news = [
    {
      id: 1,
      title: "Conférence Publique sur la Sagesse Universelle",
      excerpt: "Nous avons le plaisir de vous inviter à notre prochaine conférence publique qui aura lieu le 15 février 2025.",
      date: "2025-01-15",
      author: "Lectorium Benin",
      category: "Événement",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    },
    {
      id: 2,
      title: "Nouveau Programme de Formation Spirituelle",
      excerpt: "Découvrez notre nouveau programme de formation destiné aux membres souhaitant approfondir leur cheminement spirituel.",
      date: "2025-01-10",
      author: "Lectorium Benin",
      category: "Formation",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
    },
    {
      id: 3,
      title: "Inauguration du Nouveau Centre",
      excerpt: "C'est avec joie que nous inaugurons notre nouveau centre à Cotonou, un espace dédié à l'enseignement et à la méditation.",
      date: "2024-12-20",
      author: "Lectorium Benin",
      category: "Actualité",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-BJ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Actualités
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Restez informé de nos dernières nouvelles et événements
          </p>
        </div>

        {news.length > 0 && (
          <div className="mb-16">
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-full">
                  <img
                    src={news[0].image}
                    alt={news[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <span className="inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                    {news[0].category}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-4">
                    {news[0].title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed font-light mb-6">
                    {news[0].excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(news[0].date)}
                    <User className="w-4 h-4 mr-2 ml-4" />
                    {news[0].author}
                  </div>
                  <Link
                    to={`/actualites/${news[0].id}`}
                    className="inline-flex items-center text-black font-medium hover:underline"
                  >
                    Lire la suite
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.slice(1).map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                  {item.category}
                </span>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light mb-4">
                  {item.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(item.date)}
                  </div>
                  <Link
                    to={`/actualites/${item.id}`}
                    className="inline-flex items-center text-black font-medium hover:underline"
                  >
                    Lire
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 bg-black text-white rounded-lg p-8 lg:p-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-light mb-4">
            Restez informé
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-light">
            Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et invitations aux événements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition">
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

