import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X, User, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [loginMode, setLoginMode] = useState('membre'); // 'membre' or 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [matricule, setMatricule] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot Password states
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { login, loginByMatricule, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');
        setIsSending(true);
        try {
            const res = await axios.post('/api/forgot-password', { email: forgotEmail });
            setForgotMessage(res.data.message);
            setForgotEmail('');
        } catch (err) {
            setForgotError(err.response?.data?.message || "Une erreur s'est produite.");
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success;
        if (loginMode === 'membre') {
            success = await loginByMatricule(matricule);
        } else {
            success = await login(email, password);
        }
        if (success) navigate('/dashboard');
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4 mt-12 mb-16">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white p-8 md:p-12 border border-stone-200 shadow-sm"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif text-stone-800 mb-2">Connexion</h2>
                    <div className="w-12 h-0.5 bg-[#b89047] mx-auto mb-6"></div>
                    
                    {/* Login Mode Selector */}
                    <div className="flex bg-stone-100 p-1 rounded-sm mb-8 border border-stone-200">
                        <button 
                            onClick={() => setLoginMode('membre')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest transition-all ${loginMode === 'membre' ? 'bg-white text-[#b89047] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            <User size={14} /> Membre
                        </button>
                        <button 
                            onClick={() => setLoginMode('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest transition-all ${loginMode === 'admin' ? 'bg-white text-[#b89047] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            <ShieldCheck size={14} /> Administrateur
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-700 text-center bg-red-50 p-3 mb-6 font-medium text-sm border border-red-200">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {loginMode === 'membre' ? (
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wide">Numéro Matricule</label>
                            <input
                                type="text"
                                value={matricule}
                                onChange={(e) => setMatricule(e.target.value)}
                                required
                                placeholder="Entrez votre matricule"
                                className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-3 px-4 focus:outline-none focus:border-[#b89047] transition-colors"
                            />
                            <p className="mt-2 text-xs text-stone-500 italic">Identifiez-vous à l'aide de votre matricule d'élève.</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wide">Adresse email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-3 px-4 focus:outline-none focus:border-[#b89047] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wide">Mot de passe</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-3 pl-4 pr-12 focus:outline-none focus:border-[#b89047] transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-xs text-stone-500 hover:text-[#b89047] font-semibold transition-colors">
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    
                    <button type="submit" className="w-full text-white bg-[#b89047] hover:bg-[#a37b3b] uppercase tracking-wider text-sm font-semibold py-3 transition-colors">
                        Se Connecter
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-stone-100 text-center text-sm text-stone-500">
                    Vous n'avez pas de compte ? <br />
                    <Link to="/register" className="text-[#b89047] hover:underline font-semibold mt-1 inline-block">Faire une demande d'adhésion</Link>
                </div>
            </motion.div>

            {/* Modal Mot de passe oublié */}
            <AnimatePresence>
                {isForgotModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="bg-white w-full max-w-md p-8 border border-stone-200 shadow-xl relative"
                        >
                            <button
                                onClick={() => { setIsForgotModalOpen(false); setForgotError(''); setForgotMessage(''); }}
                                className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 transition"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-2xl font-serif text-stone-800 mb-2">Mot de passe oublié</h3>
                            <div className="w-10 h-0.5 bg-[#b89047] mb-6"></div>
                            <p className="text-sm text-stone-600 mb-6">Entrez l'adresse email rattachée à votre profil. Nous vous enverrons un mot de passe temporaire pour vous connecter.</p>

                            {forgotMessage && <p className="bg-green-50 text-green-700 p-3 mb-4 text-sm border border-green-200">{forgotMessage}</p>}
                            {forgotError && <p className="bg-red-50 text-red-700 p-3 mb-4 text-sm border border-red-200">{forgotError}</p>}

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Votre adresse email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-3 px-4 focus:outline-none focus:border-[#b89047] transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className={`w-full text-white uppercase tracking-wider text-sm font-semibold py-3 transition-colors ${isSending ? 'bg-stone-400 cursor-not-allowed' : 'bg-stone-800 hover:bg-stone-700'}`}
                                >
                                    {isSending ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;
