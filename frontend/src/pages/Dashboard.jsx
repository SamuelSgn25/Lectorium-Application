import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User, Calendar, Settings, LogOut, CheckCircle, XCircle,
    Trash2, Plus, FileDown, Eye, EyeOff, Users, Edit
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('profile');
    const [data, setData] = useState({
        activities: [],
        registrations: [],
        users: []
    });
    const [loading, setLoading] = useState(true);

    // Forms state
    const [profileForm, setProfileForm] = useState({});
    const [editingActivity, setEditingActivity] = useState(null);
    const [viewingRegistrations, setViewingRegistrations] = useState(null); // activity object
    const [activityForm, setActivityForm] = useState({
        title: '', description: '', type: 'Conférence de Renouvellement',
        date_start: '', date_end: '', inscription_start: '', inscription_end: '',
        price_fcfa: 0, max_participants: '', is_public: true,
        sites: [], program: []
    });
    const [programItem, setProgramItem] = useState({ title: '', hour_start: '', hour_end: '' });
    const [thirdPartyForm, setThirdPartyForm] = useState({ type: 'child', guest: { nom: '', prenom: '', email: '', localisation: '', whatsapp: '', telephone: '' }, child: { nom: '', prenom: '', grade: 'Jeunesse A entre 6 et 9 ans' }, payment_method: 'physical' });
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);

    const [userForm, setUserForm] = useState({ nom: '', prenom: '', email: '', password: '', role: 'Membre' });
    const [showUserPwd, setShowUserPwd] = useState(false);

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    const ALL_SITES = ["Foyer Sole Novo à Djèrègbé", "Centre de ville de Cotonou", "Centre de ville de Lokossa", "Centre de ville de Natitingou", "Centre de ville de Porto-Novo", "En Ligne"];
    const ACTIVITY_TYPES = ["Conférence de Renouvellement", "Conférence JR", "Conférence de Jeunesse", "Conférence de Noël", "Conférence de l'Ecole Intérieure", "Conférence de l'Ecole Extérieure", "Activité Publique"];
    const GRADES = ['Nouveau membre', 'Jeunesse A entre 6 et 9 ans', 'Jeunesse B entre 9 et 12 ans', 'Jeunesse C entre 12 et 15 ans', 'Jeunesse D entre 15 et 18 ans', 'JR entre 18 et 30 ans', '1er aspect', '2ème aspect', '3ème aspect', '4ème aspect', '5ème aspect', '6ème aspect', '7ème aspect'];

    const fetchData = async () => {
        try {
            if (user?.role === 'Admin') {
                const [acts, regs, usrs] = await Promise.all([
                    axios.get('/api/activities'),
                    axios.get('/api/admin/registrations', { headers }),
                    axios.get('/api/admin/users', { headers })
                ]);
                setData({ activities: acts.data, registrations: regs.data, users: usrs.data });
            } else {
                const [acts, myRegs] = await Promise.all([
                    axios.get('/api/activities'),
                    axios.get('/api/my-registrations', { headers })
                ]);
                setData({ activities: acts.data, registrations: myRegs.data, users: [] });
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setProfileForm(storedUser);
        }
    }, []);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const isAdmin = user?.role === 'Admin';

    // --------------- ADMIN HANDLERS ---------------
    const updateRegistrationStatus = async (id, status, payment_status) => {
        try {
            await axios.put(`/api/admin/registrations/${id}`, { status, payment_status }, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const updateUserStatus = async (id, status) => {
        try {
            await axios.put(`/api/admin/users/${id}`, { status }, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const updateUserRoleGrade = async (id, role, grade) => {
        try {
            await axios.put(`/api/admin/users/${id}/role-grade`, { role, grade }, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Supprimer DEFINITIVEMENT cet utilisateur ?")) return;
        try {
            await axios.delete(`/api/admin/users/${id}`, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const createUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/create-user', userForm, { headers });
            alert("Utilisateur créé avec succès (Email envoyé)");
            setUserForm({ nom: '', prenom: '', email: '', password: '', role: 'Membre' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const saveActivity = async (e) => {
        e.preventDefault();
        try {
            if (activityForm.sites.length === 0) { alert("Veuillez sélectionner au moins un site"); return; }
            if (editingActivity) {
                await axios.put(`/api/activities/${editingActivity.id}`, activityForm, { headers });
                alert("Activité mise à jour");
            } else {
                await axios.post(`/api/activities`, activityForm, { headers });
                alert("Activité créée");
            }
            setActivityForm({ title: '', description: '', type: 'Conférence de Renouvellement', date_start: '', date_end: '', inscription_start: '', inscription_end: '', price_fcfa: 0, max_participants: '', is_public: true, sites: [], program: [] });
            setEditingActivity(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const editActivity = (act) => {
        setEditingActivity(act);
        setActivityForm({
            ...act,
            date_start: act.date_start ? act.date_start.slice(0, 16) : '',
            date_end: act.date_end ? act.date_end.slice(0, 16) : '',
            inscription_start: act.inscription_start ? act.inscription_start.slice(0, 16) : '',
            inscription_end: act.inscription_end ? act.inscription_end.slice(0, 16) : '',
            program: act.program || []
        });
        setTab('events');
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

    const registerThirdParty = async (e, activityId) => {
        e.preventDefault();
        try {
            const payload = {
                activity_id: activityId,
                payment_method: thirdPartyForm.payment_method
            };
            if (thirdPartyForm.type === 'child') payload.child_info = thirdPartyForm.child;
            else payload.guest_info = thirdPartyForm.guest;

            await axios.post('/api/register-activity', payload, { headers });
            alert("Inscription réussie !");
            setThirdPartyForm({ type: 'child', guest: { nom: '', prenom: '', email: '', localisation: '', whatsapp: '', telephone: '' }, child: { nom: '', prenom: '', grade: 'Jeunesse A entre 6 et 9 ans' }, payment_method: 'physical' });
            fetchData();
        } catch (err) { alert(err.response?.data?.message || "Erreur inscription"); }
    };

    const deleteActivity = async (id) => {
        if (!window.confirm("Supprimer cette activité et toutes ses inscriptions ?")) return;
        try {
            await axios.delete(`/api/activities/${id}`, { headers });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const applyForEvent = async (activityId) => {
        try {
            await axios.post('/api/register-activity', { activity_id: activityId, payment_method: 'physical' }, { headers });
            alert("Candidature envoyée avec succès !");
            fetchData();
        } catch (err) { alert("Erreur serveur."); }
    };

    const exportActivityPDF = (act) => {
        const regs = data.registrations.filter(r => r.activity_id === act.id);
        const doc = new jsPDF();
        doc.text(`Liste des Inscrits - ${act.title}`, 14, 15);
        const tableColumn = ["Nom", "Prénom", "Email / Info", "Statut", "Paiement"];
        const tableRows = [];
        regs.forEach(r => {
            let name = r.nom || "";
            let prenom = r.prenom || "";
            let info = r.email || "";
            if (r.guest_info) {
                name = r.guest_info.nom;
                prenom = r.guest_info.prenom;
                info = `Invité: ${r.guest_info.email}`;
            } else if (r.child_info) {
                name = r.child_info.nom;
                prenom = r.child_info.prenom;
                info = `Enfant: ${r.child_info.grade}`;
            }
            tableRows.push([name, prenom, info, r.status, r.payment_status]);
        });
        doc.autoTable({ startY: 20, head: [tableColumn], body: tableRows });
        doc.save(`inscrits_${act.title.replace(/\s+/g, '_')}.pdf`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Liste globale des Inscriptions", 14, 15);
        const tableColumn = ["Date", "Membre / Invité", "Événement", "Statut", "Paiement"];
        const tableRows = [];
        data.registrations.forEach(r => {
            let identity = `${r.nom} ${r.prenom}`;
            if (r.guest_info) identity = `${r.guest_info.nom} ${r.guest_info.prenom} (Invité)`;
            else if (r.child_info) identity = `${r.child_info.nom} ${r.child_info.prenom} (Enfant)`;

            tableRows.push([
                new Date(r.created_at).toLocaleDateString('fr-FR'),
                identity,
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
            const res = await axios.put('/api/profile', profileForm, { headers });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            alert("Profil mis à jour !");
        } catch (err) { alert(err.response?.data?.message || "Erreur de mise à jour"); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-[#b89047]">Chargement du Temple...</div>;

    return (
        <div className="min-h-screen bg-[#faf9f6] flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-white flex flex-col border-r border-stone-200 shadow-sm">
                <div className="p-8 border-b border-stone-100 flex flex-col items-center md:items-start">
                    <img src="/logo.png" alt="Lectorium" className="w-12 h-12 mb-4" />
                    <h2 className="text-stone-800 font-serif text-lg leading-tight uppercase tracking-widest text-center md:text-left">{user?.nom}</h2>
                    <p className="text-[10px] text-[#b89047] font-bold tracking-[0.2em] mt-1">{user?.role?.toUpperCase()}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-sm ${tab === 'profile' ? 'bg-[#b89047] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50 hover:text-[#b89047]'}`}>
                        <User size={18} /> Profil & Adhésion
                    </button>
                    {!isAdmin && (
                        <button onClick={() => setTab('my_events')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-sm ${tab === 'my_events' ? 'bg-[#b89047] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50 hover:text-[#b89047]'}`}>
                            <Calendar size={18} /> Mes Conférences
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            <button onClick={() => setTab('events')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-sm ${tab === 'events' ? 'bg-[#b89047] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50 hover:text-[#b89047]'}`}>
                                <Calendar size={18} /> Gestion Activités
                            </button>
                            <button onClick={() => setTab('registrations')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-sm ${tab === 'registrations' ? 'bg-[#b89047] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50 hover:text-[#b89047]'}`}>
                                <CheckCircle size={18} /> Inscriptions
                            </button>
                            <button onClick={() => setTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-sm ${tab === 'users' ? 'bg-[#b89047] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50 hover:text-[#b89047]'}`}>
                                <Users size={18} /> Membres & Demandes
                            </button>
                        </>
                    )}
                    <button onClick={() => setTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-sm ${tab === 'settings' ? 'bg-[#b89047] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50 hover:text-[#b89047]'}`}>
                        <Settings size={18} /> Paramètres
                    </button>
                </nav>

                <div className="p-4 border-t border-stone-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all rounded-sm">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                {/* PROFILE VIEW */}
                {tab === 'profile' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-start mb-8 border-b border-stone-100 pb-6">
                            <div>
                                <h1 className="text-4xl font-serif text-stone-800 mb-2">Ma Fraternité</h1>
                                <p className="text-stone-500 italic">Bienvenue dans votre espace Lectorium Rosicrucianum</p>
                            </div>
                            <div className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest border ${user?.status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' : 'border-[#b89047] text-[#b89047] bg-[#b89047]/5'}`}>
                                Statut : {user?.status === 'approved' ? 'Approuvé' : 'En attente'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-white p-6 border border-stone-200 shadow-sm">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-4">Grade actuel</span>
                                <h4 className="text-xl font-serif text-[#b89047]">{user?.grade || 'Nouveau membre'}</h4>
                            </div>
                            <div className="bg-white p-6 border border-stone-200 shadow-sm">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-4">Date d'adhésion</span>
                                <h4 className="text-xl font-serif text-stone-800">{new Date(user?.created_at).toLocaleDateString('fr-FR')}</h4>
                            </div>
                            <div className="bg-white p-6 border border-stone-200 shadow-sm text-center">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-4">Besoin d'aide ?</span>
                                <a href="https://wa.me/229XXXXXXXX" target="_blank" rel="noreferrer" className="text-sm border-b border-stone-300 text-stone-600 hover:text-[#b89047]">Contacter le secrétariat</a>
                            </div>
                        </div>

                        {/* Recent Activity Mini-List */}
                        <h3 className="text-lg font-serif text-stone-800 mb-4">Mes Inscriptions Récentes</h3>
                        <div className="bg-white border border-stone-200">
                            {data.registrations.length > 0 ? (
                                data.registrations.slice(0, 3).map(r => (
                                    <div key={r.id} className="p-4 border-b border-stone-50 last:border-0 flex justify-between items-center text-sm">
                                        <span className="font-medium text-stone-700">{r.title}</span>
                                        <span className={`text-[10px] font-bold uppercase ${r.status === 'approved' ? 'text-green-600' : 'text-stone-400'}`}>{r.status}</span>
                                    </div>
                                ))
                            ) : <p className="p-4 text-stone-400 text-sm italic">Aucune inscription active.</p>}
                        </div>
                    </div>
                )}

                {/* MY EVENTS VIEW (For Members) */}
                {tab === 'my_events' && !isAdmin && (
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-serif text-stone-800 mb-8 border-b border-stone-100 pb-4">Conférences & Activités</h1>

                        {data.activities.length === 0 ? (
                            <p className="text-stone-400 italic">Chargement des événements...</p>
                        ) : (
                            <>
                                <h3 className="text-sm font-bold text-[#b89047] uppercase tracking-[0.2em] mb-6">Événements Disponibles</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {data.activities.map(a => {
                                        const isRegistered = data.registrations.some(r => r.activity_id === a.id);
                                        return (
                                            <div key={a.id} className="bg-white border border-stone-200 flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow transition-color">
                                                <div className="p-6 md:w-32 bg-stone-50 border-r border-stone-100 flex flex-col items-center justify-center text-center">
                                                    <span className="text-2xl font-serif text-stone-800">{new Date(a.date_start).getDate()}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#b89047]">
                                                        {new Date(a.date_start).toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="p-6 flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">{a.type}</span>
                                                        <span className="text-stone-300">|</span>
                                                        <span className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">{a.sites ? a.sites.join(', ') : ''}</span>
                                                    </div>
                                                    <h3 className="text-xl font-serif text-stone-800 mb-2">{a.title}</h3>
                                                    <p className="text-stone-500 text-sm line-clamp-2 mb-4">{a.description}</p>
                                                    <div className="text-xs text-stone-400 space-y-1">
                                                        <p>💶 Participation : {a.price_fcfa > 0 ? `${a.price_fcfa} FCFA` : 'Entrée libre'}</p>
                                                    </div>
                                                </div>
                                                <div className="p-6 border-l border-stone-50 flex flex-col justify-center items-center">
                                                    <button
                                                        onClick={() => applyForEvent(a.id)}
                                                        disabled={isRegistered}
                                                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest border transition-colors ${isRegistered ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed' : 'bg-[#b89047] border-[#b89047] text-white hover:bg-[#a37b3b]'}`}
                                                    >
                                                        {isRegistered ? 'Déjà postulé' : "S'inscrire (Rapide)"}
                                                    </button>
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
                            <h1 className="text-3xl font-serif text-stone-800">Gestion des Inscriptions</h1>
                            <button onClick={exportPDF} className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors"><FileDown size={16} /> Exporter PDF</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-stone-600">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-xs">
                                    <tr><th className="p-4 font-medium">Date Demande</th><th className="p-4 font-medium">Membre / Invité</th><th className="p-4 font-medium">Événement</th><th className="p-4 font-medium">Statut Candida.</th><th className="p-4 font-medium">Paiement</th><th className="p-4 font-medium min-w-[150px]">Actions</th></tr>
                                </thead>
                                <tbody>
                                    {data.registrations.map(r => (
                                        <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50">
                                            <td className="p-4 text-xs">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                                            <td className="p-4 font-medium text-stone-800">
                                                {r.guest_info ? (
                                                    <div className="text-blue-600">
                                                        <span className="font-bold">{r.guest_info.nom} {r.guest_info.prenom}</span> (Invité)
                                                        <div className="text-[10px] text-stone-400">Loc: {r.guest_info.localisation} | WA: {r.guest_info.whatsapp}</div>
                                                    </div>
                                                ) : r.child_info ? (
                                                    <div className="text-purple-600">
                                                        <span className="font-bold">{r.child_info.nom} {r.child_info.prenom}</span> (Enfant: {r.child_info.grade})
                                                    </div>
                                                ) : (
                                                    `${r.nom} ${r.prenom}`
                                                )}
                                            </td>
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
                                                {r.payment_status !== 'paid' && (
                                                    <button onClick={() => updateRegistrationStatus(r.id, r.status, 'paid')} className="text-[10px] font-bold uppercase tracking-wider border border-[#b89047] text-[#b89047] px-2 py-1 hover:bg-[#b89047] hover:text-white transition-colors">Valider Paiement</button>
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
                                    <tr><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Nom complet</th><th className="p-4 font-medium">Contact</th><th className="p-4 font-medium">Statut / Rôle</th><th className="p-4 font-medium">Grade / Rôle</th><th className="p-4 font-medium min-w-[120px]">Actions</th></tr>
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
                                                        <option value="Membre">Membre</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="p-4 flex gap-2 flex-wrap">
                                                {u.status === 'pending' && (
                                                    <div className="flex w-full gap-2 mb-2">
                                                        <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 flex-1">Accepter</button>
                                                        <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 flex-1">Refuser</button>
                                                    </div>
                                                )}
                                                <button onClick={() => setSelectedUserDetail(u)} className="text-blue-500 hover:text-blue-700 p-1" title="Détails"><Eye size={16} /></button>
                                                <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-700 p-1" title="Supprimer"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ADMIN: EVENTS (GESTION) */}
                {tab === 'events' && isAdmin && (
                    <div>
                        <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Gestion des Activités</h1>

                        {editingActivity && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 flex justify-between items-center text-blue-800">
                                <span className="text-sm font-bold">Modification de : {editingActivity.title}</span>
                                <button onClick={() => { setEditingActivity(null); setActivityForm({ title: '', description: '', type: 'Conférence de Renouvellement', date_start: '', date_end: '', inscription_start: '', inscription_end: '', price_fcfa: 0, max_participants: '', is_public: true, sites: [], program: [] }); }} className="text-xs underline">Annuler modification</button>
                            </div>
                        )}

                        <form onSubmit={saveActivity} className="bg-stone-50 p-6 border border-stone-200 mb-12">
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
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Type *</label>
                                    <select value={activityForm.type} onChange={e => setActivityForm({ ...activityForm, type: e.target.value })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]">
                                        {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Public Cible *</label>
                                    <select value={activityForm.is_public ? "1" : "0"} onChange={e => setActivityForm({ ...activityForm, is_public: e.target.value === "1" })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]">
                                        <option value="1">Public (+ Membres)</option>
                                        <option value="0">Membres uniquement (Privé)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Début (Bénin UTC+1) *</label>
                                    <input type="datetime-local" value={activityForm.date_start} onChange={e => setActivityForm({ ...activityForm, date_start: e.target.value })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Fin (Bénin UTC+1) *</label>
                                    <input type="datetime-local" value={activityForm.date_end} onChange={e => setActivityForm({ ...activityForm, date_end: e.target.value })} required className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Montant (FCFA) - 0 = Gratuit</label>
                                    <input type="number" min="0" value={activityForm.price_fcfa} onChange={e => setActivityForm({ ...activityForm, price_fcfa: e.target.value })} className="w-full bg-white border border-stone-200 p-3 outline-none focus:border-[#b89047]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Sites Concernés *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_SITES.map(site => (
                                            <label key={site} className="flex items-center gap-2 text-xs text-stone-700 bg-white p-2 border border-stone-200">
                                                <input type="checkbox" checked={activityForm.sites.includes(site)} onChange={e => {
                                                    if (e.target.checked) setActivityForm({ ...activityForm, sites: [...activityForm.sites, site] })
                                                    else setActivityForm({ ...activityForm, sites: activityForm.sites.filter(s => s !== site) })
                                                }} className="accent-[#b89047]" /> {site}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {/* PROGRAM BUILDER */}
                                <div className="md:col-span-2 border-t border-stone-200 pt-6 mt-4">
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Programme de l'activité</label>
                                    <div className="bg-white p-4 border border-stone-200 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input type="text" placeholder="Activité" value={programItem.title} onChange={e => setProgramItem({ ...programItem, title: e.target.value })} className="p-2 text-xs border border-stone-200 md:col-span-2" />
                                        <input type="time" value={programItem.hour_start} onChange={e => setProgramItem({ ...programItem, hour_start: e.target.value })} className="p-2 text-xs border border-stone-200" />
                                        <input type="time" value={programItem.hour_end} onChange={e => setProgramItem({ ...programItem, hour_end: e.target.value })} className="p-2 text-xs border border-stone-200" />
                                        <button type="button" onClick={addProgramItem} className="md:col-span-4 bg-stone-100 text-stone-600 py-1 text-[10px] font-bold tracking-widest hover:bg-stone-200">Ajouter</button>
                                    </div>
                                    <div className="space-y-2">
                                        {(activityForm.program || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-stone-100 p-2 text-xs">
                                                <span><strong>{item.hour_start} - {item.hour_end}</strong> : {item.title}</span>
                                                <button type="button" onClick={() => deleteProgramItem(idx)} className="text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#b89047] hover:bg-[#a37b3b] text-white font-bold tracking-widest uppercase text-sm py-4 transition-colors">
                                {editingActivity ? "Enregistrer les modifications" : "Créer l'activité de manière globale"}
                            </button>
                        </form>

                        <h2 className="text-xl font-serif text-stone-800 mb-4">Activités existantes</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {data.activities.map(a => (
                                <div key={a.id} className="bg-white border border-stone-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-[#b89047] uppercase tracking-widest">{a.type} | {a.is_public ? 'Public' : 'Privé'}</span>
                                            <span className="text-[10px] bg-stone-100 px-1 border border-stone-200 text-stone-500">{new Date(a.date_start).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-serif text-stone-800">{a.title}</h3>
                                        <p className="text-stone-500 text-sm mt-1">Sites : {a.sites ? a.sites.join(', ') : 'Aucun'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewingRegistrations(a)} className="text-blue-600 hover:bg-blue-50 p-2 border border-blue-100 transition-colors" title="Inscrits"><Users size={18} /></button>
                                        <button onClick={() => editActivity(a)} className="text-[#b89047] hover:bg-stone-50 p-2 border border-stone-100 transition-colors" title="Modifier"><Edit size={18} /></button>
                                        <button onClick={() => deleteActivity(a.id)} className="text-red-500 hover:text-red-700 p-2 border border-red-100 hover:bg-red-50 transition-colors" title="Supprimer"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SETTINGS VIEW */}
                {tab === 'settings' && (
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-3xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-4">Paramètres du Profil</h1>
                        <form onSubmit={updateProfile} className="space-y-6">
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
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Email</label>
                                        <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full p-2 border border-stone-200 outline-none focus:border-[#b89047] bg-stone-50" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Grade (Lecture seule)</label>
                                        <input type="text" disabled value={profileForm.grade || 'Nouveau membre'} className="w-full p-2 border border-stone-200 bg-stone-100 text-stone-500 italic" />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="bg-[#b89047] text-white px-6 py-2 uppercase text-sm font-bold tracking-widest hover:bg-[#a37b3b]">Enregistrer les modifications</button>
                        </form>
                    </div>
                )}
            </div>

            {/* MODAL: VIEW REGISTRATIONS FOR ACTIVITY */}
            {viewingRegistrations && (
                <div className="fixed inset-0 z-[100] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white max-w-4xl w-full rounded-sm shadow-xl p-8 border border-stone-200 relative my-auto">
                        <button onClick={() => setViewingRegistrations(null)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800"><XCircle size={24} /></button>
                        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                            <h2 className="text-2xl font-serif text-stone-800">Inscrits : {viewingRegistrations.title}</h2>
                            <button onClick={() => exportActivityPDF(viewingRegistrations)} className="flex items-center gap-2 bg-[#b89047] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest"><FileDown size={16} /> Export PDF</button>
                        </div>
                        {/* Third Party Form */}
                        <form onSubmit={(e) => registerThirdParty(e, viewingRegistrations.id)} className="mb-8 p-4 bg-stone-50 border border-stone-200">
                            <h4 className="text-sm font-bold text-[#b89047] uppercase tracking-widest mb-4">Inscrire manuellement un tiers</h4>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="radio" checked={thirdPartyForm.type === 'child'} onChange={() => setThirdPartyForm({ ...thirdPartyForm, type: 'child' })} /> ENFANT</label>
                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="radio" checked={thirdPartyForm.type === 'guest'} onChange={() => setThirdPartyForm({ ...thirdPartyForm, type: 'guest' })} /> INVITÉ</label>
                            </div>
                            {thirdPartyForm.type === 'child' ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input type="text" placeholder="Nom" required value={thirdPartyForm.child.nom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, child: { ...thirdPartyForm.child, nom: e.target.value } })} className="p-2 text-xs border border-stone-200" />
                                    <input type="text" placeholder="Prénom" required value={thirdPartyForm.child.prenom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, child: { ...thirdPartyForm.child, prenom: e.target.value } })} className="p-2 text-xs border border-stone-200" />
                                    <select value={thirdPartyForm.child.grade} onChange={e => setThirdPartyForm({ ...thirdPartyForm, child: { ...thirdPartyForm.child, grade: e.target.value } })} className="p-2 text-xs border border-stone-200">
                                        {GRADES.filter(g => g.startsWith('Jeunesse') || g === 'JR').map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input type="text" placeholder="Nom" required value={thirdPartyForm.guest.nom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, nom: e.target.value } })} className="p-2 text-xs border border-stone-200" />
                                    <input type="text" placeholder="Prénom" required value={thirdPartyForm.guest.prenom} onChange={e => setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, prenom: e.target.value } })} className="p-2 text-xs border border-stone-200" />
                                    <input type="email" placeholder="Email" required value={thirdPartyForm.guest.email} onChange={e => setThirdPartyForm({ ...thirdPartyForm, guest: { ...thirdPartyForm.guest, email: e.target.value } })} className="p-2 text-xs border border-stone-200" />
                                </div>
                            )}
                            <div className="mt-4 flex gap-3 items-center">
                                <span className="text-xs font-bold text-stone-500">PAIEMENT :</span>
                                <label className="text-xs flex items-center gap-1 cursor-pointer"><input type="radio" checked={thirdPartyForm.payment_method === 'physical'} onChange={() => setThirdPartyForm({ ...thirdPartyForm, payment_method: 'physical' })} /> SUR PLACE</label>
                                <button type="submit" className="ml-auto bg-stone-800 text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest">Inscrire</button>
                            </div>
                        </form>
                        <div className="max-h-[300px] overflow-y-auto border border-stone-100">
                            <table className="w-full text-xs">
                                <thead className="bg-stone-50 border-b border-stone-200 sticky top-0">
                                    <tr><th className="p-3 text-left">Nom</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Paiement</th></tr>
                                </thead>
                                <tbody>
                                    {data.registrations.filter(r => r.activity_id === viewingRegistrations.id).map(r => (
                                        <tr key={r.id} className="border-b border-stone-50">
                                            <td className="p-3 font-semibold">
                                                {r.guest_info ? `${r.guest_info.nom} ${r.guest_info.prenom}` : r.child_info ? `${r.child_info.nom} ${r.child_info.prenom}` : `${r.nom} ${r.prenom}`}
                                            </td>
                                            <td className="p-3">{r.guest_info ? 'Invité' : r.child_info ? 'Enfant' : 'Membre'}</td>
                                            <td className="p-3 font-bold uppercase">{r.payment_status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: USER DETAILS */}
            {selectedUserDetail && (
                <div className="fixed inset-0 z-[100] bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white max-w-3xl w-full rounded-sm shadow-xl p-8 border border-stone-200 relative my-auto">
                        <button onClick={() => setSelectedUserDetail(null)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800"><XCircle size={24} /></button>
                        <h2 className="text-2xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-2">Dossier Membre : {selectedUserDetail.nom} {selectedUserDetail.prenom}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div>
                                <h3 className="text-[#b89047] font-bold text-[10px] uppercase tracking-widest mb-3 border-b border-stone-50">Identité & Contact</h3>
                                <div className="space-y-3">
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Nom Complet</strong> {selectedUserDetail.nom} {selectedUserDetail.prenom}</div>
                                    {selectedUserDetail.nom_jeune_fille && <div><strong className="text-stone-400 text-[10px] uppercase block">Nom de jeune fille</strong> {selectedUserDetail.nom_jeune_fille}</div>}
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Email</strong> {selectedUserDetail.email}</div>
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
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Adresse</strong> {selectedUserDetail.adresse || 'N/A'}</div>
                                    <div><strong className="text-stone-400 text-[10px] uppercase block">Aptitudes / Talents</strong> {selectedUserDetail.aptitudes || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-stone-50 p-4 border border-stone-100 italic">
                                <strong className="text-[#b89047] text-[10px] uppercase block not-italic mb-2">Motivation d'adhésion</strong>
                                "{selectedUserDetail.motivation_adhesion || 'Non renseignée'}"
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
