import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Users, HandHeart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/activities')
            .then(res => setActivities(res.data.filter(a => a.is_public && a.status === 'upcoming').slice(0, 3)))
            .catch(console.error);
    }, []);

    const values = [
        { icon: <Heart size={32} strokeWidth={1.5} className="text-[#b89047] mb-4" />, title: "Amour Universel", desc: "Le fondement de notre cheminement, embrassant toute la création." },
        { icon: <BookOpen size={32} strokeWidth={1.5} className="text-[#b89047] mb-4" />, title: "Sagesse Éternelle", desc: "La recherche de la lumière intérieure et de la vérité libératrice." },
        { icon: <Users size={32} strokeWidth={1.5} className="text-[#b89047] mb-4" />, title: "Fraternité", desc: "Unir nos forces et nos cœurs pour le rayonnement de l'école spirituelle." },
        { icon: <HandHeart size={32} strokeWidth={1.5} className="text-[#b89047] mb-4" />, title: "Service", desc: "Se mettre au service de la lumière et de l'humanité." },
    ];

    return (
        <div className="flex flex-col items-center mt-8 space-y-24">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="w-full text-center max-w-4xl py-12"
            >
                <span className="text-[#b89047] uppercase tracking-widest text-sm font-semibold mb-4 block">École Spirituelle Internationale</span>
                <h1 className="text-4xl md:text-6xl font-serif text-stone-800 mb-6 leading-tight">
                    Lectorium Rosicrucianum
                </h1>
                <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-light mb-10 max-w-3xl mx-auto">
                    Un chemin de transformation intérieure vers la conscience originelle,
                    guidé par l'Amour Universel et la Sagesse Éternelle.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/about" className="px-8 py-3 border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors uppercase tracking-wider text-sm">
                        Découvrir notre mission
                    </Link>
                    <Link to="/register" className="px-8 py-3 bg-[#b89047] text-white hover:bg-[#a37b3b] transition-colors uppercase tracking-wider text-sm shadow-sm">
                        Rejoindre la communauté
                    </Link>
                </div>
            </motion.section>

            {/* Values Section */}
            <section className="w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif text-stone-800 mb-4">Nos Valeurs Fondamentales</h2>
                    <div className="w-16 h-0.5 bg-[#b89047] mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((v, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 border border-stone-100 shadow-sm text-center flex flex-col items-center transition-all"
                        >
                            {v.icon}
                            <h3 className="text-xl font-serif text-stone-800 mb-3">{v.title}</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Upcoming Events */}
            <section className="w-full bg-stone-50 p-12 -mx-8 sm:-mx-0 rounded-sm">
                <div className="flex justify-between items-end mb-10 border-b border-[#b89047]/20 pb-4">
                    <div>
                        <h2 className="text-3xl font-serif text-stone-800">Événements à venir</h2>
                        <p className="text-stone-500 mt-2 font-light">Rencontres et enseignements publics</p>
                    </div>
                    <Link to="/events" className="text-[#b89047] hover:underline text-sm uppercase tracking-wider font-semibold">
                        Voir tout
                    </Link>
                </div>

                {activities.length === 0 ? (
                    <p className="text-stone-500 italic text-center py-8">Aucun événement prévu pour le moment.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {activities.map(act => (
                            <div key={act.id} className="bg-white p-6 border border-stone-200 group hover:border-[#b89047] transition-all relative">
                                <div className="absolute top-0 right-0 p-2 text-xs font-semibold text-stone-500 uppercase">
                                    {act.type}
                                </div>
                                <Calendar className="text-stone-300 mb-4" />
                                <h3 className="text-lg font-serif text-stone-800 mb-2 group-hover:text-[#b89047]">{act.title}</h3>
                                <p className="text-stone-600 text-sm mb-4 line-clamp-2">{act.description}</p>
                                <div className="mt-auto flex justify-between items-center text-xs font-semibold text-stone-500">
                                    <span>{new Date(act.date).toLocaleDateString('fr-FR')}</span>
                                    <span>{act.location}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
