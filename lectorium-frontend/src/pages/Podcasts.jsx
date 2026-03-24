import { Calendar, Clock, Play, Download } from "lucide-react";

export default function PodcastsPage() {
  const podcasts = [
    {
      id: 1,
      title: "Les Enseignements de la Sagesse Universelle",
      description: "Une introduction aux enseignements spirituels du Lectorium Rosicrucianum et leur application dans la vie quotidienne.",
      duration: "45:30",
      date: "2025-01-15",
      category: "Enseignement",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop",
    },
    {
      id: 2,
      title: "Le Chemin de la Transformation Intérieure",
      description: "Exploration des étapes de la transformation spirituelle et des outils pour développer la connaissance de soi.",
      duration: "52:15",
      date: "2025-01-08",
      category: "Méditation",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    },
    {
      id: 3,
      title: "L'Amour Universel dans la Tradition Rosicrucienne",
      description: "Discussion sur le rôle de l'amour universel dans la voie spirituelle et comment le cultiver au quotidien.",
      duration: "38:45",
      date: "2024-12-30",
      category: "Philosophie",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
    },
    {
      id: 4,
      title: "Pratiques Méditatives Quotidiennes",
      description: "Guidance pratique pour intégrer la méditation dans votre routine quotidienne et développer votre pratique spirituelle.",
      duration: "35:20",
      date: "2024-12-22",
      category: "Pratique",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop",
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
            Podcasts
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Écoutez nos enseignements et conférences à tout moment
          </p>
        </div>

        {podcasts.length > 0 && (
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                <div className="relative h-64 lg:h-full">
                  <img
                    src={podcasts[0].image}
                    alt={podcasts[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition">
                      <Play className="w-8 h-8 text-black ml-1" />
                    </button>
                  </div>
                </div>
                <div className="p-8 lg:p-12 lg:col-span-2 flex flex-col justify-center">
                  <span className="inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                    {podcasts[0].category}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-4">
                    {podcasts[0].title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed font-light mb-6">
                    {podcasts[0].description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(podcasts[0].date)}
                    <Clock className="w-4 h-4 mr-2 ml-4" />
                    {podcasts[0].duration}
                  </div>
                  <div className="flex gap-4">
                    <button className="flex items-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
                      <Play className="w-5 h-5 mr-2" />
                      Écouter
                    </button>
                    <button className="flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition">
                      <Download className="w-5 h-5 mr-2" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.slice(1).map((podcast) => (
            <article
              key={podcast.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={podcast.image}
                  alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <button className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-black ml-1" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                  {podcast.category}
                </span>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  {podcast.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light mb-4">
                  {podcast.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {podcast.duration}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(podcast.date)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 bg-black text-white rounded-lg p-8 lg:p-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-light mb-4">
            Abonnez-vous à nos podcasts
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-light">
            Recevez les nouveaux épisodes directement dans votre application de podcast préférée
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition">
              Apple Podcasts
            </button>
            <button className="px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition">
              Spotify
            </button>
            <button className="px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition">
              Google Podcasts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

