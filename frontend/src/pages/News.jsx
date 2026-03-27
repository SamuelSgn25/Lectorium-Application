import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Search, Plus, FileText, Globe, Lock, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const News = () => {
    const { user } = useContext(AuthContext);
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Toutes');
    const [showForm, setShowForm] = useState(false);

    // Report Form State
    const [reportForm, setReportForm] = useState({
        title: '', content: '', category: 'Communiqué',
        image_url: '', file_url: '', 
        public_type: 'public', // 'public' or 'members'
        member_scope: 'all' // 'all' or 'admins'
    });

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchNews = () => {
        axios.get('/api/news', { headers })
            .then(res => setNews(res.data))
            .catch(console.error);
    };

    useEffect(() => {
        fetchNews();
    }, [user]);

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        try {
            let visibility = 'public';
            if (reportForm.public_type === 'members') {
                visibility = reportForm.member_scope === 'admins' ? 'admins' : 'members';
            }

            await axios.post('/api/news', {
                ...reportForm,
                visibility,
                author: `${user.prenom} ${user.nom}`
            }, { headers });

            alert("Rapport / Communiqué publié avec succès !");
            setReportForm({ title: '', content: '', category: 'Communiqué', image_url: '', file_url: '', public_type: 'public', member_scope: 'all' });
            setShowForm(false);
            fetchNews();
        } catch (err) { alert("Erreur lors de la publication."); }
    };

    const filtered = news.filter(n => {
        if (filter !== 'Toutes' && n.category !== filter) return false;
        if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';

    return (
        <div className="mt-8 space-y-12 mb-16 max-w-6xl mx-auto w-full px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif text-stone-800 mb-4">Actualités & Communiqués</h1>
                <div className="w-16 h-0.5 bg-[#b89047] mx-auto mb-6"></div>
                <p className="text-stone-500 font-light max-w-2xl mx-auto text-lg">
                    Consultez les derniers rapports de séance, annonces et actualités du Lectorium Rosicrucianum.
                </p>
            </div>

            {isAdmin && (
                <div className="bg-white border border-stone-200 p-6 shadow-sm">
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-[#b89047] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#a37b3b] transition-colors"
                    >
                        {showForm ? 'Annuler' : <><Plus size={16} /> Importer un rapport / communiqué</>}
                    </button>

                    {showForm && (
                        <form onSubmit={handleSubmitReport} className="mt-8 space-y-6 border-t border-stone-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Titre du document *</label>
                                    <input type="text" required value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} className="w-full p-3 border border-stone-200 outline-none focus:border-[#b89047]" placeholder="ex: Rapport de séance du 25 Mars" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Catégorie</label>
                                    <select value={reportForm.category} onChange={e => setReportForm({...reportForm, category: e.target.value})} className="w-full p-3 border border-stone-200 outline-none focus:border-[#b89047] bg-white text-sm">
                                        <option value="Communiqué">Communiqué</option>
                                        <option value="Rapport">Rapport de séance</option>
                                        <option value="Actualités">Actualités</option>
                                        <option value="Annonces">Annonces</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">URL du PDF / Document</label>
                                    <input type="text" value={reportForm.file_url} onChange={e => setReportForm({...reportForm, file_url: e.target.value})} className="w-full p-3 border border-stone-200 outline-none focus:border-[#b89047] font-mono" placeholder="Lien vers le fichier PDF..." />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 border border-stone-100">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#b89047] uppercase tracking-widest mb-3 flex items-center gap-2 font-mono"><Globe size={14}/> 1. Visibilité Générale</label>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                                                <input type="radio" checked={reportForm.public_type === 'public'} onChange={() => setReportForm({...reportForm, public_type: 'public'})} className="accent-[#b89047]" /> Public (Visiteurs & Membres)
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                                                <input type="radio" checked={reportForm.public_type === 'members'} onChange={() => setReportForm({...reportForm, public_type: 'members'})} className="accent-[#b89047]" /> Membres Uniquement (Connectés)
                                            </label>
                                        </div>
                                    </div>
                                    {reportForm.public_type === 'members' && (
                                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                            <label className="block text-[10px] font-bold text-[#b89047] uppercase tracking-widest mb-3 flex items-center gap-2 font-mono"><Shield size={14}/> 2. Audience des membres</label>
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                                                    <input type="radio" checked={reportForm.member_scope === 'all'} onChange={() => setReportForm({...reportForm, member_scope: 'all'})} className="accent-[#b89047]" /> Tous les membres
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                                                    <input type="radio" checked={reportForm.member_scope === 'admins'} onChange={() => setReportForm({...reportForm, member_scope: 'admins'})} className="accent-[#b89047]" /> Administrateurs uniquement
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Message court ou Introduction</label>
                                    <textarea value={reportForm.content} onChange={e => setReportForm({...reportForm, content: e.target.value})} rows="4" className="w-full p-4 border border-stone-200 outline-none focus:border-[#b89047] resize-none text-sm" placeholder="Contenu du communiqué..."></textarea>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#b89047] text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#a37b3b] shadow-lg">Publier sur la plateforme</button>
                        </form>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-stone-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une actualité ou un rapport..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2 pl-10 pr-4 focus:outline-none focus:border-[#b89047] text-sm"
                    />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-sm py-2 px-4 focus:outline-none focus:border-[#b89047] text-sm text-stone-700">
                    <option value="Toutes">Catégories : Toutes</option>
                    <option value="Communiqué">Communiqués</option>
                    <option value="Rapport">Rapports de séance</option>
                    <option value="Actualités">Actualités</option>
                    <option value="Annonces">Annonces</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.length === 0 ? (
                    <p className="col-span-full text-center text-stone-500 italic py-12">Aucun contenu trouvé.</p>
                ) : (
                    filtered.map(article => (
                        <div key={article.id} className="bg-white border border-stone-200 group flex flex-col hover:border-[#b89047] transition-all hover:shadow-md relative">
                            <div className="absolute top-4 right-4 z-10">
                                {article.visibility === 'public' ? <Globe size={14} className="text-stone-300" title="Public" /> : <Lock size={14} className="text-[#b89047]" title="Privé" />}
                            </div>
                            
                            {article.image_url && <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover border-b border-stone-100" />}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="text-[10px] font-bold text-[#b89047] uppercase tracking-widest mb-2 flex justify-between items-center">
                                    <span>{article.category}</span>
                                    {article.visibility === 'admins' && <span className="bg-stone-900 text-white px-2 py-0.5 text-[8px] rounded-full">ADMIN</span>}
                                </div>
                                <h2 className="text-xl font-serif text-stone-800 mb-3 group-hover:text-[#b89047] transition-colors">{article.title}</h2>
                                <p className="text-stone-600 text-sm mb-6 line-clamp-3 leading-relaxed font-light">{article.content}</p>
                                
                                {article.file_url && (
                                    <a 
                                        href={article.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mb-6 flex items-center gap-2 p-3 bg-stone-50 border border-stone-100 text-xs font-bold text-stone-500 hover:text-[#b89047] hover:bg-[#b89047]/5 transition-colors uppercase tracking-widest"
                                    >
                                        <FileText size={16} className="text-[#b89047]" /> Consulter le PDF
                                    </a>
                                )}

                                <div className="mt-auto flex justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-4 uppercase tracking-[0.1em] font-medium">
                                    <span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                                    <span>{article.author || 'Secrétariat'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default News;
