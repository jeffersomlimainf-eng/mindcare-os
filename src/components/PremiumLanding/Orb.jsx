import { useEffect, useRef } from 'react';

export const Orb = () => {
    const orbRef = useRef(null);

    useEffect(() => {
        const buildRings = () => {
            const orbEl = orbRef.current;
            if (!orbEl) return;
            
            // Get the actual size of the orb container
            let orbSize = orbEl.offsetWidth || orbEl.getBoundingClientRect().width;
            
            // Fallback to vmin calculation if size is not yet available in DOM
            if (orbSize === 0) {
                orbSize = Math.min(window.innerWidth, window.innerHeight) * 1.3;
            }
            
            // Cap at the max-width/max-height defined in CSS
            orbSize = Math.min(orbSize, 1500);

            const rings = orbEl.querySelectorAll('.ring-text');
            
            rings.forEach(rt => {
                rt.innerHTML = '';
                
                const text = rt.dataset.text;
                const icon = rt.dataset.icon;
                const repeat = parseInt(rt.dataset.repeat, 10);
                const start = parseFloat(rt.dataset.start);
                const size = parseFloat(rt.dataset.size);
                const radiusFraction = parseFloat(rt.dataset.radius);
                const radius = radiusFraction * orbSize;
                
                const unit = [...text, '\u00A0', '\u00A0', '__ICON__', '\u00A0', '\u00A0'];
                const chars = [];
                for (let i = 0; i < repeat; i++) chars.push(...unit);
                
                const total = chars.length;
                const step = 360 / total;
                
                const fragment = document.createDocumentFragment();
                chars.forEach((ch, i) => {
                    const sp = document.createElement('span');
                    sp.className = 'ring-char' + (ch === '__ICON__' ? ' icon' : '');
                    sp.style.setProperty('--a', (start + i * step) + 'deg');
                    sp.style.setProperty('--r', radius + 'px');
                    sp.style.setProperty('--size', (ch === '__ICON__' ? size + 2 : size) + 'px');
                    sp.textContent = ch === '__ICON__' ? icon : ch;
                    fragment.appendChild(sp);
                });
                rt.appendChild(fragment);
            });
        };

        buildRings();
        window.addEventListener('resize', buildRings);
        
        // Final fallback
        const timer = setTimeout(buildRings, 100);

        return () => {
            window.removeEventListener('resize', buildRings);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="orb" aria-hidden="true" ref={orbRef}>
            <div className="ring r1" style={{ '--dur': '90s' }}>
                <div className="ring-text" 
                    data-text="SEGURANÇA QUE INSPIRA CONFIANÇA" 
                    data-repeat="3" 
                    data-icon="◉" 
                    data-start="-18" 
                    data-size="15" 
                    data-radius="0.48">
                </div>
            </div>
            <div className="ring r2 reverse" style={{ '--dur': '70s' }}>
                <div className="ring-text" 
                    data-text="INTUITIVA DE VERDADE · DESIGN PREMIUM" 
                    data-repeat="4" 
                    data-icon="◈" 
                    data-start="8" 
                    data-size="14" 
                    data-radius="0.41">
                </div>
            </div>
            <div className="ring r3" style={{ '--dur': '100s' }}>
                <div className="ring-text" 
                    data-text="INTELIGÊNCIA QUE NOTA O QUE IMPORTA" 
                    data-repeat="3" 
                    data-icon="✦" 
                    data-start="-4" 
                    data-size="13" 
                    data-radius="0.34">
                </div>
            </div>
            <div className="ring r4 reverse" style={{ '--dur': '60s' }}>
                <div className="ring-text" 
                    data-text="INOVAÇÃO CONSTANTE NO CUIDADO" 
                    data-repeat="2" 
                    data-icon="✧" 
                    data-start="12" 
                    data-size="12" 
                    data-radius="0.28">
                </div>
            </div>

            <div className="orb-bubble">
                <div className="orb-logo">
                    ψ
                    <span className="small">SISTEMA PSI</span>
                </div>
            </div>
        </div>
    );
};

export const Dust = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        container.innerHTML = '';
        for (let i = 0; i < 22; i++) {
            const s = document.createElement('span');
            s.style.left = Math.random() * 100 + '%';
            s.style.bottom = -Math.random() * 30 + 'px';
            s.style.animationDuration = (10 + Math.random() * 14) + 's';
            s.style.animationDelay = -Math.random() * 15 + 's';
            s.style.opacity = String(0.25 + Math.random() * 0.6);
            container.appendChild(s);
        }
    }, []);

    return <div className="dust" id="dust" ref={containerRef}></div>;
};
