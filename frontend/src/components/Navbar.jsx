import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-lg">
            <div className="px-4 md:px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onMenuClick}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold gradient-text">
                            Diet & Habit Tracker
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt="Profile" className="w-8 h-8 rounded-full" />
                                ) : (
                                    <User className="w-6 h-6" />
                                )}
                                <span className="hidden md:inline text-sm font-medium">{user?.name}</span>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl py-2 animate-slide-down">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
