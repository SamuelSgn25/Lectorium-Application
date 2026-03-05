import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

const News = () => {
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Toutes');

    useEffect(() => {
        axios.get('/api/news')
            .then(res => setNews(res.data))
            .catch(console.error);
    }, []);

    const filtered = news.filter(n => {
        if (filter !== 'Toutes' && n.category !== filter) return false;
        if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="mt-8 space-y-12 mb-16 max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif text-stone-800 mb-4">Actualités & Blog</h1>
                <div className="w-16 h-0.5 bg-[#b89047] mx-auto mb-6"></div>
                <p className="text-stone-500 font-light max-w-2xl mx-auto text-lg">
                    Lisez nos derniers articles, annonces et réflexions spirituelles.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-stone-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une actualité..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2 pl-10 pr-4 focus:outline-none focus:border-[#b89047] text-sm"
                    />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-sm py-2 px-4 focus:outline-none focus:border-[#b89047] text-sm text-stone-700">
                    <option value="Toutes">Catégories : Toutes</option>
                    <option value="Actualités">Actualités</option>
                    <option value="Annonces">Annonces</option>
                    <option value="Événements">Événements</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.length === 0 ? (
                    <p className="col-span-full text-center text-stone-500 italic py-12">Aucune actualité trouvée.</p>
                ) : (
                    filtered.map(article => (
                        <div key={article.id} className="bg-white border border-stone-200 group flex flex-col">
                            {article.image_url && <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover border-b border-stone-100" />}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="text-xs font-semibold text-[#b89047] uppercase tracking-widest mb-2">{article.category}</div>
                                <h2 className="text-xl font-serif text-stone-800 mb-3 group-hover:text-[#b89047] transition-colors">{article.title}</h2>
                                <p className="text-stone-600 text-sm mb-6 line-clamp-3 leading-relaxed">{article.content}</p>
                                <div className="mt-auto flex justify-between text-xs text-stone-400 border-t border-stone-100 pt-4">
                                    <span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                                    <span>Par {article.author || 'Lectorium'}</span>
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
