import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const SmartTooltip = ({ children, content, position = 'top', icon = 'lightbulb', color = 'primary', showPulse = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        if (!triggerRef.current || !tooltipRef.current) return;
        
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let top = 0;
        let left = 0;
        const offset = 12;

        switch (position) {
            case 'top':
                top = triggerRect.top - tooltipRect.height - offset;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = triggerRect.bottom + offset;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.left - tooltipRect.width - offset;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.right + offset;
                break;
            default:
                top = triggerRect.top - tooltipRect.height - offset;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        }

        // Prevenir corte de tela
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));

        setCoords({ top, left });
    }, [position]);

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
            
            // Auto-hide on mobile after 4 seconds if triggered by tap
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (isMobile) {
                const timer = setTimeout(() => setIsVisible(false), 4000);
                return () => clearTimeout(timer);
            }
        }
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isVisible, updatePosition]);

    const handleToggle = (e) => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
            // No mobile, o primeiro toque abre. O segundo (se o conteúdo for clicável) seguiria o link.
            // Mas aqui apenas alternamos a visibilidade.
            setIsVisible(!isVisible);
        }
    };

    const colorConfig = {
        primary: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-primary/20',
        emerald: 'bg-emerald-600 text-white shadow-emerald-600/20',
        amber: 'bg-amber-500 text-white shadow-amber-500/20',
        indigo: 'bg-indigo-600 text-white shadow-indigo-600/20'
    };

    return (
        <>
            <div 
                ref={triggerRef}
                onMouseEnter={() => !window.matchMedia('(max-width: 768px)').matches && setIsVisible(true)}
                onMouseLeave={() => !window.matchMedia('(max-width: 768px)').matches && setIsVisible(false)}
                onClick={handleToggle}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                className="inline-flex relative group w-full sm:w-auto cursor-help"
            >
                {children}
                
                {showPulse && !isVisible && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-white dark:border-slate-900"></span>
                    </span>
                )}
            </div>
            
            {isVisible && createPortal(
                <div 
                    ref={tooltipRef}
                    style={{ top: coords.top, left: coords.left }}
                    className={`fixed z-[99999] max-w-[280px] p-3.5 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${colorConfig[color] || colorConfig.primary} flex gap-3 items-start pointer-events-none border border-white/10 dark:border-slate-700/50`}
                >
                    {icon && (
                        <div className="shrink-0 mt-0.5 opacity-80">
                            <span className="material-symbols-outlined text-[18px] text-amber-300">{icon}</span>
                        </div>
                    )}
                    <p className="text-[11px] font-bold leading-relaxed tracking-wide">
                        {content}
                    </p>
                </div>,
                document.body
            )}
        </>
    );
};

export default SmartTooltip;
