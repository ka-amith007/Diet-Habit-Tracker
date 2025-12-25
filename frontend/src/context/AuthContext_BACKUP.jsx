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
        // Check if user is logged in from localStorage
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        // CRITICAL: Always set loading to false after checking storage
        setLoading(false);
    }, []);

    // Optional: auto-login for local dev ONLY (prevents blank page on Vercel)
    useEffect(() => {
        // Only enable on localhost, NEVER on production/Vercel
        const isLocalDev = import.meta.env.DEV && window.location.hostname === 'localhost';
        if (!isLocalDev) return;
        if (user) return;

        let cancelled = false;

        const ensureGuestUser = async () => {
            try {
                const email = 'guest@diettracker.local';
                const password = 'Password123';

                try {
                    const userData = await authService.login({ email, password });
                    if (!cancelled) setUser(userData);
                } catch (loginErr) {
                    if (loginErr?.response?.status === 401) {
                        await authService.register({ name: 'Guest', email, password });
                        const userData = await authService.login({ email, password });
                        if (!cancelled) setUser(userData);
                    } else {
                        console.warn('Auto-login skipped');
                    }
                }
            } catch (error) {
                // Never block app - fail silently
                console.warn('Auto-login failed');
            }
        };

        // Run in background without blocking app load
        ensureGuestUser();
        return () => { cancelled = true; };
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
