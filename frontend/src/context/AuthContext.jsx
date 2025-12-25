import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            // Check if user is logged in from localStorage
            const storedUser = authService.getCurrentUser();
            if (storedUser) {
                setUser(storedUser);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            // ALWAYS set loading to false, no matter what
            setLoading(false);
        }

        // Safety timeout: force loading to false after 1 second max
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, []);

    // Optional: auto-login for local dev ONLY
    useEffect(() => {
        try {
            // Only enable on localhost, NEVER on production/Vercel
            const isLocalDev = import.meta.env.DEV && window.location.hostname === 'localhost';
            if (!isLocalDev) return;
            if (user) return;

            let cancelled = false;

            const ensureGuestUser = async () => {
                try {
                    const email = 'guest@diettracker.local';
                    const password = 'Password123';

                    const userData = await authService.login({ email, password });
                    if (!cancelled) setUser(userData);
                } catch (loginErr) {
                    try {
                        if (loginErr?.response?.status === 401) {
                            await authService.register({ name: 'Guest', email, password });
                            const userData = await authService.login({ email, password });
                            if (!cancelled) setUser(userData);
                        }
                    } catch (err) {
                        // Silent fail
                    }
                }
            };

            ensureGuestUser();
            return () => { cancelled = true; };
        } catch (error) {
            // Never crash the app
        }
    }, [user]);

    const login = async (credentials) => {
        const userData = await authService.login(credentials);
        setUser(userData);
        return userData;
    };

    const register = async (userData) => {
        const newUser = await authService.register(userData);
        setUser(newUser);
        return newUser;
    };

    const googleLogin = async (googleData) => {
        const userData = await authService.googleLogin(googleData);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
