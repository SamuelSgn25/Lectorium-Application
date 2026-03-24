import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { axiosInstance } from "../context/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    activity_type: "",
    status: "upcoming",
  });
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.activity_type) params.append("activity_type", filters.activity_type);

      const response = await axiosInstance.get(`/activities?${params.toString()}`);
      let filteredData = response.data.data || response.data;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (activity) =>
            activity.title.toLowerCase().includes(searchLower) ||
            activity.description?.toLowerCase().includes(searchLower) ||
            activity.location.toLowerCase().includes(searchLower)
        );
      }

      setActivities(filteredData);
    } catch (error) {
      console.error("Erreur lors du chargement des activités:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const activityTypeLabels = {
    public_conference: "Conférence Publique",
    renewal_conference: "Conférence de Renouvellement",
    jr_conference: "Conférence JR",
    youth_conference_ab: "Conférence Jeunesse AB",
    youth_conference_cd: "Conférence Jeunesse CD",
    workshop: "Atelier",
    retreat: "Retraite",
    other: "Autre",
  };

  const statusLabels = {
    upcoming: "À venir",
    ongoing: "En cours",
    completed: "Terminé",
    cancelled: "Annulé",
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.upcoming;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des activités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Nos Activités
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Découvrez nos conférences, séminaires et événements spirituels
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <select
              value={filters.activity_type}
              onChange={(e) => setFilters({ ...filters, activity_type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Tous les types</option>
              {Object.entries(activityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 px-4 py-2 border rounded-md transition ${
                  viewMode === "list"
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex-1 px-4 py-2 border rounded-md transition ${
                  viewMode === "calendar"
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Calendrier
              </button>
            </div>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">Aucune activité trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                to={`/activities/${activity.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      {statusLabels[activity.status]}
                    </span>
                    {activity.is_member_only && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                        Membres
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    {activity.title}
                  </h3>

                  {activity.theme && (
                    <p className="text-sm text-gray-600 mb-4 font-light">
                      {activity.theme}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(activity.start_date), "d MMM yyyy", {
                        locale: fr,
                      })}
                      {activity.is_multi_day && (
                        <span className="ml-1">
                          {" "}
                          -{" "}
                          {format(new Date(activity.end_date), "d MMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {activity.location}
                    </div>

                    {activity.price > 0 && (
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(activity.price)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {activity.registrations_count || 0} /
                      {activity.max_participants}
                    </div>
                    <span className="text-xs">
                      {activityTypeLabels[activity.activity_type]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

