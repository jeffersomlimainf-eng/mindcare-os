import React, { useEffect, useRef, useState } from 'react';

const ITEM_HEIGHT = 44;

const Wheel = ({ items, value, onChange, width = "w-14" }) => {
    const containerRef = useRef(null);
    const isScrolling = useRef(false);
    const scrollTimeoutRef = useRef(null);

    const [selectedIndex, setSelectedIndex] = useState(() => {
        const idx = items.indexOf(value);
        return idx !== -1 ? idx : 0;
    });

    useEffect(() => {
        const index = items.indexOf(value);
        if (index === -1) return;
        setSelectedIndex(index);
        const t = setTimeout(() => {
            if (containerRef.current && !isScrolling.current) {
                containerRef.current.scrollTop = index * ITEM_HEIGHT;
            }
        }, 50);
        return () => clearTimeout(t);
    }, [value, items]);

    useEffect(() => () => {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    }, []);

    const handleScroll = () => {
        if (!containerRef.current) return;
        isScrolling.current = true;
        const index = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
        if (index >= 0 && index < items.length) setSelectedIndex(index);

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            isScrolling.current = false;
            if (!containerRef.current) return;
            const final = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
            if (final >= 0 && final < items.length) {
                containerRef.current.scrollTo({ top: final * ITEM_HEIGHT, behavior: 'smooth' });
                onChange(items[final]);
            }
        }, 150);
    };

    const handleItemClick = (index) => {
        if (index === selectedIndex) return;
        setSelectedIndex(index);
        onChange(items[index]);
        containerRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    };

    return (
        <div
            ref={containerRef}
            className={`h-[132px] ${width} overflow-y-scroll snap-y snap-mandatory select-none no-scrollbar`}
            onScroll={handleScroll}
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            <div style={{ height: ITEM_HEIGHT }} />
            {items.map((item, index) => {
                const dist = Math.abs(index - selectedIndex);
                return (
                    <div
                        key={item}
                        onClick={() => handleItemClick(index)}
                        className="h-[44px] flex items-center justify-center snap-center cursor-pointer"
                        style={{
                            opacity: dist === 0 ? 1 : dist === 1 ? 0.36 : dist === 2 ? 0.13 : 0.04,
                            transition: 'opacity 0.15s ease',
                        }}
                    >
                        <span
                            className={`tabular-nums transition-all duration-150 ${
                                dist === 0
                                    ? 'text-[22px] font-black text-slate-900 dark:text-white'
                                    : dist === 1
                                    ? 'text-[17px] font-bold text-slate-500 dark:text-slate-400'
                                    : 'text-[13px] font-semibold text-slate-400'
                            }`}
                        >
                            {item}
                        </span>
                    </div>
                );
            })}
            <div style={{ height: ITEM_HEIGHT }} />
        </div>
    );
};

const TimeWheelPicker = ({ value, onChange }) => {
    const safeValue = typeof value === 'string' && value.includes(':') ? value : '08:00';
    const [h, m] = safeValue.split(':');

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden w-[176px]">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-5 pt-3.5 pb-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Horário da Sessão</span>
            </div>

            {/* Labels das colunas */}
            <div className="flex items-center justify-center px-4 pt-1.5 pb-0 gap-2">
                <div className="w-14 text-center">
                    <span className="text-[9px] font-black text-primary/70 uppercase tracking-wider">H</span>
                </div>
                <div className="w-4" />
                <div className="w-14 text-center">
                    <span className="text-[9px] font-black text-primary/70 uppercase tracking-wider">M</span>
                </div>
            </div>

            {/* Área do picker */}
            <div className="relative px-3 pb-0">
                {/* Linhas de seleção estilo iOS */}
                <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-11 border-t-2 border-b-2 border-slate-100 dark:border-slate-700 pointer-events-none z-20 rounded-xl" />

                {/* Gradiente topo */}
                <div className="absolute left-0 right-0 top-0 h-[52px] bg-gradient-to-b from-white dark:from-slate-900 to-transparent pointer-events-none z-30" />

                {/* Gradiente base */}
                <div className="absolute left-0 right-0 bottom-0 h-[52px] bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-30" />

                {/* Rodas */}
                <div className="flex items-center justify-center gap-0">
                    <Wheel items={hours} value={h} onChange={(newH) => onChange(`${newH}:${m}`)} width="w-14" />
                    <div className="w-4 text-center text-[21px] font-black text-slate-300 dark:text-slate-700 pb-0.5 shrink-0">:</div>
                    <Wheel items={minutes} value={m} onChange={(newM) => onChange(`${h}:${newM}`)} width="w-14" />
                </div>
            </div>

            <div className="h-3" />
        </div>
    );
};

export default TimeWheelPicker;
