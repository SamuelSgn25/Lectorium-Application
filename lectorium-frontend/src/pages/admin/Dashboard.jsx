import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Users, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react";
import { axiosInstance } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalActivities: 0,
    totalRevenue: 0,
    upcomingActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setStats({
        totalMembers: 156,
        totalActivities: 24,
        totalRevenue: 1250000,
        upcomingActivities: 8,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-BJ", {
      style: "currency",
      currency: "XOF",
    }).format(price);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Membres",
      value: stats.totalMembers,
      icon: Users,
      color: "bg-blue-500",
      link: "/admin/users",
    },
    {
      title: "Total Activités",
      value: stats.totalActivities,
      icon: Calendar,
      color: "bg-green-500",
      link: "/admin/activities",
    },
    {
      title: "Revenus Total",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-yellow-500",
      link: "/admin/payments",
    },
    {
      title: "Activités à Venir",
      value: stats.upcomingActivities,
      icon: TrendingUp,
      color: "bg-purple-500",
      link: "/admin/activities?status=upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">
            Tableau de Bord Admin
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user?.first_name} {user?.last_name}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${stat.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm text-gray-600 mb-2">{stat.title}</h3>
              <p className="text-3xl font-light text-gray-900">{stat.value}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Actions Rapides
            </h2>
            <div className="space-y-3">
              <Link
                to="/admin/activities/new"
                className="block w-full bg-black text-white text-center px-6 py-3 rounded-md hover:bg-gray-800 transition"
              >
                Créer une Activité
              </Link>
              <Link
                to="/admin/users/new"
                className="block w-full border border-black text-black text-center px-6 py-3 rounded-md hover:bg-black hover:text-white transition"
              >
                Ajouter un Membre
              </Link>
              <Link
                to="/admin/exports"
                className="block w-full border border-black text-black text-center px-6 py-3 rounded-md hover:bg-black hover:text-white transition"
              >
                Exporter des Données
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Activités Récentes
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 text-center py-8">
                Aucune activité récente
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-6">
            Navigation Admin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-black hover:text-white transition group"
            >
              <Users className="w-5 h-5 mr-3 group-hover:text-white" />
              <span className="font-medium">Gestion Membres</span>
            </Link>
            <Link
              to="/admin/activities"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-black hover:text-white transition group"
            >
              <Activity className="w-5 h-5 mr-3 group-hover:text-white" />
              <span className="font-medium">Gestion Activités</span>
            </Link>
            <Link
              to="/admin/registrations"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-black hover:text-white transition group"
            >
              <Calendar className="w-5 h-5 mr-3 group-hover:text-white" />
              <span className="font-medium">Inscriptions</span>
            </Link>
            <Link
              to="/admin/payments"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-black hover:text-white transition group"
            >
              <DollarSign className="w-5 h-5 mr-3 group-hover:text-white" />
              <span className="font-medium">Paiements</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

