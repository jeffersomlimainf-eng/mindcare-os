import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';

const AiAssistantAnimation = ({ size = 'medium' }) => {
    const dimensions = size === 'micro' ? 'size-8' : size === 'xs' ? 'size-10' : size === 'small' ? 'size-24' : size === 'fab' ? 'size-14 md:size-16' : size === 'large' ? 'size-56' : 'size-40 md:size-48';
    
    // Controle de Animação para os "sustinhos"
    const controls = useAnimation();
    const containerRef = useRef(null);

    // Valores de movimento do mouse (para seguir o cursor)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Suavização do movimento
    const springConfig = { damping: 20, stiffness: 100 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            // Posição relativa do mouse na tela (-0.5 a 0.5)
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Lógica dos "Sustinhos" (pulsos aleatórios simulando pensamento/audição)
    useEffect(() => {
        const triggerRandomSustinho = async () => {
            // Atraso aleatório entre 3 e 8 segundos
            const delay = Math.random() * 5000 + 3000;
            await new Promise(r => setTimeout(r, delay));

            // Inicia o "sustinho" (expansão rápida e contração)
            await controls.start({
                scale: [1, 1.15, 0.95, 1.05, 1],
                filter: [
                    'brightness(1)',
                    'brightness(1.5)', // Brilha mais forte
                    'brightness(0.9)',
                    'brightness(1.1)',
                    'brightness(1)'
                ],
                transition: { duration: 0.8, times: [0, 0.2, 0.5, 0.8, 1] }
            });

            // Chama recursivamente
            triggerRandomSustinho();
        };

        // Inicia o loop
        let isMounted = true;
        if(isMounted) triggerRandomSustinho();

        return () => { isMounted = false; };
    }, [controls]);

    // Configuração das camadas fluídas de plasma
    const plasmaBlobs = [
        { bg: 'bg-amber-500', size: 'w-full h-full', blur: 'blur-2xl', opacity: 'opacity-70', duration: 4, scale: [0.9, 1.2, 0.9], rotation: [0, 90, 0] },
        { bg: 'bg-cyan-400', size: 'w-4/5 h-4/5', blur: 'blur-[20px]', opacity: 'opacity-60', duration: 5, scale: [1, 0.8, 1.1, 1], rotation: [0, -180, -360] },
        { bg: 'bg-pink-500', size: 'w-3/4 h-3/4', blur: 'blur-[24px]', opacity: 'opacity-60', duration: 6, scale: [0.8, 1.1, 0.8], rotation: [0, 180, 360] },
        { bg: 'bg-violet-600', size: 'w-full h-4/5', blur: 'blur-[28px]', opacity: 'opacity-50', duration: 7, scale: [1.1, 0.9, 1], rotation: [0, 90, 270] },
    ];

    // Configuração dos anéis holográficos 3D
    const rings = [
        { border: 'border-2 border-amber-500/40 border-dashed', size: 'w-[110%] h-[110%]', animate: { rotateZ: [0, 360], rotateX: [20, 40, 20], rotateY: [-20, 20, -20] }, duration: 20 },
        { border: 'border border-cyan-400/50 border-dotted', size: 'w-[125%] h-[125%]', animate: { rotateZ: [360, 0], rotateX: [-30, 30, -30], rotateY: [30, -30, 30] }, duration: 15 },
        { border: 'border-[0.5px] border-pink-400/30', size: 'w-[90%] h-[90%]', animate: { rotateZ: [0, -360], rotateX: [60, 60, 60], rotateY: [0, 360, 0] }, duration: 10 },
        { border: 'border-4 border-amber-300/10 border-double', size: 'w-[140%] h-[140%]', animate: { rotateZ: [0, 360], rotateX: [0, 0, 0], rotateY: [0, 0, 0] }, duration: 30 }
    ];

    return (
        <motion.div 
            ref={containerRef}
            className={`relative ${dimensions} flex items-center justify-center cursor-pointer`}
            style={{ 
                perspective: '1000px', 
                transformStyle: 'preserve-3d',
                rotateX, 
                rotateY 
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={controls} // Conecta o controle dos "sustinhos"
        >
            {/* GRUPO 1: CAMADAS MAIORES (EXTERNAS) - HUE 0-360 */}
            <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                {/* Brilho de Fundo Maior */}
                <motion.div 
                    className="absolute inset-0 bg-primary/20 rounded-full blur-[50px] mix-blend-screen"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Anéis Externos */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                    {rings.slice(0, 2).map((ring, index) => (
                        <motion.div
                            key={`ring-outer-${index}`}
                            className={`absolute rounded-full ${ring.border} ${ring.size}`}
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={ring.animate}
                            transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
                        />
                    ))}
                </div>

                {/* Blobs de Plasma Maiores */}
                <div className="absolute inset-0 flex items-center justify-center z-20 mix-blend-screen pointer-events-none">
                    {[plasmaBlobs[0], plasmaBlobs[3]].map((blob, index) => (
                        <motion.div
                            key={`blob-outer-${index}`}
                            className={`absolute rounded-full ${blob.bg} ${blob.size} ${blob.blur} ${blob.opacity}`}
                            animate={{
                                scale: blob.scale,
                                rotateZ: blob.rotation,
                                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
                            }}
                            transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* GRUPO 2: CAMADAS MENORES (INTERNAS) - HUE 180-540 (COR INVERSA) */}
            <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{ filter: ["hue-rotate(180deg)", "hue-rotate(540deg)"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                {/* Anéis Internos */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                    {rings.slice(2).map((ring, index) => (
                        <motion.div
                            key={`ring-inner-${index}`}
                            className={`absolute rounded-full ${ring.border} ${ring.size}`}
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={ring.animate}
                            transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
                        />
                    ))}
                </div>

                {/* Blobs de Plasma Menores */}
                <div className="absolute inset-0 flex items-center justify-center z-20 mix-blend-screen pointer-events-none">
                    {[plasmaBlobs[1], plasmaBlobs[2]].map((blob, index) => (
                        <motion.div
                            key={`blob-inner-${index}`}
                            className={`absolute rounded-full ${blob.bg} ${blob.size} ${blob.blur} ${blob.opacity}`}
                            animate={{
                                scale: blob.scale,
                                rotateZ: blob.rotation,
                                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
                            }}
                            transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                        />
                    ))}
                </div>

                {/* Centro de Cristal */}
                <motion.div 
                    className="relative z-30 w-1/3 h-1/3 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(255,255,255,0.5)] border border-white/40 flex items-center justify-center overflow-hidden pointer-events-none"
                    animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: ["0 0 20px rgba(255, 255, 255, 0.4)", "0 0 40px rgba(56, 189, 248, 0.8)", "0 0 20px rgba(255, 255, 255, 0.4)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent rounded-full" />
                    <motion.div 
                        className="w-2 h-2 bg-white rounded-full blur-[1px]"
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.5, 0.8] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                </motion.div>

                {/* Partículas */}
                <motion.div 
                    className="absolute inset-0 z-40 pointer-events-none"
                    animate={{ rotateZ: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-300 rounded-full blur-[1px] shadow-[0_0_5px_#67e8f9]" />
                    <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 bg-amber-300 rounded-full blur-[1px] shadow-[0_0_8px_#fcd34d]" />
                    <div className="absolute top-1/3 left-0 w-1 h-1 bg-pink-400 rounded-full blur-[1px] shadow-[0_0_5px_#f472b6]" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default AiAssistantAnimation;
