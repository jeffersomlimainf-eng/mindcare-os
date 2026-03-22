import { useState, useEffect } from 'react';

let toastListeners = [];
export const showToast = (message, type = 'success') => {
    toastListeners.forEach(fn => fn({ message, type, id: Date.now() }));
};

const Toast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const listener = (toast) => {
            setToasts(prev => [...prev, toast]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, 3500);
        };
        toastListeners.push(listener);
        return () => { toastListeners = toastListeners.filter(l => l !== listener); };
    }, []);

    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-primary',
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] space-y-3 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`${colors[t.type]} text-white flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl animate-[slideUp_0.3s_ease] pointer-events-auto`}
                >
                    <span className="material-symbols-outlined">{icons[t.type]}</span>
                    <span className="text-sm font-bold">{t.message}</span>
                </div>
            ))}
            <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
        </div>
    );
};

export default Toast;
