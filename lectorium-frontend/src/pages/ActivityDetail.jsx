import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { axiosInstance } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    try {
      const response = await axiosInstance.get(`/activities/${id}`);
      setActivity(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'activité:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour vous inscrire");
      return;
    }

    setRegistering(true);
    try {
      const response = await axiosInstance.post("/registrations", {
        activity_id: activity.id,
      });
      alert("Inscription réussie !");
      fetchActivity();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur lors de l'inscription. Veuillez réessayer."
      );
    } finally {
      setRegistering(false);
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
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Activité non trouvée</p>
          <Link to="/activities" className="text-black hover:underline">
            Retour aux activités
          </Link>
        </div>
      </div>
    );
  }

  const isRegistered = user && activity.registrations?.some(
    (reg) => reg.user_id === user.id && reg.status !== "cancelled"
  );
  const canRegister = activity.status === "upcoming" && !isRegistered;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <Link
          to="/activities"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux activités
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span
                    className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {activity.status === "upcoming"
                      ? "À venir"
                      : activity.status === "ongoing"
                      ? "En cours"
                      : activity.status === "completed"
                      ? "Terminé"
                      : "Annulé"}
                  </span>
                  {activity.is_member_only && (
                    <span className="ml-2 inline-block text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                      Membres uniquement
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {activityTypeLabels[activity.activity_type]}
                </span>
              </div>

              <h1 className="text-3xl font-medium text-gray-900 mb-4">
                {activity.title}
              </h1>

              {activity.theme && (
                <p className="text-lg text-gray-700 mb-6 font-light">
                  {activity.theme}
                </p>
              )}

              {activity.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line font-light">
                    {activity.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-medium">
                      {format(new Date(activity.start_date), "EEEE d MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                    {activity.is_multi_day && (
                      <p className="text-sm text-gray-600">
                        au{" "}
                        {format(new Date(activity.end_date), "EEEE d MMMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {activity.start_date && (
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Heure</p>
                      <p className="font-medium">
                        {format(new Date(activity.start_date), "HH:mm")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lieu</p>
                    <p className="font-medium">{activity.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Participants</p>
                    <p className="font-medium">
                      {activity.registrations?.length || 0} /
                      {activity.max_participants}
                    </p>
                  </div>
                </div>
              </div>

              {activity.price > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <p className="text-sm text-gray-600 mb-2">Prix d'inscription</p>
                  <p className="text-3xl font-light text-gray-900">
                    {formatPrice(activity.price)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              {canRegister ? (
                <>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? "Inscription..." : "S'inscrire"}
                  </button>
                  {!user && (
                    <p className="text-sm text-gray-600 mt-4 text-center">
                      <Link to="/connexion" className="text-black hover:underline">
                        Connectez-vous
                      </Link>{" "}
                      pour vous inscrire
                    </p>
                  )}
                </>
              ) : isRegistered ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 mb-2">
                    Vous êtes inscrit(e)
                  </p>
                  <p className="text-sm text-gray-600">
                    À bientôt pour cette activité !
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600">
                    Les inscriptions ne sont plus ouvertes pour cette activité
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Informations pratiques
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  {activity.registration_deadline && (
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        Date limite d'inscription
                      </p>
                      <p>
                        {format(new Date(activity.registration_deadline), "d MMMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

