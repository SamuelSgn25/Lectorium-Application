import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, PlayCircle, Clock } from 'lucide-react';

const Podcasts = () => {
    const [podcasts, setPodcasts] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Toutes');

    useEffect(() => {
        axios.get('/api/podcasts')
            .then(res => setPodcasts(res.data))
            .catch(console.error);
    }, []);

    const filtered = podcasts.filter(p => {
        if (filter !== 'Toutes' && p.category !== filter) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="mt-8 space-y-12 mb-16 max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif text-stone-800 mb-4">Bibliothèque Audio</h1>
                <div className="w-16 h-0.5 bg-[#b89047] mx-auto mb-6"></div>
                <p className="text-stone-500 font-light max-w-2xl mx-auto text-lg">
                    Écoutez nos enseignements, pratiques et méditations guidées.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-stone-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un podcast..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2 pl-10 pr-4 focus:outline-none focus:border-[#b89047] text-sm"
                    />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-sm py-2 px-4 focus:outline-none focus:border-[#b89047] text-sm text-stone-700">
                    <option value="Toutes">Catégories : Toutes</option>
                    <option value="Enseignements">Enseignements</option>
                    <option value="Pratiques">Pratiques</option>
                    <option value="Méditations">Méditations</option>
                </select>
            </div>

            <div className="flex flex-col gap-6">
                {filtered.length === 0 ? (
                    <p className="text-center text-stone-500 italic py-12">Aucun contenu audio trouvé.</p>
                ) : (
                    filtered.map(podcast => (
                        <div key={podcast.id} className="bg-white border border-stone-200 group flex flex-col md:flex-row gap-6 p-6 items-center">
                            {podcast.image_url ? (
                                <img src={podcast.image_url} alt={podcast.title} className="w-32 h-32 object-cover border border-stone-100" />
                            ) : (
                                <div className="w-32 h-32 bg-stone-100 border border-stone-200 flex items-center justify-center">
                                    <PlayCircle size={48} className="text-[#b89047]" />
                                </div>
                            )}

                            <div className="flex flex-col flex-grow text-center md:text-left">
                                <div className="text-xs font-semibold text-[#b89047] uppercase tracking-widest mb-1">{podcast.category}</div>
                                <h2 className="text-xl font-serif text-stone-800 mb-2 group-hover:text-[#b89047] transition-colors">{podcast.title}</h2>
                                <p className="text-stone-600 text-sm mb-4 line-clamp-2 md:line-clamp-none leading-relaxed">{podcast.description}</p>

                                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                                    {podcast.audio_url && (
                                        <audio controls className="h-10 w-full max-w-sm">
                                            <source src={podcast.audio_url} type="audio/mpeg" />
                                            Votre navigateur ne supporte pas l'élément audio.
                                        </audio>
                                    )}
                                    <div className="flex items-center gap-1 text-xs font-semibold text-stone-500 bg-stone-50 border border-stone-200 px-3 py-1 ml-auto">
                                        <Clock size={14} /> {podcast.duration || 'Inconnu'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Podcasts;
