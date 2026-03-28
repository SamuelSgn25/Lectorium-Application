import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const res = await axios.post('/api/login', { email, password, loginType: 'admin' });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur s'est produite.");
            throw err;
        }
    };

    const loginByMatricule = async (matricule) => {
        try {
            setError(null);
            const res = await axios.post('/api/login', { matricule, loginType: 'membre' });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur s'est produite.");
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, error, login, loginByMatricule, logout }}>
            {children}
        </AuthContext.Provider>
    );

};
