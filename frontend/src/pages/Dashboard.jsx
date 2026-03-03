import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, Settings, Users, Calendar } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState({ activities: [], registrations: [], users: [] });
    const [tab, setTab] = useState('overview');

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchData = async () => {
        try {
            if (user?.role === 'Admin') {
                const [reg, act, usr] = await Promise.all([
                    axios.get('http://localhost:5000/api/registrations', { headers }),
                    axios.get('http://localhost:5000/api/activities'),
                    axios.get('http://localhost:5000/api/users', { headers })
                ]);
                setData({ registrations: reg.data, activities: act.data, users: usr.data });
            } else {
                const [reg, act] = await Promise.all([
                    axios.get('http://localhost:5000/api/registrations', { headers }),
                    axios.get('http://localhost:5000/api/activities')
                ]);
                setData({ registrations: reg.data, activities: act.data, users: [] });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    const updateRegistrationStatus = async (id, status, pstatus) => {
        try {
            await axios.put(`http://localhost:5000/api/registrations/${id}/status`, { status, payment_status: pstatus }, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (!user) return <div className="text-center mt-24 text-stone-500">Veuillez vous connecter.</div>;

    const isAdmin = user.role === 'Admin';

    return (
        <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* Sidebar Nav */}
            <div className="w-full md:w-64 bg-white border border-stone-200 p-4 h-max flex-shrink-0">
                <div className="text-center mb-6 pb-6 border-b border-stone-100">
                    <h2 className="text-xl font-serif text-[#b89047]">{user.prenom} {user.nom}</h2>
                    <p className="text-stone-500 text-sm">{isAdmin ? "Administrateur" : "Adhérent"}</p>
                </div>
                <nav className="flex flex-col gap-2">
                    <button onClick={() => setTab('overview')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'overview' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Vue d'ensemble</button>
                    <button onClick={() => setTab('planning')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'planning' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Mes inscriptions / Planning</button>
                    {isAdmin && <button onClick={() => setTab('users')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'users' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Gestion des Membres</button>}
                    {isAdmin && <button onClick={() => setTab('events')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'events' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Candidatures & Événements</button>}
                    <button onClick={() => setTab('settings')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'settings' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Paramètres</button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white border border-stone-200 p-8">
                {tab === 'overview' && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Tableau de bord</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-stone-50 p-6 border border-stone-200 text-center">
                                <Calendar className="mx-auto mb-2 text-[#b89047]" />
                                <h3 className="text-2xl font-bold text-stone-800">{data.registrations.length}</h3>
                                <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Événements {isAdmin ? "Tots" : "Inscrits"}</p>
                            </div>
                            {isAdmin && (
                                <div className="bg-stone-50 p-6 border border-stone-200 text-center">
                                    <Users className="mx-auto mb-2 text-[#b89047]" />
                                    <h3 className="text-2xl font-bold text-stone-800">{data.users.length}</h3>
                                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Membres totaux</p>
                                </div>
                            )}
                            <div className="bg-stone-50 p-6 border border-stone-200 text-center">
                                <Clock className="mx-auto mb-2 text-[#b89047]" />
                                <h3 className="text-2xl font-bold text-stone-800">{data.registrations.filter(r => r.status === 'pending').length}</h3>
                                <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">En attente d'approbation</p>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'planning' && !isAdmin && (
                    <div>
                        <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Historique et Planning</h1>
                        <div className="space-y-4">
                            {data.registrations.map(r => (
                                <div key={r.id} className="bg-stone-50 p-4 border border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="font-serif text-[#b89047] text-lg">{r.title}</h3>
                                        <p className="text-stone-500 text-sm mt-1">{new Date(r.date).toLocaleDateString('fr-FR')} • {r.location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 text-xs border uppercase tracking-wider ${r.status === 'approved' ? 'border-green-200 bg-green-50 text-green-700' : r.status === 'rejected' ? 'border-red-200 bg-red-50 text-red-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                                            {r.status === 'approved' ? 'Accepté' : r.status === 'rejected' ? 'Refusé' : 'En examen'}
                                        </span>
                                        <span className={`px-3 py-1 text-xs border uppercase tracking-wider ${r.payment_status === 'paid' ? 'border-green-200 bg-green-50 text-green-700' : 'border-stone-200 bg-white text-stone-600'}`}>
                                            {r.payment_status === 'paid' ? 'Payé' : r.payment_status === 'physical' ? 'À Payer sur place' : 'Non payé'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'events' && isAdmin && (
                    <div>
                        <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Gestion des Candidatures</h1>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-stone-600">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-xs">
                                    <tr><th className="p-4 font-medium">Membre</th><th className="p-4 font-medium">Événement</th><th className="p-4 font-medium">Statut C.</th><th className="p-4 font-medium">Paiement</th><th className="p-4 font-medium">Actions</th></tr>
                                </thead>
                                <tbody>
                                    {data.registrations.map(r => (
                                        <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50">
                                            <td className="p-4 font-medium text-stone-800">{r.nom} {r.prenom}</td>
                                            <td className="p-4">{r.title}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs border ${r.status === 'approved' ? 'border-green-200 text-green-700' : r.status === 'rejected' ? 'border-red-200 text-red-700' : 'border-yellow-200 text-yellow-700'}`}>{r.status}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs border ${r.payment_status === 'paid' ? 'border-green-200 text-green-700' : 'border-stone-200 text-stone-600'}`}>{r.payment_status}</span>
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                {r.status === 'pending' && <button onClick={() => updateRegistrationStatus(r.id, 'approved', r.payment_status)} className="text-green-600 hover:text-green-800"><CheckCircle size={18} /></button>}
                                                {r.status === 'pending' && <button onClick={() => updateRegistrationStatus(r.id, 'rejected', r.payment_status)} className="text-red-600 hover:text-red-800"><XCircle size={18} /></button>}
                                                {r.payment_status !== 'paid' && r.payment_method === 'physical' && <button onClick={() => updateRegistrationStatus(r.id, r.status, 'paid')} className="text-sm border border-stone-300 px-2 py-1 hover:bg-stone-200">Valider Paiement</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'users' && isAdmin && (
                    <div>
                        <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Membres et Adhésions</h1>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-stone-600">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-xs">
                                    <tr><th className="p-4 font-medium">Nom</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Centre</th><th className="p-4 font-medium">Date</th></tr>
                                </thead>
                                <tbody>
                                    {data.users.map(u => (
                                        <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50">
                                            <td className="p-4 font-medium text-stone-800">{u.nom} {u.prenom}</td>
                                            <td className="p-4">{u.email}</td>
                                            <td className="p-4">{u.centre}</td>
                                            <td className="p-4">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'settings' && (
                    <div className="text-center text-stone-500 py-12">
                        <Settings className="mx-auto mb-4 text-stone-300" size={48} />
                        <p>Les paramètres de profil seront bientôt disponibles.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
