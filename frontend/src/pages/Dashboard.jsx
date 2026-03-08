import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, Settings, Users, Calendar, Plus, Trash2, Edit, FileDown, Eye, EyeOff } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'fr': fr };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const Dashboard = () => {
    const { user, setUser } = useContext(AuthContext); // Can refresh user internally if needed

    const [data, setData] = useState({ activities: [], registrations: [], myRegistrations: [], users: [] });
    const [tab, setTab] = useState('overview');
    const [planningView, setPlanningView] = useState('list');
    const [showUserPwd, setShowUserPwd] = useState(false);
    const [userForm, setUserForm] = useState({ nom: '', prenom: '', email: '', role: 'Membre', password: '' });

    // Forms state
    const [profileForm, setProfileForm] = useState({});
    const [activityForm, setActivityForm] = useState({
        title: '', description: '', type: 'Conférence de Renouvellement',
        date_start: '', date_end: '', inscription_start: '', inscription_end: '',
        price_fcfa: 0, max_participants: '', is_public: true,
        sites: [], program: []
    });
    const [programItem, setProgramItem] = useState({ title: '', hour_start: '', hour_end: '' });
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [viewingRegistrations, setViewingRegistrations] = useState(null); // activity object for guests/export
    const [thirdPartyForm, setThirdPartyForm] = useState({ type: 'guest', guest: { nom: '', prenom: '', email: '', localisation: '', whatsapp: '', telephone: '' }, child: { nom: '', prenom: '', grade: 'Jeunesse A entre 6 et 9 ans' }, payment_method: 'physical' });


    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    const ALL_SITES = ["Foyer Sole Novo à Djèrègbé", "Centre de ville de Cotonou", "Centre de ville de Lokossa", "Centre de ville de Natitingou", "Centre de ville de Porto-Novo", "Activité en ligne"];
    const ACTIVITY_TYPES = ["Conférence de Renouvellement", "Conférence JR", "Conférence de Noël", "Conférence de l'Ecole Intérieure", "Conférence de l'Ecole Extérieure", "Activité Publique", "Conférence de Jeunesse"];

    const GRADES = ['Nouveau membre', 'Jeunesse A entre 6 et 9 ans', 'Jeunesse B entre 9 et 12 ans', 'Jeunesse C entre 12 et 15 ans', 'Jeunesse D entre 15 et 18 ans', 'JR entre 18 et 30 ans', '1er aspect', '2ème aspect', '3ème aspect', '4ème aspect', '5ème aspect', '6ème aspect', '7ème aspect'];

    const fetchData = async () => {
        try {
            if (user?.role === 'Admin' || user?.role === 'SuperAdmin') {
                const [regAll, act, usr, regSelf, me] = await Promise.all([
                    axios.get('/api/admin/registrations', { headers }),
                    axios.get('/api/activities'),
                    axios.get('/api/admin/users', { headers }),
                    axios.get('/api/my-registrations', { headers }),
                    axios.get('/api/users/me', { headers })
                ]);
                setData({ registrations: regAll.data, myRegistrations: regSelf.data, activities: act.data, users: usr.data });

                setProfileForm({
                    nom: me.data.nom || '',
                    prenom: me.data.prenom || '',
                    email: me.data.email || '',
                    password: '',
                    email_notifications: me.data.email_notifications,
                    sms_notifications: me.data.sms_notifications,
                    adresse: me.data.adresse || '',
                    telephone_whatsapp: me.data.telephone_whatsapp || '',
                    telephone_autre: me.data.telephone_autre || '',
                    profession: me.data.profession || ''
                });

            } else {
                const [regSelf, act, me] = await Promise.all([
                    axios.get('/api/my-registrations', { headers }),
                    axios.get('/api/activities'),
                    axios.get('/api/users/me', { headers })
                ]);
                setData({ registrations: [], myRegistrations: regSelf.data, activities: act.data, users: [] });

                setProfileForm({
                    nom: me.data.nom || '',
                    prenom: me.data.prenom || '',
                    email: me.data.email || '',
                    password: '',
                    email_notifications: me.data.email_notifications,
                    sms_notifications: me.data.sms_notifications,
                    adresse: me.data.adresse || '',
                    telephone_whatsapp: me.data.telephone_whatsapp || '',
                    telephone_autre: me.data.telephone_autre || '',
                    profession: me.data.profession || ''
                });

            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role !== 'Admin') setTab('planning');
            fetchData();
        }
    }, [user]);

    // --------------- ADMIN HANDLERS ---------------
    const updateRegistrationStatus = async (id, status, pstatus) => {
        try {
            if (!window.confirm("Êtes-vous sûr de mettre à jour cette candidature ?")) return;
            await axios.put(`/api/admin/registrations/${id}`, { status, payment_status: pstatus }, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const updateUserStatus = async (id, status) => {
        try {
            if (!window.confirm(`Confirmer l'opération (${status}) pour ce membre ?`)) return;
            await axios.put(`/api/admin/users/${id}/status`, { status }, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const updateUserRoleGrade = async (id, role, grade) => {
        try {
            await axios.put(`/api/admin/users/${id}/role-grade`, { role, grade }, { headers });
            fetchData();
            alert("Profil du membre mis à jour.");
        } catch (err) { alert(err.response?.data?.message || "Erreur de modification"); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Supprimer DÉFINITIVEMENT ce membre et son adhésion ?")) return;
        try {
            await axios.delete(`/api/admin/users/${id}`, { headers });
            fetchData();
        } catch (err) { alert(err.response?.data?.message || "Erreur de suppression"); }
    };

    const addProgramItem = () => {
        if (!programItem.title || !programItem.hour_start) return;
        setActivityForm({ ...activityForm, program: [...(activityForm.program || []), programItem] });
        setProgramItem({ title: '', hour_start: '', hour_end: '' });
    };

    const deleteProgramItem = (idx) => {
        const newProg = [...activityForm.program];
        newProg.splice(idx, 1);
        setActivityForm({ ...activityForm, program: newProg });
    };

    const createActivity = async (e) => {
        e.preventDefault();
        try {
            if (activityForm.sites.length === 0) { alert("Veuillez sélectionner au moins un site"); return; }
            await axios.post(`/api/activities`, activityForm, { headers });
            alert("Activité créée de manière globale !");
            setActivityForm({ title: '', description: '', type: 'Conférence de Renouvellement', date_start: '', date_end: '', inscription_start: '', inscription_end: '', price_fcfa: 0, max_participants: '', is_public: true, sites: [], program: [] });
            fetchData();
        } catch (err) { console.error(err); }
    };
    const deleteActivity = async (id) => {
        if (!window.confirm("Supprimer cette activité et toutes ses inscriptions ?")) return;
        try {
            await axios.delete(`/api/activities/${id}`, { headers });
            fetchData();
        } catch (err) { alert("Erreur serveur lors de la suppression."); }
    };

    const createUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/users', userForm, { headers });
            alert("Compte créé avec succès !");
            setUserForm({ nom: '', prenom: '', email: '', role: 'Membre', password: '' });
            fetchData();
        } catch (err) { alert(err.response?.data?.message || "Erreur création compte"); }
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        doc.text("Liste globale des Inscriptions", 14, 15);
        const tableColumn = ["Date", "Membre", "Événement", "Statut", "Paiement"];
        const tableRows = [];
        data.registrations.forEach(r => {
            tableRows.push([
                new Date(r.created_at).toLocaleDateString('fr-FR'),
                `${r.nom} ${r.prenom}`,
                r.title,
                r.status,
                r.payment_status
            ]);
        });
        doc.autoTable({ startY: 20, head: [tableColumn], body: tableRows });
        doc.save("inscriptions_lectorium.pdf");
    };

    // --------------- MEMBER HANDLERS ---------------
    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/users/me`, profileForm, { headers });
            alert("Paramètres mis à jour");
            // Rafraîchir les données locales de l'utilisateur
            const me = await axios.get('/api/users/me', { headers });
            localStorage.setItem('user', JSON.stringify(me.data));
            setUser(me.data);
            setProfileForm(prev => ({ ...prev, password: '' }));
        } catch (err) { alert(err.response?.data?.message || "Erreur lors de la mise à jour"); }
    };


    const applyForEvent = async (activity_id) => {
        if (!window.confirm("Appliquer à cet événement ?")) return;
        try {
            await axios.post('/api/register-activity', {
                activity_id, motivation: 'Inscription Rapide depuis le planning.', experience: '', attentes: '', payment_method: 'physical'
            }, { headers });
            alert("Candidature envoyée !");
            fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    };

    if (!user) return <div className="text-center mt-24 text-stone-500">Veuillez vous connecter.</div>;

    const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';
    const isSuperAdmin = user.role === 'SuperAdmin';


    return (
        <>
            <div className="flex flex-col md:flex-row gap-8 mt-8">

                {/* Sidebar Nav */}
                <div className="w-full md:w-64 bg-white border border-stone-200 p-4 h-max flex-shrink-0 sticky top-24">
                    <div className="text-center mb-6 pb-6 border-b border-stone-100">
                        <h2 className="text-xl font-serif text-[#b89047]">{user.prenom} {user.nom}</h2>
                        <p className="text-stone-500 text-sm mt-1">{isAdmin ? "Administrateur" : `Grade: ${user.grade || 'Membre'}`}</p>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {isAdmin && <button onClick={() => setTab('overview')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'overview' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Vue d'ensemble</button>}
                        {isAdmin && <button onClick={() => setTab('users')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'users' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Gestion des Membres</button>}
                        {isAdmin && <button onClick={() => setTab('events')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'events' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Gérer les Événements</button>}
                        {isAdmin && <button onClick={() => setTab('registrations')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'registrations' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Candidatures (Inscriptions)</button>}

                        <button onClick={() => setTab('planning')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'planning' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Mon Planning & Activités</button>

                        <button onClick={() => setTab('settings')} className={`p-3 text-left w-full text-sm font-semibold transition-colors ${tab === 'settings' ? 'bg-stone-100 text-[#b89047]' : 'text-stone-600 hover:bg-stone-50'}`}>Paramètres Profil</button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white border border-stone-200 p-8 shadow-sm">
                    {tab === 'overview' && isAdmin && (
                        <div className="space-y-6">
                            <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Tableau de bord Général</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-stone-50 p-6 border border-stone-200 text-center">
                                    <Calendar className="mx-auto mb-2 text-[#b89047]" />
                                    <h3 className="text-2xl font-bold text-stone-800">{data.activities.length}</h3>
                                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Événements Totaux</p>
                                </div>
                                <div className="bg-stone-50 p-6 border border-stone-200 text-center">
                                    <Users className="mx-auto mb-2 text-[#b89047]" />
                                    <h3 className="text-2xl font-bold text-stone-800">{data.users.length}</h3>
                                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Lectorium Membres</p>
                                </div>
                                <div className="bg-stone-50 p-6 border border-stone-200 text-center">
                                    <Clock className="mx-auto mb-2 text-[#b89047]" />
                                    <h3 className="text-2xl font-bold text-stone-800">{data.users.filter(u => u.status === 'pending').length}</h3>
                                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Adhésions en Attente</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MEMBER & ADMIN: PLANNING */}
                    {tab === 'planning' && (
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-stone-100 pb-4 gap-4">
                                <h1 className="text-3xl font-serif text-stone-800">Mon Planning & Activités</h1>
                                <div className="flex bg-stone-100 p-1 rounded-sm gap-1">
                                    <button onClick={() => setPlanningView('list')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${planningView === 'list' ? 'bg-white shadow text-[#b89047]' : 'text-stone-500 hover:bg-stone-200'}`}>Liste</button>
                                    <button onClick={() => setPlanningView('calendar')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${planningView === 'calendar' ? 'bg-white shadow text-[#b89047]' : 'text-stone-500 hover:bg-stone-200'}`}>Calendrier</button>
                                </div>
                            </div>

                            {planningView === 'calendar' ? (
                                <div className="h-[600px] bg-white text-sm mb-12 shadow-sm border border-stone-200 p-4">
                                    <BigCalendar
                                        localizer={localizer}
                                        events={data.activities.filter(a => new Date(a.date_end) > new Date()).map(a => ({
                                            title: a.title,
                                            start: new Date(a.date_start),
                                            end: new Date(a.date_end),
                                            allDay: false,
                                            resource: a
                                        }))}
                                        startAccessor="start"
                                        endAccessor="end"
                                        style={{ height: '100%' }}
                                        messages={{ next: "Suiv", previous: "Préc", today: "Aujourd'hui", month: "Mois", week: "Semaine", day: "Jour" }}
                                        culture="fr"
                                        onSelectEvent={(event) => applyForEvent(event.resource.id)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-serif text-[#b89047] mb-4">Mes Candidatures (Inscriptions)</h2>
                                    <div className="space-y-4 mb-12">
                                        {data.myRegistrations.length === 0 ? <p className="text-stone-500 text-sm italic">Vous n'êtes inscrit à aucun événement pour le moment.</p> :
                                            data.myRegistrations.map(r => (
                                                <div key={r.id} className="bg-stone-50 p-4 border border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div>
                                                        <h3 className="font-serif text-[#b89047] text-lg">{r.title}</h3>
                                                        <p className="text-stone-500 text-sm mt-1">{new Date(r.date_start).toLocaleString('fr-FR')} • Sites : {r.sites ? r.sites.join(', ') : ''} • {r.price_fcfa} CFA</p>
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <span className={`px-3 py-1 text-xs border uppercase tracking-wider font-semibold ${r.status === 'approved' ? 'border-green-200 bg-green-50 text-green-700' : r.status === 'rejected' ? 'border-red-200 bg-red-50 text-red-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                                                            {r.status === 'approved' ? 'Accepté' : r.status === 'rejected' ? 'Refusé' : 'En examen'}
                                                        </span>
                                                        <span className={`px-3 py-1 text-xs border uppercase tracking-wider font-semibold ${r.payment_status === 'paid' ? 'border-green-200 bg-green-50 text-green-700' : 'border-stone-200 bg-white text-stone-600'}`}>
                                                            {r.payment_status === 'paid' ? 'Payé' : r.payment_status === 'physical' ? 'À Payer sur place' : 'Non payé'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    <h2 className="text-xl font-serif text-[#b89047] mb-4 mt-8">Toutes les Mises en activité (Futur)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {data.activities.filter(a => new Date(a.date_end) > new Date()).map(a => {
                                            const isRegistered = data.myRegistrations.find(r => r.activity_id === a.id);
                                            return (
                                                <div key={a.id} className="bg-white p-5 border border-stone-200 flex flex-col group hover:border-[#b89047] transition-colors">
                                                    <span className="text-xs text-[#b89047] uppercase font-bold tracking-widest mb-1">{a.type}</span>
                                                    <h3 className="text-lg font-serif text-stone-800 mb-2 group-hover:text-[#b89047] transition-colors">{a.title}</h3>
                                                    <p className="text-stone-500 text-sm mb-4">Du : {new Date(a.date_start).toLocaleString('fr-FR')} <br /> Au : {new Date(a.date_end).toLocaleString('fr-FR')}</p>
                                                    <div className="mt-auto border-t border-stone-100 pt-4 flex justify-between items-center">
                                                        <span className="font-semibold text-stone-700 text-sm">{a.price_fcfa} FCFA</span>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <button
                                                                onClick={() => applyForEvent(a.id)}
                                                                disabled={isRegistered || (a.inscription_end && new Date() > new Date(a.inscription_end)) || (a.inscription_start && new Date() < new Date(a.inscription_start))}
                                                                className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest border transition-colors ${isRegistered ? 'bg-green-100 text-green-700 border-green-200' : (a.inscription_end && new Date() > new Date(a.inscription_end)) ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed' : 'bg-stone-800 border-stone-800 text-white hover:bg-stone-700'}`}
                                                            >
                                                                {isRegistered ? 'Dossier déposé' : (a.inscription_end && new Date() > new Date(a.inscription_end)) ? 'Terminé' : (a.inscription_start && new Date() < new Date(a.inscription_start)) ? 'Bientôt' : "S'inscrire (Moi)"}
                                                            </button>
                                                            <button onClick={() => setViewingRegistrations(a)} className="text-[10px] text-[#b89047] uppercase font-bold tracking-tight hover:underline">Inscrire tiers (invité/enfant)</button>
                                                        </div>
                                                    </div>

                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ADMIN: REGISTRATIONS */}
                    {tab === 'registrations' && isAdmin && (
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                                <h1 className="text-3xl font-serif text-stone-800">Gestion des Inscriptions (Candidatures)</h1>
                                <button onClick={exportPDF} className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors"><FileDown size={16} /> Exporter PDF</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-stone-600">
                                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-xs">
                                        <tr><th className="p-4 font-medium">Date Demande</th><th className="p-4 font-medium">Membre</th><th className="p-4 font-medium">Événement</th><th className="p-4 font-medium">Statut Candida.</th><th className="p-4 font-medium">Paiement</th><th className="p-4 font-medium min-w-[150px]">Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {data.registrations.map(r => (
                                            <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50">
                                                <td className="p-4 text-xs">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                                                <td className="p-4 font-medium text-stone-800">{r.nom} {r.prenom}</td>
                                                <td className="p-4 text-xs font-semibold text-[#b89047]">{r.title}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs border uppercase tracking-widest font-bold ${r.status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' : r.status === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50'}`}>{r.status}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs border uppercase tracking-widest font-bold ${r.payment_status === 'paid' ? 'border-green-200 text-green-700 bg-green-50' : 'border-stone-200 text-stone-600 bg-white'}`}>{r.payment_status}</span>
                                                </td>
                                                <td className="p-4 flex flex-col gap-2">
                                                    {r.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => updateRegistrationStatus(r.id, 'approved', r.payment_status)} className="p-1 text-green-600 border border-green-200 bg-green-50 hover:bg-green-100" title="Approuver"><CheckCircle size={16} /></button>
                                                            <button onClick={() => updateRegistrationStatus(r.id, 'rejected', r.payment_status)} className="p-1 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100" title="Rejeter"><XCircle size={16} /></button>
                                                        </div>
                                                    )}
                                                    {r.status === 'approved' && r.payment_status !== 'paid' && (
                                                        <button onClick={() => updateRegistrationStatus(r.id, r.status, 'paid')} className="text-[10px] font-bold uppercase tracking-wider border border-[#b89047] text-[#b89047] px-2 py-1 hover:bg-[#b89047] hover:text-white transition-colors">Valider Frais</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ADMIN: USERS (ADHÉSIONS) */}
                    {tab === 'users' && isAdmin && (
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                                <h1 className="text-3xl font-serif text-stone-800">Membres et Demandes</h1>
                            </div>

                            <form onSubmit={createUser} className="bg-stone-50 border border-stone-200 p-4 mb-8">
                                <h3 className="text-sm font-bold text-[#b89047] uppercase tracking-widest mb-4 flex items-center gap-2"><Plus size={16} /> Créer un compte direct</h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <input type="text" placeholder="Nom" required value={userForm.nom} onChange={e => setUserForm({ ...userForm, nom: e.target.value })} className="p-2 text-sm border border-stone-200 outline-none focus:border-[#b89047]" />
                                    <input type="text" placeholder="Prénom" required value={userForm.prenom} onChange={e => setUserForm({ ...userForm, prenom: e.target.value })} className="p-2 text-sm border border-stone-200 outline-none focus:border-[#b89047]" />
                                    <input type="email" placeholder="Email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="p-2 text-sm border border-stone-200 outline-none focus:border-[#b89047]" />

                                    <div className="relative">
                                        <input type={showUserPwd ? "text" : "password"} placeholder="Mot de passe" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full p-2 text-sm border border-stone-200 outline-none focus:border-[#b89047] pr-8" />
                                        <button type="button" onClick={() => setShowUserPwd(!showUserPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400">
                                            {showUserPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="p-2 text-sm font-bold border border-stone-200 outline-none focus:border-[#b89047]">
                                        <option value="Membre">Membre</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="mt-4 bg-[#b89047] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#a37b3b]">Créer l'utilisateur</button>
                            </form>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-stone-600">
                                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-xs">
                                        <tr><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Nom complet</th><th className="p-4 font-medium">Contact</th><th className="p-4 font-medium">Statut / Rôle</th><th className="p-4 font-medium">Grade Admin</th><th className="p-4 font-medium min-w-[120px]">Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {data.users.map(u => (
                                            <tr key={u.id} className={`border-b border-stone-100 hover:bg-stone-50 ${u.status === 'pending' ? 'bg-yellow-50/30' : ''}`}>
                                                <td className="p-4 text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                                                <td className="p-4 font-serif font-semibold text-stone-800 text-base">{u.nom} {u.prenom}</td>
                                                <td className="p-4 text-xs">{u.email} <br /> {u.telephone_whatsapp}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className={`px-2 py-1 text-[10px] uppercase font-bold border tracking-widest ${u.status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' : u.status === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' : 'border-yellow-300 text-yellow-800 bg-yellow-100'}`}>{u.status}</span>
                                                        <span className={`px-2 py-1 text-[10px] uppercase font-bold border tracking-widest ${u.role === 'Admin' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-stone-200 text-stone-600 bg-stone-100'}`}>{u.role}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {/* Selector for Grade & Role */}
                                                    <div className="flex flex-col gap-2">
                                                        <select
                                                            value={u.grade || 'Nouveau membre'}
                                                            onChange={(e) => updateUserRoleGrade(u.id, u.role, e.target.value)}
                                                            className="text-xs p-1 border border-stone-200 bg-white"
                                                        >
                                                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => updateUserRoleGrade(u.id, e.target.value, u.grade)}
                                                            className="text-xs p-1 border border-stone-200 bg-white font-bold"
                                                        >
                                                            <option value="Membre">M. Standard</option>
                                                            <option value="Admin">Administrateur</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="p-4 flex gap-2 flex-wrap justify-center">
                                                    <div className="flex flex-col gap-2 w-full">
                                                        {u.status === 'pending' && (
                                                            <div className="flex w-full gap-1">
                                                                <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 flex-1">Accepter</button>
                                                                <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 flex-1">Refuser</button>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2 justify-center">
                                                            <button onClick={() => setSelectedUserDetail(u)} className="p-1.5 text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100" title="Dossier Complet"><Eye size={16} /></button>
                                                            {(isSuperAdmin || (isAdmin && u.role === 'Membre')) && (
                                                                <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-500 bg-red-50 border border-red-100 hover:bg-red-100" title="Supprimer Définitivement"><Trash2 size={16} /></button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ADMIN: EVENTS (CREATION) */}
                    {tab === 'events' && isAdmin && (
                        <div>
                            <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Créer une Activité (Événement)</h1>

                            <form onSubmit={createActivity} className="bg-stone-50 p-6 border border-stone-200 mb-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Titre de l'activité *</label>
                                        <input type="text" value={activityForm.title} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Description</label>
                                        <textarea value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} rows="3" className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047] resize-none"></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Type (Catégorie) *</label>
                                        <select value={activityForm.type} onChange={e => setActivityForm({ ...activityForm, type: e.target.value })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]">
                                            <option value="Conférence de Renouvellement">Conférence de Renouvellement</option>
                                            <option value="Conférence JR">Conférence JR</option>
                                            <option value="Conférence de Noël">Conférence de Noël</option>
                                            <option value="Conférence de l'Ecole Intérieure">Conférence de l'Ecole Intérieure</option>
                                            <option value="Conférence de l'Ecole Extérieure">Conférence de l'Ecole Extérieure</option>
                                            <option value="Activité Publique">Activité Publique</option>
                                            <option value="Conférence de Jeunesse">Conférence de Jeunesse</option>
                                        </select>

                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Public Cible *</label>
                                        <select value={activityForm.is_public ? "1" : "0"} onChange={e => setActivityForm({ ...activityForm, is_public: e.target.value === "1" })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]">
                                            <option value="1">Ouvert au Public (+ Membres)</option>
                                            <option value="0">Réservé UNIQUEMENT aux Membres (Privé)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Heure Début Conférence *</label>
                                        <input type="datetime-local" value={activityForm.date_start} onChange={e => setActivityForm({ ...activityForm, date_start: e.target.value })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Heure Fin Conférence *</label>
                                        <input type="datetime-local" value={activityForm.date_end} onChange={e => setActivityForm({ ...activityForm, date_end: e.target.value })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Ouverture des inscriptions</label>
                                        <input type="datetime-local" value={activityForm.inscription_start} onChange={e => setActivityForm({ ...activityForm, inscription_start: e.target.value })} className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Clôture des inscriptions</label>
                                        <input type="datetime-local" value={activityForm.inscription_end} onChange={e => setActivityForm({ ...activityForm, inscription_end: e.target.value })} className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Montant Participation (FCFA)</label>
                                        <input type="number" min="0" value={activityForm.price_fcfa} onChange={e => setActivityForm({ ...activityForm, price_fcfa: e.target.value })} className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Nombre de places limitées</label>
                                        <input type="number" min="0" placeholder="Vide = Illimité" value={activityForm.max_participants} onChange={e => setActivityForm({ ...activityForm, max_participants: e.target.value })} className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Sites Concernés (Cochez pour ajouter) *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {ALL_SITES.map(site => (
                                                <label key={site} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer bg-white p-2 border border-stone-200 hover:border-[#b89047]">
                                                    <input
                                                        type="checkbox"
                                                        checked={activityForm.sites.includes(site)}
                                                        onChange={e => {
                                                            if (e.target.checked) setActivityForm({ ...activityForm, sites: [...activityForm.sites, site] })
                                                            else setActivityForm({ ...activityForm, sites: activityForm.sites.filter(s => s !== site) })
                                                        }}
                                                        className="accent-[#b89047]"
                                                    />
                                                    {site}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PROGRAM BUILDER */}
                                    <div className="md:col-span-2 border-t border-stone-200 pt-6 mt-4">
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Programme détaillé de l'activité</label>
                                        <div className="bg-white p-4 border border-stone-200 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <input type="text" placeholder="Désignation (ex: Introduction)" value={programItem.title} onChange={e => setProgramItem({ ...programItem, title: e.target.value })} className="p-2 text-xs border border-stone-200 md:col-span-2" />
                                            <input type="time" value={programItem.hour_start} onChange={e => setProgramItem({ ...programItem, hour_start: e.target.value })} className="p-2 text-xs border border-stone-200" />
                                            <input type="time" value={programItem.hour_end} onChange={e => setProgramItem({ ...programItem, hour_end: e.target.value })} className="p-2 text-xs border border-stone-200" />
                                            <button type="button" onClick={addProgramItem} className="md:col-span-4 bg-stone-100 text-stone-600 py-1 text-[10px] font-bold tracking-widest hover:bg-stone-200 border border-stone-200">Ajouter au programme</button>
                                        </div>
                                        <div className="space-y-2">
                                            {(activityForm.program || []).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-stone-50 p-2 text-xs border border-stone-100">
                                                    <span><strong>{item.hour_start} - {item.hour_end}</strong> : {item.title}</span>
                                                    <button type="button" onClick={() => deleteProgramItem(idx)} className="text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                <button type="submit" className="w-full bg-[#b89047] hover:bg-[#a37b3b] text-white font-bold tracking-widest uppercase text-sm py-4 transition-colors">Créer l'événement de manière globale</button>
                            </form>

                            <h2 className="text-xl font-serif text-stone-800 mb-4">Liste des Activités existantes</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {data.activities.map(a => (
                                    <div key={a.id} className="bg-white border border-stone-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-[#b89047]">
                                                <span>{a.type} | {a.is_public ? 'Public' : 'Privé'}</span>
                                                {a.inscription_end && <span className={new Date() > new Date(a.inscription_end) ? 'text-red-600' : 'text-green-600'}>• {new Date() > new Date(a.inscription_end) ? 'Clôturé' : 'Ouvert'}</span>}
                                            </div>
                                            <h3 className="text-lg font-serif text-stone-800">{a.title}</h3>
                                            <p className="text-stone-500 text-sm mt-1">Sites : {a.sites ? a.sites.join(', ') : 'Aucun'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setViewingRegistrations(a)} className="p-2 text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100" title="Inscrits / Inscrire Tiers"><Users size={18} /></button>
                                            <button onClick={() => exportActivityPDF(a)} className="p-2 text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100" title="Export PDF des inscrits"><FileDown size={18} /></button>
                                            <button onClick={() => deleteActivity(a.id)} className="text-red-500 hover:text-red-700 p-2 border border-red-100 hover:bg-red-50 transition-colors" title="Supprimer l'activité"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}


                    {/* SETTINGS (User Profil) */}
                    {tab === 'settings' && (
                        <div className="max-w-2xl mx-auto">
                            <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Paramètres du Profil</h1>

                            <form onSubmit={updateProfile} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-serif text-[#b89047] mb-3">Préférences de Notification</h3>
                                    <div className="bg-stone-50 p-4 border border-stone-200 space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={profileForm.email_notifications} onChange={e => setProfileForm({ ...profileForm, email_notifications: e.target.checked })} className="accent-[#b89047] w-4 h-4" />
                                            <span className="text-sm font-medium text-stone-700">Recevoir les actualités et rappels d'événements par Email</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={profileForm.sms_notifications} onChange={e => setProfileForm({ ...profileForm, sms_notifications: e.target.checked })} className="accent-[#b89047] w-4 h-4" />
                                            <span className="text-sm font-medium text-stone-700">Recevoir les rappels importants par SMS / WhatsApp</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-serif text-[#b89047] mb-3">Informations personnelles</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Nom</label>
                                            <input type="text" value={profileForm.nom} onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Prénom</label>
                                            <input type="text" value={profileForm.prenom} onChange={e => setProfileForm({ ...profileForm, prenom: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Adresse Email</label>
                                            <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                                            <input type="password" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-serif text-[#b89047] mb-3 mt-6">Mise à jour des coordonnées</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Adresse</label>
                                            <input type="text" value={profileForm.adresse} onChange={e => setProfileForm({ ...profileForm, adresse: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Téléphone WhatsApp</label>
                                            <input type="text" value={profileForm.telephone_whatsapp} onChange={e => setProfileForm({ ...profileForm, telephone_whatsapp: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Autre Téléphone</label>
                                            <input type="text" value={profileForm.telephone_autre} onChange={e => setProfileForm({ ...profileForm, telephone_autre: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Profession</label>
                                            <input type="text" value={profileForm.profession} onChange={e => setProfileForm({ ...profileForm, profession: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                        </div>
                                    </div>
                                </div>


                                <button type="submit" className="bg-[#b89047] text-white px-6 py-2 uppercase text-sm font-bold tracking-widest hover:bg-[#a37b3b]">Enregistrer les modifications</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: VIEW REGISTRATIONS & THIRD PARTY ENROLLMENT */}
            {viewingRegistrations && (
                <div className="fixed inset-0 z-[100] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white max-w-4xl w-full rounded-sm shadow-xl p-8 border border-stone-200 relative my-auto">
                        <button onClick={() => setViewingRegistrations(null)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800"><XCircle size={24} /></button>
                        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                            <h2 className="text-2xl font-serif text-stone-800">Inscriptions : {viewingRegistrations.title}</h2>
                            <button onClick={() => exportActivityPDF(viewingRegistrations)} className="flex items-center gap-2 bg-[#b89047] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest"><FileDown size={16} /> Liste PDF</button>
                        </div>

                        <form onSubmit={(e) => registerThirdParty(e, viewingRegistrations.id)} className="mb-8 p-4 bg-stone-50 border border-stone-200">
                            <h4 className="text-sm font-bold text-[#b89047] uppercase tracking-widest mb-4">Inscrire manuellement un tiers (Public / Enfant)</h4>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-stone-600">
                                    <input type="radio" checked={thirdPartyForm.type === 'guest'} onChange={() => setThirdPartyForm({ ...thirdPartyForm, type: 'guest' })} className="accent-[#b89047]" /> PUBLIC / INVITÉ
                                </label>
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-stone-600">
                                    <input type="radio" checked={thirdPartyForm.type === 'child'} onChange={() => setThirdPartyForm({ ...thirdPartyForm, type: 'child' })} className="accent-[#b89047]" /> ENFANT MEMBRE
                                </label>
                            </div>

                            {thirdPartyForm.type === 'guest' ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input type="text" placeholder="Nom" required value={thirdPartyForm.guest.nom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, nom: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white" />
                                    <input type="text" placeholder="Prénom" required value={thirdPartyForm.guest.prenom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, prenom: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white" />
                                    <input type="email" placeholder="Email" required value={thirdPartyForm.guest.email} onChange={e => setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, email: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white" />
                                    <input type="text" placeholder="Localisation" value={thirdPartyForm.guest.localisation} onChange={e => setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, localisation: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white" />
                                    <input type="text" placeholder="WhatsApp" value={thirdPartyForm.guest.whatsapp} onChange={e => setViewingRegistrations(prev => ({ ...prev })) && setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, whatsapp: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input type="text" placeholder="Nom Enfant" required value={thirdPartyForm.child.nom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, child: { ...thirdPartyForm.child, nom: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white" />
                                    <input type="text" placeholder="Prénom Enfant" required value={thirdPartyForm.child.prenom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, child: { ...thirdPartyForm.child, prenom: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white" />
                                    <select value={thirdPartyForm.child.grade} onChange={e => setThirdPartyForm({ ...thirdPartyForm, child: { ...thirdPartyForm.child, grade: e.target.value } })} className="p-2 text-xs border border-stone-200 bg-white">
                                        {GRADES.filter(g => g.startsWith('Jeunesse') || g === 'JR').map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="mt-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex gap-3 items-center">
                                    <span className="text-xs font-bold text-stone-500">PAIEMENT :</span>
                                    <label className="text-xs flex items-center gap-1 cursor-pointer"><input type="radio" checked={thirdPartyForm.payment_method === 'physical'} onChange={() => setThirdPartyForm({ ...thirdPartyForm, payment_method: 'physical' })} /> SUR PLACE</label>
                                </div>
                                <button type="submit" className="md:ml-auto w-full md:w-auto bg-stone-800 text-white px-8 py-2 text-xs font-bold uppercase tracking-widest shadow-lg">Enregistrer l'inscription</button>
                            </div>
                        </form>

                        <div className="max-h-[300px] overflow-y-auto border border-stone-100 rounded-sm">
                            <table className="w-full text-left text-xs text-stone-600">
                                <thead className="bg-stone-50 border-b border-stone-200 sticky top-0">
                                    <tr><th className="p-3">Nom Complet</th><th className="p-3">Type</th><th className="p-3">Détails / Grade</th><th className="p-3 text-right">Montant</th></tr>
                                </thead>
                                <tbody>
                                    {data.registrations.filter(r => r.activity_id === viewingRegistrations.id).map(r => (
                                        <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                                            <td className="p-3 font-semibold text-stone-800">
                                                {r.guest_info ? `${r.guest_info.nom} ${r.guest_info.prenom}` : r.child_info ? `${r.child_info.nom} ${r.child_info.prenom}` : `${r.nom} ${r.prenom}`}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${r.guest_info ? 'bg-blue-50 text-blue-600' : r.child_info ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                                                    {r.guest_info ? 'Invité Public' : r.child_info ? 'Enfant' : 'Membre'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-stone-400 italic">
                                                {r.guest_info ? r.guest_info.email : r.child_info ? r.child_info.grade : 'Compte Officiel'}
                                            </td>
                                            <td className="p-3 text-right font-bold">{r.payment_status === 'paid' ? 'Payé' : `${viewingRegistrations.price_fcfa} FCFA`}</td>
                                        </tr>
                                    ))}
                                    {data.registrations.filter(r => r.activity_id === viewingRegistrations.id).length === 0 && (
                                        <tr><td colSpan="4" className="p-8 text-center text-stone-400 italic">Aucune inscription pour le moment.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: FULL MEMBER DOSSIER */}
            {selectedUserDetail && (
                <div className="fixed inset-0 z-[100] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white max-w-3xl w-full rounded-sm shadow-xl p-8 border border-stone-200 relative my-auto">
                        <button onClick={() => setSelectedUserDetail(null)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800"><XCircle size={24} /></button>
                        <h2 className="text-2xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-2 uppercase tracking-tight">Dossier Membre : {selectedUserDetail.nom} {selectedUserDetail.prenom}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                            <div>
                                <h3 className="text-[#b89047] font-bold text-[10px] uppercase tracking-widest mb-3 border-b border-stone-50">Identité & Contact</h3>
                                <div className="space-y-3">
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Nom Complet</strong> {selectedUserDetail.nom} {selectedUserDetail.prenom}</div>
                                    {selectedUserDetail.nom_jeune_fille && <div><strong className="text-stone-400 text-[10px] uppercase block">Nom de jeune fille</strong> {selectedUserDetail.nom_jeune_fille}</div>}
                                    <div className="break-all"><strong className="text-stone-400 text-[10px] uppercase block">Email</strong> {selectedUserDetail.email}</div>
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">WhatsApp</strong> {selectedUserDetail.telephone_whatsapp}</div>
                                    {selectedUserDetail.telephone_autre && <div><strong className="text-stone-400 text-[10px] uppercase block">Autre téléphone</strong> {selectedUserDetail.telephone_autre}</div>}
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Nationalité</strong> {selectedUserDetail.nationalite || 'N/A'}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[#b89047] font-bold text-[10px] uppercase tracking-widest mb-3 border-b border-stone-50">Naissance & Civil</h3>
                                <div className="space-y-3">
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Date de naissance</strong> {selectedUserDetail.date_naissance ? new Date(selectedUserDetail.date_naissance).toLocaleDateString() : 'N/A'}</div>
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Lieu de naissance</strong> {selectedUserDetail.lieu_naissance || 'N/A'}</div>
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">État Civil</strong> {selectedUserDetail.etat_civil || 'N/A'}</div>
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Enfants</strong> {selectedUserDetail.nombre_enfants || 0}</div>
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Profession</strong> {selectedUserDetail.profession || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-[#b89047] font-bold text-[10px] uppercase tracking-widest mb-3 border-b border-stone-50">Localisation & Aptitudes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Adresse Résidence</strong> {selectedUserDetail.adresse || 'N/A'}</div>
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Aptitudes / Talents</strong> {selectedUserDetail.aptitudes || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-stone-50 p-4 border border-stone-100 italic rounded-sm">
                                <strong className="text-[#b89047] text-[10px] uppercase block not-italic mb-2">Motivation d'adhésion</strong>
                                "{selectedUserDetail.motivation_adhesion || 'Non renseignée'}"
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;


