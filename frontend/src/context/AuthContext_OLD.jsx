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
        // Check if user is logged in
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    // Optional: auto-login for local dev/demo so the UI loads without the login page.
    useEffect(() => {
        const shouldAutoLogin = Boolean(import.meta.env.DEV);
        if (!shouldAutoLogin) return;
        if (user) return;

        let cancelled = false;

        const ensureGuestUser = async () => {
            setLoading(true);
            try {
                const email = 'guest@diettracker.local';
                const password = 'Password123';

                try {
                    const userData = await authService.login({ email, password });
                    if (!cancelled) setUser(userData);
                } catch (loginErr) {
                    // If user doesn't exist yet, register then login.
                    if (loginErr?.response?.status === 401) {
                        await authService.register({ name: 'Guest', email, password });
                        const userData = await authService.login({ email, password });
                        if (!cancelled) setUser(userData);
                    } else {
                        // Don’t hard-fail app load; allow user to navigate manually if needed.
                        console.error('Auto-login failed:', loginErr);
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        ensureGuestUser();
        return () => {
            cancelled = true;
        };
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
