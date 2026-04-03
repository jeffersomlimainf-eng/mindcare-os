import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, icon, children, footer, maxWidth = 'max-w-2xl', closeOnBackdropClick = true }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
            onClick={e => e.target === e.currentTarget && closeOnBackdropClick && onClose()}
        >
            {/* Container */}
            <div className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        {icon && <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>}
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;


