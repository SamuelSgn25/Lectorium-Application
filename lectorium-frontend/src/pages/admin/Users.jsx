import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { axiosInstance } from "../../context/AuthContext";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchUsers();
    }
  }, [user, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRole) params.append("role", filterRole);

      const response = await axiosInstance.get(`/users?${params.toString()}`);
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await axiosInstance.patch(`/users/${userId}/deactivate`);
      } else {
        await axiosInstance.patch(`/users/${userId}/activate`);
      }
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Erreur lors de la modification");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      search === "" ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.matricule?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const roleLabels = {
    visitor: "Visiteur",
    member: "Membre",
    admin: "Admin",
    super_admin: "Super Admin",
    youth_director: "Direction Jeunesse",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">
              Gestion des Membres
            </h1>
            <p className="text-gray-600">
              Gérez tous les utilisateurs de la plateforme
            </p>
          </div>
          <Link
            to="/admin/users/new"
            className="flex items-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau membre
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Tous les rôles</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Matricule
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Niveau
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {u.first_name?.[0]}
                            {u.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {u.first_name} {u.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {u.matricule || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {u.status}ème aspect
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.is_active ? (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {u.is_active ? (
                            <UserX className="w-5 h-5" />
                          ) : (
                            <UserCheck className="w-5 h-5" />
                          )}
                        </button>
                        <button className="text-gray-600 hover:text-blue-600">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-gray-600 hover:text-red-600">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

