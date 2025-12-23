import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const show = useCallback((message, type = 'success', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }, []);

    const remove = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800';
            case 'error': return 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800';
            case 'warning': return 'bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800';
            default: return 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800';
        }
    };

    return (
        <NotificationContext.Provider value={{ show }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-xl animate-fade-in ${getBg(n.type)} min-w-[300px]`}
                    >
                        {getIcon(n.type)}
                        <p className="flex-1 text-sm font-bold">{n.message}</p>
                        <button onClick={() => remove(n.id)} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
