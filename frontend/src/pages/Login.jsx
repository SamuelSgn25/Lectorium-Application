import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Identifiants incorrects');
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4 mt-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white p-10 border border-stone-200 shadow-sm text-center"
            >
                <h2 className="text-3xl font-serif text-stone-800 mb-2">Connexion</h2>
                <div className="w-16 h-0.5 bg-[#b89047] mx-auto mb-8"></div>

                {error && <p className="text-red-700 bg-red-50 p-3 mb-6 text-sm border border-red-200">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        placeholder="Adresse email *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-3 px-4 focus:outline-none focus:border-[#b89047] text-sm"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe *"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm py-3 px-4 focus:outline-none focus:border-[#b89047] text-sm"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full text-white bg-[#b89047] hover:bg-[#a37b3b] uppercase tracking-wider text-sm font-semibold py-3 transition-colors"
                    >
                        Accéder à l'espace
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-stone-100 text-sm text-stone-500">
                    Vous n'avez pas encore adhéré ? <Link to="/register" className="text-[#b89047] hover:underline font-semibold">Faites une demande</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
