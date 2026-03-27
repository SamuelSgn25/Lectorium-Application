import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Search } from 'lucide-react';
import ApplicationForm from '../components/ApplicationForm';

const Events = () => {
    const { user } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [filterType, setFilterType] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/activities');
            setActivities(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApply = async (payload) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/register-activity', payload, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            setSuccessMsg("Votre inscription a été envoyée avec succès !");
            setSelectedEvent(null);
            setTimeout(() => setSuccessMsg(''), 4000);
            fetchEvents(); // refresh if needed
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'application");
        }
    };

    const filtered = activities.filter(a => {
        if (filterType !== 'Tous' && a.type !== filterType) return false;
        if (searchTerm && !a.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

        // Un utilisateur non connecté ne voit QUE les événements publics
        if (!user && !a.is_public) return false;

        // On n'affiche que les événements futurs
        if (new Date(a.date_end) < new Date()) return false;

        return true;
    });

    return (
        <div className="mt-8 space-y-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif text-stone-800 mb-4">Agenda des Événements</h1>
                <div className="w-16 h-0.5 bg-[#b89047] mx-auto mb-4"></div>
                <p className="text-stone-500 font-light max-w-2xl mx-auto">
                    Découvrez nos conférences et rencontres de la Rose-Croix d'Or.
                </p>
            </div>

            {successMsg && <div className="bg-green-50 border border-green-200 text-green-800 p-4 text-center rounded-sm text-sm font-semibold">{successMsg}</div>}

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-stone-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un événement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2 pl-10 pr-4 focus:outline-none focus:border-[#b89047] text-sm"
                    />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-sm py-2 px-4 focus:outline-none focus:border-[#b89047] text-sm text-stone-700">
                    <option value="Tous">Tous les types</option>
                    <option value="Conférence de Renouvellement">Conférence de Renouvellement</option>
                    <option value="Conférence JR">Conférence JR</option>
                    <option value="Conférence de Noël">Conférence de Noël</option>
                    <option value="Conférence de l'Ecole Intérieure">Conférence de l'École Intérieure</option>
                    <option value="Conférence de l'Ecole Extérieure">Conférence de l'École Extérieure</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.length === 0 ? (
                    <p className="col-span-full text-center text-stone-500 italic py-12">Aucun événement à venir trouvé.</p>
                ) : (
                    filtered.map(act => (
                        <div key={act.id} className="bg-white p-6 border border-stone-200 flex flex-col hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 text-xs font-semibold text-[#b89047] uppercase tracking-widest bg-stone-50 px-2 py-1 border border-[#b89047]/20">
                                {act.type || 'Événement'}
                            </div>
                            <h3 className="text-xl font-serif text-stone-800 mb-3 pr-20 group-hover:text-[#b89047] transition-colors">{act.title}</h3>
                            <p className="text-stone-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{act.description}</p>

                            <div className="space-y-3 text-sm text-stone-500 font-medium mb-6">
                                <div className="flex items-start gap-2">
                                    <Calendar size={16} className="text-[#b89047] mt-0.5 shrink-0" />
                                    <div>
                                        <div>Du : {new Date(act.date_start).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                        <div>Au : {new Date(act.date_end).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-[#b89047] mt-0.5 shrink-0" />
                                    <div>Sites : {act.sites ? act.sites.join(', ') : 'À définir'}</div>
                                </div>

                                <div className="flex justify-between items-center mt-4 border-t border-stone-100 pt-4">
                                    <span className="text-[#b89047] font-semibold">{act.price_fcfa > 0 ? `${act.price_fcfa} FCFA` : 'Entrée Libre'}</span>
                                    <span className={`px-2 py-1 text-xs border ${act.is_public ? 'border-green-200 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                                        {act.is_public ? 'Public' : 'Membres. ext.'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-stone-100 flex flex-col gap-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#b89047] font-semibold">{act.price_fcfa > 0 ? `${act.price_fcfa} FCFA` : 'Entrée Libre'}</span>
                                    <span className={`px-2 py-1 text-[10px] uppercase font-bold border tracking-widest ${act.is_public ? 'border-green-200 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                                        {act.is_public ? 'Public/Libre' : 'Membres. ext.'}
                                    </span>
                                </div>

                                {!user ? (
                                    <button
                                        onClick={() => window.location.href = '/login'}
                                        className="w-full py-3 bg-stone-100 text-stone-700 hover:bg-[#b89047] hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider !mt-0"
                                    >
                                        Se connecter pour s'inscrire
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setSelectedEvent(act)}
                                            className="py-3 text-[10px] font-bold uppercase tracking-widest bg-stone-800 border-stone-800 text-white hover:bg-stone-700 transition-colors"
                                        >
                                            M'inscrire
                                        </button>
                                        <button 
                                            onClick={() => {
                                                // If we want total harmony, we could redirect to Dashboard with a specific tab, 
                                                // but for now, let's just use the form.
                                                setSelectedEvent(act);
                                            }}
                                            className="py-3 text-[10px] text-[#b89047] border border-[#b89047] hover:bg-[#b89047] hover:text-white uppercase font-bold tracking-widest transition-colors"
                                        >
                                            Inscrire tiers
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedEvent && <ApplicationForm event={selectedEvent} onClose={() => setSelectedEvent(null)} onSubmit={handleApply} />}
        </div>
    );
};

export default Events;
