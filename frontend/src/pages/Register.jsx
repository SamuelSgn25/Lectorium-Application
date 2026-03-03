import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    // Les informations à renseigner dans le formulaire d’adhésion
    const [formData, setFormData] = useState({
        nom: '', nom_jeune_fille: '', prenom: '', date_naissance: '', lieu_naissance: '',
        nationalite: '', adresse: '', email: '', telephone_whatsapp: '', telephone_autre: '',
        etat_civil: '', profession: '', aptitudes: '', nombre_enfants: 0, motivation_adhesion: '',
        password: '', centre: 'Foyer Sole Novo à Djèrègbé'
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/register', formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la demande d’adhésion');
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const centres = [
        "Foyer Sole Novo à Djèrègbé",
        "Centre de ville de Cotonou",
        "Centre de ville de Lokossa",
        "Centre de ville de Natitingou",
        "Centre de ville de Porto-Novo"
    ];

    return (
        <div className="flex-grow flex items-center justify-center p-4 mt-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl bg-white p-8 md:p-12 border border-stone-200 shadow-sm"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-stone-800 mb-2">Demande d'Adhésion</h2>
                    <div className="w-16 h-0.5 bg-[#b89047] mx-auto mb-4"></div>
                    <p className="text-stone-500 font-light max-w-2xl mx-auto">Veuillez remplir ce formulaire avec soin. Votre demande sera examinée par la direction de l'école.</p>
                </div>

                {error && <p className="text-red-700 text-center bg-red-50 p-3 mb-6 text-sm border border-red-200">{error}</p>}
                {success && <p className="text-green-800 text-center bg-green-50 p-3 mb-6 text-sm border border-green-200">Votre demande a été soumise avec succès. Vous serez redirigé vers la page de connexion.</p>}

                <form onSubmit={handleRegister} className="space-y-8">
                    {/* Section État Civil */}
                    <div>
                        <h3 className="text-lg font-serif text-[#b89047] border-b border-stone-100 pb-2 mb-4">Identité & État Civil</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input type="text" name="nom" placeholder="Nom de famille *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="text" name="nom_jeune_fille" placeholder="Nom de jeune fille" onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="text" name="prenom" placeholder="Prénoms *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="date" name="date_naissance" placeholder="Date de naissance" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="text" name="lieu_naissance" placeholder="Lieu de naissance *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="text" name="nationalite" placeholder="Nationalité *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />

                            <select name="etat_civil" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm">
                                <option value="">État civil *</option>
                                <option value="Célibataire">Célibataire</option>
                                <option value="Marié(e)">Marié(e)</option>
                                <option value="Divorcé(e)">Divorcé(e)</option>
                                <option value="Veuf/Veuve">Veuf/Veuve</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-stone-600 block w-full whitespace-nowrap">Nombre d'enfants :</label>
                                <input type="number" name="nombre_enfants" min="0" placeholder="0" onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Section Coordonnées */}
                    <div>
                        <h3 className="text-lg font-serif text-[#b89047] border-b border-stone-100 pb-2 mb-4">Coordonnées</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="adresse" placeholder="Adresse postale *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm col-span-1 md:col-span-2" />
                            <input type="email" name="email" placeholder="Adresse email *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="password" name="password" placeholder="Mot de passe (pour connexion future) *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="tel" name="telephone_whatsapp" placeholder="Numéro de téléphone WhatsApp *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            <input type="tel" name="telephone_autre" placeholder="Autre numéro de téléphone" onChange={handleChange} className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                        </div>
                    </div>

                    {/* Profil & Spiritualité */}
                    <div>
                        <h3 className="text-lg font-serif text-[#b89047] border-b border-stone-100 pb-2 mb-4">Profil & Spiritualité</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select name="centre" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm">
                                    <option value="">Centre d'activité souhaité *</option>
                                    {centres.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                </select>
                                <input type="text" name="profession" placeholder="Profession *" onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm" />
                            </div>
                            <textarea name="aptitudes" placeholder="Autres aptitudes professionnelles" onChange={handleChange} rows="2" className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm"></textarea>
                            <textarea name="motivation_adhesion" placeholder="Votre motivation pour adhérer au Lectorium Rosicrucianum *" required onChange={handleChange} rows="4" className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-2 px-3 focus:outline-none focus:border-[#b89047] text-sm resize-none"></textarea>
                        </div>
                    </div>

                    <button type="submit" disabled={success} className="w-full max-w-xs mx-auto block text-white bg-[#b89047] hover:bg-[#a37b3b] uppercase tracking-wider text-sm font-semibold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Soumettre ma candidature
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-stone-100 text-center text-sm text-stone-500">
                    Vous êtes déjà membre ou votre adhésion a été validée ? <Link to="/login" className="text-[#b89047] hover:underline font-semibold">Connectez-vous</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
