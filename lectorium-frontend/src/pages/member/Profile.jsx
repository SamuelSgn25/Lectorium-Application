import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Phone, MapPin, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profil" },
    { id: "registrations", label: "Mes inscriptions" },
    { id: "payments", label: "Mes paiements" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Veuillez vous connecter</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et suivez vos activités
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "profile" && <ProfileTab user={user} />}
            {activeTab === "registrations" && <RegistrationsTab user={user} />}
            {activeTab === "payments" && <PaymentsTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center mb-8">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mr-4">
          <span className="text-white text-2xl font-medium">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-medium text-gray-900">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 mr-2" />
              Nom complet
            </label>
            <input
              type="text"
              value={`${user.first_name} ${user.last_name}`}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          {user.matricule && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                Matricule
              </label>
              <input
                type="text"
                value={user.matricule}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          )}

          {user.phone && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                Téléphone
              </label>
              <input
                type="tel"
                value={user.phone}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          )}

          {user.city && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                Ville
              </label>
              <input
                type="text"
                value={user.city}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          )}

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Niveau
            </label>
            <input
              type="text"
              value={`${user.status || 1}ème aspect`}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="pt-6 border-t">
          <button className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition">
            <Lock className="w-5 h-5 mr-2" />
            Changer mon mot de passe
          </button>
        </div>
      </div>
    </div>
  );
}

function RegistrationsTab({ user }) {
  return (
    <div>
      <p className="text-gray-600">Aucune inscription pour le moment</p>
    </div>
  );
}

function PaymentsTab({ user }) {
  return (
    <div>
      <p className="text-gray-600">Aucun paiement pour le moment</p>
    </div>
  );
}

